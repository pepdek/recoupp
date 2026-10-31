import Link from "next/link";
import { cookies } from "next/headers";
import Icon from "@/components/Icon";
import { BRAND } from "@/lib/brand";
import { ADDRESS, PHONE, SUPPORT_EMAIL, telHref } from "@/lib/contact";
import { CheckoutForm } from "@/components/Cta";
import { CHECKED, COUNT_WORD, PART_B_YEARLY } from "@/lib/site";

// v4 parts. Class names and tokens live in app/v4.css. Server components only; Tabs is the one client piece (V4Tabs).
export const NAV4 = [["/how-it-works", "How it works"], ["/programs", "What we check"], ["/pricing", "Pricing"], ["/for-sponsors", "For organizations"], ["/about", "About"]] as const;

const Chevron = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>;
const Menu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export { Chevron };

export function Wordmark4() {
  return (
    <Link href="/" className="u-wordmark" aria-label={`${BRAND} home`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden><rect width="28" height="28" rx="8" fill="var(--brand)" /><path d="M8 14.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {BRAND}
    </Link>
  );
}

export const Ph4 = ({ children }: { children: React.ReactNode }) => <span className="u-ph">[PLACEHOLDER: {children}]</span>;
export const PhoneLink4 = () => (PHONE ? <a href={telHref(PHONE)}>{PHONE}</a> : <Ph4>phone number</Ph4>);
export const EmailLink4 = ({ subject }: { subject?: string }) => (SUPPORT_EMAIL ? <a href={`mailto:${SUPPORT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}>{SUPPORT_EMAIL}</a> : <Ph4>support email on your own domain</Ph4>);

export async function Header4() {
  // Cookie presence only (no network call): enough to pick the label.
  const signedIn = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  const [href, label] = signedIn ? ["/account", "Account"] : ["/login", "Sign in"];
  return (
    <header className="u-header">
      <a className="u-skip" href="#main">Skip to content</a>
      <div className="u-wrap">
        <Wordmark4 />
        <nav className="u-nav" aria-label="Main">{NAV4.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}</nav>
        <div className="u-header-end">
          <Link className="u-signin" href={href}>{label}</Link>
          <Link className="u-btn u-btn-primary u-btn-sm" href="/check">Free check</Link>
        </div>
        <details className="u-menu" style={{ marginLeft: "auto" }}>
          <summary aria-label="Menu"><Menu /></summary>
          <div className="u-menu-panel">
            {NAV4.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
            <Link href={href}>{label}</Link>
            <Link className="u-btn u-btn-primary" href="/check" style={{ marginTop: "var(--sp-2)", width: "100%" }}>Free check</Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer4() {
  const cols: [string, [string, string][]][] = [
    ["Product", [["/how-it-works", "How it works"], ["/programs", "What we check"], ["/pricing", "Pricing"], ["/check", "Free check"]]],
    ["Company", [["/about", "About"], ["/contact", "Contact"], ["/for-sponsors", "For organizations"], ["/login", "Sign in"]]],
    ["Legal", [["/terms", "Terms (draft)"], ["/privacy", "Privacy (draft)"], ["/accessibility", "Accessibility"], ["/sources", "Sources"]]],
  ];
  return (
    <footer className="u-footer">
      <div className="u-wrap u-grid" style={{ gap: "var(--sp-4)", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))" }}>
        <div className="u-stack u-small"><Wordmark4 /><p>We help older Washingtonians and their families find benefits, fill in the paperwork, and follow it to a decision.</p></div>
        {cols.map(([h, ls]) => <nav key={h} aria-label={h}><h2 style={{ fontSize: "var(--fs-small)" }}>{h}</h2><ul>{ls.map(([a, t]) => <li key={a}><Link href={a}>{t}</Link></li>)}</ul></nav>)}
      </div>
      <div className="u-wrap u-small u-muted u-stack" style={{ marginTop: "var(--sp-4)", borderTop: "1px solid var(--border)", paddingTop: "var(--sp-3)" }}>
        <p>{BRAND} is a paperwork service. We are not a law firm, a government agency, a tax preparer or a financial adviser. Everything we show is an estimate, a person reviews each result, and the agency makes the final decision. We never ask for your Social Security number. You can apply to every program on this site for free on your own.</p>
        <p>{ADDRESS || <Ph4>Washington business address</Ph4>} · <PhoneLink4 /> · <EmailLink4 /></p>
      </div>
    </footer>
  );
}

const TONE = { ok: "u-badge-ok", wait: "u-badge-wait", bad: "u-badge-bad", quiet: "u-badge-quiet", info: "" } as const;
const STATUS4: Record<string, [string, string, keyof typeof TONE]> = {
  ready: ["Ready to apply", "arrow", "info"], waiting: ["Waiting", "clock", "wait"], submitted: ["Submitted", "envelope", "info"],
  approved: ["Approved", "check", "ok"], renewal: ["Renewal due", "calendar", "wait"], needs: ["Needs info", "alert", "bad"],
};
export const STATUS_KEYS = Object.keys(STATUS4);
/** Status badge: icon + word + tint. */
export function Status({ s }: { s: string }) {
  const [t, i, tone] = STATUS4[s];
  return <span className={`u-badge ${TONE[tone]}`}><Icon name={i} size={16} />{t}</span>;
}

/** Citation: a small number that opens a popover with the source name and check date. Full list lives in the Sources block. */
export function Cite4({ n, id, name, date = CHECKED }: { n: number; id: string; name: string; date?: string }) {
  return (
    <>
      <button type="button" className="u-cite" popoverTarget={id} aria-label={`Source ${n}: ${name}`}>{n}</button>
      <span id={id} popover="auto" className="u-pop"><b>{name}</b><br /><span className="u-muted">Checked {date}.</span> <a href={`#src-${n}`}>See source {n}</a></span>
    </>
  );
}

export function DemoTag() { return <span className="u-demo"><Icon name="question" size={16} />Demo data</span>; }

export function Check({ children }: { children: React.ReactNode }) { return <li><Icon name="check" size={20} /><span>{children}</span></li>; }

export const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

/** Hero panel: the real result parts with demo data. The dollar figure appears here, once, with its source (passed in as `cite`). */
export function ResultPanel({ cite }: { cite: React.ReactNode }) {
  const rows: [string, string, string][] = [["pill", "Medicare Savings Program", "ready"], ["phone", "Lifeline", "submitted"], ["bag", "Basic Food", "waiting"], ["calendar", "Extra Help", "renewal"]];
  return (
    <div className="u-card u-raised u-stack" role="group" aria-label="Demo result panel">
      <div className="u-row" style={{ justifyContent: "space-between" }}><h2 style={{ fontSize: "var(--fs-h3)" }}>Your results</h2><DemoTag /></div>
      <div><p className="u-small u-muted">A Medicare Savings Program may pay your Part B premium</p>
        <p className="u-figure">{usd(PART_B_YEARLY)}<span className="u-small u-muted" style={{ fontFamily: "var(--font-ui)" }}> a year</span>{cite}</p></div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border)" }}>
        {rows.map(([i, t, s]) => (
          <li key={t} className="u-row" style={{ justifyContent: "space-between", flexWrap: "nowrap", padding: "var(--sp-1) 0", borderBottom: "1px solid var(--border)" }}>
            <span className="u-row" style={{ gap: "var(--sp-1)", flexWrap: "nowrap" }}><Icon name={i} size={22} /><b className="u-small">{t}</b></span><Status s={s} />
          </li>))}
      </ul>
    </div>
  );
}

