"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "./track";

/** Phone-only bar: one thumb-reach button, plus tap-to-call when a phone number is configured. */
export default function StickyCta({ phone }: { phone?: string }) {
  const p = usePathname();
  if (!(p === "/" || p.startsWith("/programs") || p === "/about" || p === "/for-sponsors")) return null;
  return (
    <>
      <div className="h-[4.75rem] md:hidden" aria-hidden />
      <div className="stickybar md:hidden">
        <Link href="/check" className="btn" onClick={() => track("cta_click", "sticky")}>Check what I might qualify for</Link>
        {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn btn-quiet" aria-label={`Call ${phone}`}>Call</a>}
      </div>
    </>
  );
}
