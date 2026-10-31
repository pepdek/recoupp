import Link from "next/link";
import { cookies } from "next/headers";
import { BRAND } from "@/lib/brand";
import Icon from "./Icon";
import Toggles from "./Toggles";

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Mark: a small luminous orb with a top-left highlight. Works as favicon. */
export function Mark({ size = "1.5rem", decorative }: { size?: string; decorative?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : BRAND} aria-hidden={decorative ? true : undefined}>
      <defs>
        <radialGradient id="orb" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#FFE9BD" /><stop offset=".45" stopColor="#FFB04A" /><stop offset="1" stopColor="#FF7A45" /></radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#orb)" />
      <ellipse cx="14.5" cy="12.5" rx="6" ry="3.4" fill="#fff" opacity=".7" transform="rotate(-28 14.5 12.5)" />
    </svg>
  );
}
/** Type-only wordmark: Instrument Serif, tight tracking, the "c" set in italic. */
export function Wordmark({ size = "2rem" }: { size?: string }) {
  const [a, ...rest] = BRAND.split("");
  return (
    <span className="display inline-flex items-center gap-2 whitespace-nowrap" style={{ fontSize: size, letterSpacing: "-0.05em", lineHeight: 1 }}>
      <Mark size="0.85em" decorative />
      <span>{a}{rest[0] && <em style={{ letterSpacing: "-0.02em", marginRight: "0.02em" }}>{rest[0]}</em>}{rest.slice(1).join("")}</span>
    </span>
  );
}

const ICON: Record<string, string> = { recommended: "arrow", prepared: "pencil", submitted: "envelope", pending: "clock", approved: "check", denied: "x", needs_info: "alert", receiving: "check", renewal_due: "calendar" };
const TONE: Record<string, string> = { approved: "pill-green", receiving: "pill-green", submitted: "", prepared: "", recommended: "", pending: "pill-amber", needs_info: "pill-amber", renewal_due: "pill-amber", denied: "pill-red" };
export const STATUS: Record<string, string> = { recommended: "Ready to apply", prepared: "Prepared", submitted: "Submitted", pending: "Waiting", approved: "Approved", denied: "Denied", needs_info: "Needs info", receiving: "Receiving", renewal_due: "Renewal due" };
/** Status pill: icon + word + tint. */
export function Pill({ status, down }: { status: string; down?: boolean }) {
  return <span className={`pill ${TONE[status] ?? ""} ${down ? "pill-pop" : ""}`}><Icon name={ICON[status] ?? "check"} size={16} />{STATUS[status] ?? status}</span>;
}

export async function Header() {
  // Cookie presence only (no network call): enough to pick the label.
  const signedIn = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="nav">
        <div className="wrap flex items-center justify-between gap-4 py-3">
          <Link href="/" className="text-ink no-underline hover:text-ink"><Wordmark /></Link>
          <Link href={signedIn ? "/account" : "/login"} className="small font-bold">{signedIn ? "Account" : "Sign in"}</Link>
        </div>
      </header>
    </>
  );
}

export async function Footer() {
  const ui = ((await cookies()).get("ui")?.value ?? "").split(",").filter(Boolean) as ("calm" | "lg" | "hc")[];
  return (
    <footer className="wrap mt-20 mb-8">
      <div className="glass pad grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="stack small">
          <Wordmark size="1.75rem" />
          <p>{BRAND} is a paperwork service, not a law firm, tax preparer or financial adviser. Everything we show is an estimate. A person on our team reviews each result, and the agency makes the final decision. We never ask for your Social Security number.</p>
        </div>
        <div className="stack small">
          <nav aria-label="Footer" className="grid gap-2">
            <Link href="/for-sponsors">For organizations that serve older adults</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/account">Your data: download or delete</Link>
          </nav>
          <div id="display"><p className="font-bold">Display</p><div className="mt-2"><Toggles on={ui} /></div></div>
        </div>
      </div>
    </footer>
  );
}

/** Stepper: a glass track, a bead of light on the current step. `current` is 1-based. */
export function Strip({ total, current }: { total: number; current: number }) {
  return (
    <div>
      <p className="small font-bold">Step {current} of {total}</p>
      <ol className="strip mt-1" aria-label="Progress">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} data-done={i + 1 < current ? "" : undefined} aria-current={i + 1 === current ? "step" : undefined}>{i + 1 < current ? <><Icon name="check" size={16} /><span className="sr-only">done</span></> : i + 1}</li>
        ))}
      </ol>
    </div>
  );
}

export { Icon };
