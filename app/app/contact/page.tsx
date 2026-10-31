import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { ADDRESS } from "@/lib/contact";
import { EmailLink, Ph, PhoneLink } from "@/components/ui";

export const metadata: Metadata = { title: "Contact", description: `Phone, email and mailing address for ${BRAND}.`, alternates: { canonical: "/contact" } };
export default function Contact() {
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">Contact</p>
      <h1>Talk to a person</h1>
      <p className="mt-4">Questions before you start, or stuck partway through? Reach us any of these ways.</p>
      <ul className="mt-6 grid gap-3">
        <li><b>Phone:</b> <PhoneLink /> <span className="small muted">(hours: <Ph>hours</Ph>)</span></li>
        <li><b>Email:</b> <EmailLink /></li>
        <li><b>Mail:</b> {ADDRESS || <Ph>Washington business address</Ph>}</li>
      </ul>
      <h2 className="mt-10">Other things you may need</h2>
      <ul className="ml-5 mt-3 list-disc stack">
        <li>Download or delete your data: <a href="/account">your account page</a>.</li>
        <li>Run an organization that serves older adults: <a href="/for-sponsors">see the pilot</a>.</li>
        <li>Free Medicare help from the state: SHIBA, 800-562-6900.</li>
      </ul>
    </main>
  );
}
