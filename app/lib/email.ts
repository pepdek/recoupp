import { BRAND } from "./brand";

type Mail = { heading: string; paragraphs: string[]; cta?: { label: string; url: string }; footnote?: string };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
// Email clients drop web fonts, so Georgia stands in for Fraunces and Verdana for Atkinson here.
const INK = "#1B1714", INK2 = "#4A3F38", BASE = "#FFF3E6";
const FOOT = `${BRAND} helps with paperwork. We're not a law firm, tax preparer or financial adviser. Each agency makes the final decision.`;

/** One look for every email: a peach-to-apricot band, a solid white card, a coral pill button, a plain-text twin. */
export function renderEmail(m: Mail): { html: string; text: string } {
  const p = m.paragraphs.map((t) => `<p style="margin:0 0 16px;font:20px/1.5 Verdana,sans-serif;color:${INK}">${esc(t)}</p>`).join("");
  const btn = m.cta ? `<p style="margin:24px 0 8px"><a href="${esc(m.cta.url)}" style="display:inline-block;background:#FF8A5B;background-image:linear-gradient(135deg,#FF8A5B,#FFB04A);color:${INK};border-radius:999px;padding:14px 28px;font:bold 20px Verdana,sans-serif;text-decoration:none">${esc(m.cta.label)}</a></p>` : "";
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:${BASE}"><table role="presentation" width="100%" style="background:${BASE}"><tr><td align="center" style="padding:16px"><table role="presentation" width="100%" style="max-width:560px"><tr><td style="background:#FFD3B0;background-image:linear-gradient(135deg,#FFD3B0,#FFB27A 70%,#F4B93E);border-radius:28px 28px 0 0;padding:28px 28px 20px"><p style="margin:0;font:28px Georgia,serif;letter-spacing:-1px;color:${INK}">${esc(BRAND)}</p></td></tr><tr><td style="background:#FFFFFF;border-radius:0 0 28px 28px;padding:28px"><h1 style="margin:0 0 20px;font:normal 36px/1.1 Georgia,serif;color:${INK}">${esc(m.heading)}</h1>${p}${btn}<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E6D8C8;font:16px/1.5 Verdana,sans-serif;color:${INK2}">${esc(m.footnote ?? FOOT)}</p></td></tr></table></td></tr></table></body></html>`;
  const text = [m.heading, "", ...m.paragraphs.flatMap((t) => [t, ""]), ...(m.cta ? [`${m.cta.label}: ${m.cta.url}`, ""] : []), "--", m.footnote ?? FOOT].join("\n");
  return { html, text };
}

export const magicLinkEmail = (url: string) => renderEmail({ heading: "Here's your sign-in link.", paragraphs: ["Tap the button to sign in. No password needed.", "The link works once and runs out in an hour. If you didn't ask for it, ignore this email."], cta: { label: "Sign in", url } });

export const receiptEmail = (amount: string, site: string) => renderEmail({ heading: `Got your ${amount}. Thank you.`, paragraphs: ["Stripe sends the official receipt separately.", "Next step: answer the questions about your household. It takes about 15 minutes, and you can stop and come back."], cta: { label: "Start the questions", url: `${site}/intake` }, footnote: "If we find under $1,000 a year in likely benefits, you get your $149 back." });

// ponytail: not wired to a scheduler yet; the report is downloadable from the dashboard. Wire when a monthly job exists.
export const sponsorReportEmail = (org: string, verified: string, enrolled: number, site: string, slug: string) => renderEmail({ heading: `${org}: ${verified} verified so far.`, paragraphs: [`${enrolled} households have enrolled. The dollar figure counts only approval letters and confirmed receipts we checked. Estimates are left out.`, "Your full report is a PDF and a CSV on the dashboard."], cta: { label: "Open the dashboard", url: `${site}/sponsor/${slug}` } });
