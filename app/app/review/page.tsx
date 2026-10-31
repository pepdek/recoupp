import Link from "next/link";
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
    <main className="mx-auto max-w-3xl p-6 text-lg">
      <h1 className="text-3xl font-semibold">Review queue</h1>
      <p className="mt-1 text-gray-600">{rows.length} waiting · sorted by estimated yearly value, then age</p>
      <ul className="mt-4 space-y-2">
        {rows.map(({ h, value, days, escalated: e }) => (
          <li key={h.id}>
            <Link href={`/review/${h.id}`} className="flex justify-between rounded border p-3 hover:bg-gray-50">
              <span>{h.city}, {h.county} County · {h.relationship === "self" ? "self" : `by ${h.relationship}`}{e && <b className="ml-2 text-red-700">escalated</b>}</span>
              <span>~{$(value)}/yr · {days}d</span>
            </Link>
          </li>
        ))}
        {!rows.length && <li className="text-gray-600">Nothing waiting.</li>}
      </ul>
    </main>
  );
}
