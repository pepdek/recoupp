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
    <main className="wrap-narrow">
      <p className="eyebrow">Free check</p>
      <h1>What might you qualify for?</h1>
      <p className="mt-3">Six questions. No sign-up, nothing saved. You&apos;ll see which Washington programs may fit. The full report is optional.</p>
      <div className="mt-8"><Screener forWho={who === "parent" ? "parent" : "me"} nums={nums} /></div>
      <S.Block />
    </main>
  );
}
