"use client";
import { usePathname } from "next/navigation";

const STEPS = ["members", "location", "housing", "income", "assets", "expenses", "coverage", "benefits", "review"];
/** The painted background. Composition changes by page; on intake it warms a little per section. */
export default function FieldBg() {
  const p = usePathname();
  const comp = p === "/for-sponsors" ? "sponsor" : /^\/(plan|track|thanks)/.test(p) ? "plan" : /^\/(review|admin|sponsor)/.test(p) ? "tool" : "home";
  const step = p.startsWith("/intake/") ? STEPS.indexOf(p.split("/")[2]) : -1;
  return <div aria-hidden className="paint" data-comp={comp} data-step={step >= 0 ? "" : undefined} style={step >= 0 ? ({ "--step": step } as React.CSSProperties) : undefined} />;
}
