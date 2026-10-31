import { notFound, redirect } from "next/navigation";
import { guaranteeTest } from "@/lib/guarantee";
import { origin } from "@/lib/origin";
import { MIN_CELL, suppress, type Stats } from "@/lib/report";
import { programs } from "@/lib/programs";
import { supabaseServer } from "@/lib/supabase-server";

const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);

export default async function Sponsor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/login?next=/sponsor/${slug}`);
  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (!org) notFound(); // RLS: only your own org (or an admin) resolves
  const { data: stats, error } = await sb.rpc("sponsor_stats", { p_org: org.id });
  if (error || !stats) notFound();
  const s = stats as Stats;
  const { data: shared } = await sb.rpc("sponsor_shared_households", { p_org: org.id });
  const g = guaranteeTest({ ...s, fee_cents: s.org.fee_cents });
  const link = `${await origin()}/s/${slug}`;
  const funnel: [string, number][] = [["Opened your link", s.visits], ["Started the questionnaire", s.started], ["Completed it", s.completed], ["Submitted a claim", s.submitted], ["Had a claim approved", s.approved]];
  const top = Math.max(1, ...funnel.map((f) => f[1]));
  const name = (id: string) => programs.find((p) => p.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-semibold">{s.org.name}</h1>
        <p className="text-gray-600">{s.completed} of {s.org.min_households} pilot households enrolled · {$(s.fees_paid_cents / 100)} paid</p>
      </header>

      <section className="rounded border p-4">
        <h2 className="text-xl font-semibold">Recovered-income guarantee (live)</h2>
        <p className="mt-1 text-3xl font-semibold">{$(g.average)} <span className="text-base font-normal text-gray-600">average verified yearly gain per enrolled household · target {$(g.target)}</span></p>
        <p className={`mt-1 font-semibold ${s.completed === 0 ? "text-gray-600" : g.met ? "text-green-700" : "text-amber-700"}`}>
          {s.completed === 0 ? "No enrolled households yet." : g.met ? "On or above target." : `Below target by ${$(g.shortfallPer)} per household; credit/refund exposure ${$(g.exposure)} if it stayed here.`}
        </p>
        <p className="mt-2 text-sm text-gray-600">Only counts approval letters and confirmed receipts that our team verified, not estimates. {Math.round(g.coverage * 100)}% of enrolled households have a verified outcome so far; decisions take weeks, so early numbers run low. Estimated (unverified) yearly value: {$(s.estimated_total)}.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Enrollment funnel</h2>
        <ul className="mt-2 space-y-2">
          {funnel.map(([label, n]) => (
            <li key={label}>
              <div className="flex justify-between text-sm"><span>{label}</span><b>{n}</b></div>
              <div className="h-3 rounded bg-gray-100"><div className="h-3 rounded bg-black" style={{ width: `${pct(n, top)}%` }} /></div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-gray-600">{s.new_started_30d} new households and {$(s.verified_added_30d)} verified value in the last 30 days.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">By program</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-1">Program</th><th>Claims</th><th>Verified</th><th>Verified yearly value</th></tr></thead>
          <tbody>
            {s.by_program.map((p) => {
              const c = suppress(p.claims);
              return <tr key={p.program_id} className="border-b"><td className="py-1">{name(p.program_id)}</td>{c === null ? <td colSpan={3} className="text-gray-500">fewer than {MIN_CELL} households (hidden)</td> : <><td>{c}</td><td>{p.verified_claims}</td><td>{$(p.verified_value)}</td></>}</tr>;
            })}
            {!s.by_program.length && <tr><td className="py-2 text-gray-500" colSpan={4}>No claims yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your enrollment link</h2>
        <div className="mt-2 flex flex-wrap items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/sponsor/${slug}/qr`} alt="QR code for your enrollment link" className="size-40 rounded border" />
          <div><p className="break-all font-mono text-sm">{link}</p><p className="mt-2 text-sm text-gray-600">Residents and members see your name; the questionnaire and review are run by Recoup.</p></div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Reports</h2>
        <p className="mt-1 flex gap-4"><a className="underline" href={`/api/sponsor/${slug}/report?format=pdf`}>Download PDF</a><a className="underline" href={`/api/sponsor/${slug}/report?format=csv`}>Download CSV</a></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Households that chose to share</h2>
        <p className="text-sm text-gray-600">Everyone else appears only in the totals above.</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(shared ?? []).map((h: { household_id: string; city: string; status: string; claims: { program: string; status: string }[]; verified: number }) => (
            <li key={h.household_id} className="rounded border p-2">{h.city} · {h.status} · verified {$(Number(h.verified))}/yr · {h.claims.map((c) => `${name(c.program)}: ${c.status}`).join(", ") || "no claims yet"}</li>
          ))}
          {!shared?.length && <li className="text-gray-500">None yet.</li>}
        </ul>
      </section>
    </main>
  );
}
