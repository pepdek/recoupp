import { describe, expect, it } from "vitest";
import { evaluateAll } from "../lib/engine";
import { buildFacts } from "../lib/facts";
import { programs } from "../lib/programs";

type M = { birth_year: number; veteran: boolean; disabled: boolean };
const m = (birth_year = 1950, o: Partial<M> = {}): M => ({ birth_year, veteran: false, disabled: false, ...o });
const base = { inc_social_security: 0, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0, asset_bank: 0, asset_other: 0, tenure: "rent", medicare: "yes", medicaid: "no", exp_electric: 100, exp_water: 80, existing_benefits: [] as string[] };
type Extra = { county?: string; city?: string; relationship?: string };

function run(id: string, answers: Record<string, unknown> = {}, members: M[] = [m()], extra: Extra = {}) {
  const facts = buildFacts({ answers: { ...base, ...answers }, ...extra }, members, 2026);
  return evaluateAll(programs, facts).find((r) => r.program_id === id)!;
}
const ss = (n: number, more: Record<string, unknown> = {}) => ({ inc_social_security: n, ...more });
const tacoma = { county: "Pierce", city: "Tacoma" };

it("has about 20 programs", () => expect(programs.length).toBe(20));

describe("Lifeline (135% FPL: single $21,546/yr)", () => {
  it.each([[1795, "income", "eligible"], [1796, "over", "unlikely"]])("income %i -> %s", (inc, rule, status) => {
    const r = run("lifeline", ss(inc)); expect([r.rule_id, r.status]).toEqual([rule, status]);
  });
  it("qualifying programs make it eligible whatever the income", () => {
    for (const a of [{ existing_benefits: ["basic_food"] }, { medicaid: "yes" }, { inc_ssi: 900 }, { existing_benefits: ["housing"] }, { existing_benefits: ["va"] }])
      expect(run("lifeline", ss(5000, a)).rule_id, JSON.stringify(a)).toBe("program");
  });
  it("two-person household uses 29,214/yr", () => {
    expect(run("lifeline", ss(2434), [m(), m(1952)]).status).toBe("eligible"); // 29,208
    expect(run("lifeline", ss(2435), [m(), m(1952)]).status).toBe("unlikely"); // 29,220
  });
  it("existing; value is 12 x $9.25 and flagged unverified", () => {
    expect(run("lifeline", ss(500, { existing_benefits: ["lifeline"] })).status).toBe("already_receiving");
    const r = run("lifeline", ss(500)); expect(r.value!.likely).toBe(111); expect(r.unverified_inputs).toContain("benefit_amount");
  });
});

describe("ORCA LIFT (200% FPL: single $2,660/mo)", () => {
  it("income boundary", () => {
    expect(run("orca_lift", ss(2660)).rule_id).toBe("income");
    expect(run("orca_lift", ss(2661), [m()], {}).rule_id).toBe("senior_pass"); // Medicare yes -> RRFP check
    expect(run("orca_lift", ss(2661, { medicare: "no" })).status).toBe("unlikely");
  });
  it("Basic Food or Apple Health qualifies regardless of income", () => {
    expect(run("orca_lift", ss(9000, { existing_benefits: ["basic_food"] })).rule_id).toBe("benefit");
    expect(run("orca_lift", ss(9000, { medicaid: "yes" })).rule_id).toBe("benefit");
  });
  it("more than 6 people goes to review; existing card", () => {
    expect(run("orca_lift", ss(100), Array.from({ length: 7 }, () => m())).rule_id).toBe("big_household");
    expect(run("orca_lift", ss(100, { existing_benefits: ["orca"] })).status).toBe("already_receiving");
  });
  it("two people: 3,607/mo", () => {
    expect(run("orca_lift", ss(3607), [m(), m(1951)]).status).toBe("eligible");
    expect(run("orca_lift", ss(3608, { medicare: "no" }), [m(), m(1951)]).status).toBe("unlikely");
  });
});

describe("LIHEAP (150% FPL: single $1,995/mo)", () => {
  it.each([[1995, "likely"], [1996, "unlikely"]])("single income %i -> %s", (inc, status) => expect(run("liheap", ss(inc)).status).toBe(status));
  it.each([[2705, "likely"], [2706, "unlikely"]])("couple income %i -> %s", (inc, status) => expect(run("liheap", ss(inc), [m(), m(1951)]).status).toBe(status));
  it("existing; never auto-eligible without a dollar claim", () => {
    expect(run("liheap", ss(500, { existing_benefits: ["liheap"] })).status).toBe("already_receiving");
    expect(run("liheap", ss(500)).value).toBeNull();
  });
});

