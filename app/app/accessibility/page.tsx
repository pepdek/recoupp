import type { Metadata } from "next";
import { cookies } from "next/headers";
import TextSize from "@/components/TextSize";
import { EmailLink4 as EmailLink, PhoneLink4 as PhoneLink } from "@/components/v4";
import { BRAND } from "@/lib/brand";
import { cites } from "@/lib/sources";

const S = cites(["wcag"]);

export const metadata: Metadata = { title: "Accessibility", description: `Text size, how ${BRAND} aims to work for everyone, what we've tested, and what we haven't yet.`, alternates: { canonical: "/accessibility" } };
const H = { fontSize: "var(--fs-h3)", marginTop: "var(--sp-6)" } as const;
export default async function Accessibility() {
  const lg = ((await cookies()).get("ui")?.value ?? "").split(",").includes("lg");
  return (
    <main className="u-wrap-narrow u-pagehead" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Accessibility</p>
      <h1 className="u-title">Accessibility</h1>
      <h2 style={H}>Text size</h2>
      <p className="u-muted">Body text is 18 pixels by default. Choose Larger for 22 pixels. Your browser&apos;s own text-size and zoom settings also work on every page.</p>
      <div style={{ marginTop: "var(--sp-2)" }}><TextSize on={lg} /></div>

      <h2 style={H}>Our statement</h2>
      <p className="u-prose">We want {BRAND} to be easy to use for people who are 60 and up, people with low vision, and people who use a keyboard or a screen reader. Our target is the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.<S.Cite id="wcag" /></p>
      <h3 style={{ marginTop: "var(--sp-4)" }}>What we&apos;ve built in</h3>
      <ul className="u-stack" style={{ paddingLeft: "var(--sp-3)", listStyle: "disc", marginTop: "var(--sp-1)" }}>
        <li>Body text is 18px with generous line spacing. Text and background meet a 7 to 1 contrast ratio or better (the AAA level), and the page is built in relative units so browser settings scale it.</li>
        <li>Buttons and fields are at least 44px tall, and most are 48px. Every field has a visible label.</li>
        <li>You can use every page with a keyboard. There is a skip link, and focus is always visible.</li>
        <li>Status is always shown with an icon and a word, never by color alone.</li>
        <li>We respect your device&apos;s settings for reduced motion and more contrast.</li>
      </ul>
      <h3 style={{ marginTop: "var(--sp-4)" }}>What we&apos;ve tested</h3>
      <p>Automated checks (Lighthouse, which uses the axe rules) on the pages we rebuilt, and a layout check at phone widths with no sideways scrolling.</p>
      <h3 style={{ marginTop: "var(--sp-4)" }}>What we haven&apos;t tested yet</h3>
      <p>We have not yet tested with screen readers (such as VoiceOver or NVDA), on an older phone, or with people who have disabilities. Automated tools catch only some problems, so there may be some we haven&apos;t found.</p>
      <h3 style={{ marginTop: "var(--sp-4)" }}>Tell us about a problem</h3>
      <p>If something doesn&apos;t work for you, write to <EmailLink subject="Accessibility problem" /> or call <PhoneLink />. Tell us the page and what happened. We will answer and, where we can, offer another way to get the same help.</p>
      <p className="u-small u-muted" style={{ marginTop: "var(--sp-4)" }}>This statement describes the site as rebuilt on October 31, 2026. We will update it as we test more.</p>
      <div style={{ marginTop: "var(--sp-4)" }}><S.Block /></div>
    </main>
  );
}
