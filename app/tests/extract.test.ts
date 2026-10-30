import { describe, expect, it } from "vitest";
import { ExtractionSchema, confirmedFields, isSensitive, toProposed } from "../lib/extract";

describe("extraction safety", () => {
  it("flags SSN-like and long account-like numbers but not amounts or dates", () => {
    for (const v of ["123-45-6789", "123456789", "1234 5678 9012", "SSN 123456789"]) expect(isSensitive(v), v).toBe(true);
    for (const v of ["1,234.50", "2026-01-15", "1450", "approved", "Social Security"]) expect(isSensitive(v), v).toBe(false);
  });
  it("drops sensitive and empty proposals and starts everything unconfirmed", () => {
    const out = toProposed([
      { field: "benefit_amount_monthly", value: " 1450 ", confidence: "high" },
      { field: "recipient_name", value: "123-45-6789", confidence: "low" },
      { field: "decision", value: "  ", confidence: "low" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ value: "1450", confirmed: false, final_value: null });
  });
  it("only confirmed fields with a value are usable", () => {
    const base = { confidence: "high" as const, confirmed_at: null };
    const used = confirmedFields([
      { ...base, field: "benefit_amount_monthly", value: "1450", confirmed: true, final_value: "1400" },
      { ...base, field: "decision", value: "approved", confirmed: false, final_value: null },
      { ...base, field: "effective_date", value: "2026-01-01", confirmed: true, final_value: null },
    ]);
    expect(used).toEqual([{ field: "benefit_amount_monthly", value: "1400" }]);
  });
  it("schema rejects fields outside the allow-list", () => {
    expect(ExtractionSchema.safeParse({ fields: [{ field: "ssn", value: "x", confidence: "high" }] }).success).toBe(false);
  });
});
