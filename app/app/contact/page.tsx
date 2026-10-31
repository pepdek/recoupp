import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { ADDRESS } from "@/lib/contact";
import { EmailLink4 as EmailLink, Ph4 as Ph, PhoneLink4 as PhoneLink } from "@/components/v4";

export const metadata: Metadata = { title: "Contact", description: `Phone, email and mailing address for ${BRAND}.`, alternates: { canonical: "/contact" } };
export default function Contact() {
  return (
    <main className="u-wrap-narrow u-pagehead" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">Contact</p>
      <h1 className="u-title">Talk to a person</h1>
      <p className="u-muted">Questions before you start, or stuck partway through? Reach us any of these ways.</p>
      <ul className="u-stack" style={{ listStyle: "none", padding: 0, marginTop: "var(--sp-3)" }}>
        <li><b>Phone:</b> <PhoneLink /> <span className="u-small u-muted">(hours: <Ph>hours</Ph>)</span></li>
        <li><b>Email:</b> <EmailLink /></li>
        <li><b>Mail:</b> {ADDRESS || <Ph>Washington business address</Ph>}</li>
      </ul>
      <h2 style={{ fontSize: "var(--fs-h3)", marginTop: "var(--sp-6)" }}>Other things you may need</h2>
      <ul className="u-stack u-prose" style={{ marginTop: "var(--sp-1)" }}>
        <li>Download or delete your data: <a href="/account">your account page</a>.</li>
        <li>Run an organization that serves older adults: <a href="/for-sponsors">see the pilot</a>.</li>
        <li>Free Medicare help from the state: SHIBA, 800-562-6900.</li>
      </ul>
    </main>
  );
}
