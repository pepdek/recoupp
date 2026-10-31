"use client";
import { useState } from "react";

type K = "calm" | "lg" | "hc";
// Remembered in a cookie so server-rendered pages come back in the same mode.
function set(k: K, on: boolean) {
  document.documentElement.toggleAttribute(`data-${k}`, on);
  const c = (["calm", "lg", "hc"] as K[]).filter((x) => document.documentElement.hasAttribute(`data-${x}`));
  document.cookie = `ui=${c.join(",")};path=/;max-age=31536000;samesite=lax`;
}
export default function Toggles({ on }: { on: K[] }) {
  const [s, setS] = useState<K[]>(on);
  const t = (k: K, label: string) => (
    <button type="button" className="btn btn-quiet btn-sm" aria-pressed={s.includes(k)} onClick={() => { const v = !s.includes(k); set(k, v); setS(v ? [...s, k] : s.filter((x) => x !== k)); }}>{label}</button>
  );
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Display settings">{t("calm", "Calm")}{t("lg", "Larger text")}{t("hc", "High contrast")}</div>;
}
