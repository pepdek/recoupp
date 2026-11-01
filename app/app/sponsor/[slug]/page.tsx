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
    <main className="u-app">
      <header>
        <h1 className="u-title">{s.org.name}</h1>
        <p className="u-muted">{s.completed} of {s.org.min_households} pilot households enrolled · {$(s.fees_paid_cents / 100)} paid</p>
      </header>

      <section className="u-card u-raised u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Recovered-income guarantee (live)</h2>
        <div><p className="u-figure">{$(g.average)}</p><p className="u-small" style={{ fontWeight: 600 }}>average verified a year per household · target {$(g.target)}</p></div>
        <p style={{ fontWeight: 600, color: s.completed === 0 ? "var(--ink-2)" : g.met ? "var(--money)" : "var(--wait)" }}>
          {s.completed === 0 ? "No enrolled households yet." : g.met ? "On or above target." : `Below target by ${$(g.shortfallPer)} per household; credit/refund exposure ${$(g.exposure)} if it stayed here.`}
        </p>
        <p className="u-small u-muted">Only counts approval letters and confirmed receipts that our team verified, not estimates. {Math.round(g.coverage * 100)}% of enrolled households have a verified outcome so far; decisions take weeks, so early numbers run low. Estimated (unverified) yearly value: {$(s.estimated_total)}.</p>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Enrollment funnel</h2>
        <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
          {funnel.map(([label, n]) => (
            <li key={label}>
              <div className="u-row u-small" style={{ justifyContent: "space-between" }}><span>{label}</span><b>{n}</b></div>
              <div className="u-progress" role="img" aria-label={`${label}: ${n}`}><i style={{ width: `${pct(n, top)}%` }} /></div>
            </li>
          ))}
        </ul>
        <p className="u-small u-muted">{s.new_started_30d} new households and {$(s.verified_added_30d)} verified value in the last 30 days.</p>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>By program</h2>
        <div className="u-scroll"><table className="u-table">
          <thead><tr><th>Program</th><th>Claims</th><th>Verified</th><th>Verified yearly value</th></tr></thead>
          <tbody>
            {s.by_program.map((p) => {
              const c = suppress(p.claims);
              return <tr key={p.program_id}><td>{name(p.program_id)}</td>{c === null ? <td colSpan={3} className="u-muted">fewer than {MIN_CELL} households (hidden)</td> : <><td>{c}</td><td>{p.verified_claims}</td><td>{$(p.verified_value)}</td></>}</tr>;
            })}
            {!s.by_program.length && <tr><td className="u-muted" colSpan={4}>No claims yet.</td></tr>}
          </tbody>
        </table></div>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Your enrollment link</h2>
        <div className="u-row" style={{ gap: "var(--sp-3)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/sponsor/${slug}/qr`} alt="QR code for your enrollment link" width={160} height={160} style={{ background: "var(--surface)", objectFit: "contain", borderRadius: "var(--r-1)", padding: 4 }} />
          <div><p className="u-code" style={{ wordBreak: "break-all" }}>{link}</p><p className="u-small u-muted">Residents and members see your name; the questionnaire and review are run by Recoupp.</p></div>
        </div>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Reports</h2>
        <p className="u-row"><a href={`/api/sponsor/${slug}/report?format=pdf`}>Download PDF</a><a href={`/api/sponsor/${slug}/report?format=csv`}>Download CSV</a></p>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Households that chose to share</h2>
        <p className="u-small u-muted">Everyone else appears only in the totals above.</p>
        <ul className="u-stack u-small" style={{ listStyle: "none", padding: 0 }}>
          {(shared ?? []).map((h: { household_id: string; city: string; status: string; claims: { program: string; status: string }[]; verified: number }) => (
            <li key={h.household_id} className="u-card u-stack">{h.city} · {h.status} · verified {$(Number(h.verified))}/yr · {h.claims.map((c) => `${name(c.program)}: ${c.status}`).join(", ") || "no claims yet"}</li>
          ))}
          {!shared?.length && <li className="u-muted">None yet.</li>}
        </ul>
      </section>
    </main>
  );
}
