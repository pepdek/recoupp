import { describe, expect, it } from "vitest";
import { guaranteeTest } from "../lib/guarantee";
import { MIN_CELL, reportCsv, reportRows, suppress, type Stats } from "../lib/report";

const g = (o: Partial<Parameters<typeof guaranteeTest>[0]>) => guaranteeTest({ verified_total: 0, completed: 100, fee_cents: 9900, fees_paid_cents: 990000, households_with_verified: 0, ...o });

describe("guarantee test (fee $99 -> target $495)", () => {
  it("target is 5x fee", () => expect(g({}).target).toBe(495));
  it("exactly at target is met; one dollar per household under is not", () => {
    expect(g({ verified_total: 49500 }).met).toBe(true);
    expect(g({ verified_total: 49400 }).met).toBe(false);
  });
  it("averages over all enrolled households, zeros included", () => expect(g({ verified_total: 20000, completed: 100 }).average).toBe(200));
  it("no enrolled households is never 'met' and has no exposure", () => {
    const r = g({ completed: 0, fees_paid_cents: 0 });
    expect([r.met, r.average, r.exposure]).toEqual([false, 0, 0]);
  });
  it("credit exposure is the shortfall but capped at fees paid", () => {
    expect(g({ verified_total: 40000, completed: 100, fees_paid_cents: 9_900_000 }).exposure).toBe(9500); // (495-400)*100
    expect(g({ verified_total: 0, completed: 100, fees_paid_cents: 495000 }).exposure).toBe(4950);        // capped: fees paid
  });
  it("coverage is the share of enrolled households with a verified outcome", () => expect(g({ households_with_verified: 25 }).coverage).toBe(0.25));
});

const stats: Stats = {
  org: { id: "o", name: 'Acme "Seniors"', slug: "acme", fee_cents: 9900, min_households: 100 },
  visits: 300, started: 120, completed: 100, submitted: 40, approved: 20, estimated_total: 90000, verified_total: 30000,
  households_with_verified: 20, new_started_30d: 50, verified_added_30d: 10000, fees_paid_cents: 495000,
  by_program: [{ program_id: "msp", claims: 60, verified_claims: 10, verified_value: 24000 }, { program_id: "basic_food", claims: 3, verified_claims: 1, verified_value: 900 }],
};

describe("sponsor report", () => {
  it("hides program rows under the minimum cell size", () => {
    expect([suppress(MIN_CELL - 1), suppress(MIN_CELL)]).toEqual([null, MIN_CELL]);
    const rows = reportRows(stats, "2026-11-01").filter(([k]) => k.startsWith("Program:"));
    expect(rows.find(([k]) => k.includes("Basic Food"))![1]).toMatch(/hidden/);
    expect(rows.find(([k]) => k.includes("Medicare Savings"))![1]).toMatch(/60 claims/);
    expect(JSON.stringify(rows)).not.toContain("900");
  });
  it("CSV escapes quotes and reports the guarantee status", () => {
    const csv = reportCsv(stats, "2026-11-01");
    expect(csv).toContain('"Acme ""Seniors"""');
    expect(csv).toContain("Below target");
  });
});
