"use client";
import { useEffect, useState } from "react";

// Counts up and settles. Reserves the final width (invisible copy) so proportional figures don't jitter.
export default function Counter({ to, prefix = "$" }: { to: number; prefix?: string }) {
  const [n, setN] = useState(to);
  const fmt = (v: number) => `${prefix}${v.toLocaleString("en-US")}`;
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calm")) return;
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 1100); setN(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(step); };
    setN(0); raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span className="relative inline-block">
      <span className="sr-only">{fmt(to)}</span>
      <span aria-hidden className="invisible">{fmt(to)}</span>
      <span aria-hidden className="absolute inset-0 text-left">{fmt(n)}</span>
    </span>
  );
}
