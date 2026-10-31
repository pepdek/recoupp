"use client";
import { useId, useState } from "react";

/** Tabs with arrow-key support. */
export default function V4Tabs({ tabs }: { tabs: { label: string; body: React.ReactNode }[] }) {
  const [i, setI] = useState(0);
  const id = useId();
  const key = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + tabs.length) % tabs.length;
    setI(n);
    document.getElementById(`${id}-t${n}`)?.focus();
  };
  return (
    <div className="u-tabs">
      <div role="tablist" onKeyDown={key}>
        {tabs.map((t, n) => <button key={t.label} id={`${id}-t${n}`} role="tab" type="button" aria-selected={i === n} aria-controls={`${id}-p${n}`} tabIndex={i === n ? 0 : -1} onClick={() => setI(n)}>{t.label}</button>)}
      </div>
      <div role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`}>{tabs[i].body}</div>
    </div>
  );
}
