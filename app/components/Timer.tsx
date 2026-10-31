"use client";
import { useEffect, useState } from "react";

// Counts seconds the tab is visible; submitted with the form so reviewer time per household can be summed.
// ponytail: client-measured and clamped server-side; add idle detection if it proves noisy.
export default function Timer({ shared }: { shared?: boolean }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) setS((x) => x + 1); }, 1000);
    return () => clearInterval(t);
  }, []);
  return <input type="hidden" name="seconds" value={s} data-shared={shared ? "1" : undefined} readOnly />;
}
