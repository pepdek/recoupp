import type { Facts } from "./engine";
import { BENEFITS } from "./intake";

type Member = { birth_year: number; veteran: boolean; disabled: boolean };
type Household = { answers: Record<string, unknown> };

const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/** Household row + members -> flat facts the program rules read. Ages are bracketed because only birth year is known. */
export function buildFacts(h: Household, members: Member[], year = new Date().getFullYear()): Facts {
  const a = h.answers, f: Facts = {};
  const max = members.map((m) => year - m.birth_year), min = max.map((x) => x - 1); // before / after this year's birthday
  const atLeast = (age: number) => ({
    certain: min.some((x) => x >= age),
    possible: max.some((x, i) => x >= age && min[i] < age),
  });
  const s60 = atLeast(60), s61 = atLeast(61);
  const wages = n(a.inc_wages), unearned = n(a.inc_social_security) + n(a.inc_ssi) + n(a.inc_pension) + n(a.inc_other);

  Object.assign(f, {
    year, hh_size: members.length,
    unit_size: Math.min(members.length, 2), unit_ambiguous: members.length > 2,
    any_60plus_certain: s60.certain, any_60plus_possible: !s60.certain && s60.possible,
    any_61plus_certain: s61.certain, any_61plus_possible: !s61.certain && s61.possible,
    any_disabled: members.some((m) => m.disabled), any_veteran: members.some((m) => m.veteran),
    wages_monthly: wages, income_unearned_monthly: unearned, income_monthly: wages + unearned, income_annual: (wages + unearned) * 12,
    has_ssi: n(a.inc_ssi) > 0,
    assets: n(a.asset_bank) + n(a.asset_other),
    tenure: String(a.tenure ?? ""), medicare: String(a.medicare ?? "unsure"), medicaid: String(a.medicaid ?? "unsure"),
  });
  const have = new Set((a.existing_benefits as string[] | undefined) ?? []);
  for (const [k] of BENEFITS) f[`has_${k}`] = have.has(k);
  // program ids differ from intake keys for a few benefits
  f.has_msp = have.has("msp"); f.has_extra_help = have.has("extra_help"); f.has_apple_health = have.has("apple_health");
  f.has_property_tax = have.has("property_tax"); f.has_basic_food = have.has("basic_food");
  return f;
}
