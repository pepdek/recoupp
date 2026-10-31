import type { Range, Result, Status } from "./engine";

export type Evaluation = {
  id: string; household_id: string; program_id: string; program_version: string; status: Status; rule_id: string; reason: string;
  value: Range | null; confidence: "verified" | "needs_review"; review_state: "pending" | "approved" | "rejected" | "escalated";
  override_status: "eligible" | "likely" | "unlikely" | null; override_value_likely: number | null; reviewer_note: string | null;
};

export const effectiveStatus = (e: Pick<Evaluation, "status" | "override_status">): Status => e.override_status ?? e.status;
export const effectiveValue = (e: Pick<Evaluation, "value" | "override_value_likely">) => e.override_value_likely ?? e.value?.likely ?? null;
export const needsDecision = (s: Status) => s === "eligible" || s === "likely" || s === "needs_human_review";

/** A recommendation the household may see: a reviewer approved it and it is eligible/likely after any override. */
export const isRecommended = (e: Pick<Evaluation, "review_state" | "status" | "override_status">) =>
  e.review_state === "approved" && (effectiveStatus(e) === "eligible" || effectiveStatus(e) === "likely");

/** Rows to snapshot when review starts. Nothing needing judgment is pre-approved. */
export const evaluationRows = (householdId: string, results: Result[]) =>
  results.map((r) => ({
    household_id: householdId, program_id: r.program_id, program_version: r.version ?? "unversioned", status: r.status,
    rule_id: r.rule_id, reason: r.reason, value: r.value, confidence: r.confidence,
    review_state: needsDecision(r.status) ? "pending" : "approved",
  }));
