import type { Metadata } from "next";
import Audience from "@/components/Audience";
import { CheckoutForm, TLink } from "@/components/Cta";
import { EmailLink, Ph, PhoneLink, Pill, money } from "@/components/ui";
import Json from "@/components/Json";
import { BRAND } from "@/lib/brand";
import { cites } from "@/lib/sources";
import {
  COUNT_VERIFIED, COUNT_WORD, EXTRA_HELP_SINGLE_LIMIT, LAST_CHECKED, LIFELINE_MONTHLY, LIFELINE_YEARLY,
  PART_B_MONTHLY, PART_B_YEARLY, SEATTLE_CITY_LIGHT, SEATTLE_SPU, TPU_DISCOUNT, prettyDate,
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
const WHAT: { name: string; text: string; cite: string[] }[] = [
  { name: "Medicare premiums", text: `A Medicare Savings Program can pay your Part B premium: ${$m(PART_B_MONTHLY)} a month in 2026.`, cite: ["cms", "wac_msp"] },
  { name: "Groceries", text: "Basic Food (SNAP) helps pay for groceries. The monthly amount depends on household size and income.", cite: ["dshs_bf", "wac_bf"] },
  { name: "Medicine", text: `Extra Help lowers your Medicare drug costs. In 2026 a single person's income limit is $${EXTRA_HELP_SINGLE_LIMIT.toLocaleString("en-US")} a year.`, cite: ["medicare_xh", "ssa_xh"] },
  { name: "Phone and internet", text: `Lifeline takes ${$m(LIFELINE_MONTHLY)} off a monthly phone or internet bill.`, cite: ["lifeline"] },
  { name: "Heating", text: "Energy help (LIHEAP) pays part of a heating bill. The amount depends on your household and your local agency.", cite: ["liheap"] },
  { name: "Utilities", text: `Tacoma Public Utilities takes ${TPU_DISCOUNT}% off electric, water and sewer for people who qualify. Seattle takes ${SEATTLE_CITY_LIGHT}% off City Light and ${SEATTLE_SPU}% off water bills.`, cite: ["tpu", "seattle"] },
  { name: "Transit", text: "ORCA LIFT cuts King County transit fares to $1.", cite: ["orca"] },
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

/** One section of the page: a short label in the margin, the content beside it. */
function Row({ id, label, labelledBy, children }: { id: string; label: string; labelledBy: string; children: React.ReactNode }) {
  return (
    <section id={id} className="wrap row scroll-mt-20" aria-labelledby={labelledBy}>
      <div className="row-label"><p className="eyebrow">{label}</p></div>
      <div>{children}</div>
    </section>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: who } = await searchParams;
  const faqAll = [...FAQ_OPEN, ...FAQ_MORE];
  return (
    <main>
      <Json data={[
        { "@context": "https://schema.org", "@type": "Organization", name: BRAND, description: "Finds and fills in Washington benefit applications for older adults and their families.", areaServed: "Washington State, US" },
        { "@context": "https://schema.org", "@type": "Service", name: `${BRAND} Family Benefits Recovery Report`, serviceType: "Benefits eligibility check and application preparation", areaServed: "Washington State, US", provider: { "@type": "Organization", name: BRAND }, offers: { "@type": "Offer", price: "149.00", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqAll.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ]} />

      {/* Hero: words on the left, one painted shape on the right */}
      <section className="hero-band" aria-labelledby="h1">
        <div className="wrap grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">Washington State · people 60 and up, and their families</p>
            <h1 id="h1" className="hero-h1">Washington has help with food, medicine and bills. Many people who qualify aren&apos;t getting it.</h1>
            <p className="mt-5 max-w-2xl">
              More than 4 in 10 people who qualify for help with Medicare costs aren&apos;t enrolled.<S.Cite id="jama" /> We check about {COUNT_WORD} Washington programs, fill in the forms, and follow each one until it&apos;s decided.
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <TLink href="/check" event="cta_click" className="btn">Check what I might qualify for</TLink>
              <span className="small font-bold">Free. No sign-up.</span>
            </p>
            <p className="small mt-3"><a href="#price">See what the full report costs</a></p>
            <p className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Who is this for">
              <span className="small w-full font-bold">Who is this for?</span>
              <TLink href="/check?for=me" event="cta_click" className="btn btn-quiet btn-sm">I&apos;m 60 or older</TLink>
              <TLink href="/check?for=parent" event="cta_click" className="btn btn-quiet btn-sm">I&apos;m helping my parent</TLink>
              <TLink href="/for-sponsors" event="cta_click" className="btn btn-quiet btn-sm">I run an organization</TLink>
            </p>
          </div>
          <figure>
            <div className="sun">
              <div>
                <p className="small font-bold">Example</p>
                <p className="bignum-s">{money(PART_B_YEARLY)}</p>
                <p className="font-bold">a year</p>
              </div>
            </div>
            <figcaption className="small mt-4 text-center">A Medicare Savings Program can pay your Part B premium. That is {$m(PART_B_MONTHLY)} a month in 2026.<S.Cite id="cms" /> Your amount depends on your income.</figcaption>
          </figure>
        </div>
        <ul className="wrap small grid gap-x-8 gap-y-1 border-t border-ink/20 pb-6 pt-4 sm:grid-cols-3">
          {["A person reviews every result", "We never ask for your Social Security number", "Full refund if we find under $1,000 a year"].map((t) => <li key={t} className="font-bold">{t}</li>)}
        </ul>
      </section>

      <Row id="problem" label="01 · The problem" labelledBy="problem-h">
        <h2 id="problem-h" className="max-w-3xl">Help exists. Getting it is the hard part.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div><h3>Every program is a different office.</h3><p className="small mt-2">Medicare help comes from the state Health Care Authority. Food help comes from DSHS. Phone discounts are a federal program. Utility discounts come from your city. Each has its own form.</p></div>
          <div><h3>The rules change every year.</h3><p className="small mt-2">Income limits and amounts reset. The same facts get asked a different way on every form.</p></div>
          <div><h3>One missed letter can end it.</h3><p className="small mt-2">Agencies write back asking for more papers, and benefits have to be renewed. Miss a deadline and you may have to start over.</p></div>
        </div>
        <p className="mt-10 max-w-3xl text-[1.375rem] leading-snug">
          In a 2025 study, more than 4 in 10 people who qualified for a Medicare Savings Program weren&apos;t enrolled.<S.Cite id="jama" /> Medicare Part B now costs {$m(PART_B_MONTHLY)} a month, up from $185.00 a year earlier.<S.Cite id="cms" /> <b>That&apos;s the gap we close.</b>
        </p>
      </Row>

      <Row id="what" label="02 · What we check" labelledBy="what-h">
        <h2 id="what-h" className="max-w-3xl">One set of answers. Every program that fits.</h2>
        <p className="mt-3 max-w-3xl">We look at about {COUNT_WORD} Washington programs. These are the ones where we can show you a published amount today.</p>
        <div className="mt-6">
          {WHAT.map((w) => (
            <div key={w.name} className="factrow">
              <h3 className="!text-[1.375rem]">{w.name}</h3>
              <p className="md:col-span-2">{w.text}<S.Cite id={w.cite} /></p>
            </div>
          ))}
        </div>
        <p className="small mt-4 border-t border-ink/20 pt-4">We also look at property tax breaks, Apple Health, SSI, veterans&apos; help and more. A person confirms those before you see them, so we don&apos;t show amounts for them yet.</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2"><b>We check all of them from one set of answers.</b> <a href="/programs">See every program</a></p>
      </Row>

      <Row id="how" label="03 · How it works" labelledBy="how-h">
        <h2 id="how-h" className="max-w-3xl">You answer once. We handle the forms.</h2>
        <Audience initial={who === "parent" ? "parent" : "me"} />
      </Row>

      <Row id="sample" label="04 · A sample" labelledBy="sample-h">
        <h2 id="sample-h" className="max-w-3xl">Here&apos;s what a result looks like.</h2>
        <p className="mt-3">A made-up household. The people and numbers are not real. <span className="pill pill-amber ml-1">Demo data</span></p>
        <div className="mt-6 max-w-3xl">
          <div className="border-t-2 border-ink pb-4 pt-4">
            <p className="small font-bold">Found for the Demo household</p>
            <p className="amount mt-1">{money(PART_B_YEARLY + LIFELINE_YEARLY)}<span className="small ml-2 font-sans font-bold">a year, likely</span></p>
            <p className="small muted mt-1">Two programs counted. One needs a person to look first, so it isn&apos;t in the total.</p>
          </div>
          {[
            ["Medicare Savings Program", money(PART_B_YEARLY), "Pays the Part B premium", "recommended"],
            ["Lifeline phone or internet", money(LIFELINE_YEARLY), `${$m(LIFELINE_MONTHLY)} off each month`, "recommended"],
            ["Extra Help with drug costs", "To be checked", "A reviewer checks this one", "pending"],
          ].map(([n, v, d, s]) => (
            <div key={n} className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-2 border-t border-ink/25 py-4">
              <div><h3 className="!text-[1.375rem]">{n}</h3><p className="small mt-1">{d}</p></div>
              <p className="display min-w-[7ch] text-right text-3xl">{v}</p>
              <div className="col-span-2"><Pill status={s} /></div>
            </div>
          ))}
        </div>
      </Row>

      <Row id="proof" label="05 · Proof" labelledBy="proof-h2">
        <h2 id="proof-h2" className="max-w-3xl">Every number comes from an official source.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3>Sources</h3>
            <p className="small mt-2">Rules checked against the Washington Health Care Authority, DSHS, the Social Security Administration, federal poverty guidelines, the FCC Lifeline program, King County Metro, Tacoma Public Utilities and Seattle City Light. Last checked {prettyDate(LAST_CHECKED)}. We show amounts only for the {COUNT_VERIFIED} programs we&apos;ve verified. A person reviews the rest.</p>
            <p className="small mt-2">Each small number on this page opens its source in the <a href="#sources">Sources list</a> at the bottom.</p>
          </div>
          <div>
            <h3>Who reviews your answers</h3>
            <p className="small mt-2"><Ph>reviewer name and role</Ph> reads every result before you see it. <Ph>photo and a short, true bio</Ph></p>
            <p className="small mt-2"><a href="/about">More about us</a></p>
          </div>
          <div>
            <h3>What we can honestly show</h3>
            <p className="small mt-2">We&apos;re new. We don&apos;t have customer stories yet, so we won&apos;t make any up. Here&apos;s what we offer instead: a refund if we find under $1,000 a year, a rule that only letters and confirmed payments count as &ldquo;verified&rdquo;, and a sample you can read.</p>
          </div>
        </div>
      </Row>

      <Row id="free-help" label="06 · Free help" labelledBy="free-h">
        <h2 id="free-h" className="max-w-3xl">Free help is real. Here&apos;s what we add.</h2>
        <div className="mt-6">
          <div className="factrow"><h3 className="!text-[1.375rem]">BenefitsCheckUp</h3><p className="md:col-span-2">From the National Council on Aging. A free online screening for nearly 2,000 programs across the country. It doesn&apos;t process applications. It lists each agency&apos;s contact, with phone, chat and local centers for in-person application help.<S.Cite id="ncoa" /></p></div>
          <div className="factrow"><h3 className="!text-[1.375rem]">SHIBA</h3><p className="md:col-span-2">Free, unbiased help with Medicare questions from the Washington Office of the Insurance Commissioner. Call 800-562-6900 and ask for your local office.<S.Cite id="shiba" /></p></div>
          <div className="factrow"><h3 className="!text-[1.375rem]">Area Agencies on Aging</h3><p className="md:col-span-2">Local offices that help older adults and their families find services and programs. Find yours through Washington&apos;s Community Living Connections.<S.Cite id="aaa" /></p></div>
          <div className="factrow"><h3 className="!text-[1.375rem]">{BRAND}</h3><p className="md:col-span-2">We check about {COUNT_WORD} Washington programs from one set of answers, fill in each form, have a person check it, and remind you about letters and renewals. The full report is $149.</p></div>
        </div>
        <p className="mt-4 border-t border-ink/20 pt-4">If you have time and a patient helper, those are good places to start. If you want it done in one sitting, that&apos;s us.</p>
      </Row>

      <section id="price" className="band scroll-mt-20" aria-labelledby="price-h">
        <div className="wrap row !border-t-0">
          <div className="row-label"><p className="eyebrow">07 · The terms</p></div>
          <div>
            <h2 id="price-h" className="max-w-3xl">Find under $1,000 a year? You pay <em>nothing</em>.</h2>
            <ul className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-2">
              {[
                "You pay $149 once, before you start. The price is the same for everyone.",
                "\"Likely benefits\" means programs we mark likely or eligible after a person reviews them. Guesses don't count.",
                "If that total is under $1,000 a year, we refund the $149.",
                "Whether an agency approves you is up to the agency. We can't promise that.",
              ].map((t) => <li key={t} className="small border-t border-ink/30 pt-3">{t}</li>)}
            </ul>
            <div className="mt-8 grid items-start gap-6 border-t-2 border-ink pt-6 md:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="display text-5xl leading-none">$149. One time.</p>
                <p className="mt-3">No subscription. No upsell.</p>
                <div className="mt-5"><CheckoutForm /></div>
                <p className="small mt-3">Not sure yet? <a href="/check">Do the free check first.</a></p>
              </div>
              <ul className="grid gap-2">
                {[`A check of about ${COUNT_WORD} Washington programs, ranked by dollars a year`, "A filled-in answers sheet for each program you qualify for", "A plain list of papers to gather", "90 days of reminders about papers, letters and renewals", "A refund if we find under $1,000 a year"].map((t) => <li key={t} className="border-t border-ink/25 pt-2">{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Row id="questions" label="08 · Questions" labelledBy="faq-h">
        <h2 id="faq-h" className="max-w-3xl">Questions people ask</h2>
        <div className="mt-6 max-w-3xl">
          {FAQ_OPEN.map(([q, a]) => <div key={q} className="border-t border-ink/25 py-4"><p className="display text-[1.6rem] leading-tight">{q}</p><p className="mt-2">{a}</p></div>)}
          {FAQ_MORE.map(([q, a]) => (
            <details key={q} className="border-t border-ink/25 py-4">
              <summary className="display cursor-pointer text-[1.6rem] leading-tight">{q}</summary>
              <p className="mt-3">{a}{q === "Who is behind this?" && <> <a href="/about">About {BRAND}</a>.</>}</p>
            </details>
          ))}
        </div>
      </Row>

      <section className="wrap row" aria-labelledby="org-h">
        <div className="row-label"><p className="eyebrow">For organizations</p></div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 id="org-h" className="!text-[1.75rem]">Run a group that serves older adults?</h2><p className="small mt-1">Give your members this at no cost to them. It comes with a recovered-income guarantee.</p></div>
          <TLink href="/for-sponsors" event="cta_click" className="btn btn-quiet">See the pilot</TLink>
        </div>
      </section>

      <section className="band" aria-labelledby="final-h">
        <div className="wrap py-14">
          <h2 id="final-h" className="max-w-3xl">Find out what you might qualify for.</h2>
          <p className="mt-5"><TLink href="/check" event="cta_click" className="btn">Check what I might qualify for</TLink> <span className="small ml-2 font-bold">Free. No sign-up.</span></p>
          <p className="small mt-4">Questions? Call <PhoneLink /> or write <EmailLink />.</p>
        </div>
      </section>

      <div className="wrap"><S.Block /></div>
    </main>
  );
}
