"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extract, isSensitive, type Proposed } from "@/lib/extract";
import { KINDS } from "@/lib/documents";
import { getCtx } from "@/lib/household";

const Reg = z.object({
  path: z.string(), kind: z.enum(KINDS.map((k) => k[0]) as [string, ...string[]]),
  filename: z.string().min(1).max(200), mime: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  size: z.coerce.number().int().min(1).max(10 * 1024 * 1024),
});

export async function registerDocument(input: unknown) {
  const { sb, household } = await getCtx("/documents");
  if (!household) throw new Error("no household");
  const r = Reg.safeParse(input);
  if (!r.success || !r.data.path.startsWith(`${household.id}/`) || r.data.path.includes("..")) throw new Error("bad upload");
  const { data: ok } = await sb.storage.from("documents").exists(r.data.path);
  if (!ok) throw new Error("file not found");
  const { error } = await sb.from("documents").insert({ household_id: household.id, kind: r.data.kind, storage_path: r.data.path, filename: r.data.filename, mime: r.data.mime, size_bytes: r.data.size });
  if (error) throw error;
  await sb.rpc("log_event", { p_action: "document.uploaded", p_entity: "household", p_entity_id: household.id, p_detail: { kind: r.data.kind } });
  revalidatePath("/documents");
}

export async function extractDocument(fd: FormData) {
  const { sb, household } = await getCtx("/documents");
  if (!household) redirect("/intake");
  const id = String(fd.get("id"));
  const { data: doc } = await sb.from("documents").select("*").eq("id", id).eq("household_id", household.id).single();
  if (!doc) redirect("/documents");
  let patch: Record<string, unknown>, detail: Record<string, unknown>;
  try {
    const { data: blob, error } = await sb.storage.from("documents").download(doc.storage_path);
    if (error || !blob) throw error ?? new Error("download failed");
    const out = await extract(new Uint8Array(await blob.arrayBuffer()), doc.mime);
    patch = { extraction_status: "done", extraction_usage: out.usage, extracted: out.fields };
    detail = { ...out.usage, fields: out.fields.length };
  } catch {
    patch = { extraction_status: "failed" }; // no error text stored: it could echo document content
    detail = { failed: true };
  }
  await sb.from("documents").update(patch).eq("id", id);
  await sb.rpc("log_event", { p_action: "document.extracted", p_entity: "document", p_entity_id: id, p_detail: detail });
  revalidatePath("/documents");
}

/** Human confirmation: only boxes the person ticks (with their possibly edited value) become usable. */
export async function confirmFields(fd: FormData) {
  const { sb, household } = await getCtx("/documents");
  if (!household) redirect("/intake");
  const id = String(fd.get("id"));
  const { data: doc } = await sb.from("documents").select("extracted").eq("id", id).eq("household_id", household.id).single();
  if (!doc) redirect("/documents");
  const now = new Date().toISOString();
  const next = (doc.extracted as Proposed[]).map((f, i) => {
    const v = String(fd.get(`value_${i}`) ?? "").trim().slice(0, 200);
    const ok = fd.get(`confirm_${i}`) === "on" && v && !isSensitive(v);
    return { ...f, confirmed: !!ok, final_value: ok ? v : null, confirmed_at: ok ? now : null };
  });
  await sb.from("documents").update({ extracted: next }).eq("id", id);
  await sb.rpc("log_event", { p_action: "document.confirmed", p_entity: "document", p_entity_id: id, p_detail: { confirmed: next.filter((f) => f.confirmed).length, total: next.length } });
  revalidatePath("/documents");
}

export async function deleteDocument(fd: FormData) {
  const { sb, household } = await getCtx("/documents");
  if (!household) redirect("/intake");
  const id = String(fd.get("id"));
  const { data: doc } = await sb.from("documents").select("storage_path").eq("id", id).eq("household_id", household.id).single();
  if (doc) {
    await sb.storage.from("documents").remove([doc.storage_path]);
    await sb.from("documents").delete().eq("id", id);
    await sb.rpc("log_event", { p_action: "document.deleted", p_entity: "document", p_entity_id: id });
  }
  revalidatePath("/documents");
}
