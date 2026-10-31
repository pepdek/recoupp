// Day-90 kill criteria from the research: <30% of recommended claims completed; verified gain < 5x fee; gross margin < 60%.
export type KillMetrics = {
  claims_total: number; claims_completed: number; revenue_cents: number; reviewer_seconds: number; reviewed_households: number;
  extract_input_tokens: number; extract_output_tokens: number;
  orgs: { name: string; fee_cents: number; completed: number; verified_total: number }[];
  b2c: { completed: number; verified_total: number };
};
export type Rates = { reviewerHourlyUsd: number; inputPerMtokUsd: number; outputPerMtokUsd: number };

// ponytail: reviewer wage and API prices are assumptions; override with REVIEWER_HOURLY_USD / API_*_PER_MTOK_USD.
export const ratesFromEnv = (e: Record<string, string | undefined> = process.env): Rates => ({
  reviewerHourlyUsd: Number(e.REVIEWER_HOURLY_USD ?? 40), inputPerMtokUsd: Number(e.API_INPUT_PER_MTOK_USD ?? 2), outputPerMtokUsd: Number(e.API_OUTPUT_PER_MTOK_USD ?? 10),
});

export type Light = "red" | "green" | "nodata";
export function killReport(m: KillMetrics, r: Rates) {
  const completion = m.claims_total > 0 ? m.claims_completed / m.claims_total : null;
  const feeBase = m.orgs.reduce((a, o) => a + (o.completed * o.fee_cents) / 100, 0);
  const verified = m.orgs.reduce((a, o) => a + o.verified_total, 0);
  const multiple = feeBase > 0 ? verified / feeBase : null;
  const revenue = m.revenue_cents / 100;
  const reviewerCost = (m.reviewer_seconds / 3600) * r.reviewerHourlyUsd;
  const apiCost = (m.extract_input_tokens / 1e6) * r.inputPerMtokUsd + (m.extract_output_tokens / 1e6) * r.outputPerMtokUsd;
  const margin = revenue > 0 ? (revenue - reviewerCost - apiCost) / revenue : null;
  const light = (v: number | null, min: number): Light => (v === null ? "nodata" : v < min ? "red" : "green");
  return {
    completion: { value: completion, light: light(completion, 0.3), n: m.claims_total },
    multiple: { value: multiple, light: light(multiple, 5), verified, feeBase },
    margin: { value: margin, light: light(margin, 0.6), revenue, reviewerCost, apiCost, minutesPerHousehold: m.reviewed_households ? m.reviewer_seconds / 60 / m.reviewed_households : null },
    b2c: { completed: m.b2c.completed, avgVerified: m.b2c.completed ? m.b2c.verified_total / m.b2c.completed : null },
  };
}
