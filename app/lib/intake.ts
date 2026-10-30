import { z } from "zod";

export const CONSENT_VERSION = "2026-10-v1";

export const COUNTIES = ["Adams","Asotin","Benton","Chelan","Clallam","Clark","Columbia","Cowlitz","Douglas","Ferry","Franklin","Garfield","Grant","Grays Harbor","Island","Jefferson","King","Kitsap","Kittitas","Klickitat","Lewis","Lincoln","Mason","Okanogan","Pacific","Pend Oreille","Pierce","San Juan","Skagit","Skamania","Snohomish","Spokane","Stevens","Thurston","Wahkiakum","Walla Walla","Whatcom","Whitman","Yakima"];

export const BENEFITS = [
  ["basic_food", "Basic Food (SNAP / food stamps)"], ["apple_health", "Apple Health (Medicaid)"],
  ["msp", "Medicare Savings Program"], ["extra_help", "Extra Help with Part D drug costs"],
  ["liheap", "Energy assistance (LIHEAP)"], ["utility_discount", "Utility bill discount"],
  ["property_tax", "Senior property tax exemption"], ["orca", "Reduced-fare transit (ORCA LIFT / senior pass)"],
  ["lifeline", "Lifeline phone or internet discount"], ["va", "VA pension or benefits"],
  ["housing", "Housing assistance or subsidized housing"],
] as const;

type Field =
  | { name: string; label: string; kind: "number"; hint?: string }
  | { name: string; label: string; kind: "text" }
  | { name: string; label: string; kind: "select"; options: readonly (readonly [string, string])[] }
  | { name: string; label: string; kind: "checkboxes"; options: readonly (readonly [string, string])[] };

export type Step = { id: string; title: string; help?: string; fields: Field[] };

const yn = [["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]] as const;
const money = (name: string, label: string, hint?: string): Field => ({ name, label, kind: "number", hint });

// "members" is a special screen (repeating rows) handled in its own page section.
export const STEPS: Step[] = [
  { id: "members", title: "Who lives in the household?", fields: [] },
  { id: "location", title: "Where do you live?", fields: [
    { name: "county", label: "County", kind: "select", options: COUNTIES.map((c) => [c, c] as const) },
    { name: "city", label: "City", kind: "text" },
  ] },
  { id: "housing", title: "Your housing", fields: [
    { name: "tenure", label: "Do you rent or own?", kind: "select", options: [["rent", "Rent"], ["own", "Own"], ["other", "Other (family, assisted living, etc.)"]] },
    money("housing_cost", "Monthly rent or mortgage ($)", "Enter 0 if none."),
    { name: "subsidized", label: "Is it subsidized or senior housing?", kind: "select", options: yn },
  ] },
  { id: "income", title: "Monthly income, before taxes", help: "Add up everyone in the household. Enter 0 for anything that doesn't apply.", fields: [
    money("inc_social_security", "Social Security ($)"), money("inc_ssi", "SSI ($)"), money("inc_pension", "Pension or retirement accounts ($)"),
    money("inc_wages", "Wages or self-employment ($)"), money("inc_other", "Other income ($)"),
  ] },
  { id: "assets", title: "Savings and assets", help: "Don't include your home or one car.", fields: [
    money("asset_bank", "Bank accounts and cash ($)"), money("asset_other", "Stocks, bonds, other property ($)"),
  ] },
  { id: "expenses", title: "Monthly bills", fields: [
    money("exp_electric", "Electricity ($)"), money("exp_heat", "Heating, if separate ($)"), money("exp_water", "Water, sewer, garbage ($)"),
    money("exp_phone_internet", "Phone and internet ($)"), money("exp_medical", "Medical costs you pay yourself ($)"),
  ] },
  { id: "coverage", title: "Health coverage", fields: [
    { name: "medicare", label: "Does anyone have Medicare?", kind: "select", options: yn },
    { name: "part_d", label: "Do they have Medicare drug coverage (Part D)?", kind: "select", options: yn },
    { name: "medicaid", label: "Does anyone have Apple Health (Medicaid)?", kind: "select", options: yn },
  ] },
  { id: "benefits", title: "Help you already get", help: "Check everything you currently receive.", fields: [
    { name: "existing_benefits", label: "Current benefits", kind: "checkboxes", options: BENEFITS },
  ] },
];

export const nextStep = (id: string) => STEPS[STEPS.findIndex((s) => s.id === id) + 1]?.id ?? "review";

export function schemaFor(step: Step) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of step.fields) {
    if (f.kind === "number") shape[f.name] = z.string().trim().min(1).transform(Number).pipe(z.number().min(0).max(10_000_000));
    else if (f.kind === "text") shape[f.name] = z.string().trim().max(100);
    else if (f.kind === "select") shape[f.name] = z.enum(f.options.map((o) => o[0]) as [string, ...string[]]);
    else shape[f.name] = z.array(z.enum(f.options.map((o) => o[0]) as [string, ...string[]]));
  }
  return z.object(shape);
}

export function parseStep(step: Step, fd: FormData) {
  const raw: Record<string, unknown> = {};
  for (const f of step.fields) raw[f.name] = f.kind === "checkboxes" ? fd.getAll(f.name) : fd.get(f.name) ?? "";
  return schemaFor(step).safeParse(raw);
}
