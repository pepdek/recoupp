import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { evaluateAll } from "../lib/engine";
import { buildFacts } from "../lib/facts";
import { buildAnswersSheet, packetAllowed } from "../lib/packet";
import { programs } from "../lib/programs";

const members = [{ first_name: "Ruth 李", birth_year: 1950, veteran: false, disabled: false }];
const answers = { inc_social_security: 1400, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0, asset_bank: 500, asset_other: 0, tenure: "rent", housing_cost: 900, medicare: "yes", medicaid: "no", existing_benefits: [] };
const h = { answers, county: "Pierce", city: "Tacoma", reviewed_at: "2026-10-30T00:00:00Z" };
const results = evaluateAll(programs, buildFacts(h, members, 2026));
const get = (id: string) => results.find((r) => r.program_id === id)!;

describe("answers sheet", () => {
  it("builds a valid multi-section PDF and tolerates non-Latin names", async () => {
    const bytes = await buildAnswersSheet(programs.find((p) => p.id === "msp")!, get("msp"), h, members);
    expect(Buffer.from(bytes.slice(0, 4)).toString()).toBe("%PDF");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(1);
  });
  it("is only allowed after review, for verified eligible/likely programs", () => {
    expect(packetAllowed(h, get("msp"))).toBe(true);
    expect(packetAllowed({ reviewed_at: null }, get("msp"))).toBe(false);
    expect(packetAllowed(h, get("apple_health"))).toBe(false); // needs_review program
    expect(packetAllowed(h, get("basic_food"))).toBe(false);   // needs_human_review result
  });
});
