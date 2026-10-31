import type { Metadata } from "next";
import Link from "next/link";
import Audience from "@/components/Audience";
import { TLink } from "@/components/Cta";
import Icon from "@/components/Icon";
import { PacketPreview } from "@/components/v4";
import { BRAND } from "@/lib/brand";
import { COUNT_WORD } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: `You answer once. ${BRAND} checks about ${COUNT_WORD} Washington programs, fills in the forms, and follows each one until it's decided.`,
  alternates: { canonical: "/how-it-works" },
};

export default async function HowItWorks({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: who } = await searchParams;
  return (
    <main>
      <section className="u-wrap u-pagehead" style={{ paddingTop: "var(--sp-6)" }}>
        <p className="u-eyebrow">How it works</p>
        <h1 className="u-title">You answer once. We handle the forms.</h1>
        <p className="u-muted">Four steps, from the first question to the last renewal. A person on our team checks your results before you see them.</p>
      </section>
      <section className="u-wrap u-section" aria-labelledby="steps-h" style={{ paddingTop: "var(--sp-3)" }}>
        <h2 id="steps-h" className="sr-only">The four steps</h2>
        <Audience initial={who === "parent" ? "parent" : "me"} />
      </section>
      <section className="u-band" aria-labelledby="packet-h">
        <div className="u-wrap u-section">
          <div className="u-head"><h2 id="packet-h">What you get: your packet</h2><p className="u-muted">The finished paperwork, in the order you will use it. Demo data, so you can see the shape.</p></div>
          <PacketPreview />
          <ul className="u-list" style={{ marginTop: "var(--sp-4)", maxWidth: "46rem" }}>
            {["A filled-in form for each program you qualify for. You check it and sign.", "A plain list of papers to gather, and where to send them.", "Reminders for 90 days about missing papers, agency letters and renewal dates.", "A status for each program, from Ready to apply to Approved."].map((t) => <li key={t}><Icon name="check" size={20} /><span>{t}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="u-wrap u-section" aria-labelledby="go-h">
        <div className="u-card u-raised u-row" style={{ justifyContent: "space-between", padding: "var(--sp-4)" }}>
          <div><h2 id="go-h">Start with the free check.</h2><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>Five questions. Nothing saved. <Link href="/pricing">See pricing</Link>.</p></div>
          <TLink href="/check" event="cta_click" className="u-btn u-btn-primary u-btn-lg">Free check</TLink>
        </div>
      </section>
    </main>
  );
}
