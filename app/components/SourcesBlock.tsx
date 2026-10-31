"use client";
import { useEffect, useState } from "react";
import type { Source } from "@/lib/sources";

type Item = Source & { n: number };
/** APA-style source list in an accordion. A numbered citation link anywhere on the page opens it and jumps to its entry. */
export default function SourcesBlock({ items, defaultOpen = false }: { items: Item[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen), [hit, setHit] = useState<string | null>(null);
  useEffect(() => {
    const go = () => {
      const h = location.hash;
      if (h !== "#sources" && !/^#src-\d+$/.test(h)) return;
      setOpen(true); setHit(h.slice(1));
      requestAnimationFrame(() => { const el = document.getElementById(h === "#sources" ? "sources" : h.slice(1)); el?.scrollIntoView({ block: "center" }); (el as HTMLElement | null)?.focus?.({ preventScroll: true }); });
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#src-"]');
      if (!a) return;
      e.preventDefault(); document.querySelectorAll(":popover-open").forEach((p) => (p as HTMLElement).hidePopover()); history.replaceState(null, "", a.getAttribute("href")!); go();
    };
    go(); addEventListener("hashchange", go); document.addEventListener("click", click);
    return () => { removeEventListener("hashchange", go); document.removeEventListener("click", click); };
  }, []);
  return (
    <div className="u-acc u-sources"><details id="sources" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary><h2 style={{ font: "600 var(--fs-h3)/1.3 var(--font-ui)" }}>Sources ({items.length})</h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg></summary>
      <ol>
        {items.map((s) => (
          <li key={s.n} id={`src-${s.n}`} tabIndex={-1} data-hit={hit === `src-${s.n}` ? "" : undefined}>
            <span className="num">{s.n}</span>
            <span>
              {s.parts.map((p, i) => (typeof p === "string" ? p : <em key={i}>{p.i}</em>))}{" "}
              {s.retrieved && <>{s.retrieved}, from </>}<a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
              {s.note && <span className="note">{s.note}</span>}
            </span>
          </li>
        ))}
      </ol>
    </details></div>
  );
}
