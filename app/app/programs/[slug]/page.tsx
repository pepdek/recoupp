import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm, TLink } from "@/components/Cta";
import Icon from "@/components/Icon";
import Json from "@/components/Json";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { COPY, PROGRAM_SOURCES, bySlug, programData } from "@/lib/programCopy";
import { cites } from "@/lib/sources";
import { prettyDate } from "@/lib/site";


export const dynamicParams = false;
export const generateStaticParams = () => COPY.map((c) => ({ slug: c.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = bySlug((await params).slug);
  return c ? { title: `${c.title}: what it pays and who qualifies`, description: `${c.pays} Who qualifies, how to apply in Washington, and the official source.`, alternates: { canonical: `/programs/${c.slug}` } } : {};
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = bySlug((await params).slug);
  if (!c) notFound();
  const p = programData(c.id);
  const ids = PROGRAM_SOURCES[c.id], S = cites(ids);
  return (
    <main className="u-wrap u-pagehead" style={{ paddingBottom: "var(--sp-8)" }}>
      <Json data={{ "@context": "https://schema.org", "@type": "GovernmentService", name: c.title, serviceOperator: { "@type": "GovernmentOrganization", name: p.agency }, areaServed: "Washington State, US", description: c.pays }} />
      <p className="u-small"><Link href="/programs">All programs</Link></p>
      <p className="u-eyebrow">{p.agency}</p>
      <h1 className="u-title">{c.title}</h1>
      <div className="u-grid u-page2" style={{ marginTop: "var(--sp-3)" }}>
        <div className="u-stack u-prose">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>What it pays</h2>
          <p>{c.pays}{c.extra ? ` ${c.extra}` : ""}<S.Cite id={ids[0]} /></p>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: "var(--sp-4)" }}>Who qualifies</h2>
          <ul className="u-list" style={{ marginTop: "var(--sp-1)" }}>{c.who.map((w) => <li key={w}><Icon name="check" size={20} /><span>{w}</span></li>)}</ul>
          <p className="u-small u-muted">These are the published rules as we read them.<S.Cite id={ids} /> The agency decides. Rules change, so check the official page before you rely on a number.</p>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: "var(--sp-4)" }}>How to apply</h2>
          <p>{p.application.channel}. <a href={p.application.url} target="_blank" rel="noreferrer">Official application page</a></p>
          <p>Papers you&apos;ll likely need:</p>
          <ul className="u-list">{p.documents.map((d) => <li key={d}><Icon name="doc" size={20} /><span>{d}</span></li>)}</ul>
          <p className="u-small">How renewal works: {p.renewal}.</p>
          <h2 style={{ fontSize: "var(--fs-h3)", marginTop: "var(--sp-4)" }}>Where this comes from</h2>
          <p>The numbers above come from {ids.length === 1 ? "one official page" : `${ids.length} official sources`}, listed in the Sources list below.<S.Cite id={ids} /> Last checked {prettyDate(p.last_verified)} by {BRAND}.</p>
        </div>
        <div className="u-card u-raised u-stack">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>See if this fits you</h2>
          <p className="u-muted">The free check takes about a minute and saves nothing. The full report checks about twenty programs and fills in the forms.</p>
          <div className="u-row"><TLink href="/check" event="cta_click" className="u-btn u-btn-primary">Free check</TLink><CheckoutForm where="program" className="u-btn u-btn-secondary" label="Get the full report, $149" /></div>
        </div>
      </div>
      <div style={{ marginTop: "var(--sp-6)" }}><S.Block /></div>
    </main>
  );
}
