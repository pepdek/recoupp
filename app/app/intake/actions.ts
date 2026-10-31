"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CONSENT_VERSION, STEPS, nextStep, parseStep } from "@/lib/intake";
import { getCtx } from "@/lib/household";

const REL = ["self", "family", "caseworker", "other"] as const;

export async function startIntake(fd: FormData) {
  const { sb, household } = await getCtx("/intake");
  const org = String(fd.get("org") ?? "");
  const back = `/intake${org ? `?org=${encodeURIComponent(org)}` : ""}`;
  if (household) redirect("/intake");
  if (fd.get("consent") !== "on") redirect(`${back}${org ? "&" : "?"}error=consent`);
  const rel = z.enum(REL).safeParse(fd.get("relationship"));
  if (!rel.success) redirect(`${back}${org ? "&" : "?"}error=relationship`);
  // One server-side function writes household, org link and consent together; clients can't attach an org themselves.
  const { error } = await sb.rpc("create_household", { p_relationship: rel.data, p_org_slug: org, p_consent_version: CONSENT_VERSION, p_share: fd.get("share") === "on" });
  if (error) throw error;
  redirect("/intake/members");
}

export async function addMember(fd: FormData) {
  const { sb, household } = await getCtx("/intake/members");
  if (!household) redirect("/intake");
  const m = z.object({
    first_name: z.string().trim().min(1).max(60),
    birth_year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  }).safeParse({ first_name: fd.get("first_name"), birth_year: fd.get("birth_year") });
  if (!m.success) redirect("/intake/members?error=member");
  const { count } = await sb.from("household_members").select("id", { count: "exact", head: true }).eq("household_id", household.id);
  const { error } = await sb.from("household_members").insert({
    household_id: household.id, ...m.data, is_primary: !count,
    veteran: fd.get("veteran") === "on", disabled: fd.get("disabled") === "on",
  });
  if (error) throw error;
  redirect("/intake/members");
}

export async function removeMember(fd: FormData) {
  const { sb, household } = await getCtx("/intake/members");
  if (!household) redirect("/intake");
  await sb.from("household_members").delete().eq("id", String(fd.get("id"))).eq("household_id", household.id);
  redirect("/intake/members");
}

export async function saveStep(stepId: string, fd: FormData) {
  const { sb, household } = await getCtx(`/intake/${stepId}`);
  if (!household) redirect("/intake");
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) redirect("/intake");
  if (stepId === "members") {
    const { count } = await sb.from("household_members").select("id", { count: "exact", head: true }).eq("household_id", household.id);
    if (!count) redirect("/intake/members?error=empty");
  } else {
    const p = parseStep(step, fd);
    if (!p.success) redirect(`/intake/${stepId}?error=invalid`);
    const patch: Record<string, unknown> = { answers: { ...household.answers, ...p.data } };
    if (stepId === "location") { patch.county = p.data.county; patch.city = p.data.city; }
    const { error } = await sb.from("households").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", household.id);
    if (error) throw error;
  }
  const next = nextStep(stepId);
  await sb.from("households").update({ step: next, updated_at: new Date().toISOString() }).eq("id", household.id);
  redirect(`/intake/${next}`);
}

export async function finishIntake() {
  const { sb, household } = await getCtx("/intake/review");
  if (!household) redirect("/intake");
  await sb.from("households").update({ status: "completed", step: "review", updated_at: new Date().toISOString() }).eq("id", household.id);
  await sb.rpc("log_event", { p_action: "intake.completed", p_entity: "household", p_entity_id: household.id });
  redirect("/intake");
}

export async function deleteMyData() {
  const { sb, household } = await getCtx("/account");
  if (household) {
    await sb.rpc("log_event", { p_action: "household.deleted", p_entity: "household", p_entity_id: household.id });
    await sb.from("households").delete().eq("id", household.id);
  }
  redirect("/");
}
