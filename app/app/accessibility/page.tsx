import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { EmailLink, PhoneLink } from "@/components/ui";
import { cites } from "@/lib/sources";

const S = cites(["wcag"]);

export const metadata: Metadata = { title: "Accessibility statement", description: `How ${BRAND} aims to work for everyone, what we've tested, and what we haven't yet.`, alternates: { canonical: "/accessibility" } };
export default function Accessibility() {
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">Accessibility</p>
      <h1>Accessibility statement</h1>
      <p className="mt-4">We want {BRAND} to be easy to use for people who are 60 and up, people with low vision, and people who use a keyboard or a screen reader. Our target is the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.<S.Cite id="wcag" /></p>
      <h2 className="mt-8">What we&apos;ve built in</h2>
      <ul className="ml-5 mt-3 list-disc stack">
        <li>Body text is 20px, with a Larger text option, a High contrast option and a Calm option that turns off blur and motion. Open the &ldquo;Aa&rdquo; button at the top of any page, or the Display section in the footer.</li>
        <li>Text is dark on light panes. We checked every text color against the worst-case background and kept each at 7 to 1 or better.</li>
        <li>Buttons and fields are at least 48px tall. Every field has a visible label.</li>
        <li>You can use every page with a keyboard. There is a skip link, and focus is always visible.</li>
        <li>We respect your device&apos;s settings for reduced motion, reduced transparency and more contrast.</li>
      </ul>
      <h2 className="mt-8">What we&apos;ve tested</h2>
      <p className="mt-3">Automated checks (Lighthouse, which uses the axe rules) score 100 on the pages we tested. We checked that pages reflow with no sideways scrolling at 320px wide with larger text, high contrast and Calm on.</p>
      <h2 className="mt-8">What we haven&apos;t tested yet</h2>
      <p className="mt-3">We have not yet tested with screen readers (such as VoiceOver or NVDA), on an older phone, or with people who have disabilities. Automated tools catch only some problems, so there may be some we haven&apos;t found.</p>
      <h2 className="mt-8">Tell us about a problem</h2>
      <p className="mt-3">If something doesn&apos;t work for you, write to <EmailLink subject="Accessibility problem" /> or call <PhoneLink />. Tell us the page and what happened. We will answer and, where we can, offer another way to get the same help.</p>
      <p className="small muted mt-6">This statement describes the site as built on October 31, 2026. We will update it as we test more.</p>
      <S.Block />
    </main>
  );
}
