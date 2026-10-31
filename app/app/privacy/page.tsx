import type { Metadata } from "next";
import Md from "@/components/Md";
import legal from "@/lib/legal.generated.json";

export const metadata: Metadata = { title: "Privacy Policy (draft)", description: "Draft privacy policy for attorney review. Not in effect.", alternates: { canonical: "/privacy" }, robots: { index: false } };
export default function Privacy() {
  return (
    <main className="u-wrap-narrow u-pagehead u-prose-all" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Legal</p>
      <h1 className="u-title">Privacy Policy</h1>
      <p className="u-alert u-alert-warn" style={{ fontWeight: 600 }}>Draft for attorney review. Not in effect. Do not rely on it.</p>
      <p>The short version: we never ask for your Social Security number, you can download or delete your data any time from your <a href="/account">account page</a>, and a community group that sent you sees totals only unless you choose to share.</p>
      <div style={{ marginTop: "var(--sp-3)" }}><Md text={legal.privacy} /></div>
    </main>
  );
}
