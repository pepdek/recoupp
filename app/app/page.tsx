import { programs } from "@/lib/programs";
import { Icon, Stamp, money } from "@/components/ui";
import Counter from "@/components/Counter";
import { BRAND } from "@/lib/brand";

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
// Same constant the rules engine uses, so this page can't drift from the Medicare Savings rule.
const partB = ((programs.find((p) => p.id === "msp") as { constants?: Record<string, number> } | undefined)?.constants?.part_b_premium_monthly) ?? 202.9;
const premium = Math.round(partB * 12);
const lifeline = Math.round(9.25 * 12);

const steps = [
  ["doc", "Find", "Answer questions about money, bills and who lives at home. About 15 minutes. Save and come back any time."],
  ["pencil", "Fill", "We turn your answers into a sheet for each program. Nothing to copy by hand."],
  ["envelope", "File", "A person on our team checks it first. You get a list of papers to gather and where to send them."],
  ["calendar", "Follow", "We nudge you about missing papers, agency letters and renewal dates."],
] as const;

const faq: [string, string][] = [
  ["Do you need my Social Security number?", "No. We never ask for it. The sheets we make leave a blank line for it, and you write it in yourself."],
  ["Who looks at my answers?", "You, and a reviewer on our team. If a community group sent you, they see totals only. They see your own results only if you tick the box to share."],
  ["What if you find nothing?", "You get all $149 back. The line is $1,000 a year in likely benefits."],
  ["Are the dollar figures exact?", "No. They are estimates, and we show a range when we can't be sure. Each agency makes the final call."],
  ["Is this legal or tax advice?", `No. ${BRAND} helps with paperwork. It is not a law firm, a tax preparer or a financial adviser.`],
  ["Can my son or daughter do this for me?", "Yes. Most of our users are adult kids. You can fill it in for your parent and tell us how you're related."],
];

