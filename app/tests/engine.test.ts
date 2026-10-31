import { describe, expect, it } from "vitest";
import { claimPlan, evaluateAll, type Program } from "../lib/engine";
import { buildFacts } from "../lib/facts";
import { programs } from "../lib/programs";

type M = { birth_year: number; veteran: boolean; disabled: boolean };
const m = (birth_year = 1950, o: Partial<M> = {}): M => ({ birth_year, veteran: false, disabled: false, ...o });
const base = { inc_social_security: 0, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0, asset_bank: 0, asset_other: 0, tenure: "rent", medicare: "yes", medicaid: "no", existing_benefits: [] as string[] };

function run(id: string, answers: Record<string, unknown> = {}, members: M[] = [m()]) {
  const facts = buildFacts({ answers: { ...base, ...answers } }, members, 2026);
  const all = evaluateAll(programs, facts);
  return { r: all.find((x) => x.program_id === id)!, all };
}
const ss = (n: number, extra: Record<string, unknown> = {}) => ({ inc_social_security: n, ...extra });

describe("Medicare Savings Program (single: QMB 1463, SLMB 1596, QI 1835.40)", () => {
  it.each([
    [1463, "qmb", "eligible"], [1464, "slmb", "eligible"], [1596, "slmb", "eligible"],
    [1597, "qi", "likely"], [1835, "qi", "likely"], [1855, "near_limit", "needs_human_review"], [1856, "over", "unlikely"],
  ])("income %i -> %s", (inc, rule, status) => {
    const { r } = run("msp", ss(inc));
    expect([r.rule_id, r.status]).toEqual([rule, status]);
  });
  it("has no resource test", () => expect(run("msp", ss(1000, { asset_bank: 500000 })).r.status).toBe("eligible"));
  it("couple uses the 2-person limit (1983.33)", () => {
    const two = [m(1950), m(1952)];
    expect(run("msp", ss(1983), two).r.status).toBe("eligible");
    expect(run("msp", ss(1984), two).r.rule_id).toBe("slmb");
  });
  it("routes medicare no/unsure, 3+ people, wages, and existing benefit", () => {
    expect(run("msp", ss(1000, { medicare: "no" })).r.status).toBe("unlikely");
    expect(run("msp", ss(1000, { medicare: "unsure" })).r.status).toBe("needs_human_review");
    expect(run("msp", ss(1000), [m(), m(1951), m(1980)]).r.rule_id).toBe("unit_unclear");
    expect(run("msp", { inc_social_security: 1800, inc_wages: 700 }).r.rule_id).toBe("wages");
    expect(run("msp", ss(1000, { existing_benefits: ["msp"] })).r.status).toBe("already_receiving");
  });
  it("values QMB at 12 months of Part B premium", () => expect(run("msp", ss(1000)).r.value).toEqual({ low: 2434.8, likely: 2434.8, high: 2434.8 }));
});

describe("Extra Help (single: income 23,940/yr, resources 18,090)", () => {
  it("within both limits -> eligible", () => expect(run("extra_help", ss(1995, { asset_bank: 18090 })).r.rule_id).toBe("within"));
  it("income $12/yr over -> human review", () => expect(run("extra_help", ss(1996)).r.rule_id).toBe("near"));
  it("savings $1 over -> review; $1,501 over -> unlikely", () => {
    expect(run("extra_help", ss(1995, { asset_bank: 18091 })).r.status).toBe("needs_human_review");
    expect(run("extra_help", ss(1995, { asset_bank: 19591 })).r.status).toBe("unlikely");
  });
  it("deemed eligible through MSP regardless of savings", () => {
    const { r } = run("extra_help", ss(1400, { asset_bank: 50000 }));
    expect([r.rule_id, r.status]).toEqual(["auto_msp", "eligible"]);
  });
  it("QI-tier MSP -> likely; SSI -> eligible; no medicare -> unlikely", () => {
    expect(run("extra_help", ss(1800)).r.status).toBe("likely");
    expect(run("extra_help", { inc_ssi: 967 }).r.rule_id).toBe("auto_ssi");
    expect(run("extra_help", ss(1000, { medicare: "no" })).r.status).toBe("unlikely");
  });
  it("shows no dollar value (no verified formula)", () => expect(run("extra_help", ss(1400)).r.value).toBeNull());
});

