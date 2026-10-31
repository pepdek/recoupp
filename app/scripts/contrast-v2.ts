// Worst-case contrast: text tokens on the 86% white glass pane over each field color, darkest case included.
// Fails (exit 1) if any body-text pair drops under 7:1. Run: npx tsx scripts/contrast-v2.ts
const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const L = (h: string) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a: string, b: string) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg: string, bg: string, a: number) => "#" + rgb(fg).map((v, i) => Math.round(a * v + (1 - a) * rgb(bg)[i]).toString(16).padStart(2, "0")).join("");

const field = { peach: "#ffc79a", apricot: "#ff9a52", marigold: "#f9b21c", clay: "#d4705f", sage: "#8fb08a", sky: "#8ec5e8", ember: "#ff6e3c", teal: "#1f5f63", base: "#fff3e6" };
const text = { ink: "#1b1714", "ink-2": "#4a3f38", money: "#0a4526", wait: "#5e3800", bad: "#80190f", link: "#7f2605" };
let fail = 0;
for (const [fn, fh] of Object.entries(field)) {
  const surface = over("#ffffff", fh, 0.86);
  const row = Object.entries(text).map(([tn, th]) => { const r = cr(th, surface); if (r < 7) fail++; return `${tn} ${r.toFixed(1)}`; });
  console.log(`${fn.padEnd(9)} ${surface}  ${row.join("  ")}`);
}
const tints = [["warm", "#fff6ea"], ["sage", "#f4faf2"]].flatMap(([n, t]) => Object.entries(text).map(([tn, th]) => { const r = cr(th, over(t, field.teal, 0.88)); if (r < 7) fail++; return `${n}/${tn} ${r.toFixed(1)}`; }));
console.log(`tinted panes over teal: ${tints.join("  ")}`);
const btn = ["#ff8a5b", "#ffb04a"].map((b) => cr("#1b1714", b).toFixed(1));
console.log(`button ink on gradient: ${btn.join(" / ")}`);
const num = Object.entries(field).filter(([n]) => n !== "teal").map(([n, h]) => `${n} ${cr("#5c1b04", h).toFixed(1)}`);
console.log(`hero numeral (#5c1b04, large text needs 3) on field: ${num.join("  ")}`);
if (fail) { console.error(`${fail} pairs under 7:1`); process.exit(1); }
