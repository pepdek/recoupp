import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { DemoTag, EmailLink4 } from "@/components/v4";
import { money } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = { title: "For organizations: the founding pilot", description: "Give your members help with benefit applications and get a monthly report of verified dollars. Founding pilot for Washington organizations.", alternates: { canonical: "/for-sponsors" } };
const mail = SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Founding Sponsor Pilot")}` : "#book";

const rows: [string, number, number, number][] = [
  ["Medicare Savings Program", 14, 5, 12175],
  ["Basic Food", 17, 8, 4310],
  ["Utility discounts", 11, 6, 2457],
  ["Lifeline", 9, 7, 777],
];
const H = { fontSize: "var(--fs-h3)" } as const;

export default function ForSponsors() {
  return (
    <main>
      <section className="u-hero" aria-labelledby="h1"><div className="u-wrap u-hero-grid">
        <div className="u-stack">
          <p className="u-eyebrow">Founding Sponsor Pilot · Washington State</p>
          <h1 id="h1">We only count dollars with a paper trail.</h1>
          <p className="u-muted">Your members get help with benefit applications. You get a monthly report of verified dollars: approval letters and confirmed receipts that our staff checked and logged. Estimates never count toward the guarantee.</p>
          <div className="u-row" style={{ marginTop: "var(--sp-2)" }}><a className="u-btn u-btn-primary u-btn-lg" href={mail}>Book a pilot</a><span className="u-small" style={{ fontWeight: 600 }}>{money(99)} per household · 100 households minimum</span></div>
        </div>
        <div className="u-card u-raised u-stack">
          <p className="u-eyebrow" style={{ display: "flex", gap: "var(--sp-1)", alignItems: "center" }}><Icon name="shield" size={18} />Recovered-Income Guarantee</p>
          <h2>5× your fee, or we make it right.</h2>
          <p className="u-small u-muted">If average verified yearly gain per enrolled household is under {money(495)} (5 × {money(99)}) after the first year, you choose a credit or a refund of the shortfall, capped at what you paid. Every household counts in the average.</p>
        </div>
      </div></section>

      <section className="u-wrap u-section" aria-labelledby="rep">
        <div className="u-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "var(--sp-6)" }}>
          <div className="u-stack">
            <p className="u-eyebrow">Proof</p><h2 id="rep">The monthly report</h2>
            <p className="u-muted">A PDF and a CSV, plus a live dashboard. Programs with fewer than 5 claims are hidden so nobody can be picked out.</p>
            <p><DemoTag /> <span className="u-small u-muted">Made-up numbers for a made-up group.</span></p>
          </div>
          <div className="u-stack" style={{ gridColumn: "span 2" }}>
            <div className="u-card"><p className="u-small" style={{ fontWeight: 600 }}>Average verified a year per household · target {money(495)}</p>
              <p className="u-figure" style={{ marginTop: "var(--sp-1)" }}>{money(313)} <span className="u-small u-muted" style={{ fontFamily: "var(--font-ui)" }}>63 of 100 enrolled</span></p>
              <p className="u-small u-muted" style={{ marginTop: "var(--sp-1)" }}>Below target. Decisions take weeks, so early months run low. Estimated, not verified: {money(61204)}.</p></div>
            <table className="u-table"><caption className="sr-only">Sample claims by program</caption>
              <thead><tr><th>Program</th><th className="n">Claims</th><th className="n">Verified</th><th className="n">Verified a year</th></tr></thead>
              <tbody>{rows.map(([n, c, v, d]) => <tr key={n}><td data-l="Program">{n}</td><td data-l="Claims" className="n">{c}</td><td data-l="Verified" className="n">{v}</td><td data-l="Verified a year" className="n">{money(d)}</td></tr>)}</tbody></table>
          </div>
        </div>
      </section>

      <section className="u-band" aria-labelledby="link"><div className="u-wrap u-section u-grid u-cols-2" style={{ gap: "var(--sp-6)" }}>
        <div className="u-stack"><p className="u-eyebrow">Enrollment</p><h2 id="link">Your own link and QR code</h2>
          <p className="u-muted">Members open a page with your name on it, then answer the questions. We run the review. Put the link in a newsletter. Print the QR code on a flyer.</p>
          <p className="u-muted">Members choose whether you see their individual results. The box is unchecked by default.</p></div>
        <ol className="u-list" style={{ alignContent: "start" }}>
          {[["qr", "You get a link and QR code"], ["doc", "Members answer, about 15 minutes"], ["shield", "We review every result"], ["calendar", "You get the report each month"]].map(([i, t]) => <li key={t} className="u-card" style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2)" }}><Icon name={i} size={24} /><span>{t}</span></li>)}
        </ol>
      </div></section>

      <section className="u-wrap u-section" aria-labelledby="trust">
        <div className="u-head"><p className="u-eyebrow">Privacy</p><h2 id="trust">What we collect and who sees it</h2></div>
        <ul className="u-list u-grid u-cols-2" style={{ gap: "var(--sp-2) var(--sp-6)" }}>
          {[
            "No Social Security numbers, ever. Our sheets leave a blank line and the member writes it in.",
            "You see totals. Rows under 5 are hidden. Individual results only if the member ticks the share box.",
            "Every table is locked down by row, so one household can't read another. We tested that in the database.",
            "Documents sit in private storage. Links to view them expire after 5 minutes.",
            "Members can download or delete their data from their account page.",
            "Our log of verified outcomes has no names and can't be edited, only added to.",
          ].map((t) => <li key={t}><Icon name="lock" size={20} /><span>{t}</span></li>)}
        </ul>
        <p className="u-small u-muted" style={{ marginTop: "var(--sp-3)" }}>The Sponsor Agreement is available on request. We are still having our legal drafts reviewed by an attorney, so ask us before you sign anything.</p>
      </section>

      <section id="book" className="u-band" aria-labelledby="pay"><div className="u-wrap u-section" style={{ scrollMarginTop: "5rem" }}>
        <div className="u-head"><p className="u-eyebrow">Next step</p><h2 id="pay">Book a pilot and pay</h2></div>
        <div className="u-grid u-cols-3">
          <div className="u-card"><p className="u-price-amt">{money(9900)}</p><p className="u-small u-muted">100 households × {money(99)}</p></div>
          <div className="u-card"><p className="u-price-amt">{money(4950)}</p><p className="u-small u-muted">First invoice, now. By bank transfer (ACH) or card</p></div>
          <div className="u-card"><p className="u-price-amt">{money(4950)}</p><p className="u-small u-muted">Second invoice, when household 50 enrolls</p></div>
        </div>
        <div className="u-stack" style={{ marginTop: "var(--sp-3)" }}>
          <p><a className="u-btn u-btn-primary" href={mail}>{SUPPORT_EMAIL ? "Email us to start" : "Contact us to start"}</a></p>
          <p className="u-prose">Write to <EmailLink4 subject="Founding Sponsor Pilot" /></p>
          <p className="u-small u-muted">We set up your link, your dashboard login and the first invoice. {BRAND} is a paperwork service, not a law firm or financial adviser.</p>
        </div>
      </div></section>
    </main>
  );
}