/** What the fee buys: filled form, papers list, reminders. Demo data, labeled. */
export function PacketPreview() {
  return (
    <div className="u-grid u-cols-3" style={{ alignItems: "start" }}>
      <div className="u-form" role="group" aria-label="Demo filled form"><div className="u-row" style={{ justifyContent: "space-between" }}><b>Application, page 1</b><DemoTag /></div>
        <dl><dt>Name</dt><dd>Sample Person</dd><dt>Date of birth</dt><dd>01/15/1952</dd><dt>Monthly income</dt><dd>$1,450</dd><dt>Program</dt><dd>Medicare Savings</dd></dl></div>
      <div className="u-card u-stack"><div className="u-row" style={{ justifyContent: "space-between" }}><h3>Papers to gather</h3><DemoTag /></div>
        <ul className="u-list"><Check>Photo ID</Check><Check>Medicare card</Check><li><Icon name="clock" size={20} /><span>Latest bank statement</span></li></ul></div>
      <div className="u-card"><div className="u-row" style={{ justifyContent: "space-between" }}><h3>Reminders</h3><DemoTag /></div>
        <ol className="u-time" style={{ marginTop: "var(--sp-2)" }}>
          <li data-s="done"><span className="dot"><Icon name="check" size={14} /></span><b>Form submitted</b><p className="u-small u-muted">Mar 3</p></li>
          <li data-s="now"><span className="dot"><Icon name="clock" size={14} /></span><b>Waiting for a decision</b><p className="u-small u-muted">We check every week</p></li>
          <li><span className="dot"><Icon name="calendar" size={14} /></span><b>Renewal reminder</b><p className="u-small u-muted">Mar 2027</p></li></ol></div>
    </div>
  );
}

export const INCLUDED = [`A check of about ${COUNT_WORD} Washington programs, ranked by dollars a year`, "A filled-in form for each program you qualify for", "A plain list of papers to gather", "90 days of reminders about papers, letters and renewals", "Money back if we find under $1,000 a year in likely benefits"];

export function PriceCard({ where = "home" }: { where?: string }) {
  return (
    <div className="u-card u-raised u-price" style={{ borderColor: "var(--brand)" }}>
      <p className="u-eyebrow">For families</p><p className="u-price-amt">$149<span className="u-small u-muted" style={{ fontWeight: 400 }}> one time</span></p>
      <p className="u-muted">No subscription. No upsell. The same price for everyone.</p>
      <ul className="u-list">{INCLUDED.map((t) => <Check key={t}>{t}</Check>)}</ul>
      <CheckoutForm where={where} className="u-btn u-btn-primary u-btn-lg" label="Get my full report" />
      <p className="u-small">Not sure yet? <a href="/check">Do the free check first.</a></p>
    </div>
  );
}
export function SponsorCard() {
  return (
    <div className="u-card u-price"><p className="u-eyebrow">For organizations</p><h3>Sponsor pilot</h3><p className="u-muted">Give your members this at no cost to them. It comes with a recovered-income guarantee.</p>
      <ul className="u-list"><Check>Your members get the full service</Check><Check>A dashboard of verified totals, never names, unless a member opts in</Check></ul>
      <Link className="u-btn u-btn-secondary" href="/for-sponsors">See the pilot</Link></div>
  );
}
