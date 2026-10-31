"use client";
import { useEffect } from "react";

// j/k move between queue rows, Enter opens. Rows are plain links, so it works without this too.
export default function QueueKeys() {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const rows = [...document.querySelectorAll<HTMLAnchorElement>("[data-row]")];
      const i = rows.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "j") rows[Math.min(rows.length - 1, i + 1)]?.focus();
      if (e.key === "k") rows[Math.max(0, i - 1)]?.focus();
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);
  return <p className="small muted">Keys: <kbd>j</kbd> next · <kbd>k</kbd> previous · <kbd>Enter</kbd> open</p>;
}
