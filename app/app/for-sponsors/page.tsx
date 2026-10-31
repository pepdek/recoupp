import type { Metadata } from "next";
import { Icon, money } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "For organizations: the founding pilot" };
const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const mail = contact ? `mailto:${contact}?subject=${encodeURIComponent("Founding Sponsor Pilot")}` : "#book";

const rows: [string, number, number, number][] = [
  ["Medicare Savings Program", 14, 5, 12175],
  ["Basic Food", 17, 8, 4310],
  ["Utility discounts", 11, 6, 2457],
  ["Lifeline", 9, 7, 777],
];

export default function ForSponsors() {
  return (
    <main className="dense">
      {/* Signature: an oversized italic 5x, cropped by the edge of the page */}
      <section className="relative overflow-hidden">
        <p aria-hidden className="display pointer-events-none absolute -right-6 -top-10 select-none text-[clamp(16rem,52vw,40rem)] italic leading-none text-white/55 md:-right-16">5×</p>
        <div className="wrap relative grid gap-8 py-10 md:grid-cols-[1.3fr_1fr] md:py-16">
          <div className="glass pad" data-light>
            <p className="small font-bold">Founding Sponsor Pilot · Washington State</p>
            <h1 className="mt-3">We only count dollars with a <em>paper trail</em>.</h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem]">Your members get help with benefit applications. You get a monthly report of verified dollars: approval letters and confirmed receipts that our staff checked and logged. Estimates never count toward the guarantee.</p>
            <p className="mt-5 flex flex-wrap items-center gap-4">
              <a className="btn" href={mail} data-light>Book a pilot</a>
              <span className="small font-bold">{money(99)} per household · 100 households minimum</span>
            </p>
          </div>
          <div className="glass pad self-end">
            <p className="small flex items-center gap-2 font-bold"><Icon name="shield" size={18} />Recovered-Income Guarantee</p>
            <p className="display mt-2 text-4xl leading-tight">5× your fee, or we make it <em>right</em>.</p>
            <p className="small mt-3">If average verified yearly gain per enrolled household is under {money(495)} (5 × {money(99)}) after the first year, you choose a credit or a refund of the shortfall, capped at what you paid. Every household counts in the average, including those with no gain. Agencies make the final decisions, and we can't promise approvals.</p>
          </div>
        </div>
      </section>

      <section className="wrap mt-10" aria-labelledby="rep">
        <div className="glass pad grid gap-8 md:grid-cols-[1fr_1.7fr]">
          <div>
            <h2 id="rep">The monthly report</h2>
            <p className="mt-3">A PDF and a CSV, plus a live dashboard. Programs with fewer than 5 claims are hidden so nobody can be picked out.</p>
            <p className="mt-3"><span className="pill pill-amber"><Icon name="alert" size={16} />Demo data</span> <span className="small">Made-up numbers for a made-up group.</span></p>
          </div>
          <div className="stack">
            <div className="cheque">
              <p className="small font-bold">Average verified a year per household · target {money(495)}</p>
              <div className="line mt-1"><span className="amount">{money(313)}</span><span className="small font-bold">63 of 100 enrolled</span></div>
              <p className="small muted mt-2">Below target. Decisions take weeks, so early months run low. Estimated, not verified: {money(61204)}.</p>
            </div>
            <table className="tbl">
              <caption className="sr-only">Sample claims by program</caption>
              <thead><tr><th>Program</th><th className="num">Claims</th><th className="num">Verified</th><th className="num">Verified a year</th></tr></thead>
              <tbody>{rows.map(([n, c, v, d]) => <tr key={n}><td>{n}</td><td className="num">{c}</td><td className="num">{v}</td><td className="num">{money(d)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="wrap mt-10" aria-labelledby="link">
        <div className="glass pad grid gap-8 md:grid-cols-2">
          <div>
            <h2 id="link">Your own link and QR code</h2>
            <p className="mt-3">Members open a page with your name on it, then answer the questions. We run the review. Put the link in a newsletter. Print the QR code on a flyer.</p>
            <p className="mt-3">Members choose whether you see their individual results. The box is unchecked by default.</p>
          </div>
          <ol className="ticket stack">
            {[["qr", "You get a link and QR code"], ["doc", "Members answer, about 15 minutes"], ["shield", "We review every result"], ["calendar", "You get the report each month"]].map(([i, t]) => <li key={t} className="flex items-center gap-3"><Icon name={i} /><span className="font-bold">{t}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="wrap mt-10" aria-labelledby="trust">
        <div className="glass pad">
          <h2 id="trust">What we collect and who sees it</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {[
              "No Social Security numbers, ever. Our sheets leave a blank line and the member writes it in.",
              "You see totals. Rows under 5 are hidden. Individual results only if the member ticks the share box.",
              "Every table is locked down by row, so one household can't read another. We tested that in the database.",
              "Documents sit in private storage. Links to view them expire after 5 minutes.",
              "Members can download or delete their data from their account page.",
              "Our log of verified outcomes has no names and can't be edited, only added to.",
            ].map((t) => <li key={t} className="flex gap-3"><Icon name="lock" size={20} /><span>{t}</span></li>)}
          </ul>
          <p className="small mt-4">The Sponsor Agreement is available on request. We are still having our legal drafts reviewed by an attorney, so ask us before you sign anything.</p>
        </div>
      </section>

      <section id="book" className="wrap mt-10 scroll-mt-20" aria-labelledby="pay">
        <div className="glass pad">
          <h2 id="pay">Book a pilot and pay</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="ticket"><p className="display text-4xl">{money(9900)}</p><p className="small">100 households × {money(99)}</p></div>
            <div className="ticket"><p className="display text-4xl">{money(4950)} now</p><p className="small">First invoice, by bank transfer (ACH) or card</p></div>
            <div className="ticket"><p className="display text-4xl">{money(4950)} later</p><p className="small">Second invoice when household 50 enrolls</p></div>
          </div>
          <p className="mt-5"><a className="btn" href={mail}>{contact ? "Email us to start" : "Contact us to start"}</a></p>
          <p className="small mt-3">We set up your link, your dashboard login and the first invoice. {BRAND} is a paperwork service, not a law firm or financial adviser.</p>
        </div>
      </section>
    </main>
  );
}
