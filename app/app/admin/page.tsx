import Link from "next/link";
import { programs } from "@/lib/programs";
import { requireAdmin } from "@/lib/admin";

const $ = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const STALE_DAYS = 365;

export default async function Admin() {
  const { sb } = await requireAdmin();
  const [{ data: pay }, { data: orgs }, { data: funnel }] = await Promise.all([
    sb.from("payments").select("id, offer, email, amount_cents, refunded_cents, status, created_at, org_id").order("created_at", { ascending: false }).limit(50),
    sb.from("organizations").select("id, name, slug, fee_cents, min_households, created_at"),
    sb.rpc("site_funnel", { p_days: 30 }),
  ]);
  const old = (d: string) => (Date.now() - new Date(d).getTime()) / 864e5 > STALE_DAYS;
  return (
    <main className="u-app">
      <h1 className="u-title">Admin</h1>
      <p className="u-row"><Link href="/admin/kill">Kill-criteria dashboard</Link><Link href="/review">Review queue</Link></p>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Public site funnel (last 30 days)</h2>
        <p className="u-small u-muted">Counts only: no names, emails or answers. Paid checkouts are in Payments below.</p>
        <div className="u-scroll"><table className="u-table"><thead><tr><th>Event</th><th className="n">Count</th></tr></thead><tbody>{(funnel as { name: string; events: number }[] | null)?.map((f) => <tr key={f.name}><td>{f.name}</td><td className="n">{f.events}</td></tr>)}{!funnel?.length && <tr><td colSpan={2} className="u-muted">No events yet.</td></tr>}</tbody></table></div>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Programs ({programs.length})</h2>
        <p className="u-small u-muted">Rules live in <code>/programs/*.yaml</code> in git: edit there and bump <code>last_verified</code> after re-checking the source. Unverified programs are never auto-recommended.</p>
        <div className="u-scroll"><table className="u-table">
          <thead><tr><th>Program</th><th>Confidence</th><th>Last verified</th><th>Version</th></tr></thead>
          <tbody>{programs.map((p) => (
            <tr key={p.id}><td>{p.name}</td>
              <td className={p.confidence === "verified" ? "text-forest font-bold" : "font-bold"}>{p.confidence}</td>
              <td className={old(p.last_verified) ? "text-pill font-bold" : ""}>{p.last_verified}{old(p.last_verified) && " (stale)"}</td><td className="u-code">{p.version}</td></tr>
          ))}</tbody>
        </table></div>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Sponsors</h2>
        <div className="u-scroll"><table className="u-table">
          <thead><tr><th>Name</th><th>Link</th><th>Fee</th><th>Minimum</th></tr></thead>
          <tbody>{orgs?.map((o) => <tr key={o.id}><td><Link href={`/sponsor/${o.slug}`}>{o.name}</Link></td><td className="u-code">/s/{o.slug}</td><td>{$(o.fee_cents)}</td><td>{o.min_households}</td></tr>)}
            {!orgs?.length && <tr><td colSpan={4} className="u-muted">None yet. Create one with scripts/sponsor-invoice.ts.</td></tr>}</tbody>
        </table></div>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Payments (latest 50)</h2>
        <div className="u-scroll"><table className="u-table">
          <thead><tr><th>Date</th><th>Offer</th><th>Email</th><th>Amount</th><th>Refunded</th><th>Status</th></tr></thead>
          <tbody>{pay?.map((p) => <tr key={p.id}><td>{p.created_at.slice(0, 10)}</td><td>{p.offer}</td><td>{p.email ?? "—"}</td><td>{$(p.amount_cents)}</td><td>{p.refunded_cents ? $(p.refunded_cents) : ""}</td><td>{p.status}</td></tr>)}
            {!pay?.length && <tr><td colSpan={6} className="u-muted">No payments yet.</td></tr>}</tbody>
        </table></div>
      </section>
    </main>
  );
}
