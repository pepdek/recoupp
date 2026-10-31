// Launch blockers. Fails the build when it runs for production (Netlify CONTEXT=production, or LAUNCH_CHECK=1); otherwise prints a warning.
// Source-level on purpose: the site reads cookies in the header, so pages are rendered per request and there is no static HTML to scan.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []; });
const files = [...walk("app"), ...walk("components")];
const problems: string[] = [];

for (const f of files) {
  readFileSync(f, "utf8").split("\n").forEach((l, i) => {
    // A visible placeholder that no env var can fill (reviewer name, bio, founder note, hours).
    if (/<Ph4?>/.test(l) && !/ADDRESS \|\||PHONE \?|SUPPORT_EMAIL \?/.test(l)) problems.push(`${f}:${i + 1} hard-coded placeholder: ${l.trim().slice(0, 90)}`);
    if (/\[PLACEHOLDER/.test(l) && !/u-ph|className="ph"|function Ph|const Ph4/.test(l)) problems.push(`${f}:${i + 1} literal PLACEHOLDER text`);
  });
}
for (const [v, what] of [["NEXT_PUBLIC_SUPPORT_EMAIL", "support email"], ["NEXT_PUBLIC_CONTACT_PHONE", "phone number"], ["NEXT_PUBLIC_CONTACT_ADDRESS", "business address"]] as const) {
  if (!process.env[v]) problems.push(`env ${v} is not set: the ${what} renders as a placeholder`);
}
const nav = readFileSync("components/v4.tsx", "utf8");
if (/\(draft\)/.test(nav)) problems.push("components/v4.tsx: footer legal links still say (draft). Remove only after attorney review.");

const strict = process.env.CONTEXT === "production" || process.env.LAUNCH_CHECK === "1";
if (problems.length) {
  console.log(`\n${strict ? "LAUNCH BLOCKERS" : "Launch blockers (warning only, not a production build)"}:\n  ${problems.join("\n  ")}\nSee docs/LAUNCH_BLOCKERS.md\n`);
  if (strict) process.exit(1);
}
