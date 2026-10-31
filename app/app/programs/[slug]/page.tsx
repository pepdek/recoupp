import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm, TLink } from "@/components/Cta";
import Json from "@/components/Json";
import { BRAND } from "@/lib/brand";
import { COPY, bySlug, programData } from "@/lib/programCopy";
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
  return (
    <main className="wrap-narrow">
      <Json data={{ "@context": "https://schema.org", "@type": "GovernmentService", name: c.title, serviceOperator: { "@type": "GovernmentOrganization", name: p.agency }, areaServed: "Washington State, US", description: c.pays }} />
      <p className="eyebrow">{p.agency}</p>
      <h1>{c.title}</h1>
      <p className="mt-4 text-[1.375rem]">{c.pays}</p>

      <h2 className="mt-10">What it pays</h2>
      <p className="mt-3">{c.pays}{c.extra ? ` ${c.extra}` : ""}</p>

      <h2 className="mt-10">Who qualifies</h2>
      <ul className="ml-5 mt-3 list-disc stack">{c.who.map((w) => <li key={w}>{w}</li>)}</ul>
      <p className="small muted mt-3">These are the published rules as we read them. The agency decides. Rules change, so check the official page before you rely on a number.</p>

      <h2 className="mt-10">How to apply</h2>
      <p className="mt-3">{p.application.channel}. <a href={p.application.url} target="_blank" rel="noreferrer">Official application page</a></p>
      <p className="mt-3">Papers you&apos;ll likely need:</p>
      <ul className="ml-5 mt-2 list-disc grid gap-1">{p.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      <p className="small mt-3">How renewal works: {p.renewal}.</p>

      <h2 className="mt-10">Where this comes from</h2>
      <ul className="ml-5 mt-3 list-disc grid gap-1">{p.source_urls.map((u) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{new URL(u).hostname.replace(/^www\./, "")}</a></li>)}</ul>
      <p className="small mt-3">Last checked {prettyDate(p.last_verified)} by {BRAND}.</p>

      <div className="slip mt-10">
        <h2 className="!text-[1.75rem]">See if this fits you</h2>
        <p className="mt-2">The free check takes about a minute and saves nothing. The full report checks about twenty programs and fills in the forms.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4"><TLink href="/check" event="cta_click" className="btn">Check what I might qualify for</TLink><CheckoutForm where="program" className="btn btn-quiet" label="Get the full report, $149" /></div>
      </div>
    </main>
  );
}
