import type { Metadata } from "next";
import Screener from "@/components/Screener";
import { allProgramSources } from "@/lib/programCopy";
import { cites } from "@/lib/sources";

export const metadata: Metadata = {
  title: "Free check: what might you qualify for?",
  description: "Six questions, no sign-up. See which Washington benefit programs may fit you or your parent.",
  alternates: { canonical: "/check" },
};

export default async function Check({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: who } = await searchParams;
  const { ids, nums } = allProgramSources(), S = cites(ids);
  return (
    <main className="u-wrap-narrow u-pagehead" style={{ paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Free check</p>
      <h1 className="u-title">What might you qualify for?</h1>
      <p className="u-muted">Five short questions. No sign-up, nothing saved. The full report is optional.</p>
      <div style={{ marginTop: "var(--sp-4)" }}><Screener forWho={who === "parent" ? "parent" : "me"} nums={nums} /></div>
      <div style={{ marginTop: "var(--sp-6)" }}><S.Block /></div>
    </main>
  );
}
