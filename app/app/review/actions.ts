"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { evaluateAll } from "@/lib/engine";
import { buildFacts } from "@/lib/facts";
import { programs } from "@/lib/programs";
import { effectiveValue, evaluationRows, isRecommended, type Evaluation } from "@/lib/review";
import { requireStaff } from "@/lib/staff";

const secs = (v: FormDataEntryValue | null) => Math.min(7200, Math.max(0, Math.floor(Number(v) || 0)));
const back = (hid: string, q = "") => redirect(`/review/${hid}${q}`);

export async function startReview(fd: FormData) {
  const { sb } = await requireStaff();
  const hid = String(fd.get("household_id"));
  const { data: h } = await sb.from("households").select("*").eq("id", hid).eq("status", "completed").single();
  const { data: members } = await sb.from("household_members").select("*").eq("household_id", hid);
  if (!h || !members?.length) back(hid, "?error=missing");
  const rows = evaluationRows(hid, evaluateAll(programs, buildFacts(h!, members!)));
  const { error } = await sb.from("evaluations").upsert(rows, { onConflict: "household_id,program_id", ignoreDuplicates: true });
  if (error) throw error;
  await sb.rpc("log_event", { p_action: "review.started", p_entity: "household", p_entity_id: hid });
  revalidatePath(`/review/${hid}`);
}

const Decide = z.object({
  id: z.string().uuid(), household_id: z.string().uuid(), decision: z.enum(["approved", "rejected", "escalated"]),
  override_status: z.enum(["", "eligible", "likely", "unlikely"]), override_value: z.string(), note: z.string().max(2000),
});

export async function decideEvaluation(fd: FormData) {
  const { sb, user } = await requireStaff();
  const r = Decide.safeParse(Object.fromEntries(fd));
  if (!r.success) redirect("/review");
  const d = r.data;
  const { data: e } = await sb.from("evaluations").select("*").eq("id", d.id).eq("household_id", d.household_id).single();
  if (!e) back(d.household_id);
  const ov = d.override_status || null, val = d.override_value.trim() === "" ? null : Number(d.override_value);
  if (val !== null && (!Number.isFinite(val) || val < 0)) back(d.household_id, "?error=value");
  // Approving a "needs human review" result means the reviewer must state the outcome.
  if (d.decision === "approved" && !ov && (e as Evaluation).status === "needs_human_review") back(d.household_id, "?error=outcome");
  const { error } = await sb.from("evaluations").update({
    review_state: d.decision, override_status: ov, override_value_likely: val, reviewer_note: d.note || null,
    reviewed_by: user.id, reviewed_at: new Date().toISOString(),
  }).eq("id", d.id);
  if (error) throw error;
  await sb.rpc("log_event", { p_action: `evaluation.${d.decision}`, p_entity: "evaluation", p_entity_id: d.id, p_detail: { program: (e as Evaluation).program_id, override: ov } });
  revalidatePath(`/review/${d.household_id}`);
}

export async function finishReview(fd: FormData) {
  const { sb, user } = await requireStaff();
  const hid = String(fd.get("household_id"));
  const { error } = await sb.rpc("approve_household", { hid });
  if (error) back(hid, "?error=undecided");

  const { data: h } = await sb.from("households").select("org_id").eq("id", hid).single();
  const { data: evs } = await sb.from("evaluations").select("*").eq("household_id", hid);
  const { data: existing } = await sb.from("claims").select("program_id").eq("household_id", hid);
  const have = new Set((existing ?? []).map((c) => c.program_id));
  for (const e of ((evs ?? []) as Evaluation[]).filter((x) => isRecommended(x) && !have.has(x.program_id))) {
    const { data: c, error: ce } = await sb.from("claims").insert({ household_id: hid, evaluation_id: e.id, program_id: e.program_id }).select("id").single();
    if (ce) throw ce;
    await sb.from("ledger_entries").insert({
      org_id: h?.org_id ?? null, household_id: hid, claim_id: c.id, program_id: e.program_id, kind: "estimated",
      annual_value: effectiveValue(e) ?? 0, note: e.override_value_likely != null ? "reviewer estimate" : "engine estimate (likely)",
    });
  }
  await sb.from("reviews").insert({ household_id: hid, reviewer_id: user.id, decision: "approved", notes: String(fd.get("notes") ?? "").slice(0, 2000) || null, seconds_spent: secs(fd.get("seconds")) });
  redirect("/review");
}

export async function escalateHousehold(fd: FormData) {
  const { sb, user } = await requireStaff();
  const hid = String(fd.get("household_id"));
  await sb.from("reviews").insert({ household_id: hid, reviewer_id: user.id, decision: "escalated", notes: String(fd.get("notes") ?? "").slice(0, 2000) || null, seconds_spent: secs(fd.get("seconds")) });
  await sb.rpc("log_event", { p_action: "household.escalated", p_entity: "household", p_entity_id: hid });
  redirect("/review");
}

const STATUS = ["recommended", "prepared", "submitted", "pending", "approved", "denied", "needs_info", "receiving", "renewal_due"] as const;
export async function setClaimStatus(fd: FormData) {
  const { sb } = await requireStaff();
  const hid = String(fd.get("household_id")), status = z.enum(STATUS).parse(fd.get("status"));
  const due = String(fd.get("renewal_due") ?? "");
  const { error } = await sb.from("claims").update({ status, renewal_due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null }).eq("id", String(fd.get("claim_id")));
  if (error) throw error;
  revalidatePath(`/review/${hid}`);
}

export async function addLedgerEntry(fd: FormData) {
  const { sb, user } = await requireStaff();
  const hid = String(fd.get("household_id"));
  const kind = z.enum(["approved", "received"]).parse(fd.get("kind"));
  const amount = Number(fd.get("annual_value")), doc = String(fd.get("evidence_document_id") ?? "");
  if (!Number.isFinite(amount) || amount < 0 || !doc) back(hid, "?error=ledger");
  // Evidence must be one of this household's own documents.
  const { data: d } = await sb.from("documents").select("id").eq("id", doc).eq("household_id", hid).single();
  const { data: c } = await sb.from("claims").select("id, program_id, household_id").eq("id", String(fd.get("claim_id"))).eq("household_id", hid).single();
  const { data: h } = await sb.from("households").select("org_id").eq("id", hid).single();
  if (!d || !c) back(hid, "?error=ledger");
  const eff = String(fd.get("effective_date") ?? "");
  const { error } = await sb.from("ledger_entries").insert({
    org_id: h?.org_id ?? null, household_id: hid, claim_id: c!.id, program_id: c!.program_id, kind, annual_value: amount,
    effective_date: /^\d{4}-\d{2}-\d{2}$/.test(eff) ? eff : null,
    verified_basis: kind === "approved" ? "determination_letter" : "confirmed_receipt", evidence_document_id: doc, verified_by: user.id,
    note: String(fd.get("note") ?? "").slice(0, 500) || null,
  });
  if (error) throw error;
  await sb.rpc("log_event", { p_action: `ledger.${kind}`, p_entity: "claim", p_entity_id: c!.id, p_detail: { annual_value: amount } });
  revalidatePath(`/review/${hid}`);
}
