"use client";
import Link from "next/link";
import { useRef, useState } from "react";
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

export default function Screener({ forWho, nums }: { forWho: "me" | "parent"; nums: Record<string, number[]> }) {
  const [res, setRes] = useState<ReturnType<typeof matches> | null>(null), started = useRef(false), top = useRef<HTMLDivElement>(null);
  const parent = forWho === "parent", your = parent ? "your parent's" : "your";
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setRes(matches({ county: String(d.get("county")), city: String(d.get("city") ?? "").trim().toLowerCase(), age: AGE.find((a) => a[0] === d.get("age"))![2], size: Number(d.get("size")), band: INCOME.findIndex((i) => i[0] === d.get("income")), medicare: String(d.get("medicare")) }));
    track("check_complete", "/check");
    setTimeout(() => top.current?.focus(), 0);
  }
  return (
    <div>
      <form method="dialog" onSubmit={onSubmit} onChange={() => { if (!started.current) { started.current = true; track("check_start", "/check"); } }} className="space-y-6">
        <label className="field">Which county {parent ? "does your parent live in" : "do you live in"}?<select name="county" required defaultValue="" className="input"><option value="" disabled>Choose one</option>{COUNTIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field">City or town (optional)<span className="hint">Some utility discounts depend on the city.</span><input name="city" autoComplete="address-level2" className="input" /></label>
        <label className="field">{parent ? "How old is your parent" : "How old are you"}?<select name="age" required defaultValue="" className="input"><option value="" disabled>Choose one</option>{AGE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="field">How many people live in the household?<select name="size" required defaultValue="" className="input"><option value="" disabled>Choose one</option><option value="1">1</option><option value="2">2</option><option value="3">3 or more</option></select></label>
        <label className="field">About how much does the household get each month, before taxes?<span className="hint">Add up Social Security, pensions and any other income.</span><select name="income" required defaultValue="" className="input"><option value="" disabled>Choose one</option>{INCOME.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="field">Does anyone have Medicare?<select name="medicare" required defaultValue="" className="input"><option value="" disabled>Choose one</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></select></label>
        <button className="btn">Show what may fit</button>
        <p className="small muted">This check runs in your browser. We don&apos;t save your answers.</p>
      </form>

      <div ref={top} tabIndex={-1} aria-live="polite" className="outline-none">
        {res && (
          <section className="mt-10 border-t border-ink/20 pt-8" aria-labelledby="res-h">
            <h2 id="res-h">{res.length ? `${res.length} ${res.length === 1 ? "program" : "programs"} may fit ${your === "your" ? "you" : "your parent"}` : "Nothing in the quick check fits right now"}</h2>
            <p className="mt-2">{res.length ? "These are programs you may qualify for. We can't tell for sure from six questions, and we don't add up a total here." : "That can change with more detail. The full report checks about twenty programs and looks at things this quick check can't, like bills and savings."}</p>
            <ul className="mt-6">
              {res.map((c) => (
                <li key={c.id} className="border-t border-ink/20 py-4">
                  <h3 className="flex items-center gap-2 !text-[1.375rem]"><Icon name="check" size={20} />{c.title} <span className="pill pill-amber ml-1">May qualify</span></h3>
                  <p className="mt-1">{c.pays}{(nums[c.id] ?? []).map((n) => <a key={n} className="fn" href={`#src-${n}`} aria-label={`Source ${n}`}>{n}</a>)}</p>
                  <p className="small mt-1"><Link href={`/programs/${c.slug}`}>Who qualifies and how to apply</Link></p>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-ink/20 pt-6">
              <h3>Want it checked properly?</h3>
              <p className="mt-2">The full report checks all of them against {your} real answers, fills in each form, has a person review it, and follows each one to a decision. $149. Full refund if we find under $1,000 a year in likely benefits.</p>
              <div className="mt-4 flex flex-wrap items-center gap-4"><CheckoutForm where="check" /><Link href="/#price" className="small">Read the terms</Link></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