describe("Tacoma Public Utilities (discount limit single $3,346, BCAP $4,458)", () => {
  it("senior under the discount limit: 35% of electric+water, low = electric only", () => {
    const r = run("tpu_assistance", ss(3346), [m()], tacoma);
    expect([r.rule_id, r.status]).toEqual(["discount", "likely"]);
    expect(r.value!.low).toBeCloseTo(420); expect(r.value!.likely).toBeCloseTo(756); expect(r.value!.high).toBeCloseTo(756);
  });
  it("above discount but under BCAP -> bill credit range", () => {
    const r = run("tpu_assistance", ss(3347), [m()], tacoma);
    expect(r.rule_id).toBe("bcap"); expect(r.value!.low).toBeCloseTo(699.6); expect(r.value!.high).toBeCloseTo(1227.6);
    expect(run("tpu_assistance", ss(4458), [m()], tacoma).rule_id).toBe("bcap");
    expect(run("tpu_assistance", ss(4459), [m()], tacoma).status).toBe("unlikely");
  });
  it("service-area guards", () => {
    expect(run("tpu_assistance", ss(1000), [m()], { county: "King", city: "Seattle" }).rule_id).toBe("wrong_county");
    expect(run("tpu_assistance", ss(1000), [m()], { county: "Pierce", city: "Lakewood" }).rule_id).toBe("outside_tacoma");
    expect(run("tpu_assistance", ss(1000), Array.from({ length: 7 }, () => m()), tacoma).rule_id).toBe("big_household");
  });
  it("under-62 only gets the discount with a disability; turning 62 this year goes to review", () => {
    expect(run("tpu_assistance", ss(1000), [m(1971)], tacoma).rule_id).toBe("bcap");
    expect(run("tpu_assistance", ss(1000), [m(1971, { disabled: true })], tacoma).rule_id).toBe("disability");
    expect(run("tpu_assistance", ss(1000), [m(1964)], tacoma).rule_id).toBe("age_unclear");
  });
});

describe("Seattle Utility Discount Program (2026 single $4,269/mo)", () => {
  const sea = { county: "King", city: "Seattle" };
  it("income boundary and value", () => {
    const r = run("seattle_udp", ss(4269), [m()], sea);
    expect([r.rule_id, r.status]).toEqual(["income", "likely"]);
    expect(r.value!.low).toBeCloseTo(720); expect(r.value!.likely).toBeCloseTo(1200); expect(r.value!.high).toBeCloseTo(1200); // 12 x (0.6 x 100 + 0.5 x 80); low = electric only
    expect(run("seattle_udp", ss(4270), [m()], sea).status).toBe("unlikely");
  });
  it("household sizes: 2 and 11 (each additional $247)", () => {
    expect(run("seattle_udp", ss(5582), [m(), m(1951)], sea).status).toBe("likely");
    expect(run("seattle_udp", ss(5583), [m(), m(1951)], sea).status).toBe("unlikely");
    const eleven = Array.from({ length: 11 }, () => m());
    expect(run("seattle_udp", ss(12068), eleven, sea).status).toBe("likely");
    expect(run("seattle_udp", ss(12069), eleven, sea).status).toBe("unlikely");
  });
  it("geography and existing", () => {
    expect(run("seattle_udp", ss(1000), [m()], { county: "Pierce", city: "Tacoma" }).rule_id).toBe("wrong_county");
    expect(run("seattle_udp", ss(1000), [m()], { county: "King", city: "Shoreline" }).rule_id).toBe("outside_seattle");
    expect(run("seattle_udp", ss(1000, { existing_benefits: ["utility_discount"] }), [m()], sea).status).toBe("already_receiving");
  });
});

