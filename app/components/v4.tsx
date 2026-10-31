import Icon from "@/components/Icon";
import { BRAND } from "@/lib/brand";
import { CHECKED } from "@/lib/site";

// v4 parts. Class names and tokens live in app/v4.css. Server components only; Tabs is the one client piece (V4Tabs).
export const NAV4 = [["/how-it-works", "How it works"], ["/programs", "What we check"], ["/pricing", "Pricing"], ["/for-sponsors", "For organizations"], ["/about", "About"]] as const;

const Chevron = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>;
const Menu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export { Chevron };

export function Wordmark4() {
  return (
    <a href="/" className="u-wordmark" aria-label={`${BRAND} home`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden><rect width="28" height="28" rx="8" fill="var(--brand)" /><path d="M8 14.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {BRAND}
    </a>
  );
}

export function Header4({ current }: { current?: string }) {
  return (
    <header className="u-header">
      <a className="u-skip" href="#main">Skip to content</a>
      <div className="u-wrap">
        <Wordmark4 />
        <nav className="u-nav" aria-label="Main">{NAV4.map(([h, t]) => <a key={h} href={h} aria-current={current === h ? "page" : undefined}>{t}</a>)}</nav>
        <div className="u-header-end">
          <a className="u-signin" href="/login">Sign in</a>
          <a className="u-btn u-btn-primary u-btn-sm" href="/check">Free check</a>
        </div>
        <details className="u-menu" style={{ marginLeft: "auto" }}>
          <summary aria-label="Menu"><Menu /></summary>
          <div className="u-menu-panel">
            {NAV4.map(([h, t]) => <a key={h} href={h}>{t}</a>)}
            <a href="/login">Sign in</a>
            <a className="u-btn u-btn-primary" href="/check" style={{ marginTop: "var(--sp-2)", width: "100%" }}>Free check</a>
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer4() {
  const cols: [string, [string, string][]][] = [
    ["Product", [["/how-it-works", "How it works"], ["/programs", "What we check"], ["/pricing", "Pricing"], ["/check", "Free check"]]],
    ["Company", [["/about", "About"], ["/contact", "Contact"], ["/for-sponsors", "For organizations"]]],
    ["Legal", [["/terms", "Terms (draft)"], ["/privacy", "Privacy (draft)"], ["/accessibility", "Accessibility"], ["/sources", "Sources"]]],
  ];
  return (
    <footer className="u-footer">
      <div className="u-wrap u-grid u-cols-3" style={{ gap: "var(--sp-4)" }}>
        {cols.map(([h, ls]) => <nav key={h} aria-label={h}><h3>{h}</h3><ul>{ls.map(([a, t]) => <li key={a}><a href={a}>{t}</a></li>)}</ul></nav>)}
      </div>
      <div className="u-wrap u-small u-muted" style={{ marginTop: "var(--sp-4)" }}>
        <p>{BRAND} is not a government agency. We check the public programs listed on this site and prepare your paperwork. You can apply to every one of them for free on your own.</p>
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
