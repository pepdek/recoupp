import type { Metadata } from "next";
import Md from "@/components/Md";
import legal from "@/lib/legal.generated.json";

export const metadata: Metadata = { title: "Terms of Service (draft)", description: "Draft terms for attorney review. Not in effect.", alternates: { canonical: "/terms" }, robots: { index: false } };
export default function Terms() {
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">Legal</p>
      <h1>Terms of Service</h1>
      <p className="slip mt-4 font-bold">Draft for attorney review. Not in effect. Do not rely on it.</p>
      <div className="mt-6"><Md text={legal.terms} /></div>
    </main>
  );
}
