import { programs } from "./programs";
import { PART_B_MONTHLY } from "./site";

// Plain-language program copy. Every number is computed from the program data, so it can't drift from the rules.
// Only verified programs get a page or a match; reviewer-only programs never appear here.
const P = (id: string) => programs.find((p) => p.id === id)!;
const fpl = (n: number) => P("lifeline").tables.fpl_2026[String(n)];
const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const monthly = (n: number, x: number) => $((fpl(n) * x) / 12);
const annual = (n: number, x: number) => $(fpl(n) * x);

export type Copy = { id: string; slug: string; title: string; pays: string; who: string[]; extra?: string };
export const COPY: Copy[] = [
  { id: "msp", slug: "medicare-savings-program", title: "Medicare Savings Program",
    pays: `Pays your Medicare Part B premium: $${PART_B_MONTHLY.toFixed(2)} a month in 2026.`,
    who: ["You have Medicare Part A (hospital insurance).",
      `Your monthly income is at or below ${monthly(1, 1.1)} for one person or ${monthly(2, 1.1)} for a couple (QMB, 110% of the 2026 federal poverty level).`,
      `Slightly higher incomes can still qualify: up to ${monthly(1, 1.2)} for one person (SLMB, 120%) or ${monthly(1, 1.38)} (QI, 138%). Couples: ${monthly(2, 1.2)} and ${monthly(2, 1.38)}.`,
      "Washington's rule (WAC 182-517-0100) does not count savings for these levels."],
    extra: "If you get a Medicare Savings Program, you are also enrolled in Extra Help automatically." },
  { id: "extra_help", slug: "extra-help", title: "Extra Help with Medicare drug costs",
    pays: "Helps with the cost of your Medicare drug coverage.",
    who: [`Income at or below $${P("extra_help").tables.income_limit_2026["1"].toLocaleString("en-US")} a year for one person, or $${P("extra_help").tables.income_limit_2026["2"].toLocaleString("en-US")} for a couple (2026).`,
      `Savings at or below $${P("extra_help").tables.resource_limit_2026["1"].toLocaleString("en-US")} for one person, or $${P("extra_help").tables.resource_limit_2026["2"].toLocaleString("en-US")} for a couple (2026).`,
      "People who get a Medicare Savings Program are enrolled automatically."] },
  { id: "basic_food", slug: "basic-food", title: "Basic Food (SNAP)",
    pays: "Money on an EBT card to buy groceries. The monthly amount depends on household size and income.",
    who: ["Washington looks at household size and income.", "If someone in the household is 60 or older, only the net-income limit applies (WAC 388-478-0060).", "We don't list dollar limits here until we've read this year's October update."] },
  { id: "lifeline", slug: "lifeline", title: "Lifeline phone or internet discount",
    pays: `Takes $${P("lifeline").constants.monthly_benefit.toFixed(2)} off a monthly phone or internet bill.`,
    who: [`Income at or below 135% of the 2026 federal poverty level: ${annual(1, 1.35)} a year for one person, ${annual(2, 1.35)} for two.`, "Other ways to qualify are listed on the official Lifeline page."] },
  { id: "liheap", slug: "energy-help", title: "Energy help (LIHEAP)",
    pays: "Pays part of a heating bill. The amount depends on your household, your heating cost and available funds.",
    who: [`Income at or below 150% of the 2026 federal poverty level: ${monthly(1, 1.5)} a month for one person, ${monthly(2, 1.5)} for two.`, "You apply through your local provider, not the state."] },
  { id: "tpu_assistance", slug: "tacoma-public-utilities", title: "Tacoma Public Utilities discount",
    pays: `Takes ${Math.round(P("tpu_assistance").constants.discount * 100)}% off electric, water, sewer, garbage and stormwater. A bill credit program may be worth more.`,
    who: ["You are a Tacoma Public Utilities customer in Pierce County.", `Someone in the household is 62 or older and monthly income is at or below ${$(P("tpu_assistance").tables.discount_limit_monthly["1"])} for one person (${$(P("tpu_assistance").tables.discount_limit_monthly["2"])} for two).`] },
  { id: "seattle_udp", slug: "seattle-utility-discount", title: "Seattle Utility Discount Program",
    pays: `Takes ${Math.round(P("seattle_udp").constants.city_light_discount * 100)}% off Seattle City Light and ${Math.round(P("seattle_udp").constants.spu_discount * 100)}% off Seattle Public Utilities bills.`,
    who: ["You are a Seattle City Light or Seattle Public Utilities customer.", `Monthly income is at or below ${$(P("seattle_udp").tables.limit_monthly["1"])} for one person (${$(P("seattle_udp").tables.limit_monthly["2"])} for two).`] },
  { id: "orca_lift", slug: "orca-lift", title: "ORCA LIFT reduced transit fare",
    pays: "Cuts King County transit fares to $1.",
    who: [`Income at or below 200% of the 2026 federal poverty level: ${monthly(1, 2)} a month for one person, ${monthly(2, 2)} for two.`, "You can also qualify through certain other benefits. See the official page."] },
];
export const bySlug = (slug: string) => COPY.find((c) => c.slug === slug);
export const byId = (id: string) => COPY.find((c) => c.id === id);
export const programData = P;
