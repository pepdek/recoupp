"use client";
import { useState } from "react";

type Who = "me" | "parent";
const STEPS: [string, string, string, string][] = [
  ["Find", "Answer questions about your money, bills and who lives at home. About 15 minutes. Save and come back any time.", "Answer questions about your parent's money, bills and who lives at home. About 15 minutes. Save and come back any time.", "doc"],
  ["Fill", "We turn your answers into a sheet for each program. Nothing to copy by hand.", "We turn those answers into a sheet for each program. Nothing for you to copy by hand.", "pencil"],
  ["File", "A person on our team checks it first. You get a list of papers to gather and where to send them.", "A person on our team checks it first. You get a list of papers to gather and where to send them. Your parent only signs.", "envelope"],
  ["Follow", "We nudge you about missing papers, agency letters and renewal dates.", "We nudge you about missing papers, agency letters and renewal dates, so nothing slips.", "calendar"],
];
/** For me / For my parent: swaps pronouns in the four steps. Starts on "parent" when the visitor chose that entry point. */
export default function Audience({ initial }: { initial: Who }) {
  const [who, setWho] = useState<Who>(initial);
  return (
    <div className="u-stack">
      <div role="group" aria-label="Who is this for" className="u-seg">
        {(["me", "parent"] as const).map((w) => <button key={w} type="button" aria-pressed={who === w} onClick={() => setWho(w)}>{w === "me" ? "For me" : "For my parent"}</button>)}
      </div>
      <ol className="u-steps-ol" style={{ marginTop: "var(--sp-3)" }}>
        {STEPS.map(([name, me, parent]) => (
          <li key={name}><h3>{name}</h3><p className="u-muted" style={{ marginTop: "var(--sp-1)" }}>{who === "me" ? me : parent}</p></li>
        ))}
      </ol>
    </div>
  );
}
