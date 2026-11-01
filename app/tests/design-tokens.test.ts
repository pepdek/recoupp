import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// v4 consistency: sizes, radii and colors come from tokens only. Extended to every page as the rebuild lands.
const css = readFileSync("app/v4.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const root = css.match(/:root\s*{[^}]*}/)![0];
const rest = css.replace(/:root\s*{[^}]*}/g, "").replace(/@media[^{]*{\s*:root\s*{[^}]*}\s*}/g, "");
const vals = (re: RegExp, s: string) => [...s.matchAll(re)].map((m) => m[1].trim());

describe("v4 tokens", () => {
  it("font sizes use the scale", () => {
    const bad = vals(/font-size:\s*([^;}]+)/g, rest).filter((v) => !/^var\(--fs-(caption|small|body|h3|h2|h1|figure)\)$/.test(v));
    const shorthand = vals(/font:\s*[^;}]*?(\S+)\/[\d.]+/g, rest).filter((v) => !/var\(--fs-/.test(v.replace(/^\d{3}\s+/, "")));
    expect([...bad, ...shorthand]).toEqual([]);
  });
  it("uses two radii plus pill", () => {
    const bad = vals(/border-radius:\s*([^;}]+)/g, rest).filter((v) => !/^(var\(--r-(1|2|pill)\)|0 0 var\(--r-1\) var\(--r-1\)|inherit)$/.test(v));
    expect(bad).toEqual([]);
    expect(vals(/--r-[\w]+:\s*([^;]+)/g, root)).toEqual(["8px", "16px", "999px"]);
  });
  it("has no hex colors outside :root", () => {
    expect(rest.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });
});

// Signed-in pages: u- parts only. No v3 classes, Tailwind size utilities, arbitrary sizes or hex colors.
const files = ["login", "account", "thanks", "intake", "plan", "track", "documents", "review", "admin", "sponsor", "s"].flatMap((d) => readdirSync(`app/${d}`, { recursive: true }).map(String).filter((f) => f.endsWith(".tsx")).map((f) => `app/${d}/${f}`)).concat("components/Uploader.tsx");
const V3 = /\b(btn|btn-quiet|btn-sm|ticket|slip|box|pill|glass|wrap|wrap-narrow|field|check|input|linkbtn|err|tbl|cheque|bar|strip|cell|display|bignum|perf|pad|sheet)\b/;
describe("signed-in pages", () => {
  it.each(files)("%s uses v4 parts only", (f) => {
    const src = readFileSync(f, "utf8");
    const classes = [...src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)].flatMap((m) => (m[1] ?? m[2]).split(/\s+/));
    expect(classes.filter((c) => V3.test(c) && !c.startsWith("u-"))).toEqual([]);
    expect(classes.filter((c) => /^!?text-(\[|xs|sm|base|lg|\d?xl)/.test(c))).toEqual([]);
    expect(src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });
});
