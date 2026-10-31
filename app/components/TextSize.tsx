"use client";
import { useState } from "react";

// ponytail: one saved setting ("ui" cookie, value "lg") shared with the v3 cookie, so a saved v3 choice carries over silently.
export default function TextSize({ on }: { on: boolean }) {
  const [lg, setLg] = useState(on);
  const set = (v: boolean) => {
    setLg(v);
    document.documentElement.toggleAttribute("data-lg", v);
    document.cookie = `ui=${v ? "lg" : ""};path=/;max-age=31536000;samesite=lax`;
  };
  return (
    <div role="group" aria-label="Text size" className="u-seg">
      <button type="button" aria-pressed={!lg} onClick={() => set(false)}>Standard</button>
      <button type="button" aria-pressed={lg} onClick={() => set(true)}>Larger</button>
    </div>
  );
}
