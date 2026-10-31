// Prints SQL that seeds a demo sponsor and 10 synthetic households (8 waiting for review, 2 reviewed with verified outcomes).
//   npx tsx scripts/seed-sql.ts            -> seed
//   npx tsx scripts/seed-sql.ts --cleanup  -> remove everything it created
// Run the output in the Supabase SQL editor (or any psql session). No service key needed.
import { createHash } from "node:crypto";
import { evaluateAll } from "../lib/engine";
import { DEMOS } from "../lib/demo";
import { buildFacts } from "../lib/facts";
import { programs } from "../lib/programs";
import { effectiveValue, evaluationRows, isRecommended } from "../lib/review";

const id = (s: string) => { const h = createHash("sha1").update(`recoup-demo:${s}`).digest("hex"); return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
const q = (v: unknown) => v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const ORG = id("org"), REVIEWER = id("reviewer");

if (process.argv.includes("--cleanup")) {
  console.log(`delete from ledger_entries where org_id = '${ORG}' or household_id in (select id from households where owner_id in (select id from auth.users where email like 'demo-%@example.test'));
delete from payments where stripe_object_id like 'demo_%';
delete from auth.users where email like 'demo-%@example.test';
delete from events where org_id = '${ORG}';
delete from organizations where id = '${ORG}';`);
  process.exit(0);
}

const out: string[] = [];
const ins = (table: string, row: Record<string, unknown>, raw: Record<string, string> = {}) => {
  const cols = [...Object.keys(row), ...Object.keys(raw)];
  out.push(`insert into ${table} (${cols.join(", ")}) values (${[...Object.values(row).map((v) => (typeof v === "object" && v !== null ? j(v) : q(v))), ...Object.values(raw)].join(", ")});`);
};

ins("organizations", { id: ORG, name: "Demo Senior Services", slug: "demo-seniors", fee_cents: 9900, min_households: 100 });
ins("payments", { stripe_object_id: "demo_in_1", offer: "A", org_id: ORG, email: "billing@example.test", amount_cents: 495000, status: "paid" });
out.push(`insert into events (org_id, name) select '${ORG}', 'link_visit' from generate_series(1, 12);`);

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7); // e.g. --only=10 for a one-household smoke test
for (const d of DEMOS.filter((x) => !only || String(x.n) === only)) {
  const owner = id(`user${d.n}`), hh = id(`hh${d.n}`), reviewed = d.n >= 9; // 1-8 wait in the review queue; 9-10 are reviewed with verified outcomes
  out.push(`insert into auth.users (id, email, aud, role) values ('${owner}', 'demo-${d.n}@example.test', 'authenticated', 'authenticated');`);
  ins("households", { id: hh, owner_id: owner, org_id: d.sponsor ? ORG : null, relationship: d.relationship, county: d.county, city: d.city, answers: d.answers, step: "review", status: "completed" },
    { created_at: `now() - interval '${d.n} days'`, updated_at: `now() - interval '${d.n} days'`, ...(reviewed ? { reviewed_at: "now()" } : {}) });
  d.members.forEach((m, i) => ins("household_members", { household_id: hh, first_name: m.first_name, birth_year: m.birth_year, is_primary: i === 0, veteran: !!m.veteran, disabled: !!m.disabled }));
  ins("consents", { household_id: hh, user_id: owner, version: "2026-10-v1", share_with_org: !!d.share, org_id: d.sponsor ? ORG : null });
  if (!reviewed) continue;

  const facts = buildFacts({ answers: d.answers, county: d.county, city: d.city, relationship: d.relationship }, d.members.map((m) => ({ birth_year: m.birth_year, veteran: !!m.veteran, disabled: !!m.disabled })));
  const results = evaluateAll(programs, facts);
  const rows = evaluationRows(hh, results).map((r) => ({ ...r, review_state: r.review_state === "pending" ? (r.status === "needs_human_review" ? "rejected" : "approved") : r.review_state }));
  const evalIds = new Map<string, string>();
  for (const r of rows.filter((x) => isRecommended(x as never))) { const eid = id(`ev${d.n}${r.program_id}`); evalIds.set(r.program_id, eid); ins("evaluations", { id: eid, ...r, reviewed_by: REVIEWER }); }
  ins("reviews", { household_id: hh, reviewer_id: REVIEWER, decision: "approved", seconds_spent: 420 + d.n * 60 });

  const doc = id(`doc${d.n}`);
  if (d.n >= 9) ins("documents", { id: doc, household_id: hh, kind: "determination_letter", storage_path: `${hh}/demo-letter.pdf`, filename: "DEMO-determination-letter.pdf", mime: "application/pdf", size_bytes: 1000 });
  for (const r of rows.filter((x) => isRecommended(x as never))) {
    const cid = id(`cl${d.n}${r.program_id}`), est = effectiveValue(r as never) ?? 0;
    const msp = r.program_id === "msp", status = d.n === 9 && msp ? "approved" : d.n === 10 && msp ? "receiving" : d.n === 8 ? "submitted" : "recommended";
    ins("claims", { id: cid, household_id: hh, evaluation_id: evalIds.get(r.program_id), program_id: r.program_id, status });
    ins("ledger_entries", { org_id: d.sponsor ? ORG : null, household_id: hh, claim_id: cid, program_id: r.program_id, kind: "estimated", annual_value: Math.round(est), note: "engine estimate (likely)" });
    if (msp && d.n >= 9) {
      const common = { org_id: d.sponsor ? ORG : null, household_id: hh, claim_id: cid, program_id: "msp", evidence_document_id: doc, verified_by: REVIEWER };
      ins("ledger_entries", { ...common, kind: "approved", annual_value: 2435, verified_basis: "determination_letter", note: "demo" });
      if (d.n === 10) ins("ledger_entries", { ...common, kind: "received", annual_value: 2435, verified_basis: "confirmed_receipt", note: "demo" }, { created_at: "now() + interval '1 second'" });
    }
  }
}
console.log(out.join("\n"));
