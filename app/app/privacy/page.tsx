import type { Metadata } from "next";
import Md from "@/components/Md";
import legal from "@/lib/legal.generated.json";

export const metadata: Metadata = { title: "Privacy Policy (draft)", description: "Draft privacy policy for attorney review. Not in effect.", alternates: { canonical: "/privacy" }, robots: { index: false } };
export default function Privacy() {
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">Legal</p>
      <h1>Privacy Policy</h1>
      <p className="slip mt-4 font-bold">Draft for attorney review. Not in effect. Do not rely on it.</p>
      <p className="mt-4">The short version: we never ask for your Social Security number, you can download or delete your data any time from your <a href="/account">account page</a>, and a community group that sent you sees totals only unless you choose to share.</p>
      <div className="mt-6"><Md text={legal.privacy} /></div>
    </main>
  );
}
