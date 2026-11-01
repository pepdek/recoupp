import { notFound } from "next/navigation";
import { killReport, ratesFromEnv, type KillMetrics, type Light } from "@/lib/kill";
import { requireAdmin } from "@/lib/admin";

const pct = (v: number | null) => (v === null ? "no data" : `${Math.round(v * 100)}%`);
const word: Record<Light, [string, string]> = { red: ["Failing", "u-badge-bad"], green: ["Passing", "u-badge-ok"], nodata: ["No data", "u-badge-quiet"] };

function Card({ title, value, light, rule, children }: { title: string; value: string; light: Light; rule: string; children?: React.ReactNode }) {
  return (
    <section className="u-card u-stack">
      <h2 className="u-row" style={{ fontSize: "var(--fs-h3)" }}>{title} <span className={`u-badge ${word[light][1]}`}>{word[light][0]}</span></h2>
      <p>{value}</p>
      <p className="u-small u-muted">Kill if {rule}</p>
      {children && <div className="u-small u-muted">{children}</div>}
    </section>
  );
}

export default async function Kill() {
  const { sb } = await requireAdmin();
  const { data, error } = await sb.rpc("kill_metrics");
  if (error || !data) notFound();
  const m = data as KillMetrics, rates = ratesFromEnv(), k = killReport(m, rates);
  const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  return (
    <main className="u-app">
      <h1 className="u-title">Kill criteria</h1>
      <p className="u-muted">Judge at day 90 with real volume; early numbers swing wildly. Red means the criterion is currently failing.</p>
      <Card title="Claim completion" value={pct(k.completion.value)} light={k.completion.light} rule="under 30% of recommended claims are submitted or beyond">
        {m.claims_completed} of {k.completion.n} claims moved past "prepared".
      </Card>
      <Card title="Verified gain vs sponsor fee" value={k.multiple.value === null ? "no data" : `${k.multiple.value.toFixed(1)}x`} light={k.multiple.light} rule="average verified yearly gain is under 5x the fee">
        {$(k.multiple.verified)} verified across enrolled sponsor households against {$(k.multiple.feeBase)} of per-household fees. Direct (B2C) households: {k.b2c.completed}{k.b2c.avgVerified !== null && `, average verified ${$(k.b2c.avgVerified)}`} (the $149 offer's refund test is $1,000 of <i>likely</i> value, not verified).
      </Card>
      <Card title="Gross margin estimate" value={pct(k.margin.value)} light={k.margin.light} rule="margin is under 60% after three pilots">
        Revenue {$(k.margin.revenue)} minus reviewer time {$(k.margin.reviewerCost)} ({k.margin.minutesPerHousehold === null ? "no reviews yet" : `${k.margin.minutesPerHousehold.toFixed(0)} min per household`} at {$(rates.reviewerHourlyUsd)}/hr) minus API cost {$(k.margin.apiCost)}. Reviewer wage and API prices are assumptions (<code>REVIEWER_HOURLY_USD</code>, <code>API_INPUT_PER_MTOK_USD</code>, <code>API_OUTPUT_PER_MTOK_USD</code>). Excludes Stripe fees, hosting, your own time, and support.
      </Card>
    </main>
  );
}
