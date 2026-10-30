// Usage: npx tsx scripts/plan.ts '{"ss":1400,"tenure":"own","members":[1950]}'   (prints the claim plan for a synthetic household)
import { claimPlan, evaluateAll } from "../lib/engine";
import { buildFacts } from "../lib/facts";
import { programs } from "../lib/programs";

const i = JSON.parse(process.argv[2] ?? "{}");
const facts = buildFacts(
  { answers: { inc_social_security: i.ss ?? 0, inc_ssi: i.ssi ?? 0, inc_pension: i.pension ?? 0, inc_wages: i.wages ?? 0, inc_other: 0, asset_bank: i.assets ?? 0, asset_other: 0,
    tenure: i.tenure ?? "rent", medicare: i.medicare ?? "yes", medicaid: i.medicaid ?? "no", existing_benefits: i.have ?? [] } },
  (i.members ?? [1950]).map((b: number) => ({ birth_year: b, veteran: false, disabled: !!i.disabled })),
);
const plan = claimPlan(evaluateAll(programs, facts));
const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
for (const it of plan.items) console.log(`${it.status.padEnd(18)} ${it.name}${it.value ? `  ${it.value.low === it.value.high ? $(it.value.low) : `${$(it.value.low)}–${$(it.value.high)}`}/yr (likely ${$(it.value.likely)})` : "  (value not verified)"}\n   ${it.reason}${it.note ? `\n   ${it.note}` : ""}`);
console.log(`\nTotal (eligible/likely) ${$(plan.total.low)}–${$(plan.total.high)}/yr${plan.total_provisional ? " (provisional)" : ""}; pending review up to ${$(plan.pending_review_total.high)}`);
for (const r of plan.not_recommended) console.log(`not recommended: ${r.name} — ${r.reason}`);
