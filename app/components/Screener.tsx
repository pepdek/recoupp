"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { evaluateAll, type Facts } from "@/lib/engine";
import { buildFacts } from "@/lib/facts";
import { COUNTIES } from "@/lib/intake";
import { COPY } from "@/lib/programCopy";
import { programs } from "@/lib/programs";
import Icon from "./Icon";
import { CheckoutForm } from "./Cta";
import { track } from "./track";

const INCOME: [string, string, number, number][] = [
  ["a", "Under $1,500", 0, 1500], ["b", "$1,500 to $2,500", 1501, 2500], ["c", "$2,500 to $3,500", 2501, 3500],
  ["d", "$3,500 to $5,000", 3501, 5000], ["e", "Over $5,000", 5001, 8000],
];
const AGE: [string, string, number][] = [["a", "60 to 64", 62], ["b", "65 to 74", 69], ["c", "75 or older", 80]];

// Runs entirely in the browser against the same program rules the full report uses. Nothing is sent or stored.
// Income is tried at the bottom and top of the chosen band; a program shows if either end could qualify.
// ponytail: no personal dollar total here on purpose (reviewed totals only); savings and bills are left unknown.
function matches(f: { county: string; city: string; age: number; size: number; band: number; medicare: string }) {
  const year = new Date().getFullYear();
  const members = Array.from({ length: f.size }, (_, i) => ({ birth_year: year - (i === 0 ? f.age : f.age + 1), veteran: false, disabled: false }));
  const [, , lo, hi] = INCOME[f.band];
  const verified = programs.filter((p) => p.confidence === "verified");
  const run = (income: number): Facts => buildFacts({ county: f.county, city: f.city, relationship: "self", answers: { tenure: "rent", inc_social_security: income, medicare: f.medicare, medicaid: "no", existing_benefits: [] } }, members, year);
  const a = evaluateAll(verified, run(lo)), b = evaluateAll(verified, run(hi));
  const ok = (s: string) => s === "eligible" || s === "likely" || s === "needs_human_review";
  // ORCA LIFT: our verified source is King County Metro, and the program file has no county rule yet, so only match King County here.
  return COPY.filter((c) => !(c.id === "orca_lift" && f.county !== "King") && [a, b].some((r) => ok(r.find((x) => x.program_id === c.id)?.status ?? "unlikely")));
}

