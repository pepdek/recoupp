import Link from "next/link";
import { cookies } from "next/headers";
import { BRAND } from "@/lib/brand";
import Icon from "./Icon";
import Toggles from "./Toggles";

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Type-only wordmark: Fraunces, tightened, with the first letter dropped into a stamp ring. */
export function Wordmark({ size = "1.75rem" }: { size?: string }) {
  return (
    <span className="display inline-flex items-center gap-2 whitespace-nowrap" style={{ fontSize: size, letterSpacing: "-0.045em" }}>
      <Mark size="1.15em" decorative />
      <span>{BRAND}</span>
    </span>
  );
}
/** Mark: favicon and stamp. A ring, an initial, a tilted baseline. */
export function Mark({ size = "1.5rem", decorative }: { size?: string; decorative?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : BRAND} aria-hidden={decorative ? true : undefined} style={{ transform: "rotate(-6deg)" }}>
      <circle cx="20" cy="20" r="17" fill="none" stroke="var(--color-stamp)" strokeWidth="3.5" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="var(--color-stamp)" strokeWidth="1.2" strokeDasharray="2 2.6" />
      <text x="20" y="26.5" textAnchor="middle" fontFamily="var(--font-fraunces), serif" fontWeight="800" fontSize="19" fill="var(--color-stamp)">{BRAND[0]}</text>
    </svg>
  );
}

/** Rough ink-edge filter used by .stamp. Render once in the layout. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" /></filter>
    </svg>
  );
}

const TONE: Record<string, string> = { approved: "stamp-forest", receiving: "stamp-forest", renewal_due: "stamp-red", needs_info: "stamp-red", denied: "stamp-red" };
export const STATUS: Record<string, string> = { recommended: "Ready to apply", prepared: "Prepared", submitted: "Submitted", pending: "Waiting", approved: "Approved", denied: "Denied", needs_info: "Needs info", receiving: "Receiving", renewal_due: "Renewal due" };
export function Stamp({ status, down }: { status: string; down?: boolean }) {
  return <span className={`stamp ${TONE[status] ?? ""} ${down ? "stamp-down" : ""}`}>{STATUS[status] ?? status}</span>;
}

export async function Header() {
  const ui = ((await cookies()).get("ui")?.value ?? "").split(",");
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="border-b-[3px] border-ink">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="text-ink no-underline hover:text-ink"><Wordmark /></Link>
          <Toggles lg={ui.includes("lg")} hc={ui.includes("hc")} />
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t-[3px] border-ink bg-paper-2">
      <div className="wrap grid gap-8 py-10 md:grid-cols-[1.4fr_1fr]">
        <div className="stack small">
          <Wordmark size="1.5rem" />
          <p>{BRAND} is a paperwork service, not a law firm, tax preparer or financial adviser. Everything we show is an estimate. A person on our team reviews each result, and the agency makes the final decision. We never ask for your Social Security number.</p>
        </div>
        <nav aria-label="Footer" className="small grid content-start gap-2">
          <Link href="/for-sponsors">For organizations that serve older adults</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/account">Your data: download or delete</Link>
        </nav>
      </div>
    </footer>
  );
}

export { Icon };

/** Perforated progress strip. `current` is 1-based. */
export function Strip({ total, current }: { total: number; current: number }) {
  return (
    <div>
      <p className="small font-bold">Step {current} of {total}</p>
      <ol className="strip mt-1" aria-label="Progress">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} data-done={i + 1 < current ? "" : undefined} aria-current={i + 1 === current ? "step" : undefined}>{i + 1 < current ? <><Icon name="check" size={18} /><span className="sr-only">done</span></> : i + 1}</li>
        ))}
      </ol>
    </div>
  );
}