describe("Basic Food (single 60+: net limit 1305, ceiling 2610, max benefit 298)", () => {
  it("zero income gets the max allotment", () => expect(run("basic_food", {}).r.value).toEqual({ low: 3576, likely: 3576, high: 3576 }));
  it("at the net limit -> eligible, range floors at 0", () => {
    const { r } = run("basic_food", ss(1305));
    expect(r.status).toBe("eligible");
    expect(r.value).toEqual({ low: 0, likely: 1788, high: 3576 });
  });
  it("mid income range", () => expect(run("basic_food", ss(600)).r.value).toEqual({ low: 1416, likely: 2496, high: 3576 }));
  it.each([[1306, "needs_human_review"], [2610, "needs_human_review"], [2611, "unlikely"]])("income %i -> %s", (inc, status) =>
    expect(run("basic_food", ss(inc)).r.status).toBe(status));
  it("under-60 non-disabled needs a reviewer; over gross limit unlikely", () => {
    expect(run("basic_food", ss(1000), [m(2006)]).r.status).toBe("needs_human_review");
    expect(run("basic_food", ss(1697), [m(2006)]).r.status).toBe("unlikely");
  });
  it("turning 60 this year depends on birthday -> review", () => expect(run("basic_food", ss(1000), [m(1966)]).r.rule_id).toBe("age_unclear"));
  it("disabled member uses net limit", () => expect(run("basic_food", ss(1305), [m(1981, { disabled: true })]).r.rule_id).toBe("disabled_pass"));
  it("two people: limit 1763 / 1764", () => {
    const two = [m(1950), m(1952)];
    expect(run("basic_food", ss(1763), two).r.status).toBe("eligible");
    expect(run("basic_food", ss(1764), two).r.status).toBe("needs_human_review");
  });
  it("existing benefit", () => expect(run("basic_food", ss(500, { existing_benefits: ["basic_food"] })).r.status).toBe("already_receiving"));
});

describe("Apple Health (unverified limits -> never a recommendation)", () => {
  it.each([[0], [500], [1500], [3000], [9000]])("income %i -> human review only", (inc) => {
    const { r } = run("apple_health", ss(inc));
    expect(r.status).toBe("needs_human_review");
    expect(r.reviewer_only).toBe(true);
  });
  it("already covered", () => {
    expect(run("apple_health", { medicaid: "yes" }).r.status).toBe("already_receiving");
    expect(run("apple_health", { existing_benefits: ["apple_health"] }).r.status).toBe("already_receiving");
  });
});

describe("Senior property tax exemption (income thresholds unverified)", () => {
  const own = { tenure: "own" };
  it("owner 61+ -> review (never eligible)", () => expect(run("property_tax", own).r.rule_id).toBe("age_ok"));
  it("renter -> unlikely", () => expect(run("property_tax", { tenure: "rent" }).r.status).toBe("unlikely"));
  it("owner turning 61 this year -> review; turning 60 -> unlikely", () => {
    expect(run("property_tax", own, [m(1965)]).r.rule_id).toBe("age_or_disability_unclear");
    expect(run("property_tax", own, [m(1966)]).r.status).toBe("unlikely");
  });
  it("young disabled or veteran owner -> review", () => {
    expect(run("property_tax", own, [m(1985, { disabled: true })]).r.status).toBe("needs_human_review");
    expect(run("property_tax", own, [m(1971, { veteran: true })]).r.status).toBe("needs_human_review");
  });
  it("already has it", () => expect(run("property_tax", { ...own, existing_benefits: ["property_tax"] }).r.status).toBe("already_receiving"));
});

describe("program data and engine invariants", () => {
  it("every program has sources, a verification date, and a catch-all last rule", () => {
    for (const p of programs) {
      expect(p.source_urls.length, p.id).toBeGreaterThan(0);
      expect(p.last_verified, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.rules.at(-1)!.when, p.id).toBe(true);
    }
  });
  it("an unverified program can never return eligible/likely, whatever its rules say", () => {
    const forged: Program = { ...programs.find((p) => p.id === "msp")!, confidence: "needs_review" };
    const facts = buildFacts({ answers: { ...base, inc_social_security: 1000 } }, [m()], 2026);
    const [r] = evaluateAll([forged], facts);
    expect(r.status).toBe("needs_human_review");
    expect(r.reviewer_only).toBe(true);
  });
  it("claim plan puts MSP before Extra Help, flags provisional totals, and lists non-recommendations", () => {
    const { all } = run("msp", ss(1400));
    const plan = claimPlan(all);
    const ids = plan.items.map((i) => i.program_id);
    expect(ids.indexOf("msp")).toBeLessThan(ids.indexOf("extra_help"));
    expect(plan.items.find((i) => i.program_id === "extra_help")!.note).toMatch(/first/);
    expect(plan.total_provisional).toBe(true);
    expect(plan.total.high).toBeGreaterThanOrEqual(plan.total.likely);
    expect(plan.total.likely).toBeCloseTo(2434.8 + 111); // MSP premium + Lifeline ($9.25 x 12); Basic Food is pending review
    expect(plan.pending_review_total.high).toBe(3576);
    expect(plan.items.every((i) => i.requires_review)).toBe(true);
  });
  it("every result carries a reason", () => {
    const { all } = run("msp", ss(1400));
    for (const r of all) expect(r.reason.length, r.program_id).toBeGreaterThan(10);
    for (const r of all) expect(r.reason, r.program_id).not.toMatch(/\{\$?\w+\}/);
  });
});
