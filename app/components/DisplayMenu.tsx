"use client";
import { useEffect, useRef, useState } from "react";
import Toggles from "./Toggles";

type K = "calm" | "lg" | "hc";
/** One small "Aa" button that opens Calm, Larger text and High contrast. Choices are remembered (cookie). */
export default function DisplayMenu({ on }: { on: K[] }) {
  const [open, setOpen] = useState(false), box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const out = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    addEventListener("keydown", esc); addEventListener("pointerdown", out);
    return () => { removeEventListener("keydown", esc); removeEventListener("pointerdown", out); };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button type="button" className="btn btn-quiet btn-sm" aria-expanded={open} aria-controls="display-panel" onClick={() => setOpen(!open)}><span aria-hidden className="display text-xl leading-none">Aa</span><span className="sr-only">Display settings</span></button>
      {open && (
        <div id="display-panel" role="group" aria-label="Display settings" className="popover">
          <p className="font-bold">Make this easier to read</p>
          <div className="mt-3"><Toggles on={on} /></div>
          <p className="small muted mt-3">We remember your choice on this device.</p>
        </div>
      )}
    </div>
  );
}
