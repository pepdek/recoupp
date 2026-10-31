"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "./track";

/** Phone-only bar: the free check, plus tap-to-call when a phone number is configured. */
export default function StickyCta({ phone }: { phone?: string }) {
  const p = usePathname();
  if (!(p === "/" || /^\/(programs|about|pricing|how-it-works|for-sponsors)/.test(p))) return null;
  return (
    <>
      <div style={{ height: "4.5rem" }} className="md:hidden" aria-hidden />
      <div className="u-sticky">
        <Link href="/check" className="u-btn u-btn-primary" onClick={() => track("cta_click", "sticky")}>Free check</Link>
        {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="u-btn u-btn-secondary" aria-label={`Call ${phone}`}>Call</a>}
      </div>
    </>
  );
}
