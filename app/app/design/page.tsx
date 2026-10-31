import type { Metadata } from "next";
import Icon, { ICONS } from "@/components/Icon";
import V4Tabs from "@/components/V4Tabs";
import { Check, Chevron, Cite4, DemoTag, STATUS_KEYS, Status } from "@/components/v4";
import { LIFELINE_MONTHLY, PART_B_MONTHLY, PART_B_YEARLY } from "@/lib/site";
import "../v4.css";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

// WCAG 2.x contrast, computed here so the numbers on the page cannot drift from the hex values.
const lum = (h: string) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const COLORS: [string, string, string][] = [
  ["--ink", "#14202b", "Text"], ["--ink-2", "#44525f", "Secondary text"], ["--surface", "#ffffff", "Page and cards"], ["--subtle", "#f4f6f8", "Bands, table heads"],
  ["--border", "#d5dce3", "Dividers"], ["--border-strong", "#6b7a88", "Input and control edges"], ["--brand", "#0b4f5c", "Links, selected, icons"], ["--brand-deep", "#083a44", "Hover, text on tint"],
  ["--brand-tint", "#e7f1f3", "Selected fill"], ["--accent", "#ff8a6b", "Main call to action"], ["--money", "#0a5c36", "Money, approved"], ["--wait", "#6e4200", "Waiting, renewal"],
  ["--bad", "#9a1717", "Problems"], ["--wash", "#fbefe9", "Hero wash only"],
];
const PAIRS: [string, string, string, string, number][] = [
  ["Body text", "#14202b", "#ffffff", "text", 7], ["Secondary text on white", "#44525f", "#ffffff", "text", 7], ["Secondary text on subtle", "#44525f", "#f4f6f8", "text", 7],
  ["Link on white", "#0b4f5c", "#ffffff", "text", 7], ["Link on subtle band", "#0b4f5c", "#f4f6f8", "text", 7], ["Ink on coral button", "#14202b", "#ff8a6b", "text", 7], ["Ink on coral hover", "#14202b", "#ff7f5c", "text", 4.5],
  ["Text on brand tint", "#083a44", "#e7f1f3", "text", 7], ["Approved badge", "#0a5c36", "#e5f4ea", "text", 7], ["Waiting badge", "#6e4200", "#fff3d9", "text", 7], ["Problem text", "#9a1717", "#fdeceb", "text", 7],
  ["White on ink (toast)", "#ffffff", "#14202b", "text", 7], ["Body text on hero wash", "#14202b", "#fbefe9", "text", 7], ["Control edge on white", "#6b7a88", "#ffffff", "non-text", 3], ["Focus ring on white", "#0b4f5c", "#ffffff", "non-text", 3], ["Focus ring on coral", "#0b4f5c", "#ff8a6b", "non-text", 3],
];

const SCALE: [string, string, string, string][] = [
  ["Figure", "56 / 56", "400 serif, tabular", "Dollar figure only. Appears once per page."], ["H1", "40 / 48 (mobile / desktop)", "700", "One per page. Two or three lines."],
  ["H2", "28 / 36", "600", "States a conclusion."], ["H3", "20 / 22", "600", "Component and item titles."], ["Body", "18", "400", "Never below 17. Line height 1.6."],
  ["Small", "16", "400 / 500", "Hints, nav, table cells, buttons (sm)."], ["Caption", "14", "600", "Badges, table heads, citation numbers. Never the only place a fact appears."],
];

function Sw({ v, hex, use }: { v: string; hex: string; use: string }) {
  return <li className="u-swatch"><i style={{ background: hex }} /><div><b>{v}</b><br /><span className="u-code">{hex}</span><br /><span className="u-muted">{use}</span></div></li>;
}

const SrcRow = ({ n, a, t, u }: { n: number; a: string; t: string; u: string }) => <li id={`src-${n}`}>{a} <i>{t}</i>. <a href={u}>{u}</a></li>;

