import { describe, expect, it } from "vitest";
import { STEPS, parseStep } from "../lib/intake";

const fd = (o: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) [v].flat().forEach((x) => f.append(k, x));
  return f;
};
const income = STEPS.find((s) => s.id === "income")!;

describe("intake validation", () => {
  it("accepts valid income and coerces numbers", () => {
    const r = parseStep(income, fd({ inc_social_security: "1200", inc_ssi: "0", inc_pension: "0", inc_wages: "0", inc_other: "0" }));
    expect(r.success && r.data.inc_social_security).toBe(1200);
  });
  it("rejects negatives and blanks", () => {
    expect(parseStep(income, fd({ inc_social_security: "-1", inc_ssi: "0", inc_pension: "0", inc_wages: "0", inc_other: "0" })).success).toBe(false);
    expect(parseStep(income, fd({ inc_social_security: "", inc_ssi: "0", inc_pension: "0", inc_wages: "0", inc_other: "0" })).success).toBe(false);
  });
  it("rejects unknown county", () => {
    expect(parseStep(STEPS.find((s) => s.id === "location")!, fd({ county: "Narnia", city: "x" })).success).toBe(false);
  });
});
