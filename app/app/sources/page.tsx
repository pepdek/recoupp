import type { Metadata } from "next";
import { SOURCES, cites } from "@/lib/sources";

export const metadata: Metadata = { title: "Sources", description: "Every official source behind the numbers on this site, in APA format, with the date we read it.", alternates: { canonical: "/sources" } };

export default function Sources() {
  const S = cites(Object.keys(SOURCES));
  return (
    <main className="u-wrap u-pagehead" style={{ paddingBottom: "var(--sp-8)", paddingTop: "var(--sp-6)" }}>
      <p className="u-eyebrow">Sources</p>
      <h1 className="u-title">Where our numbers come from</h1>
      <p className="u-muted">Every dollar figure and statistic on this site links to one of these. Pages show a short numbered list of the ones they use.</p>
      <div style={{ marginTop: "var(--sp-4)" }}><S.Block open /></div>
    </main>
  );
}
