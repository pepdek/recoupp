import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { ADDRESS } from "@/lib/contact";
import { EmailLink, Ph, PhoneLink } from "@/components/ui";

export const metadata: Metadata = { title: `About ${BRAND}`, description: `Who reviews your answers at ${BRAND}, why we built it, and how to reach a person.`, alternates: { canonical: "/about" } };
export default function About() {
  return (
    <main className="wrap-narrow">
      <p className="eyebrow">About</p>
      <h1>Who is behind {BRAND}</h1>
      <p className="mt-4">{BRAND}: get back what&apos;s yours. We help older Washingtonians and their families find benefits, fill in the paperwork, and follow it to a decision. A person reads every result before you see it.</p>

      <h2 className="mt-10">Who reviews your answers</h2>
      <div className="mt-4 grid items-start gap-5 md:grid-cols-[12rem_1fr]">
        <div className="grid aspect-square place-items-center border-2 border-dashed border-ink-2 p-3 text-center small font-bold">PHOTO SLOT<br />A real photo goes here</div>
        <div className="stack">
          <p className="display text-3xl"><Ph>name</Ph></p>
          <p><Ph>role</Ph></p>
          <p><Ph>a short, true bio: where you&apos;re from, why this work, your experience with these programs</Ph></p>
        </div>
      </div>

      <h2 className="mt-10">Why we built this</h2>
      <p className="mt-3"><Ph>a short note in your own voice: what you saw happen to a family, and why you built this. Plain words. Only things that are true.</Ph></p>

      <h2 className="mt-10">How to reach a person</h2>
      <ul className="mt-3 grid gap-2">
        <li><b>Phone:</b> <PhoneLink /></li>
        <li><b>Email:</b> <EmailLink /></li>
        <li><b>Mail:</b> {ADDRESS || <Ph>Washington business address</Ph>}</li>
      </ul>

      <h2 className="mt-10">What we are, and what we aren&apos;t</h2>
      <p className="mt-3">We are a paperwork service. We are not a law firm, a government agency, a tax preparer or a financial adviser. The agency that runs each program makes the final decision. Our dollar figures are estimates.</p>
    </main>
  );
}
