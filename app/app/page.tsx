import type { Metadata } from "next";
import Link from "next/link";
import { TLink } from "@/components/Cta";
import Icon from "@/components/Icon";
import { Chevron, EmailLink4, PacketPreview, PhoneLink4, PriceCard, ResultPanel, SponsorCard } from "@/components/v4";
import Json from "@/components/Json";
import { BRAND } from "@/lib/brand";
import { COPY } from "@/lib/programCopy";
import { cites } from "@/lib/sources";
import {
  COUNT_WORD, EXTRA_HELP_SINGLE_LIMIT, LAST_CHECKED, LIFELINE_MONTHLY,
  PART_B_MONTHLY, SEATTLE_CITY_LIGHT, SEATTLE_SPU, TPU_DISCOUNT, prettyDate,
} from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${BRAND}: Washington benefits for older adults, found and filled in` },
  description: `Washington has help with food, medicine and bills. We check about ${COUNT_WORD} programs for you or your parent, fill in the forms, and follow each one until it's decided.`,
  alternates: { canonical: "/" },
};

// Source numbers follow order of first appearance on this page.
const S = cites(["jama", "cms", "wac_msp", "dshs_bf", "wac_bf", "medicare_xh", "ssa_xh", "lifeline", "liheap", "tpu", "seattle", "orca", "ncoa", "shiba", "aaa"]);
const $m = (n: number) => `$${n.toFixed(2)}`;

// What we check: every amount comes from the program data (lib/site.ts). Basic Food has no figure until the October 2026 table is verified.
const WHAT: { id: string; icon: string; name: string; text: string; cite: string[] }[] = [
  { id: "msp", icon: "pill", name: "Medicare premiums", text: `A Medicare Savings Program can pay your Part B premium: ${$m(PART_B_MONTHLY)} a month in 2026.`, cite: ["cms", "wac_msp"] },
  { id: "basic_food", icon: "bag", name: "Groceries", text: "Basic Food (SNAP) helps pay for groceries. The monthly amount depends on household size and income.", cite: ["dshs_bf", "wac_bf"] },
  { id: "extra_help", icon: "bulb", name: "Medicine", text: `Extra Help lowers your Medicare drug costs. In 2026 a single person's income limit is $${EXTRA_HELP_SINGLE_LIMIT.toLocaleString("en-US")} a year.`, cite: ["medicare_xh", "ssa_xh"] },
  { id: "lifeline", icon: "phone", name: "Phone and internet", text: `Lifeline takes ${$m(LIFELINE_MONTHLY)} off a monthly phone or internet bill.`, cite: ["lifeline"] },
  { id: "liheap", icon: "plug", name: "Heating", text: "Energy help (LIHEAP) pays part of a heating bill. The amount depends on your household and your local agency.", cite: ["liheap"] },
  { id: "tpu_assistance", icon: "house", name: "Utilities", text: `Tacoma Public Utilities takes ${TPU_DISCOUNT}% off electric, water and sewer for people who qualify. Seattle takes ${SEATTLE_CITY_LIGHT}% off City Light and ${SEATTLE_SPU}% off water bills.`, cite: ["tpu", "seattle"] },
  { id: "orca_lift", icon: "bus", name: "Transit", text: "ORCA LIFT cuts King County transit fares to $1.", cite: ["orca"] },
];

const FAQ_OPEN: [string, string][] = [
  ["Do you need my Social Security number?", "No. We never ask for it. Our sheets leave a blank line and you write it in yourself."],
  ["Who looks at my answers?", "You, and a reviewer on our team. If a community group sent you, they see totals only. They see your own results only if you tick the box to share."],
  ["What if you find nothing?", "You get all $149 back. The line is $1,000 a year in likely benefits."],
];
const FAQ_MORE: [string, string][] = [
  ["Are the dollar figures exact?", "No. They are estimates, and we show a range when we can't be sure. Each agency makes the final call."],
  ["Is this legal or tax advice?", `No. ${BRAND} helps with paperwork. It is not a law firm, a tax preparer or a financial adviser.`],
  ["What do I need to have ready?", "A Medicare card, proof of income such as a Social Security award letter, and recent bills. You can add papers later."],
  ["How long does it take?", "The questions take about 15 minutes. A person reviews your answers after that. Agencies then take their own time to decide, often a few weeks."],
  ["Who is behind this?", "See the About page for who reviews your answers and how to reach us."],
];

