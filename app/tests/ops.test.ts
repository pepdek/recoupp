import { describe, expect, it } from "vitest";
import { killReport, type KillMetrics } from "../lib/kill";
import { dueReminders, message, weekKey, type ClaimRow } from "../lib/reminders";

const now = new Date("2026-11-10T16:00:00Z");
const claim = (o: Partial<ClaimRow> = {}): ClaimRow => ({ id: "c1", household_id: "h1", program_id: "msp", status: "recommended", renewal_due: null, created_at: "2026-10-20T00:00:00Z", ...o });
const run = (c: ClaimRow, docs = 0, sent: string[] = []) => dueReminders(now, [c], new Map([["h1", docs]]), new Set(sent));

describe("reminders", () => {
  it("docs_missing: only after 7 days, only with zero documents", () => {
    expect(run(claim()).map((d) => d.kind)).toEqual(["docs_missing"]);
    expect(run(claim({ created_at: "2026-11-05T00:00:00Z" }))).toEqual([]);
    expect(run(claim(), 1)).toEqual([]);
    expect(run(claim({ status: "submitted" }))).toEqual([]);
  });
  it("weekly kinds don't repeat within a week and stop after the cap", () => {
    const k = run(claim())[0].key;
    expect(run(claim(), 0, [k])).toEqual([]);
    const prior = ["c1:docs_missing:2026-W01", "c1:docs_missing:2026-W02", "c1:docs_missing:2026-W03"];
    expect(run(claim(), 0, prior)).toEqual([]);
  });
  it("needs_info reminds weekly while the status holds", () => {
    expect(run(claim({ status: "needs_info" })).map((d) => d.kind)).toEqual(["needs_info"]);
    expect(run(claim({ status: "approved" }))).toEqual([]);
  });
  it("renewal: 30-day then 7-day, each once; not far-out or long-expired", () => {
    expect(run(claim({ status: "receiving", renewal_due: "2026-12-05" })).map((d) => d.kind)).toEqual(["renewal_30"]);
    expect(run(claim({ status: "receiving", renewal_due: "2026-11-14" })).map((d) => d.kind)).toEqual(["renewal_7"]);
    expect(run(claim({ status: "receiving", renewal_due: "2026-11-14" }), 0, ["c1:renewal_7:once"])).toEqual([]);
    expect(run(claim({ status: "receiving", renewal_due: "2027-03-01" }))).toEqual([]);
    expect(run(claim({ status: "receiving", renewal_due: "2026-09-01" }))).toEqual([]);
  });
  it("week bucket changes across weeks; messages carry no personal details", () => {
    expect(weekKey(new Date("2026-11-10T00:00:00Z"))).not.toBe(weekKey(new Date("2026-11-20T00:00:00Z")));
    const m = message("renewal_7", "Basic Food", "https://x.test");
    expect(m.subject).toMatch(/Basic Food/); expect(m.text).toContain("https://x.test/plan"); expect(m.text).toMatch(/stop sending/);
  });
});

const base: KillMetrics = { claims_total: 0, claims_completed: 0, revenue_cents: 0, reviewer_seconds: 0, reviewed_households: 0, extract_input_tokens: 0, extract_output_tokens: 0, orgs: [], b2c: { completed: 0, verified_total: 0 } };
const rates = { reviewerHourlyUsd: 40, inputPerMtokUsd: 2, outputPerMtokUsd: 10 };

describe("kill criteria", () => {
  it("no data -> nodata, never a false alarm", () => {
    const k = killReport(base, rates);
    expect([k.completion.light, k.multiple.light, k.margin.light]).toEqual(["nodata", "nodata", "nodata"]);
  });
  it("completion threshold is 30%", () => {
    expect(killReport({ ...base, claims_total: 10, claims_completed: 3 }, rates).completion.light).toBe("green");
    expect(killReport({ ...base, claims_total: 10, claims_completed: 2 }, rates).completion.light).toBe("red");
  });
  it("verified multiple is total verified over total per-household fees; threshold 5x", () => {
    const org = (verified_total: number) => ({ name: "A", fee_cents: 9900, completed: 100, verified_total });
    expect(killReport({ ...base, orgs: [org(49500)] }, rates).multiple).toMatchObject({ value: 5, light: "green" });
    expect(killReport({ ...base, orgs: [org(49400)] }, rates).multiple.light).toBe("red");
  });
  it("margin = (revenue - reviewer time - API) / revenue; threshold 60%", () => {
    const m = { ...base, revenue_cents: 1_000_00, reviewer_seconds: 3600 * 5, extract_input_tokens: 1_000_000, extract_output_tokens: 100_000 };
    const k = killReport(m, rates).margin; // revenue 1000, reviewer 200, api 2 + 1 = 3
    expect(k.value).toBeCloseTo((1000 - 200 - 3) / 1000);
    expect(k.light).toBe("green");
    expect(killReport({ ...m, reviewer_seconds: 3600 * 12 }, rates).margin.light).toBe("red"); // 480 + 3 -> 48%
  });
});
