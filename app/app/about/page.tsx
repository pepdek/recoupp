import type { Metadata } from "next";
import Link from "next/link";
import { EmailLink4, Ph4, PhoneLink4 } from "@/components/v4";
import { BRAND } from "@/lib/brand";
import { ADDRESS } from "@/lib/contact";
import { COUNT_WORD } from "@/lib/site";
import { cites } from "@/lib/sources";

const S = cites(["ncoa", "shiba", "aaa"]);

export const metadata: Metadata = { title: `About ${BRAND}`, description: `Who reviews your answers at ${BRAND}, why we built it, how we compare with free help, and how to reach a person.`, alternates: { canonical: "/about" } };
const H = { fontSize: "var(--fs-h3)", marginTop: "var(--sp-6)" } as const;
export default function About() {
  return (
    <main className="u-wrap-narrow u-pagehead" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
      <p className="u-eyebrow">About</p>
      <h1 className="u-title">Who is behind {BRAND}</h1>
      <p className="u-muted">{BRAND}: get back what&apos;s yours. We help older Washingtonians and their families find benefits, fill in the paperwork, and follow it to a decision. A person reads every result before you see it.</p>

      <h2 style={H}>Who reviews your answers</h2>
      <div className="u-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 12rem) minmax(0, 1fr))", alignItems: "start" }}>
        <div className="u-empty u-small" style={{ aspectRatio: "1", display: "grid", placeItems: "center", textAlign: "center" }}>Photo slot<br />A real photo goes here</div>
        <div className="u-stack"><p className="u-eyebrow">Reviewer</p><h3><Ph4>name</Ph4></h3><p><Ph4>role</Ph4></p><p><Ph4>a short, true bio: where you&apos;re from, why this work, your experience with these programs</Ph4></p></div>
      </div>

      <h2 style={H}>Why we built this</h2>
      <p><Ph4>a short note in your own voice: what you saw happen to a family, and why you built this. Plain words. Only things that are true.</Ph4></p>

      <h2 id="free-help" style={H}>Free help is real. Here&apos;s how we compare.</h2>
      <p className="u-muted u-prose">If you have time and a patient helper, start with the free options. If you want it done in one sitting, that&apos;s us.</p>
      <table className="u-table" style={{ marginTop: "var(--sp-2)" }}>
        <caption className="sr-only">Free help compared with {BRAND}</caption>
        <thead><tr><th>Option</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td data-l="Option" style={{ fontWeight: 600 }}><a href="https://www.benefitscheckup.org">BenefitsCheckUp</a></td><td data-l="What it does" className="u-prose">From the National Council on Aging. A free online screening for nearly 2,000 programs across the country. It doesn&apos;t process applications; it lists each agency&apos;s contact and offers phone, chat and local centers.<S.Cite id="ncoa" /></td></tr>
          <tr><td data-l="Option" style={{ fontWeight: 600 }}><a href="https://insurance.wa.gov/about-shiba-services">SHIBA</a></td><td data-l="What it does" className="u-prose">Free, unbiased help with Medicare questions from the Washington Office of the Insurance Commissioner. Call 800-562-6900 and ask for your local office.<S.Cite id="shiba" /></td></tr>
          <tr><td data-l="Option" style={{ fontWeight: 600 }}><a href="https://www.dshs.wa.gov/ALTSA/resources">Area Agencies on Aging</a></td><td data-l="What it does" className="u-prose">Local offices that help older adults and their families find services and programs, through Washington&apos;s Community Living Connections.<S.Cite id="aaa" /></td></tr>
          <tr><td data-l="Option" style={{ fontWeight: 600 }}>{BRAND}</td><td data-l="What it does">We check about {COUNT_WORD} Washington programs from one set of answers, fill in each form, have a person check it, and remind you about letters and renewals. The full report is <Link href="/pricing">$149</Link>.</td></tr>
        </tbody>
      </table>

      <h2 style={H}>How to reach a person</h2>
      <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
        <li><b>Phone:</b> <PhoneLink4 /></li><li><b>Email:</b> <EmailLink4 /></li><li><b>Mail:</b> {ADDRESS || <Ph4>Washington business address</Ph4>}</li>
      </ul>

      <h2 style={H}>What we are, and what we aren&apos;t</h2>
      <p>We are a paperwork service. We are not a law firm, a government agency, a tax preparer or a financial adviser. The agency that runs each program makes the final decision. Our dollar figures are estimates.</p>
      <div style={{ marginTop: "var(--sp-6)" }}><S.Block /></div>
    </main>
  );
}
