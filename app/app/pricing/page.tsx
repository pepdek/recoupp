import type { Metadata } from "next";
import Link from "next/link";
import Json from "@/components/Json";
import { Chevron, PriceCard, SponsorCard } from "@/components/v4";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Pricing and guarantee",
  description: `${BRAND} costs $149 once. If we find under $1,000 a year in likely benefits, you get it all back.`,
  alternates: { canonical: "/pricing" },
};

const TERMS: [string, string][] = [
  ["What do I pay?", "$149 once, before you start. The price is the same for everyone. There is no subscription and no upsell."],
  ["What counts as \"likely benefits\"?", "Programs we mark likely or eligible after a person reviews them. Guesses don't count."],
  ["When do I get a refund?", "If that total is under $1,000 a year, we refund the $149."],
  ["Will I be approved?", "That is up to each agency. We can't promise it. We can promise our own work: the check, the filled-in forms, the review and the reminders."],
  ["What if I'm not sure yet?", "Do the free check first. It takes about a minute and saves nothing."],
];

export default function Pricing() {
  return (
    <main>
      <Json data={{ "@context": "https://schema.org", "@type": "Service", name: `${BRAND} Family Benefits Recovery Report`, provider: { "@type": "Organization", name: BRAND }, areaServed: "Washington State, US", offers: { "@type": "Offer", price: "149.00", priceCurrency: "USD" } }} />
      <section className="u-wrap u-pagehead" style={{ paddingTop: "var(--sp-6)" }}>
        <p className="u-eyebrow">Pricing</p>
        <h1 className="u-title">Find under $1,000 a year? You pay nothing.</h1>
        <p className="u-muted">One price, one time. Free check first.</p>
      </section>
      <section className="u-wrap u-section" aria-labelledby="plans-h" style={{ paddingTop: "var(--sp-3)" }}>
        <h2 id="plans-h" className="sr-only">Plans</h2>
        <div className="u-grid u-cols-2" style={{ alignItems: "start" }}><PriceCard where="pricing" /><SponsorCard /></div>
      </section>
      <section className="u-band" aria-labelledby="terms-h">
        <div className="u-wrap u-section">
          <div className="u-head"><h2 id="terms-h">The guarantee, in plain words</h2></div>
          <div className="u-acc" style={{ maxWidth: "46rem" }}>
            {TERMS.map(([q, a], i) => <details key={q} open={i < 3}><summary><h3 style={{ font: "inherit" }}>{q}</h3><Chevron /></summary><div><p>{a}</p></div></details>)}
          </div>
          <p className="u-small u-muted" style={{ marginTop: "var(--sp-3)" }}>Full <Link href="/terms">Terms (draft)</Link> are under attorney review.</p>
        </div>
      </section>
    </main>
  );
}
