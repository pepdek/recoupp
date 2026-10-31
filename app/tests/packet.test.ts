import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildAnswersSheet, packetAllowed } from "../lib/packet";
import { programs } from "../lib/programs";

const members = [{ first_name: "Ruth 李", birth_year: 1950, veteran: false, disabled: false }];
const answers = { inc_social_security: 1400, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0, asset_bank: 500, asset_other: 0, tenure: "rent", housing_cost: 900, medicare: "yes", medicaid: "no", existing_benefits: [] };
const h = { answers, county: "Pierce", city: "Tacoma", reviewed_at: "2026-10-30T00:00:00Z" };
const ev = (o: Partial<{ review_state: "pending" | "approved" | "rejected" | "escalated"; status: "eligible" | "likely" | "unlikely" | "needs_human_review" | "already_receiving"; override_status: "eligible" | "likely" | "unlikely" | null }>) =>
  ({ review_state: "approved" as const, status: "eligible" as const, override_status: null, ...o });

describe("answers sheet", () => {
  it("builds a valid multi-section PDF and tolerates non-Latin names", async () => {
    const bytes = await buildAnswersSheet(programs.find((p) => p.id === "msp")!, "Income is under the limit.", h, members);
    expect(Buffer.from(bytes.slice(0, 4)).toString()).toBe("%PDF");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(1);
  });
  it("is only allowed for approved, released, eligible/likely recommendations", () => {
    expect(packetAllowed(h, ev({}))).toBe(true);
    expect(packetAllowed(h, ev({ status: "likely" }))).toBe(true);
    expect(packetAllowed({ reviewed_at: null }, ev({}))).toBe(false);          // household review not finished
    expect(packetAllowed(h, ev({ review_state: "pending" }))).toBe(false);
    expect(packetAllowed(h, ev({ review_state: "escalated" }))).toBe(false);
    expect(packetAllowed(h, ev({ status: "needs_human_review" }))).toBe(false); // reviewer never decided the outcome
    expect(packetAllowed(h, ev({ status: "needs_human_review", override_status: "likely" }))).toBe(true);
    expect(packetAllowed(h, ev({ override_status: "unlikely" }))).toBe(false);
  });
});
