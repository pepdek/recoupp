"use client";
import { useEffect } from "react";

// Moves the specular highlight on [data-light] panes with the pointer. Off for reduced motion and Calm.
export default function Light() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const on = (e: PointerEvent) => {
      if (document.documentElement.hasAttribute("data-calm")) return;
      document.querySelectorAll<HTMLElement>("[data-light]").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    addEventListener("pointermove", on, { passive: true });
    return () => removeEventListener("pointermove", on);
  }, []);
  return null;
}
