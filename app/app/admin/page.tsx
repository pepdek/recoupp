import Link from "next/link";
import { programs } from "@/lib/programs";
import { requireAdmin } from "@/lib/admin";

const $ = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const STALE_DAYS = 365;

export default async function Admin() {
  const { sb } = await requireAdmin();
  const [{ data: pay }, { data: orgs }] = await Promise.all([
    sb.from("payments").select("id, offer, email, amount_cents, refunded_cents, status, created_at, org_id").order("created_at", { ascending: false }).limit(50),
    sb.from("organizations").select("id, name, slug, fee_cents, min_households, created_at"),
  ]);
  const old = (d: string) => (Date.now() - new Date(d).getTime()) / 864e5 > STALE_DAYS;
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-3xl font-semibold">Admin</h1>
      <p className="flex gap-4"><Link className="underline" href="/admin/kill">Kill-criteria dashboard</Link><Link className="underline" href="/review">Review queue</Link></p>

      <section>
        <h2 className="text-xl font-semibold">Programs ({programs.length})</h2>
        <p className="text-sm text-gray-600">Rules live in <code>/programs/*.yaml</code> in git: edit there and bump <code>last_verified</code> after re-checking the source. Unverified programs are never auto-recommended.</p>
        <table className="mt-2 w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-1">Program</th><th>Confidence</th><th>Last verified</th><th>Version</th></tr></thead>
          <tbody>{programs.map((p) => (
            <tr key={p.id} className="border-b"><td className="py-1">{p.name}</td>
              <td className={p.confidence === "verified" ? "text-green-700" : "text-amber-700"}>{p.confidence}</td>
              <td className={old(p.last_verified) ? "font-semibold text-red-700" : ""}>{p.last_verified}{old(p.last_verified) && " (stale)"}</td><td className="font-mono">{p.version}</td></tr>
          ))}</tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sponsors</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-1">Name</th><th>Link</th><th>Fee</th><th>Minimum</th></tr></thead>
          <tbody>{orgs?.map((o) => <tr key={o.id} className="border-b"><td className="py-1"><Link className="underline" href={`/sponsor/${o.slug}`}>{o.name}</Link></td><td className="font-mono">/s/{o.slug}</td><td>{$(o.fee_cents)}</td><td>{o.min_households}</td></tr>)}
            {!orgs?.length && <tr><td colSpan={4} className="py-2 text-gray-500">None yet. Create one with scripts/sponsor-invoice.ts.</td></tr>}</tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Payments (latest 50)</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-1">Date</th><th>Offer</th><th>Email</th><th>Amount</th><th>Refunded</th><th>Status</th></tr></thead>
          <tbody>{pay?.map((p) => <tr key={p.id} className="border-b"><td className="py-1">{p.created_at.slice(0, 10)}</td><td>{p.offer}</td><td>{p.email ?? "—"}</td><td>{$(p.amount_cents)}</td><td>{p.refunded_cents ? $(p.refunded_cents) : ""}</td><td>{p.status}</td></tr>)}
            {!pay?.length && <tr><td colSpan={6} className="py-2 text-gray-500">No payments yet.</td></tr>}</tbody>
        </table>
      </section>
    </main>
  );
}