const slug = (id: string) => COPY.find((c) => c.id === id)!.slug;

export default async function Home() {
  const faqAll = [...FAQ_OPEN, ...FAQ_MORE];
  return (
    <main>
      <Json data={[
        { "@context": "https://schema.org", "@type": "Organization", name: BRAND, description: "Finds and fills in Washington benefit applications for older adults and their families.", areaServed: "Washington State, US" },
        { "@context": "https://schema.org", "@type": "Service", name: `${BRAND} Family Benefits Recovery Report`, serviceType: "Benefits eligibility check and application preparation", areaServed: "Washington State, US", provider: { "@type": "Organization", name: BRAND }, offers: { "@type": "Offer", price: "149.00", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqAll.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ]} />

      <section className="u-hero" aria-labelledby="h1">
        <div className="u-wrap">
          <div className="u-pagehead" style={{ paddingTop: "var(--sp-6)", maxWidth: "56rem" }}>
            <p className="u-eyebrow">Washington State · people 60 and up, and their families</p>
            <h1 id="h1">Washington has help with food, medicine and bills. Many people who qualify aren&apos;t getting it.</h1>
          </div>
          <div className="u-hero-grid" style={{ paddingTop: "var(--sp-2)" }}>
            <div className="u-stack">
              <p className="u-prose">More than 4 in 10 people who qualify for help with Medicare costs aren&apos;t enrolled.<S.Cite id="jama" /> We check about {COUNT_WORD} Washington programs, fill in the forms, and follow each one until it&apos;s decided.</p>
              <div className="u-row" style={{ marginTop: "var(--sp-3)" }}>
                <TLink href="/check" event="cta_click" className="u-btn u-btn-primary u-btn-lg">Free check</TLink>
                <Link href="/how-it-works" className="u-btn u-btn-secondary u-btn-lg">See how it works</Link>
              </div>
              <p className="u-small u-muted">Takes about a minute. No sign-up.</p>
              <div className="u-row" role="group" aria-label="Who is this for" style={{ marginTop: "var(--sp-2)" }}>
                <span className="u-small" style={{ fontWeight: 600 }}>Who is this for?</span>
                <TLink href="/check?for=me" event="cta_click" className="u-btn u-btn-ghost u-btn-sm">I&apos;m 60 or older</TLink>
                <TLink href="/check?for=parent" event="cta_click" className="u-btn u-btn-ghost u-btn-sm">I&apos;m helping my parent</TLink>
                <TLink href="/for-sponsors" event="cta_click" className="u-btn u-btn-ghost u-btn-sm">I run an organization</TLink>
              </div>
            </div>
            <ResultPanel cite={<S.Cite id="cms" />} />
          </div>
          <ul className="u-trust" style={{ borderTop: "1px solid var(--border)" }}>
            {["A person reviews every result", "We never ask for your Social Security number", "Full refund if we find under $1,000 a year"].map((t) => <li key={t}><Icon name="shield" size={20} />{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="u-wrap u-section" aria-labelledby="problem-h">
        <div className="u-head"><h2 id="problem-h">Help exists. Getting it is the hard part.</h2></div>
        <div className="u-points">
          <div><h3>Every program is a different office</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>Medicare help comes from the state Health Care Authority, food help from DSHS, phone discounts from a federal program, utility discounts from your city. Each has its own form.</p></div>
          <div><h3>The rules change every year</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>Income limits and amounts reset. The same facts get asked a different way on every form.</p></div>
          <div><h3>One missed letter can end it</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>Agencies write back asking for more papers, and benefits must be renewed. Miss a deadline and you may have to start over.</p></div>
        </div>
        <p className="u-prose" style={{ marginTop: "var(--sp-4)", fontWeight: 500 }}>Medicare Part B now costs {$m(PART_B_MONTHLY)} a month, up from $185.00 a year earlier.<S.Cite id="cms" /> That&apos;s the gap we close.</p>
      </section>

      <section id="what" className="u-band" aria-labelledby="what-h">
        <div className="u-wrap u-section">
          <div className="u-head"><h2 id="what-h">One set of answers. Every program that fits.</h2><p className="u-muted">We look at about {COUNT_WORD} Washington programs. These are the ones where we can show a published amount today.</p></div>
          <div className="u-prog">
            {WHAT.map((w) => (
              <div key={w.name} className="u-card u-stack">
                <Icon name={w.icon} size={28} />
                <h3><Link href={`/programs/${slug(w.id)}`}>{w.name}</Link></h3>
                <p className="u-small u-muted u-prose">{w.text}<S.Cite id={w.cite} /></p>
              </div>
            ))}
            <Link href="/programs" className="u-card u-card-link u-stack" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}><h3>See every program</h3><p className="u-small u-muted">Amounts, who qualifies, how to apply, with the official source for each.</p><span className="u-more">All programs <Icon name="arrow" size={18} /></span></Link>
          </div>
        </div>
      </section>

      <section className="u-wrap u-section" aria-labelledby="packet-h">
        <div className="u-head"><h2 id="packet-h">You get the finished paperwork, not a to-do list.</h2><p className="u-muted">A filled-in form, the papers to gather, and reminders so a letter never slips by. This is what the full report adds to the free tools.</p></div>
        <PacketPreview />
        <p style={{ marginTop: "var(--sp-3)" }}><Link href="/how-it-works" className="u-more">How it works <Icon name="arrow" size={18} /></Link></p>
      </section>

      <section id="free-help" className="u-band" aria-labelledby="free-h">
        <div className="u-wrap u-section">
          <div className="u-head"><h2 id="free-h">Free help is real. Here&apos;s what we add.</h2><p className="u-muted u-prose">BenefitsCheckUp from the National Council on Aging screens for nearly 2,000 programs.<S.Cite id="ncoa" /> SHIBA gives free, unbiased Medicare help at 800-562-6900.<S.Cite id="shiba" /> Area Agencies on Aging help you find local services.<S.Cite id="aaa" /> If you have time and a patient helper, start there. If you want it done in one sitting, that&apos;s us.</p></div>
          <Link href="/about#free-help" className="u-more">Compare the options <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      <section id="price" className="u-wrap u-section" aria-labelledby="price-h">
        <div className="u-head"><h2 id="price-h">Find under $1,000 a year? You pay nothing.</h2><p className="u-muted">Whether an agency approves you is up to the agency. We can&apos;t promise that. We can promise our own work.</p></div>
        <div className="u-grid u-cols-2" style={{ alignItems: "start" }}><PriceCard /><SponsorCard /></div>
        <p style={{ marginTop: "var(--sp-3)" }}><Link href="/pricing" className="u-more">Read the guarantee terms <Icon name="arrow" size={18} /></Link></p>
      </section>

      <section id="questions" className="u-band" aria-labelledby="faq-h">
        <div className="u-wrap u-section">
          <div className="u-head"><h2 id="faq-h">Questions people ask</h2></div>
          <div className="u-acc" style={{ maxWidth: "46rem" }}>
            {[...FAQ_OPEN, ...FAQ_MORE].map(([q, a], i) => (
              <details key={q} open={i < 3}><summary><h3 style={{ font: "inherit" }}>{q}</h3><Chevron /></summary><div><p>{a}{q === "Who is behind this?" && <> <Link href="/about">About {BRAND}</Link>.</>}</p></div></details>
            ))}
          </div>
        </div>
      </section>

      <section className="u-wrap u-section" aria-labelledby="final-h">
        <div className="u-card u-raised u-row" style={{ justifyContent: "space-between", padding: "var(--sp-4)" }}>
          <div><h2 id="final-h">Find out what you might qualify for.</h2><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>Free. No sign-up. About a minute.</p></div>
          <TLink href="/check" event="cta_click" className="u-btn u-btn-primary u-btn-lg">Free check</TLink>
        </div>
        <p className="u-small u-muted" style={{ marginTop: "var(--sp-2)" }}>Last checked {prettyDate(LAST_CHECKED)}. Questions? Call <PhoneLink4 /> or write <EmailLink4 />.</p>
      </section>

      <div className="u-wrap"><S.Block /></div>
    </main>
  );
}
