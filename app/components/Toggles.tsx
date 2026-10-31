"use client";
import { useState } from "react";

// Remembered in a cookie so server-rendered pages come back in the same mode.
function set(k: "lg" | "hc", on: boolean) {
  document.documentElement.toggleAttribute(`data-${k}`, on);
  const c = ["lg", "hc"].filter((x) => document.documentElement.hasAttribute(`data-${x}`));
  document.cookie = `ui=${c.join(",")};path=/;max-age=31536000;samesite=lax`;
}
export default function Toggles({ lg, hc }: { lg: boolean; hc: boolean }) {
  const [a, setA] = useState(lg), [b, setB] = useState(hc);
  const cls = "btn btn-quiet btn-sm";
  return (
    <div className="flex gap-2" role="group" aria-label="Display settings">
      <button type="button" className={cls} aria-pressed={a} onClick={() => { set("lg", !a); setA(!a); }}>Larger text</button>
      <button type="button" className={cls} aria-pressed={b} onClick={() => { set("hc", !b); setB(!b); }}>High contrast</button>
    </div>
  );
}
