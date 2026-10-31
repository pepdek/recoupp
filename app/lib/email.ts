import { BRAND } from "./brand";

type Mail = { heading: string; paragraphs: string[]; cta?: { label: string; url: string }; footnote?: string };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
// Email clients drop web fonts, so Georgia stands in for Fraunces and Verdana for Atkinson here.
const INK = "#1E1B16", PAPER = "#F4ECD8", STAMP = "#B5381A";

/** One look for every email: cream paper, ink rules, one red button, plain-text twin. */
export function renderEmail(m: Mail): { html: string; text: string } {
  const p = m.paragraphs.map((t) => `<p style="margin:0 0 16px;font:20px/1.5 Verdana,sans-serif;color:${INK}">${esc(t)}</p>`).join("");
  const btn = m.cta ? `<p style="margin:24px 0"><a href="${esc(m.cta.url)}" style="display:inline-block;background:${STAMP};color:${PAPER};border:3px solid ${INK};padding:12px 24px;font:bold 20px Verdana,sans-serif;text-decoration:none">${esc(m.cta.label)}</a></p>` : "";
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:${PAPER}"><table role="presentation" width="100%" style="background:${PAPER}"><tr><td align="center" style="padding:24px 16px"><table role="presentation" width="100%" style="max-width:560px;border-top:3px solid ${INK}"><tr><td style="padding-top:16px"><p style="margin:0 0 24px;font:bold 28px Georgia,serif;color:${STAMP}">${esc(BRAND)}</p><h1 style="margin:0 0 20px;font:bold 34px/1.1 Georgia,serif;color:${INK}">${esc(m.heading)}</h1>${p}${btn}<hr style="border:0;border-top:3px dotted ${INK};margin:24px 0"><p style="margin:0;font:16px/1.5 Verdana,sans-serif;color:#4a4337">${esc(m.footnote ?? `${BRAND} helps with paperwork. We're not a law firm, tax preparer or financial adviser. Each agency makes the final decision.`)}</p></td></tr></table></td></tr></table></body></html>`;
  const text = [m.heading, "", ...m.paragraphs.flatMap((t) => [t, ""]), ...(m.cta ? [`${m.cta.label}: ${m.cta.url}`, ""] : []), "--", m.footnote ?? `${BRAND} helps with paperwork. We're not a law firm, tax preparer or financial adviser. Each agency makes the final decision.`].join("\n");
  return { html, text };
}

export const magicLinkEmail = (url: string) => renderEmail({ heading: "Here's your sign-in link.", paragraphs: ["Tap the button to sign in. No password needed.", "The link works once and runs out in an hour. If you didn't ask for it, ignore this email."], cta: { label: "Sign in", url } });

export const receiptEmail = (amount: string, site: string) => renderEmail({ heading: `Got your ${amount}. Thank you.`, paragraphs: ["Stripe sends the official receipt separately.", "Next step: answer the questions about your household. It takes about 15 minutes, and you can stop and come back."], cta: { label: "Start the questions", url: `${site}/intake` }, footnote: "If we find under $1,000 a year in likely benefits, you get your $149 back." });

// ponytail: not wired to a scheduler yet; the report is downloadable from the dashboard. Wire when a monthly job exists.
export const sponsorReportEmail = (org: string, verified: string, enrolled: number, site: string, slug: string) => renderEmail({ heading: `${org}: ${verified} verified so far.`, paragraphs: [`${enrolled} households have enrolled. The dollar figure counts only approval letters and confirmed receipts we checked. Estimates are left out.`, "Your full report is a PDF and a CSV on the dashboard."], cta: { label: "Open the dashboard", url: `${site}/sponsor/${slug}` } });
