import Link from "next/link";
import QueueKeys from "@/components/QueueKeys";
import { claimPlan, evaluateAll } from "@/lib/engine";
import { buildFacts } from "@/lib/facts";
import { programs } from "@/lib/programs";
import { requireStaff } from "@/lib/staff";

const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default async function Queue() {
  const { sb } = await requireStaff();
  const { data: hs } = await sb.from("households").select("id, county, city, relationship, created_at, answers, updated_at").eq("status", "completed").is("reviewed_at", null);
  const ids = (hs ?? []).map((h) => h.id);
  const [{ data: members }, { data: esc }] = await Promise.all([
    sb.from("household_members").select("*").in("household_id", ids),
    sb.from("evaluations").select("household_id").in("household_id", ids).eq("review_state", "escalated"),
  ]);
  const escalated = new Set((esc ?? []).map((e) => e.household_id));
  const rows = (hs ?? []).map((h) => {
    const ms = (members ?? []).filter((m) => m.household_id === h.id);
    const plan = claimPlan(evaluateAll(programs, buildFacts(h, ms)));
    return { h, value: plan.total.likely + plan.pending_review_total.likely, days: Math.floor((Date.now() - new Date(h.updated_at).getTime()) / 864e5), escalated: escalated.has(h.id) };
  }).sort((a, b) => b.value - a.value || b.days - a.days);

  return (
    <main className="wrap py-6">
      <h1>Review queue</h1>
      <p className="muted mt-1">{rows.length} waiting. Sorted by estimated yearly value, then age.</p>
      <div className="mt-2"><QueueKeys /></div>
      <table className="tbl mt-4">
        <thead><tr><th>Household</th><th>Filled by</th><th className="num">Est. a year</th><th className="num">Waiting</th><th>State</th></tr></thead>
        <tbody>
          {rows.map(({ h, value, days, escalated: e }) => (
            <tr key={h.id}>
              <td><Link data-row href={`/review/${h.id}`} className="font-bold">{h.city}, {h.county} County</Link></td>
              <td>{h.relationship}</td><td className="num">~{$(value)}</td><td className="num">{days}d</td>
              <td>{e ? <span className="pill pill-red">Escalated</span> : "New"}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="muted">Nothing waiting.</td></tr>}
        </tbody>
      </table>
    </main>
  );
}
