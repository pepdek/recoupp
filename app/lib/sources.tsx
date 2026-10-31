import { useId } from "react";
import SourcesBlock from "@/components/SourcesBlock";
import { CHECKED } from "@/lib/site";

// Numbered sources, APA 7 format, shown in an accordion near the footer. In text, a citation is just a number that links to its entry.
// Numbers follow order of first appearance on each page: a page lists its source ids in that order and cites them with <Cite id=.../>.
// Page titles are copied from the pages themselves (read Oct 30-31, 2026). Two pages (Lifeline, SSA Extra Help) wouldn't load for our reader, so they use a bracketed description, as APA allows.
type Part = string | { i: string };
export type Source = { parts: Part[]; url: string; retrieved?: string; note?: string };
const R = "Retrieved October 30, 2026";

export const SOURCES: Record<string, Source> = {
  jama: { parts: ["Kotb, S., Su, A., & Sinaiko, A. D. (2025). Medicare Savings Program take-up estimates and profile of enrolled and unenrolled individuals. ", { i: "JAMA Network Open, 8" }, "(10), Article e2535408."], url: "https://doi.org/10.1001/jamanetworkopen.2025.35408", note: "National study of 2018 to 2020 data. 56.7% of eligible beneficiary-years were enrolled (95% confidence interval, 54.5% to 59.0%), so between 41% and 45% were not. Not specific to Washington." },
  cms: { parts: ["Centers for Medicare & Medicaid Services. (2025, November 14). ", { i: "2026 Medicare Parts A & B premiums and deductibles" }, " [Fact sheet]."], url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles", retrieved: "Retrieved October 31, 2026", note: "Standard Part B premium: $202.90 a month in 2026, up from $185.00 in 2025. \"About $2,435 a year\" is $202.90 × 12, rounded." },
  wac_msp: { parts: ["Wash. Admin. Code § 182-517-0100."], url: "https://app.leg.wa.gov/WAC/default.aspx?cite=182-517-0100", retrieved: R },
  fpl: { parts: ["U.S. Department of Health and Human Services, Office of the Assistant Secretary for Planning and Evaluation. (n.d.). ", { i: "Poverty guidelines" }, "."], url: "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines", retrieved: R },
  dshs_bf: { parts: ["Washington State Department of Social and Health Services. (n.d.). ", { i: "Basic Food benefits" }, "."], url: "https://www.dshs.wa.gov/esa/community-services-offices/basic-food", retrieved: R },
  wac_bf: { parts: ["Wash. Admin. Code § 388-478-0060."], url: "https://app.leg.wa.gov/WAC/default.aspx?cite=388-478-0060", retrieved: R },
  medicare_xh: { parts: ["Medicare.gov. (n.d.). ", { i: "Help with drug costs" }, "."], url: "https://www.medicare.gov/basics/costs/help/drug-costs", retrieved: R },
  ssa_xh: { parts: ["Social Security Administration. (n.d.). [Extra Help with Medicare prescription drug plan costs page]."], url: "https://www.ssa.gov/medicare/part-d-extra-help", retrieved: R },
  lifeline: { parts: ["Universal Service Administrative Company. (n.d.). [Lifeline eligibility page]."], url: "https://www.lifelinesupport.org/how-to-qualify/", retrieved: R },
  liheap: { parts: ["Washington State Department of Commerce. (n.d.). ", { i: "Low-Income Home Energy Assistance Program (LIHEAP)" }, "."], url: "https://www.commerce.wa.gov/liheap", retrieved: R },
  tpu: { parts: ["Tacoma Public Utilities. (n.d.). ", { i: "Payment assistance" }, "."], url: "https://www.mytpu.org/?p=1005", retrieved: R },
  seattle: { parts: ["Seattle City Light. (n.d.). ", { i: "Bill assistance programs" }, "."], url: "https://www.seattle.gov/city-light/residential-services/billing-information/payment-assistance-programs", retrieved: R },
  orca: { parts: ["King County Metro. (n.d.). ", { i: "ORCA LIFT" }, "."], url: "https://kingcounty.gov/en/dept/metro/fares-and-payment/reduced-fares/orca-lift", retrieved: R },
  ncoa: { parts: ["National Council on Aging. (2022, June 27). ", { i: "NCOA's newly redesigned BenefitsCheckUp makes it easier for older adults to worry less, age better" }, "."], url: "https://www.ncoa.org/article/ncoas-newly-redesigned-benefitscheckup-makes-it-easier-for-older-adults-to-worry-less-age-better", retrieved: "Retrieved October 31, 2026", note: "The \"nearly 2,000 programs\" figure is from this 2022 announcement." },
  shiba: { parts: ["Washington State Office of the Insurance Commissioner. (n.d.). ", { i: "Statewide Health Insurance Benefits Advisors (SHIBA)" }, "."], url: "https://insurance.wa.gov/about-shiba-services", retrieved: "Retrieved October 31, 2026" },
  aaa: { parts: ["Washington State Department of Social and Health Services. (n.d.). ", { i: "Find local services, information, and resources" }, "."], url: "https://www.dshs.wa.gov/ALTSA/resources", retrieved: "Retrieved October 31, 2026" },
  wcag: { parts: ["World Wide Web Consortium. (2023, October 5). ", { i: "Web Content Accessibility Guidelines (WCAG) 2.2" }, "."], url: "https://www.w3.org/TR/WCAG22/", retrieved: "Retrieved October 31, 2026" },
};

/** Per-page citations. List ids in order of first appearance; <Cite id="x" /> prints that number as a link, <Block /> prints the accordion. */
export function cites(ids: string[]) {
  const n = (id: string) => { const i = ids.indexOf(id); if (i < 0) throw new Error(`source "${id}" is not in this page's list`); return i + 1; };
  function One({ id }: { id: string }) {
    const pid = useId(), num = n(id), s = SOURCES[id];
    const it = s.parts.find((p) => typeof p !== "string") as { i: string } | undefined;
    const name = it ? it.i : (s.parts[0] as string).replace(/\.$/, "");
    return (
      <>
        <button type="button" className="u-cite" popoverTarget={pid} aria-label={`Source ${num}: ${name}`}>{num}</button>
        <span id={pid} popover="auto" className="u-pop"><b>{name}</b><br /><span className="u-muted">Checked {s.retrieved?.replace(/^Retrieved /, "") ?? CHECKED}.</span> <a href={`#src-${num}`}>See source {num}</a></span>
      </>
    );
  }
  function Cite({ id }: { id: string | string[] }) {
    return <>{(Array.isArray(id) ? id : [id]).map((x) => <One key={x} id={x} />)}</>;
  }
  function Block({ open }: { open?: boolean }) {
    return <SourcesBlock defaultOpen={open} items={ids.map((id, i) => ({ n: i + 1, ...SOURCES[id] }))} />;
  }
  return { Cite, Block };
}
