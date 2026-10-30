import { z } from "zod";

// ---- Program spec (programs/*.yaml). Programs are data; this file is the only interpreter. ----
export type Expr =
  | number | string | boolean
  | { fact: string } | { const: string }
  | { table: string; size: Expr }
  | { op: "add" | "sub" | "mul" | "div" | "max" | "min"; args: Expr[] };
export type Cond =
  | true
  | { all: Cond[] } | { any: Cond[] } | { not: Cond }
  | { fact: string }
  | { cmp: [">" | ">=" | "<" | "<=" | "==" | "!=", Expr, Expr] };

export const STATUSES = ["eligible", "likely", "unlikely", "needs_human_review", "already_receiving"] as const;
export type Status = (typeof STATUSES)[number];

const expr: z.ZodType<Expr> = z.lazy(() => z.union([
  z.number(), z.string(), z.boolean(),
  z.object({ fact: z.string() }).strict(), z.object({ const: z.string() }).strict(),
  z.object({ table: z.string(), size: expr }).strict(),
  z.object({ op: z.enum(["add", "sub", "mul", "div", "max", "min"]), args: z.array(expr).min(1) }).strict(),
]));
const cond: z.ZodType<Cond> = z.lazy(() => z.union([
  z.literal(true),
  z.object({ all: z.array(cond) }).strict(), z.object({ any: z.array(cond) }).strict(), z.object({ not: cond }).strict(),
  z.object({ fact: z.string() }).strict(),
  z.object({ cmp: z.tuple([z.enum([">", ">=", "<", "<=", "==", "!="]), expr, expr]) }).strict(),
]));

export const ProgramSchema = z.object({
  id: z.string().regex(/^[a-z_]+$/),
  name: z.string(), agency: z.string(), jurisdiction: z.string(),
  confidence: z.enum(["verified", "needs_review"]),
  last_verified: z.coerce.date().transform((d) => d.toISOString().slice(0, 10)),
  source_urls: z.array(z.string().url()).min(1), // rule 3: no source, no program
  unverified_inputs: z.array(z.string()).default([]),
  renewal: z.string(), documents: z.array(z.string()),
  application: z.object({ channel: z.string(), url: z.string().url() }),
  depends_on: z.array(z.string()).default([]),
  constants: z.record(z.string(), z.number()).default({}),
  tables: z.record(z.string(), z.record(z.string(), z.number())).default({}),
  derived: z.record(z.string(), expr).default({}),
  rules: z.array(z.object({
    id: z.string(), when: cond, status: z.enum(STATUSES), reason: z.string(),
    value: z.object({ low: expr, likely: expr, high: expr }).strict().optional(),
  }).strict()).min(1),
}).strict();
export type Program = z.infer<typeof ProgramSchema> & { version?: string };

// ---- Evaluation ----
export type Facts = Record<string, number | string | boolean>;
export type Range = { low: number; likely: number; high: number };
export type Result = {
  program_id: string; name: string; version: string | null; status: Status; rule_id: string; reason: string;
  value: Range | null; confidence: Program["confidence"]; unverified_inputs: string[];
  requires_review: true; reviewer_only: boolean; source_urls: string[]; last_verified: string;
  depends_on: string[]; application_url: string; documents: string[];
};

const num = (v: unknown): number => {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v !== "number" || Number.isNaN(v)) throw new Error(`not a number: ${String(v)}`);
  return v;
};

function lookup(table: Record<string, number>, size: number) {
  const n = Math.max(1, Math.floor(size));
  if (table[String(n)] !== undefined) return table[String(n)];
  const max = Math.max(...Object.keys(table).filter((k) => /^\d+$/.test(k)).map(Number));
  if (table.each_additional === undefined) throw new Error(`size ${n} outside table`);
  return table[String(max)] + table.each_additional * (n - max);
}

function ev(e: Expr, p: Program, scope: Facts): number | string | boolean {
  if (typeof e !== "object") return e;
  if ("fact" in e) { if (!(e.fact in scope)) throw new Error(`unknown fact ${e.fact} in ${p.id}`); return scope[e.fact]; }
  if ("const" in e) { if (!(e.const in p.constants)) throw new Error(`unknown const ${e.const} in ${p.id}`); return p.constants[e.const]; }
  if ("table" in e) { const t = p.tables[e.table]; if (!t) throw new Error(`unknown table ${e.table} in ${p.id}`); return lookup(t, num(ev(e.size, p, scope))); }
  const a = e.args.map((x) => num(ev(x, p, scope)));
  switch (e.op) {
    case "add": return a.reduce((x, y) => x + y);
    case "sub": return a.reduce((x, y) => x - y);
    case "mul": return a.reduce((x, y) => x * y);
    case "div": return a.reduce((x, y) => x / y);
    case "max": return Math.max(...a);
    case "min": return Math.min(...a);
  }
}

