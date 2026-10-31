import type { Metadata } from "next";
import Link from "next/link";
import { COPY, PROGRAM_SOURCES, allProgramSources, programData } from "@/lib/programCopy";
import { cites } from "@/lib/sources";
import { programs } from "@/lib/programs";
import { LAST_CHECKED, prettyDate } from "@/lib/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Programs we check", description: `The Washington benefit programs ${BRAND} checks, what each one pays, and who qualifies.`, alternates: { canonical: "/programs" } };
export default function Programs() {
  const S = cites(allProgramSources().ids);
  const review = programs.filter((p) => p.confidence !== "verified");
  return (
    <main className="u-wrap u-pagehead" style={{ paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Programs</p>
      <h1 className="u-title">Programs we check</h1>
      <p className="u-muted">These are the programs where we can show a published amount or limit. Each page links to the official source. Rules last checked {prettyDate(LAST_CHECKED)}.</p>
      <table className="u-table" style={{ marginTop: "var(--sp-3)" }}>
        <caption className="sr-only">Programs with a published amount</caption>
        <thead><tr><th>Program</th><th>What it pays</th><th>Run by</th></tr></thead>
        <tbody>
          {COPY.map((c) => (
            <tr key={c.id}>
              <td data-l="Program" style={{ fontWeight: 600 }}><Link href={`/programs/${c.slug}`}>{c.title}</Link></td>
              <td data-l="What it pays" className="u-prose">{c.pays}<S.Cite id={PROGRAM_SOURCES[c.id]} /></td>
              <td data-l="Run by" className="u-small u-muted">{programData(c.id).agency}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: "var(--sp-6)", fontSize: "var(--fs-h3)" }}>Also checked by a person</h2>
      <p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>We also look at these. A person confirms them before you see a result, so we don&apos;t show amounts here yet.</p>
      <ul className="u-row u-small" style={{ listStyle: "none", padding: 0, marginTop: "var(--sp-2)" }}>{review.map((p) => <li key={p.id} className="u-badge u-badge-quiet" style={{ whiteSpace: "normal", maxWidth: "100%" }}>{p.name}</li>)}</ul>
      <div style={{ marginTop: "var(--sp-6)" }}><S.Block /></div>
    </main>
  );
}
