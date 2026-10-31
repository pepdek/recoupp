import type { Metadata } from "next";
import Md from "@/components/Md";
import legal from "@/lib/legal.generated.json";

export const metadata: Metadata = { title: "Terms of Service (draft)", description: "Draft terms for attorney review. Not in effect.", alternates: { canonical: "/terms" }, robots: { index: false } };
export default function Terms() {
  return (
    <main className="u-wrap-narrow u-pagehead u-prose-all" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Legal</p>
      <h1 className="u-title">Terms of Service</h1>
      <p className="u-alert u-alert-warn" style={{ fontWeight: 600 }}>Draft for attorney review. Not in effect. Do not rely on it.</p>
      <div style={{ marginTop: "var(--sp-3)" }}><Md text={legal.terms} /></div>
    </main>
  );
}