type Ans = { county: string; city: string; age: string; size: string; income: string; medicare: string };
const BLANK: Ans = { county: "", city: "", age: "", size: "", income: "", medicare: "" };
const SIZE: [string, string][] = [["1", "Just one person"], ["2", "Two people"], ["3", "Three or more"]];
const MED: [string, string][] = [["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]];

function Choices({ name, value, set, opts }: { name: keyof Ans; value: string; set: (k: keyof Ans, v: string) => void; opts: [string, string][] }) {
  return <div className="u-grid" style={{ gap: "var(--sp-1)" }}>{opts.map(([v, l]) => <label key={v} className="u-choice"><input type="radio" name={name} value={v} checked={value === v} onChange={() => set(name, v)} /><span>{l}</span></label>)}</div>;
}

export default function Screener({ forWho, nums }: { forWho: "me" | "parent"; nums: Record<string, number[]> }) {
  const [res, setRes] = useState<ReturnType<typeof matches> | null>(null), [step, setStep] = useState(0), [a, setA] = useState<Ans>(BLANK), started = useRef(false), top = useRef<HTMLHeadingElement>(null);
  const parent = forWho === "parent", your = parent ? "your parent's" : "your";
  const set = (k: keyof Ans, v: string) => { if (!started.current) { started.current = true; track("check_start", "/check"); } setA((x) => ({ ...x, [k]: v })); };
  const STEPS = [
    { q: `Which county ${parent ? "does your parent live in" : "do you live in"}?`, ok: !!a.county, body: (
      <div className="u-stack">
        <div><label className="u-label" htmlFor="county">County</label><select id="county" className="u-input" value={a.county} onChange={(e) => set("county", e.target.value)}><option value="" disabled>Choose one</option>{COUNTIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="u-label" htmlFor="city">City or town (optional)<span className="u-hint">Some utility discounts depend on the city.</span></label><input id="city" className="u-input" autoComplete="address-level2" value={a.city} onChange={(e) => set("city", e.target.value)} /></div>
      </div>) },
    { q: `${parent ? "How old is your parent" : "How old are you"}?`, ok: !!a.age, body: <Choices name="age" value={a.age} set={set} opts={AGE.map(([v, l]) => [v, l])} /> },
    { q: "How many people live in the household?", ok: !!a.size, body: <Choices name="size" value={a.size} set={set} opts={SIZE} /> },
    { q: "About how much does the household get each month, before taxes?", hint: "Add up Social Security, pensions and any other income.", ok: !!a.income, body: <Choices name="income" value={a.income} set={set} opts={INCOME.map(([v, l]) => [v, l])} /> },
    { q: "Does anyone have Medicare?", ok: !!a.medicare, body: <Choices name="medicare" value={a.medicare} set={set} opts={MED} /> },
  ] as { q: string; hint?: string; ok: boolean; body: React.ReactNode }[];
  const last = step === STEPS.length - 1, cur = STEPS[step];
  useEffect(() => { top.current?.focus(); }, [step, res]);
  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!cur.ok) return;
    if (!last) return setStep(step + 1);
    setRes(matches({ county: a.county, city: a.city.trim().toLowerCase(), age: AGE.find((x) => x[0] === a.age)![2], size: Number(a.size), band: INCOME.findIndex((i) => i[0] === a.income), medicare: a.medicare }));
    track("check_complete", "/check");
  }
  if (!res) {
    return (
      <form method="dialog" onSubmit={next} className="u-stack" noValidate>
        <div className="u-stack"><p className="u-small u-muted" id="prog">Step {step + 1} of {STEPS.length}</p>
          <div className="u-progress" role="progressbar" aria-labelledby="prog" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div></div>
        <fieldset className="u-step-q" style={{ marginTop: "var(--sp-3)" }}>
          <legend><h2 ref={top} tabIndex={-1} style={{ fontSize: "var(--fs-h3)", outline: "none" }}>{cur.q}</h2>{cur.hint && <span className="u-hint u-small u-muted" style={{ display: "block", fontWeight: 400, marginTop: "var(--sp-1)" }}>{cur.hint}</span>}</legend>
          <div style={{ marginTop: "var(--sp-2)" }}>{cur.body}</div>
        </fieldset>
        <div className="u-row" style={{ marginTop: "var(--sp-3)" }}>
          {step > 0 && <button type="button" className="u-btn u-btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="u-btn u-btn-primary" disabled={!cur.ok}>{last ? "Show what may fit" : "Next"}</button>
        </div>
        <p className="u-small u-muted">This check runs in your browser. We don&apos;t save your answers.</p>
      </form>
    );
  }
  return (
    <div aria-live="polite" className="u-stack">
      <h2 ref={top} tabIndex={-1} style={{ outline: "none" }}>{res.length ? `${res.length} ${res.length === 1 ? "program" : "programs"} may fit ${parent ? "your parent" : "you"}` : "Nothing in the quick check fits right now"}</h2>
      <p className="u-muted">{res.length ? "These are programs you may qualify for. We can't tell for sure from five questions, and we don't add up a total here." : "That can change with more detail. The full report checks about twenty programs and looks at things this quick check can't, like bills and savings."}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border)" }}>
        {res.map((c) => (
          <li key={c.id} className="u-stack" style={{ padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)", marginTop: 0 }}>
            <div className="u-row" style={{ justifyContent: "space-between" }}><h3>{c.title}</h3><span className="u-badge u-badge-wait"><Icon name="question" size={16} />May qualify</span></div>
            <p className="u-prose">{c.pays}{(nums[c.id] ?? []).map((n) => <a key={n} className="u-cite" href={`#src-${n}`} aria-label={`Source ${n}`}>{n}</a>)}</p>
            <p className="u-small"><Link href={`/programs/${c.slug}`}>Who qualifies and how to apply</Link></p>
          </li>
        ))}
      </ul>
      <div className="u-card u-raised u-stack">
        <h3>Want it checked properly?</h3>
        <p>The full report checks all of them against {your} real answers, fills in each form, has a person review it, and follows each one to a decision. $149. Full refund if we find under $1,000 a year in likely benefits.</p>
        <div className="u-row"><CheckoutForm where="check" className="u-btn u-btn-primary" label="Get my full report" /><Link href="/pricing" className="u-btn u-btn-ghost">Read the terms</Link></div>
      </div>
      <button type="button" className="u-btn u-btn-secondary" style={{ justifySelf: "start" }} onClick={() => { setRes(null); setStep(0); }}>Start over</button>
    </div>
  );
}
