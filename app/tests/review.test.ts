import { describe, expect, it } from "vitest";
import { evaluateAll } from "../lib/engine";
import { buildFacts } from "../lib/facts";
import { verifiedByClaim } from "../lib/ledger";
import { programs } from "../lib/programs";
import { effectiveStatus, effectiveValue, evaluationRows, isRecommended } from "../lib/review";

const base = { status: "likely" as const, override_status: null, review_state: "approved" as const };

describe("review rules", () => {
  it("only approved eligible/likely (after override) is a recommendation", () => {
    expect(isRecommended(base)).toBe(true);
    expect(isRecommended({ ...base, review_state: "pending" })).toBe(false);
    expect(isRecommended({ ...base, review_state: "rejected" })).toBe(false);
    expect(isRecommended({ ...base, status: "needs_human_review" as const })).toBe(false);
    expect(isRecommended({ ...base, status: "needs_human_review" as const, override_status: "eligible" })).toBe(true);
    expect(isRecommended({ ...base, override_status: "unlikely" })).toBe(false);
  });
  it("override wins for status and value", () => {
    expect(effectiveStatus({ status: "unlikely", override_status: "likely" })).toBe("likely");
    expect(effectiveValue({ value: { low: 1, likely: 2, high: 3 }, override_value_likely: 9 })).toBe(9);
    expect(effectiveValue({ value: { low: 1, likely: 2, high: 3 }, override_value_likely: null })).toBe(2);
    expect(effectiveValue({ value: null, override_value_likely: null })).toBeNull();
  });
  it("snapshot leaves every judgment call pending and pre-approves only non-recommendations", () => {
    const answers = { inc_social_security: 1400, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0, asset_bank: 0, asset_other: 0, tenure: "own", medicare: "yes", medicaid: "no", existing_benefits: ["basic_food"] };
    const facts = buildFacts({ answers }, [{ birth_year: 1950, veteran: false, disabled: false }], 2026);
    const rows = evaluationRows("h1", evaluateAll(programs, facts));
    const by = Object.fromEntries(rows.map((r) => [r.program_id, r]));
    expect(by.msp.review_state).toBe("pending");           // eligible: reviewer must approve
    expect(by.apple_health.review_state).toBe("pending");  // needs human review
    expect(by.basic_food.status).toBe("already_receiving");
    expect(by.basic_food.review_state).toBe("approved");   // nothing to decide
    expect(rows.every((r) => r.program_version.length > 0)).toBe(true);
  });
});

describe("ledger verification", () => {
  const e = (claim_id: string, kind: "estimated" | "approved" | "received", v: number, t: string) => ({ claim_id, kind, annual_value: v, created_at: t });
  it("ignores estimates; latest verified entry per claim wins", () => {
    const m = verifiedByClaim([
      e("a", "estimated", 5000, "2026-01-01"), e("a", "approved", 2400, "2026-02-01"), e("a", "received", 2300, "2026-03-01"),
      e("b", "estimated", 900, "2026-01-01"), e("c", "approved", 1200, "2026-02-01"),
    ]);
    expect(m.get("a")).toBe(2300);
    expect(m.has("b")).toBe(false);
    expect(m.get("c")).toBe(1200);
  });
});