export default function Home() {
  return (
    <main>
      {/* 1. Money first */}
      <section className="grain border-b-[3px] border-ink">
        <div className="wrap grid gap-8 py-10 md:grid-cols-[1.3fr_1fr] md:py-16">
          <div>
            <p className="small font-bold uppercase tracking-widest">Washington State · for people 60 and up and their families</p>
            <p className="bignum mt-4 text-stamp"><Counter to={premium} /></p>
            <p className="display mt-2 text-[1.6rem] leading-tight md:text-[2.25rem]">
              a year is what Medicare Part B costs one person. A Medicare Savings Program can pay it.
            </p>
            <p className="mt-5 max-w-xl">Many people who qualify never apply. We check about twenty Washington programs for you or your parent, fill in the paperwork, and stay on it until it's decided.</p>
          </div>
          <aside className="self-end md:-mb-24">
            <div className="cheque -rotate-1">
              <p className="small font-bold uppercase tracking-widest">Pay to the order of you</p>
              <div className="line mt-2"><span className="amount text-forest">{money(premium)}</span><span className="small font-bold">per year*</span></div>
              <p className="small mt-3">*One program, one person, if income is under the limit. Your total depends on your answers.</p>
            </div>
            <form action="/api/checkout" method="post" className="mt-6">
              <button className="btn w-full md:w-auto">Get my report, $149</button>
            </form>
            <p className="small mt-3 font-bold">Full refund if we find under $1,000 a year in likely benefits.</p>
            <p className="small mt-1"><a href="#sample">See a sample result</a></p>
          </aside>
        </div>
      </section>

      {/* 2. Four steps, staggered like paper on a desk */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="how">
        <h2 id="how" className="max-w-md">Four steps. We do the heavy ones.</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {steps.map(([icon, name, text], i) => (
            <li key={name} className={`ticket ${i % 2 ? "md:mt-10" : ""}`}>
              <p className="display text-5xl text-stamp" aria-hidden>{i + 1}</p>
              <h3 className="mt-1 flex items-center gap-2"><Icon name={icon} size={26} />{name}</h3>
              <p className="small mt-2">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Sample */}
      <section id="sample" className="wrap mt-20 md:mt-28 scroll-mt-6" aria-labelledby="sample-h">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="sample-h">What a result looks like</h2>
            <p className="mt-3">This is a made-up household, to show the layout. The people and numbers are not real.</p>
            <p className="mt-3"><span className="stamp">Demo data</span></p>
          </div>
          <div className="stack">
            <div className="cheque">
              <p className="small font-bold uppercase tracking-widest">Found for the Demo household</p>
              <div className="line mt-2"><span className="amount">{money(premium + lifeline)}</span><span className="small font-bold">a year, likely</span></div>
              <p className="small mt-2">Two programs counted. A third needs a person to look first, so it is not in the total.</p>
            </div>
            {[
              ["Medicare Savings Program", money(premium), "Pays the Part B premium", "recommended"],
              ["Lifeline phone or internet", money(lifeline), "$9.25 off each month", "recommended"],
              ["Extra Help with drug costs", "We'll tell you", "A reviewer checks this one", "pending"],
            ].map(([n, v, d, s]) => (
              <div key={n} className="ticket flex flex-wrap items-start justify-between gap-3">
                <div><h3>{n}</h3><p className="small mt-1">{d}</p></div>
                <div className="text-right"><p className="display text-3xl">{v}</p><div className="mt-1"><Stamp status={s} /></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Guarantee, as a printed slip */}
      <section className="wrap-narrow mt-20 md:mt-28" aria-labelledby="g">
        <div className="slip -rotate-1">
          <p className="small font-bold uppercase tracking-widest">The terms, in print</p>
          <h2 id="g" className="mt-2">Find under $1,000 a year? You pay nothing.</h2>
          <hr className="perf my-4" />
          <ul className="stack">
            <li>You pay $149 once, before you start. Price is the same for everyone.</li>
            <li>"Likely benefits" means programs we mark likely or eligible after a person reviews them. Guesses don't count.</li>
            <li>If that total is under $1,000 a year, we refund the $149.</li>
            <li>Whether an agency approves you is up to the agency. We can't promise that.</li>
          </ul>
        </div>
      </section>

      {/* 5. Pricing */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="price">
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 id="price">$149. One time.</h2>
            <p className="mt-3">No subscription. No upsell.</p>
          </div>
          <div className="ticket">
            <ul className="stack">
              {["A check of about twenty Washington programs, ranked by dollars a year", "A filled-in answers sheet for each program you qualify for", "A plain list of papers to gather", "90 days of reminders about papers, letters and renewals", "A refund if we find under $1,000 a year"].map((t) => (
                <li key={t} className="flex gap-3"><Icon name="check" size={26} /><span>{t}</span></li>
              ))}
            </ul>
            <form action="/api/checkout" method="post" className="mt-6"><button className="btn">Get my report, $149</button></form>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="wrap-narrow mt-20 md:mt-28" aria-labelledby="faq">
        <h2 id="faq">Questions people ask</h2>
        <div className="mt-6 border-t-[3px] border-ink">
          {faq.map(([q, a]) => (
            <details key={q} className="border-b-[3px] border-ink py-4">
              <summary className="display cursor-pointer text-[1.35rem] font-bold">{q}</summary>
              <p className="mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Sponsors */}
      <section className="wrap mt-20 md:mt-28">
        <div className="slip flex flex-wrap items-center justify-between gap-4">
          <div><h3>Run a group that serves older adults?</h3><p className="small mt-1">Give your members this at no cost to them. It comes with a recovered-income guarantee.</p></div>
          <a className="btn btn-quiet" href="/for-sponsors">See the pilot</a>
        </div>
        {contact && <p className="small mt-4">Questions? <a href={`mailto:${contact}`}>{contact}</a></p>}
      </section>
    </main>
  );
}
