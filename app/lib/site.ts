import { programs } from "./programs";

// Every figure the marketing pages show is read from the program data, so the page can't drift from the rules.
const byId = (id: string) => programs.find((p) => p.id === id)!;
export const PART_B_MONTHLY = byId("msp").constants.part_b_premium_monthly;       // 202.90, CMS fact sheet Nov 14 2025
export const PART_B_YEARLY = Math.round(PART_B_MONTHLY * 12);                       // 2,435 (2,434.80 rounded)
export const LIFELINE_MONTHLY = byId("lifeline").constants.monthly_benefit;         // 9.25
export const LIFELINE_YEARLY = Math.round(LIFELINE_MONTHLY * 12);                   // 111
export const TPU_DISCOUNT = Math.round(byId("tpu_assistance").constants.discount * 100);
export const SEATTLE_CITY_LIGHT = Math.round(byId("seattle_udp").constants.city_light_discount * 100);
export const SEATTLE_SPU = Math.round(byId("seattle_udp").constants.spu_discount * 100);
export const EXTRA_HELP_SINGLE_LIMIT = byId("extra_help").tables.income_limit_2026["1"]; // 23,940 a year
export const COUNT_PROGRAMS = programs.length;
export const COUNT_VERIFIED = programs.filter((p) => p.confidence === "verified").length;
export const WORD_COUNT: Record<number, string> = { 20: "twenty" };
export const COUNT_WORD = WORD_COUNT[COUNT_PROGRAMS] ?? String(COUNT_PROGRAMS);
export const LAST_CHECKED = programs.filter((p) => p.confidence === "verified").map((p) => p.last_verified).sort().at(-1)!;
export const prettyDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
export const src = (id: string, i = 0) => byId(id).source_urls[i];

export const CITE = {
  jama: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12495494/",
  cms: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
  shiba: "https://insurance.wa.gov/about-shiba-services",
  bcu: "https://www.ncoa.org/article/ncoas-newly-redesigned-benefitscheckup-makes-it-easier-for-older-adults-to-worry-less-age-better",
  aaa: "https://www.dshs.wa.gov/ALTSA/resources",
};
export const CHECKED = "October 31, 2026"; // date I read the non-program sources (docs/CONTENT_PLAN_V3.md section 5)
