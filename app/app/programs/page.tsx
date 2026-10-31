import type { Metadata } from "next";
import Link from "next/link";
import { COPY, programData } from "@/lib/programCopy";
import { programs } from "@/lib/programs";
import { LAST_CHECKED, prettyDate } from "@/lib/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Programs we check", description: `The Washington benefit programs ${BRAND} checks, what each one pays, and who qualifies.`, alternates: { canonical: "/programs" } };
export default function Programs() {
  const review = programs.filter((p) => p.confidence !== "verified");
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">Programs</p>
      <h1>Programs we check</h1>
      <p className="mt-4">These are the programs where we can show a published amount or limit. Each page links to the official source. Rules last checked {prettyDate(LAST_CHECKED)}.</p>
      <ul className="mt-8">
        {COPY.map((c) => (
          <li key={c.id} className="factrow">
            <h2 className="!text-[1.75rem]"><Link href={`/programs/${c.slug}`}>{c.title}</Link></h2>
            <p>{c.pays}</p>
            <p className="small">{programData(c.id).agency}.</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-10">Also checked by a person</h2>
      <p className="mt-3">We also look at these. A person confirms them before you see a result, so we don&apos;t show amounts here yet.</p>
      <ul className="ml-5 mt-3 list-disc grid gap-1 small">{review.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </main>
  );
}