function VerifiedTotal({ verified, total, count }: { verified: boolean; total?: number; count?: number }) {
  return verified && total != null ? (
    <div className="u-card"><p className="u-eyebrow">Verified recovered</p><p className="u-figure u-num" style={{ marginTop: "var(--sp-1)" }}>{usd(total)}</p><p className="u-small u-muted" style={{ marginTop: "var(--sp-1)" }}>{count} households, each confirmed by a decision letter.</p></div>
  ) : (
    <div className="u-empty"><h3>Verified total</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>We publish this number once real households have decision letters to back it. Until then it stays empty on purpose.</p></div>
  );
}
function Testimonial({ verified, quote, who }: { verified: boolean; quote?: string; who?: string }) {
  return verified && quote ? (
    <figure className="u-card" style={{ margin: 0 }}><blockquote style={{ margin: 0 }}>{quote}</blockquote><figcaption className="u-small u-muted" style={{ marginTop: "var(--sp-2)" }}>{who}</figcaption></figure>
  ) : (
    <div className="u-empty"><h3>Family stories</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>No stories yet. Each one will be a real family who agreed in writing to share it.</p></div>
  );
}

export default function Design() {
  return (
    <main>
        <div className="u-hero"><div className="u-wrap u-section u-stack">
          <p className="u-eyebrow">Design system v4</p>
          <h1>One set of parts, used on every page</h1>
          <p className="u-muted">Calm financial software with a human guarantee. Everything below is rendered from the same tokens the product will use. Nothing here is a mock-up.</p>
          <nav aria-label="On this page" className="u-row u-small" style={{ marginTop: "var(--sp-2)" }}>{["color", "type", "shape", "buttons", "fields", "status", "nav", "content", "product", "icons"].map((s) => <a key={s} href={`#${s}`} className="u-badge u-badge-quiet" style={{ textTransform: "capitalize" }}>{s}</a>)}</nav>
        </div></div>

        <section id="color" className="u-wrap u-section u-stack" aria-labelledby="h-color">
          <h2 id="h-color">Cool base, warm accent, meaning by icon and word</h2>
          <p className="u-muted">Ink on white for text. Deep teal for brand and links. Coral only for the one main action on a screen. Green is money and approved, amber is waiting, red is a problem. Each status also carries an icon and a word.</p>
          <ul className="u-grid" style={{ listStyle: "none", padding: 0, gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))" }}>{COLORS.map(([v, h, u]) => <Sw key={v} v={v} hex={h} use={u} />)}</ul>
          <h3 style={{ marginTop: "var(--sp-4)" }}>Contrast, measured</h3>
          <table className="u-table"><caption className="u-small u-muted">AA needs 4.5 for text and 3 for controls. We hold body and small text to AAA (7). Computed from the hex values above.</caption>
            <thead><tr><th>Pair</th><th>Foreground</th><th>Background</th><th className="n">Ratio</th><th>Target</th><th>Result</th></tr></thead>
            <tbody>{PAIRS.map(([n, f, b, k, t]) => { const r = ratio(f, b); const ok = r >= t; const aaa = k === "text" && r >= 7; return (
              <tr key={n}><td data-l="Pair">{n}</td><td data-l="Foreground" className="u-code">{f}</td><td data-l="Background" className="u-code">{b}</td><td data-l="Ratio" className="n">{r.toFixed(2)} : 1</td><td data-l="Target">{k === "text" ? (t === 7 ? "AAA 7" : "AA 4.5") : "AA 3"}</td>
                <td data-l="Result"><span className={`u-badge ${ok ? "u-badge-ok" : "u-badge-bad"}`}><Icon name={ok ? "check" : "x"} size={16} />{ok ? (aaa ? "AAA" : "Pass") : "Fail"}</span></td></tr>); })}</tbody></table>
          <p className="u-small u-muted">Hover on the coral button is held to AA (4.5) because it is a momentary state.</p>
        </section>

        <section id="type" className="u-band"><div className="u-wrap u-section u-stack" aria-labelledby="h-type">
          <h2 id="h-type">One sans, one scale, weights for hierarchy</h2>
          <p className="u-muted">Figtree for everything. Instrument Serif appears only on the dollar figure. Sizes are in rem, so the browser&apos;s text-size setting is honored. Nothing else is allowed; a test fails on any other size.</p>
          <div className="u-card u-stack">
            <p className="u-figure">{usd(PART_B_YEARLY)}</p>
            <p className="u-h1-sample" style={{ font: "700 var(--fs-h1)/1.15 var(--font-ui)", letterSpacing: "-0.015em" }}>Heading one states the point</p>
            <p style={{ font: "600 var(--fs-h2)/1.2 var(--font-ui)" }}>Heading two states a conclusion</p>
            <p style={{ font: "600 var(--fs-h3)/1.3 var(--font-ui)" }}>Heading three names the part</p>
            <p>Body is 18 pixels at 1.6 line height, about 68 characters wide. Money lines up because numerals are tabular: {usd(PART_B_MONTHLY)} a month, {usd(LIFELINE_MONTHLY)} a month.</p>
            <p className="u-small">Small is 16. Used for hints, navigation and table cells.</p>
            <p className="u-caption u-muted">Caption is 14. Badges, table heads and citation numbers.</p>
          </div>
          <table className="u-table"><thead><tr><th>Token</th><th>Size (px)</th><th>Weight</th><th>Use</th></tr></thead>
            <tbody>{SCALE.map(([a, b, c, d]) => <tr key={a}><td data-l="Token"><b>{a}</b></td><td data-l="Size" className="u-num">{b}</td><td data-l="Weight">{c}</td><td data-l="Use">{d}</td></tr>)}</tbody></table>
        </div></section>

        <section id="shape" className="u-wrap u-section u-stack" aria-labelledby="h-shape">
          <h2 id="h-shape">Two radii, one border, soft shadows, an 8px grid</h2>
          <div className="u-grid u-cols-3">
            <div className="u-card" style={{ borderRadius: "var(--r-1)" }}><h3>8px radius</h3><p className="u-small u-muted">Buttons, inputs, tables, alerts.</p></div>
            <div className="u-card"><h3>16px radius</h3><p className="u-small u-muted">Cards and panels.</p></div>
            <div className="u-card u-raised"><h3>Raised</h3><p className="u-small u-muted">Soft shadow for panels that sit above the page: hero panel, pricing, popovers.</p></div>
          </div>
          <p className="u-small u-muted">Pills are for badges and status only. Spacing steps: 8, 16, 24, 32, 48, 64, 96. No blur-heavy layers.</p>
        </section>

        <section id="buttons" className="u-band"><div className="u-wrap u-section u-stack" aria-labelledby="h-btn">
          <h2 id="h-btn">Three kinds, three sizes, all tappable</h2>
          {(["primary", "secondary", "ghost"] as const).map((k) => (
            <div key={k} className="u-row"><span className="u-small u-muted" style={{ width: "6rem", textTransform: "capitalize" }}>{k}</span>
              <button className={`u-btn u-btn-sm u-btn-${k}`}>Free check</button><button className={`u-btn u-btn-${k}`}>Free check</button><button className={`u-btn u-btn-lg u-btn-${k}`}>Free check</button><button className={`u-btn u-btn-${k}`} disabled>Disabled</button></div>))}
          <p className="u-small u-muted">Sizes are 44, 48 and 56 pixels tall. Use coral for one action per screen. Press Tab to see the focus ring.</p>
        </div></section>

        <section id="fields" className="u-wrap u-section u-stack" aria-labelledby="h-fields">
          <h2 id="h-fields">Fields say what they need, and what went wrong</h2>
          <div className="u-grid u-cols-2">
            <div><label className="u-label" htmlFor="d1">Your ZIP code<span className="u-hint">Five digits. We use it to find local programs.</span></label><input id="d1" className="u-input" inputMode="numeric" defaultValue="98101" /></div>
            <div><label className="u-label" htmlFor="d2">Monthly income<span className="u-hint">Before taxes.</span></label><input id="d2" className="u-input" aria-invalid="true" aria-describedby="d2e" defaultValue="abc" />
              <p id="d2e" className="u-error"><Icon name="alert" size={16} />Enter a number, like 1450.</p></div>
            <div><label className="u-label" htmlFor="d3">Who are you checking for?</label><select id="d3" className="u-input" defaultValue="me"><option value="me">Me</option><option value="parent">My parent</option></select></div>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend className="u-label">Do you own your home?</legend>
            <div className="u-grid u-cols-2"><label className="u-choice"><input type="radio" name="own" defaultChecked /><span><b>Yes</b><span className="u-hint">Including a mobile home you own.</span></span></label><label className="u-choice"><input type="radio" name="own" /><span><b>No</b><span className="u-hint">Rent or live with family.</span></span></label></div></fieldset>
          <label className="u-choice"><input type="checkbox" defaultChecked /><span><b>Remind me before renewals</b><span className="u-hint">By email. You can stop any time.</span></span></label>
        </section>

        <section id="status" className="u-band"><div className="u-wrap u-section u-stack" aria-labelledby="h-status">
          <h2 id="h-status">Status and feedback never rely on color alone</h2>
          <div className="u-row">{STATUS_KEYS.map((s) => <Status key={s} s={s} />)}</div>
          <div className="u-grid u-cols-2">
            <div className="u-alert u-alert-info" role="note"><Icon name="question" size={22} /><p>Info: your answers stay on this page until you choose to save them.</p></div>
            <div className="u-alert u-alert-ok" role="status"><Icon name="check" size={22} /><p>Done: your form is ready to review.</p></div>
            <div className="u-alert u-alert-warn"><Icon name="clock" size={22} /><p>Waiting: the office usually answers within 45 days.</p></div>
            <div className="u-alert u-alert-bad" role="alert"><Icon name="alert" size={22} /><p>Problem: we need one more paper. Upload your bank statement.</p></div>
          </div>
          <div className="u-row"><span className="u-toast" role="status"><Icon name="check" size={16} />Saved</span></div>
          <div className="u-stack"><p className="u-label" id="stp">Step 2 of 5</p><ol className="u-steps" aria-labelledby="stp">{["done", "now", "", "", ""].map((s, i) => <li key={i} data-s={s} />)}</ol>
            <div className="u-progress" role="progressbar" aria-label="Free check progress" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}><i style={{ width: "40%" }} /></div></div>
        </div></section>

        <section id="nav" className="u-wrap u-section u-stack" aria-labelledby="h-nav">
          <h2 id="h-nav">One header and one footer on every page</h2>
          <p className="u-muted">The header and footer on this page are the real ones. Wordmark, five links, Sign in, and one short button. Sign in never wraps. Below 1100 pixels the links fold into a menu. There is no display selector in the header; text size is a browser setting, and the footer links to an Accessibility page with a text-size control.</p>
          <V4Tabs tabs={[
            { label: "Free check", body: <p>A stepped flow: one question group per step, a progress bar, Back and Next.</p> },
            { label: "Your packet", body: <p>The filled form, the papers checklist, and the reminders.</p> },
            { label: "Tracker", body: <p>Each program with its status and the next date.</p> },
          ]} />
        </section>

        <section id="content" className="u-band"><div className="u-wrap u-section u-stack" aria-labelledby="h-content">
          <h2 id="h-content">Cards, tables, accordions and quiet citations</h2>
          <div className="u-grid u-cols-3">
            {[["bag", "Basic Food", "Monthly grocery money. Amount depends on household size."], ["pill", "Medicare Savings Program", `Pays the Part B premium, ${usd(PART_B_MONTHLY)} a month.`], ["phone", "Lifeline", `${usd(LIFELINE_MONTHLY)} a month off a phone or internet plan.`]].map(([i, t, d]) => (
              <a key={t} href="/programs" className="u-card u-card-link"><Icon name={i} size={28} /><h3 style={{ marginTop: "var(--sp-1)" }}>{t}</h3><p className="u-small u-muted" style={{ marginTop: "var(--sp-1)" }}>{d}</p></a>))}
          </div>
          <p className="u-prose">The Part B premium for 2026 is {usd(PART_B_MONTHLY)} a month.<Cite4 n={1} id="c1" name="CMS, 2026 Medicare Parts A & B premiums and deductibles" /> A <a href="/programs/msp">Medicare Savings Program</a> can pay it. Tap the number to see the source.</p>
          <table className="u-table"><caption>Programs we check</caption><thead><tr><th>Program</th><th>What it pays</th><th className="n">Amount</th><th>Source</th></tr></thead><tbody>
            <tr><td data-l="Program"><a href="/programs/msp">Medicare Savings Program</a></td><td data-l="What it pays">Part B premium</td><td data-l="Amount" className="n">{usd(PART_B_YEARLY)} a year</td><td data-l="Source">WAC 182-517-0100<Cite4 n={2} id="c2" name="Wash. Admin. Code § 182-517-0100" /></td></tr>
            <tr><td data-l="Program"><a href="/programs/lifeline">Lifeline</a></td><td data-l="What it pays">Phone or internet</td><td data-l="Amount" className="n">{usd(LIFELINE_MONTHLY)} a month</td><td data-l="Source">USAC<Cite4 n={3} id="c3" name="Universal Service Administrative Company, Lifeline eligibility" /></td></tr></tbody></table>
          <div className="u-acc"><details><summary>Is this the same as the free tools?<Chevron /></summary><div className="u-prose"><p>Partly. The free tools find programs and point you to the form. We also fill the form, list the papers, and follow it until it is decided. You can always apply on your own for free, using <a href="https://insurance.wa.gov/about-shiba-services">SHIBA</a> or your local Area Agency on Aging.</p></div></details>
            <details><summary>What if I am turned down?<Chevron /></summary><div><p>We tell you why and what to try next. The guarantee terms are on the pricing page.</p></div></details></div>
        </div></section>

        <section id="product" className="u-wrap u-section u-stack" aria-labelledby="h-product">
          <h2 id="h-product">The hero shows the work product, not a picture of it</h2>
          <p className="u-muted">Concept for the homepage hero: the result panel on the right, built from these parts. Demo data, labeled. The dollar figure appears once, here, with its source.</p>
          <div className="u-grid u-cols-2" style={{ alignItems: "start" }}>
            <div className="u-stack"><p className="u-eyebrow">Hero, left column</p><p style={{ font: "700 var(--fs-h1)/1.15 var(--font-ui)", letterSpacing: "-0.015em" }}>Washington has help with food, medicine and bills. Many people who qualify never get it.</p>
              <p className="u-muted">We check, fill in the paperwork, and follow it until it is decided.</p>
              <div className="u-row"><a className="u-btn u-btn-primary u-btn-lg" href="/check">Free check</a><a className="u-btn u-btn-secondary u-btn-lg" href="/how-it-works">See how it works</a></div></div>
            <div className="u-card u-raised u-stack" aria-label="Demo result panel">
              <div className="u-row" style={{ justifyContent: "space-between" }}><h3>Your results</h3><DemoTag /></div>
              <div><p className="u-small u-muted">Medicare Savings Program may pay your Part B premium</p><p className="u-figure">{usd(PART_B_YEARLY)}<span className="u-small u-muted" style={{ fontFamily: "var(--font-ui)" }}> a year</span><Cite4 n={4} id="c4" name="CMS, 2026 Medicare Parts A & B premiums and deductibles" /></p></div>
              <ul className="u-stack" style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border)" }}>
                {[["pill", "Medicare Savings Program", "ready"], ["phone", "Lifeline", "submitted"], ["bag", "Basic Food", "waiting"], ["calendar", "Extra Help", "renewal"]].map(([i, t, s]) => (
                  <li key={t} className="u-row" style={{ justifyContent: "space-between", paddingBlock: "var(--sp-1)", borderBottom: "1px solid var(--border)", marginTop: 0 }}><span className="u-row" style={{ gap: "var(--sp-1)" }}><Icon name={i} size={22} /><b>{t}</b></span><Status s={s} /></li>))}
              </ul>
            </div>
          </div>

          <h3 style={{ marginTop: "var(--sp-4)" }}>Your packet: what the fee buys</h3>
          <div className="u-grid u-cols-3" style={{ alignItems: "start" }}>
            <div className="u-form" role="img" aria-label="Demo filled form"><div className="u-row" style={{ justifyContent: "space-between" }}><b>Application, page 1</b><DemoTag /></div>
              <dl><dt>Name</dt><dd>Sample Person</dd><dt>Date of birth</dt><dd>01/15/1952</dd><dt>Monthly income</dt><dd>$1,450</dd><dt>Program</dt><dd>Medicare Savings</dd></dl></div>
            <div className="u-card u-stack"><div className="u-row" style={{ justifyContent: "space-between" }}><h3>Papers to gather</h3><DemoTag /></div>
              <ul className="u-list"><Check>Photo ID</Check><Check>Medicare card</Check><li><Icon name="clock" size={20} /><span>Latest bank statement</span></li></ul></div>
            <div className="u-card"><div className="u-row" style={{ justifyContent: "space-between" }}><h3>Reminders</h3><DemoTag /></div>
              <ol className="u-time" style={{ marginTop: "var(--sp-2)" }}>
                <li data-s="done"><span className="dot"><Icon name="check" size={14} /></span><b>Form submitted</b><p className="u-small u-muted">Mar 3</p></li>
                <li data-s="now"><span className="dot"><Icon name="clock" size={14} /></span><b>Waiting for a decision</b><p className="u-small u-muted">We check every week</p></li>
                <li><span className="dot"><Icon name="calendar" size={14} /></span><b>Renewal reminder</b><p className="u-small u-muted">Mar 2027</p></li></ol></div>
          </div>

          <h3 style={{ marginTop: "var(--sp-4)" }}>Pricing</h3>
          <div className="u-grid u-cols-2" style={{ alignItems: "start" }}>
            <div className="u-card u-raised u-price" style={{ borderColor: "var(--brand)" }}><p className="u-eyebrow">For families</p><p className="u-price-amt">$149</p><p className="u-muted">One price per household. Free check first.</p>
              <ul className="u-list"><Check>We fill in every application</Check><Check>A list of the papers you need</Check><Check>Tracking and renewal reminders</Check><Check>Money back if we find you nothing</Check></ul>
              <a className="u-btn u-btn-primary" href="/check">Start the free check</a></div>
            <div className="u-card u-price"><p className="u-eyebrow">For organizations</p><h3>Sponsor pilot</h3><p className="u-muted">Offer Recoupp to the people you serve, and see the verified total.</p>
              <ul className="u-list"><Check>Your members get the full service</Check><Check>A dashboard of verified results</Check></ul><a className="u-btn u-btn-secondary" href="/for-sponsors">Talk to us</a></div>
          </div>

          <h3 style={{ marginTop: "var(--sp-4)" }}>Proof, with designed empty states</h3>
          <p className="u-small u-muted">Both are data-driven and render only when <span className="u-code">verified: true</span>. Until then the empty state says so plainly.</p>
          <div className="u-grid u-cols-2"><VerifiedTotal verified={false} /><Testimonial verified={false} /></div>
          <div className="u-grid u-cols-2"><VerifiedTotal verified total={0} count={0} /><Testimonial verified quote="(Format preview only. Real quotes appear only with written permission.)" who="Format preview" /></div>
        </section>

        <section id="icons" className="u-band"><div className="u-wrap u-section u-stack" aria-labelledby="h-icons">
          <h2 id="h-icons">One icon set, one stroke weight</h2>
          <ul className="u-grid" style={{ listStyle: "none", padding: 0, gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" }}>{ICONS.map((n) => <li key={n} className="u-card u-row" style={{ padding: "var(--sp-2)", flexWrap: "nowrap" }}><Icon name={n} size={24} /><span className="u-caption">{n}</span></li>)}</ul>
          <p className="u-small u-muted">24px grid, 2px stroke, round caps and joins. {ICONS.length} icons.</p>
        </div></section>

        <section className="u-wrap u-section u-stack" aria-labelledby="h-src">
          <div className="u-acc"><details id="sources"><summary id="h-src"><h2 style={{ font: "600 var(--fs-h3)/1.3 var(--font-ui)" }}>Sources (sample block)</h2><Chevron /></summary>
            <ol className="u-small u-stack" style={{ paddingLeft: "var(--sp-3)" }}>
              <SrcRow n={1} a="Centers for Medicare & Medicaid Services. (2025, November 14)." t="2026 Medicare Parts A & B premiums and deductibles [Fact sheet]" u="https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles" />
              <SrcRow n={2} a="Wash. Admin. Code § 182-517-0100." t="" u="https://app.leg.wa.gov/WAC/default.aspx?cite=182-517-0100" />
              <SrcRow n={3} a="Universal Service Administrative Company. (n.d.)." t="[Lifeline eligibility page]" u="https://www.lifelinesupport.org/how-to-qualify/" />
              <SrcRow n={4} a="Centers for Medicare & Medicaid Services. (2025, November 14)." t="2026 Medicare Parts A & B premiums and deductibles [Fact sheet]" u="https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles" />
            </ol></details></div>
        </section>
    </main>
  );
}
