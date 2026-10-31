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
export default function Audience({ initial, icons }: { initial: Who; icons: Record<string, React.ReactNode> }) {
  const [who, setWho] = useState<Who>(initial);
  return (
    <div>
      <div role="group" aria-label="Who is this for" className="mt-5 inline-flex gap-1 rounded-full bg-ink/10 p-1">
        {(["me", "parent"] as const).map((w) => (
          <button key={w} type="button" aria-pressed={who === w} onClick={() => setWho(w)} className={`btn btn-sm ${who === w ? "" : "btn-quiet !border-transparent"}`}>{w === "me" ? "For me" : "For my parent"}</button>
        ))}
      </div>
      <ol className="cols-4 mt-8 grid gap-6 md:grid-cols-4">
        {STEPS.map(([name, me, parent, icon], i) => (
          <li key={name}>
            <p className="display text-6xl leading-none text-link" aria-hidden>{i + 1}</p>
            <h3 className="mt-2 flex items-center gap-2">{icons[icon]}{name}</h3>
            <p className="small mt-2">{who === "me" ? me : parent}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