function test(c: Cond, p: Program, scope: Facts): boolean {
  if (c === true) return true;
  if ("all" in c) return c.all.every((x) => test(x, p, scope));
  if ("any" in c) return c.any.some((x) => test(x, p, scope));
  if ("not" in c) return !test(c.not, p, scope);
  if ("fact" in c) return Boolean(ev(c, p, scope));
  const [op, l, r] = c.cmp, a = ev(l, p, scope), b = ev(r, p, scope);
  switch (op) {
    case "==": return a === b; case "!=": return a !== b;
    default: { const x = num(a), y = num(b); return op === "<" ? x < y : op === "<=" ? x <= y : op === ">" ? x > y : x >= y; }
  }
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const fill = (t: string, s: Facts) => t.replace(/\{(\$?)(\w+)\}/g, (_, d, k) => (k in s ? (d ? money(num(s[k])) : String(typeof s[k] === "number" ? Math.round(s[k] as number * 100) / 100 : s[k])) : `{${k}}`));

export function evaluate(p: Program, facts: Facts): Omit<Result, "version"> & { version: string | null } {
  const scope: Facts = { ...facts };
  for (const [k, e] of Object.entries(p.derived)) scope[k] = ev(e, p, scope);
  const rule = p.rules.find((r) => test(r.when, p, scope));
  if (!rule) throw new Error(`${p.id}: no rule matched (last rule must be \`when: true\`)`);
  let status = rule.status, reason = fill(rule.reason, scope);
  // Safety net: nothing unverified may ever be a recommendation, whatever the YAML says.
  if (p.confidence !== "verified" && (status === "eligible" || status === "likely")) {
    status = "needs_human_review";
    reason = `${reason} (Program rules not fully verified; reviewer must confirm.)`;
  }
  const v = rule.value;
  const value = v ? { low: num(ev(v.low, p, scope)), likely: num(ev(v.likely, p, scope)), high: num(ev(v.high, p, scope)) } : null;
  return {
    program_id: p.id, name: p.name, version: p.version ?? null, status, rule_id: rule.id, reason, value,
    confidence: p.confidence, unverified_inputs: p.unverified_inputs, requires_review: true,
    reviewer_only: p.confidence !== "verified" || status === "needs_human_review",
    source_urls: p.source_urls, last_verified: p.last_verified, depends_on: p.depends_on,
    application_url: p.application.url, documents: p.documents,
  };
}

/** Evaluates every program in dependency order; later programs see `status_<id>` of earlier ones. */
export function evaluateAll(programs: Program[], facts: Facts): Result[] {
  const done = new Map<string, Result>(), pending = [...programs];
  const scope: Facts = { ...facts };
  while (pending.length) {
    const i = pending.findIndex((p) => p.depends_on.every((d) => done.has(d)));
    if (i < 0) throw new Error("circular depends_on among programs");
    const [p] = pending.splice(i, 1);
    const r = evaluate(p, scope);
    done.set(p.id, r);
    scope[`status_${p.id}`] = r.status;
  }
  return programs.map((p) => done.get(p.id)!);
}

// ---- Claim plan ----
const WEIGHT: Partial<Record<Status, number>> = { eligible: 0.9, likely: 0.7, needs_human_review: 0.4 };
export type Plan = {
  items: (Result & { score: number; note?: string })[];
  not_recommended: Result[]; already_receiving: Result[];
  total: Range;              // eligible + likely only
  pending_review_total: Range; // needs_human_review items that carry a value
  total_provisional: boolean;
};

export function claimPlan(results: Result[]): Plan {
  const items: Plan["items"] = results
    .filter((r) => r.status in WEIGHT)
    .map((r) => ({ ...r, score: (r.value?.likely ?? 0) * WEIGHT[r.status]! }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  // A program that unlocks another goes first.
  for (const it of [...items]) for (const d of it.depends_on) {
    const di = items.findIndex((x) => x.program_id === d), ii = items.indexOf(it);
    if (di > ii) { const [dep] = items.splice(di, 1); items.splice(ii, 0, dep); }
    if (di >= 0) it.note = `Applying for ${items.find((x) => x.program_id === d)!.name} first can qualify you automatically.`;
  }
  const total = { low: 0, likely: 0, high: 0 }, pending = { low: 0, likely: 0, high: 0 };
  for (const it of items) if (it.value) for (const k of ["low", "likely", "high"] as const) (it.status === "needs_human_review" ? pending : total)[k] += it.value[k];
  return {
    items,
    not_recommended: results.filter((r) => r.status === "unlikely"),
    already_receiving: results.filter((r) => r.status === "already_receiving"),
    total, pending_review_total: pending,
    total_provisional: items.some((i) => i.value && i.status !== "needs_human_review" && (i.reviewer_only || i.unverified_inputs.length > 0)),
  };
}