// Unverified programs: every case must end as needs_human_review, unlikely, or already_receiving. Never a recommendation.
const stubCases: Record<string, [string, Record<string, unknown>, M[], Extra, string][]> = {
  copes: [
    ["70-year-old", {}, [m(1956)], {}, "needs_human_review"], ["40, no disability", {}, [m(1986)], {}, "unlikely"],
    ["40 with disability", {}, [m(1986, { disabled: true })], {}, "needs_human_review"], ["turning 65 this year", {}, [m(1961)], {}, "needs_human_review"], ["turning 64", {}, [m(1962)], {}, "unlikely"],
  ],
  ssi: [
    ["already on SSI", { inc_ssi: 900 }, [m()], {}, "already_receiving"], ["70-year-old", {}, [m()], {}, "needs_human_review"],
    ["40, no disability", {}, [m(1986)], {}, "unlikely"], ["40 with disability", {}, [m(1986, { disabled: true })], {}, "needs_human_review"], ["turning 65", {}, [m(1961)], {}, "needs_human_review"],
  ],
  property_tax_veteran: [
    ["owner veteran", { tenure: "own" }, [m(1950, { veteran: true })], {}, "needs_human_review"], ["renter veteran", {}, [m(1950, { veteran: true })], {}, "unlikely"],
    ["owner non-veteran", { tenure: "own" }, [m()], {}, "unlikely"], ["already has exemption", { tenure: "own", existing_benefits: ["property_tax"] }, [m(1950, { veteran: true })], {}, "already_receiving"],
    ["young owner veteran", { tenure: "own" }, [m(1985, { veteran: true })], {}, "needs_human_review"],
  ],
  va_pension: [
    ["veteran 70", {}, [m(1950, { veteran: true })], {}, "needs_human_review"], ["no veteran", {}, [m()], {}, "unlikely"],
    ["veteran 40 not disabled", {}, [m(1986, { veteran: true })], {}, "unlikely"], ["veteran 40 disabled", {}, [m(1986, { veteran: true, disabled: true })], {}, "needs_human_review"],
    ["already has VA benefits", { existing_benefits: ["va"] }, [m(1950, { veteran: true })], {}, "already_receiving"],
  ],
  weatherization: [
    ["owner", { tenure: "own" }, [m()], {}, "needs_human_review"], ["renter", {}, [m()], {}, "needs_human_review"], ["high income", ss(9000), [m()], {}, "needs_human_review"],
    ["large household", {}, Array.from({ length: 6 }, () => m()), {}, "needs_human_review"], ["young", {}, [m(1990)], {}, "needs_human_review"],
  ],
  pse_help: [
    ["Pierce", {}, [m()], { county: "Pierce" }, "needs_human_review"], ["King", {}, [m()], { county: "King" }, "needs_human_review"], ["zero income", {}, [m()], {}, "needs_human_review"],
    ["high income", ss(9000), [m()], {}, "needs_human_review"], ["couple", {}, [m(), m(1951)], {}, "needs_human_review"],
  ],
  housing_assistance: [
    ["already housed with assistance", { existing_benefits: ["housing"] }, [m()], {}, "already_receiving"], ["renter", {}, [m()], {}, "needs_human_review"],
    ["owner", { tenure: "own" }, [m()], {}, "needs_human_review"], ["couple", {}, [m(), m(1951)], {}, "needs_human_review"], ["high income", ss(9000), [m()], {}, "needs_human_review"],
  ],
  sfmnp: [
    ["61", {}, [m(1965)], {}, "needs_human_review"], ["turning 60", {}, [m(1966)], {}, "needs_human_review"], ["turning 59", {}, [m(1967)], {}, "unlikely"],
    ["40", {}, [m(1986)], {}, "unlikely"], ["80", {}, [m(1946)], {}, "needs_human_review"],
  ],
  family_caregiver: [
    ["helper is family", {}, [m()], { relationship: "family" }, "needs_human_review"], ["two people, self", {}, [m(), m(1951)], { relationship: "self" }, "needs_human_review"],
    ["single, self", {}, [m()], { relationship: "self" }, "unlikely"], ["single, caseworker", {}, [m()], { relationship: "caseworker" }, "unlikely"], ["family, single", ss(1000), [m()], { relationship: "family" }, "needs_human_review"],
  ],
  emergency_relief: [
    ["renter", {}, [m()], {}, "needs_human_review"], ["owner", { tenure: "own" }, [m()], {}, "needs_human_review"], ["zero income", {}, [m()], {}, "needs_human_review"],
    ["high income", ss(9000), [m()], {}, "needs_human_review"], ["family of three", {}, [m(), m(1951), m(1990)], {}, "needs_human_review"],
  ],
};

describe.each(Object.entries(stubCases))("%s (needs_review program)", (id, cases) => {
  it("is flagged needs_review, keeps its sources, and has at least 5 cases", () => {
    const p = programs.find((x) => x.id === id)!;
    expect(p.confidence).toBe("needs_review"); expect(p.source_urls.length).toBeGreaterThan(0); expect(cases.length).toBeGreaterThanOrEqual(5);
  });
  it.each(cases)("%s", (_label, answers, members, extra, status) => {
    const r = run(id, answers, members, extra);
    expect(r.status).toBe(status);
    expect(["eligible", "likely"]).not.toContain(r.status);
  });
});

it("across a spread of households, no unverified program is ever a recommendation", () => {
  const unverified = new Set(programs.filter((p) => p.confidence !== "verified").map((p) => p.id));
  for (const inc of [0, 800, 1400, 2500, 6000]) for (const tenure of ["own", "rent"]) for (const mem of [[m()], [m(1986, { disabled: true, veteran: true })], [m(), m(1951), m(1990)]]) {
    const facts = buildFacts({ answers: { ...base, inc_social_security: inc, tenure }, county: "Pierce", city: "Tacoma" }, mem, 2026);
    for (const r of evaluateAll(programs, facts)) if (unverified.has(r.program_id)) expect(["eligible", "likely"]).not.toContain(r.status);
  }
});
