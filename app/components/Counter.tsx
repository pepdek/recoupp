"use client";
import { useEffect, useRef, useState } from "react";

// Ticks up to the total. Server and no-JS render the final number; reduced motion skips the tick.
export default function Counter({ to, prefix = "$" }: { to: number; prefix?: string }) {
  const [n, setN] = useState(to), r = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 1100); setN(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(step); };
    setN(0); raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span ref={r}><span className="sr-only">{prefix}{to.toLocaleString("en-US")}</span><span aria-hidden>{prefix}{n.toLocaleString("en-US")}</span></span>;
}
