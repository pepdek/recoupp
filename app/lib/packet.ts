import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { Program, Result } from "./engine";

type Member = { first_name: string; birth_year: number; veteran: boolean; disabled: boolean };
type Household = { answers: Record<string, unknown>; county: string | null; city: string | null; reviewed_at: string | null };

/** A packet is only for reviewer-approved, verified, likely-or-better programs. */
export const packetAllowed = (h: Pick<Household, "reviewed_at">, r: Pick<Result, "status" | "confidence">) =>
  !!h.reviewed_at && r.confidence === "verified" && (r.status === "eligible" || r.status === "likely");

// Standard PDF fonts only cover WinAnsi; anything else would throw.
const safe = (s: string) => s.replace(/[^\x20-\x7E -ÿ–—‘’“”•]/g, "?");
const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const usd = (v: unknown) => `$${n(v).toLocaleString("en-US")}`;

const YESNO: Record<string, string> = { yes: "Yes", no: "No", unsure: "Not sure" };

/** One-page-ish "answers sheet": our intake answers laid out for copying onto the agency's own form. We do not fill official forms (none verified yet). */
export async function buildAnswersSheet(p: Program, r: Result, h: Household, members: Member[]) {
  const a = h.answers;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 54;
  let page = pdf.addPage([W, H]), y = H - M;

  const wrap = (text: string, f: PDFFont, size: number, width: number) => {
    const lines: string[] = []; let cur = "";
    for (const w of safe(text).split(/\s+/)) {
      const next = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(next, size) > width && cur) { lines.push(cur); cur = w; } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const line = (text: string, o: { size?: number; bold?: boolean; indent?: number; gap?: number; color?: [number, number, number] } = {}) => {
    const size = o.size ?? 11, f = o.bold ? bold : font, indent = o.indent ?? 0;
    for (const l of wrap(text, f, size, W - 2 * M - indent)) {
      if (y < M + 30) { page = pdf.addPage([W, H]); y = H - M; }
      page.drawText(l, { x: M + indent, y, size, font: f, color: rgb(...(o.color ?? [0, 0, 0])) });
      y -= size + 4;
    }
    y -= o.gap ?? 0;
  };
  const row = (label: string, value: string) => {
    if (y < M + 30) { page = pdf.addPage([W, H]); y = H - M; }
    page.drawText(safe(label), { x: M, y, size: 11, font });
    page.drawText(safe(value), { x: M + 270, y, size: 11, font: bold });
    y -= 16;
  };

  line(`Answers sheet: ${p.name}`, { size: 17, bold: true, gap: 4 });
  line(`Prepared for: ${members.map((m) => m.first_name).join(", ")}   |   ${h.city ?? ""}, ${h.county ?? ""} County`, { gap: 2 });
  line("Copy these answers onto the application. Estimates only; not legal, tax, or financial advice. The agency makes the final decision.", { size: 9, color: [0.35, 0.35, 0.35], gap: 10 });

  line("Why we think you may qualify", { bold: true, size: 13 });
  line(r.reason, { gap: 10 });

  line("People in the household", { bold: true, size: 13 });
  for (const m of members) row(m.first_name, `born ${m.birth_year}${m.veteran ? ", veteran" : ""}${m.disabled ? ", has a disability" : ""}`);
  y -= 8;
  line("Housing", { bold: true, size: 13 });
  row("Rent or own", String(a.tenure ?? "") || "not answered"); row("Monthly rent or mortgage", usd(a.housing_cost)); row("Subsidized or senior housing", YESNO[String(a.subsidized)] ?? "not answered");
  y -= 8;
  line("Monthly income before taxes", { bold: true, size: 13 });
  row("Social Security", usd(a.inc_social_security)); row("SSI", usd(a.inc_ssi)); row("Pension or retirement", usd(a.inc_pension));
  row("Wages or self-employment", usd(a.inc_wages)); row("Other", usd(a.inc_other));
  y -= 8;
  line("Savings and assets (not counting your home or one car)", { bold: true, size: 13 });
  row("Bank accounts and cash", usd(a.asset_bank)); row("Stocks, bonds, other property", usd(a.asset_other));
  y -= 8;
  line("Monthly bills", { bold: true, size: 13 });
  row("Electricity", usd(a.exp_electric)); row("Heating", usd(a.exp_heat)); row("Water, sewer, garbage", usd(a.exp_water));
  row("Phone and internet", usd(a.exp_phone_internet)); row("Medical costs you pay", usd(a.exp_medical));
  y -= 8;
  line("Health coverage", { bold: true, size: 13 });
  row("Medicare", YESNO[String(a.medicare)] ?? "not answered"); row("Medicare drug coverage (Part D)", YESNO[String(a.part_d)] ?? "not answered"); row("Apple Health (Medicaid)", YESNO[String(a.medicaid)] ?? "not answered");
  y -= 10;

  line("Fill in by hand (we never collect these)", { bold: true, size: 13 });
  for (const label of ["Social Security number(s)", ...(p.id === "msp" || p.id === "extra_help" ? ["Medicare number"] : [])]) {
    line(`${label}: ______________________________`, { gap: 4 });
  }
  y -= 6;
  line("Documents to gather", { bold: true, size: 13 });
  for (const d of p.documents) line(`[  ] ${d}`, { indent: 6 });
  y -= 6;
  line("How to apply", { bold: true, size: 13 });
  line(p.application.channel);
  line(p.application.url, { color: [0, 0.2, 0.7], gap: 10 });
  line(`Rules checked against official sources; last verified ${p.last_verified}. ${p.source_urls[0]}`, { size: 8, color: [0.4, 0.4, 0.4] });
  return pdf.save();
}
