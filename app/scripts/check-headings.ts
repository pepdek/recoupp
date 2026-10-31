export {};
// Crawls the built public routes on a running server and checks the heading outline.
//   npm run build && npx next start -p 3112 &  then:  BASE=http://localhost:3112 npm run check:headings
// Fails (exit 1) if a page doesn't have exactly one H1, or a heading level is skipped going down (H1 to H3).
const BASE = process.env.BASE ?? "http://localhost:3112";
const ROUTES = ["/", "/check", "/about", "/contact", "/programs", "/programs/medicare-savings-program", "/programs/basic-food", "/for-sponsors", "/privacy", "/terms", "/accessibility", "/login"];
let bad = 0;
async function main() {
for (const r of ROUTES) {
  const html = await (await fetch(BASE + r)).text();
  const hs = [...html.matchAll(/<h([1-6])[\s>][^]*?<\/h\1>/g)].map((m) => ({ level: Number(m[1]), text: m[0].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 60) }));
  const h1 = hs.filter((h) => h.level === 1).length;
  const skips = hs.filter((h, i) => i > 0 && h.level > hs[i - 1].level + 1);
  const ok = h1 === 1 && !skips.length;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${r}  h1=${h1}  headings=${hs.length}${skips.length ? `  skipped to ${skips.map((s) => `h${s.level} "${s.text}"`).join(", ")}` : ""}`);
  if (process.env.OUTLINE) for (const h of hs) console.log(`${"  ".repeat(h.level - 1)}h${h.level} ${h.text}`);
}
process.exit(bad ? 1 : 0);
}
main();
