import { PDFDocument, StandardFonts } from "pdf-lib";
import { guaranteeTest } from "./guarantee";
import { programs } from "./programs";

export type Stats = {
  org: { id: string; name: string; slug: string; fee_cents: number; min_households: number };
  visits: number; started: number; completed: number; submitted: number; approved: number;
  estimated_total: number; verified_total: number; households_with_verified: number;
  new_started_30d: number; verified_added_30d: number; fees_paid_cents: number;
  by_program: { program_id: string; claims: number; verified_claims: number; verified_value: number }[];
};

/** Small cells could identify a household; hide them in program-level tables. */
export const MIN_CELL = 5;
export const suppress = (n: number) => (n < MIN_CELL ? null : n);

const name = (id: string) => programs.find((p) => p.id === id)?.name ?? id;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function reportRows(s: Stats, asof: string): [string, string][] {
  const g = guaranteeTest({ ...s, fee_cents: s.org.fee_cents });
  const rows: [string, string][] = [
    ["Sponsor", s.org.name], ["Snapshot date", asof],
    ["Opened the enrollment link", String(s.visits)], ["Started questionnaire", String(s.started)], ["Completed questionnaire", String(s.completed)],
    ["Households with a submitted claim", String(s.submitted)], ["Households with an approved claim", String(s.approved)],
    ["New households, last 30 days", String(s.new_started_30d)],
    ["Estimated yearly value (not verified)", usd(s.estimated_total)], ["Verified yearly value", usd(s.verified_total)],
    ["Verified value added, last 30 days", usd(s.verified_added_30d)],
    ["Households with a verified outcome", String(s.households_with_verified)],
    ["Guarantee target per household (5x fee)", usd(g.target)], ["Average verified gain per enrolled household", usd(g.average)],
    ["Guarantee status", s.completed === 0 ? "No enrolled households yet" : g.met ? "On or above target" : "Below target"],
    ["Share of households with a verified outcome so far", `${Math.round(g.coverage * 100)}%`],
  ];
  for (const p of s.by_program) {
    const c = suppress(p.claims);
    rows.push([`Program: ${name(p.program_id)}`, c === null ? `fewer than ${MIN_CELL} households (hidden)` : `${c} claims, ${p.verified_claims} verified, ${usd(p.verified_value)} verified`]);
  }
  return rows;
}

const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
export const reportCsv = (s: Stats, asof: string) => ["metric,value", ...reportRows(s, asof).map(([a, b]) => `${q(a)},${q(b)}`)].join("\n") + "\n";

export async function reportPdf(s: Stats, asof: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]), y = 740;
  const ascii = (t: string) => t.replace(/[^\x20-\x7E]/g, "?");
  page.drawText("Monthly outcomes report", { x: 54, y, size: 18, font: bold }); y -= 30;
  for (const [k, v] of reportRows(s, asof)) {
    if (y < 70) { page = pdf.addPage([612, 792]); y = 740; }
    page.drawText(ascii(k), { x: 54, y, size: 10, font }); page.drawText(ascii(v).slice(0, 70), { x: 330, y, size: 10, font: bold }); y -= 16;
  }
  page.drawText("Estimates are not verified outcomes. Verified = approval letter or confirmed receipt reviewed by staff. Not legal, tax, or financial advice.", { x: 54, y: 40, size: 7, font });
  return pdf.save();
}
