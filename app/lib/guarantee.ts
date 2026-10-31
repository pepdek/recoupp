export const GUARANTEE_MULTIPLE = 5;

export type GuaranteeInput = { verified_total: number; completed: number; fee_cents: number; fees_paid_cents: number; households_with_verified: number };

/**
 * Recovered-Income Guarantee test.
 * Enrolled household = completed the questionnaire via the sponsor link. Verified gain = latest approved
 * (determination letter) or received (confirmed receipt) ledger value per claim, with evidence and a staff verifier.
 * Average is over ALL enrolled households (zeros included), the sponsor-favourable reading.
 * Credit/refund is capped at fees actually paid, since a refund above what was paid makes no sense; confirm with counsel.
 */
export function guaranteeTest(g: GuaranteeInput) {
  const target = (GUARANTEE_MULTIPLE * g.fee_cents) / 100;
  const average = g.completed > 0 ? g.verified_total / g.completed : 0;
  const shortfallPer = Math.max(0, target - average);
  const exposure = Math.min(g.fees_paid_cents / 100, shortfallPer * g.completed);
  return {
    target, average, met: g.completed > 0 && average >= target, shortfallPer, exposure,
    coverage: g.completed > 0 ? g.households_with_verified / g.completed : 0, // share of enrolled households with any verified outcome yet
  };
}
