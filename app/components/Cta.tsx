"use client";
import Link from "next/link";
import { track } from "./track";

export function TLink({ href, event, className, children }: { href: string; event: string; className?: string; children: React.ReactNode }) {
  return <Link href={href} className={className} onClick={() => track(event, href)}>{children}</Link>;
}
/** The $149 checkout form. Posts to the existing /api/checkout route; the click is counted first. */
export function CheckoutForm({ label = "Get my full report, $149", className = "btn", where = "home" }: { label?: string; className?: string; where?: string }) {
  return (
    <form action="/api/checkout" method="post">
      <button className={className} onClick={() => track("checkout_start", where)}>{label}</button>
    </form>
  );
}
