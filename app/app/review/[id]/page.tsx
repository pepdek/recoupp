import { notFound } from "next/navigation";
import Timer from "@/components/Timer";
import { confirmedFields, type Proposed } from "@/lib/extract";
import { verifiedByClaim, type LedgerEntry } from "@/lib/ledger";
import { programs } from "@/lib/programs";
import { effectiveStatus, effectiveValue, type Evaluation } from "@/lib/review";
import { requireStaff } from "@/lib/staff";
import { addLedgerEntry, decideEvaluation, escalateHousehold, finishReview, setClaimStatus, startReview } from "../actions";

const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const STATUS = ["recommended", "prepared", "submitted", "pending", "approved", "denied", "needs_info", "receiving", "renewal_due"];
const cell = "u-input u-input-sm";

export default async function ReviewHousehold({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { sb } = await requireStaff();
  const { data: h } = await sb.from("households").select("*").eq("id", id).single();
  if (!h) notFound();
  const [{ data: members }, { data: consents }, { data: docs }, { data: evs }, { data: claims }, { data: ledger }] = await Promise.all([
    sb.from("household_members").select("*").eq("household_id", id).order("created_at"),
    sb.from("consents").select("version, accepted_at").eq("household_id", id),
    sb.from("documents").select("*").eq("household_id", id).order("created_at"),
    sb.from("evaluations").select("*").eq("household_id", id),
    sb.from("claims").select("*").eq("household_id", id),
    sb.from("ledger_entries").select("*").eq("household_id", id).order("created_at"),
  ]);
  const links = Object.fromEntries(await Promise.all((docs ?? []).map(async (d) => [d.id, (await sb.storage.from("documents").createSignedUrl(d.storage_path, 300)).data?.signedUrl])));
  const evaluations = (evs ?? []) as Evaluation[];
  const undecided = evaluations.filter((e) => e.review_state === "pending" || e.review_state === "escalated").length;
  const verified = verifiedByClaim((ledger ?? []) as LedgerEntry[]);
  const a = h.answers as Record<string, unknown>;

  return (
    <main className="u-app">
      <header>
        <h1 className="u-title">{h.city}, {h.county} County</h1>
        <p className="u-muted">Answered {h.relationship === "self" ? "by the household" : `by a ${h.relationship}`} · consent {consents?.map((c) => `${c.version} ${c.accepted_at.slice(0, 10)}`).join(", ")} · {h.reviewed_at ? `reviewed ${h.reviewed_at.slice(0, 10)}` : "awaiting review"}</p>
        {error && <p className="u-error">That didn&apos;t work ({error}). {error === "outcome" && "Choose an outcome before approving a needs-review item."}</p>}
      </header>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Household</h2>
        <ul>{members?.map((m) => <li key={m.id}>{m.first_name}, born {m.birth_year}{m.veteran && " · veteran"}{m.disabled && " · disability"}</li>)}</ul>
        <dl className="u-dl u-small">
          {Object.entries(a).map(([k, v]) => <div key={k}><dt className="u-muted">{k}</dt><dd>{Array.isArray(v) ? v.join(", ") || "none" : String(v)}</dd></div>)}
        </dl>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Documents</h2>
        <ul className="u-stack u-small" style={{ listStyle: "none", padding: 0 }}>
          {docs?.map((d) => {
            const f = confirmedFields(d.extracted as Proposed[]);
            return (
              <li key={d.id} className="u-card u-stack">
                {links[d.id] ? <a href={links[d.id]} target="_blank" rel="noreferrer">{d.kind}: {d.filename}</a> : d.filename}
                <span className="u-muted"> {d.extraction_status}</span>
                {f.length > 0 && <div>Household-confirmed: {f.map((x) => `${x.field}=${x.value}`).join(" · ")}</div>}
              </li>
            );
          })}
          {!docs?.length && <li className="u-muted">None uploaded.</li>}
        </ul>
      </section>

      <section className="u-stack">
        <h2 style={{ fontSize: "var(--fs-h3)" }}>Engine decisions</h2>
        {!evaluations.length ? (
          <form action={startReview}><input type="hidden" name="household_id" value={id} /><button className="u-btn u-btn-primary u-btn-sm">Start review (snapshot engine results)</button></form>
        ) : (
          <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
            {evaluations.map((e) => {
              const p = programs.find((x) => x.id === e.program_id);
              const v = effectiveValue(e);
              return (
                <li key={e.id} className="u-card u-stack">
                  <div className="u-row" style={{ justifyContent: "space-between" }}>
                    <b>{p?.name ?? e.program_id}</b>
                    <span>engine: <b>{e.status}</b>{e.override_status && <> → reviewer: <b>{e.override_status}</b></>} · {e.review_state}{e.confidence !== "verified" && <span className="ml-1 font-bold">(unverified program)</span>}</span>
                  </div>
                  <p>{e.reason}</p>
                  <p className="u-small u-muted">rule {e.rule_id} · v{e.program_version} · {v != null ? `${$(v)}/yr likely${e.value ? ` (${$(e.value.low)}–${$(e.value.high)})` : ""}` : "no verified value"}{p && <> · <a href={p.source_urls[0]} target="_blank" rel="noreferrer">source</a> verified {p.last_verified}</>}</p>
                  {!h.reviewed_at && (
                    <form action={decideEvaluation} className="u-row u-small">
                      <input type="hidden" name="id" value={e.id} /><input type="hidden" name="household_id" value={id} />
                      <select name="decision" defaultValue="approved" className={cell}><option value="approved">Approve</option><option value="rejected">Reject</option><option value="escalated">Escalate</option></select>
                      <select name="override_status" defaultValue={e.override_status ?? ""} className={cell}><option value="">Keep engine outcome</option><option value="eligible">Set eligible</option><option value="likely">Set likely</option><option value="unlikely">Set unlikely</option></select>
                      <input name="override_value" placeholder="Yearly value $" defaultValue={e.override_value_likely ?? ""} className="u-input u-input-sm" style={{ width: "8rem" }} />
                      <input name="note" placeholder="Note" defaultValue={e.reviewer_note ?? ""} className="u-input u-input-sm" style={{ flex: 1, minWidth: "12rem" }} />
                      <button className="u-btn u-btn-secondary u-btn-sm">Save</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!!evaluations.length && !h.reviewed_at && (
        <section className="u-card u-stack">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>Finish</h2>
          <p className="u-small u-muted">{undecided ? `${undecided} evaluation(s) still undecided.` : "All decided. Finishing releases the plan to the household and creates their claims."}</p>
          <form className="u-stack">
            <input type="hidden" name="household_id" value={id} /><Timer />
            <textarea name="notes" placeholder="Household notes" className="u-input" />
            <div className="u-row">
              <button formAction={finishReview} disabled={!!undecided} className="u-btn u-btn-primary u-btn-sm">Approve and release</button>
              <button formAction={escalateHousehold} className="u-btn u-btn-secondary u-btn-sm">Log escalation and leave</button>
            </div>
          </form>
        </section>
      )}

      {h.reviewed_at && (
        <section className="u-stack">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>Claims and outcome ledger</h2>
          <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
            {claims?.map((c) => {
              const entries = (ledger ?? []).filter((l) => l.claim_id === c.id);
              return (
                <li key={c.id} className="u-card u-stack">
                  <div className="u-row" style={{ justifyContent: "space-between" }}>
                    <b>{programs.find((p) => p.id === c.program_id)?.name ?? c.program_id}</b>
                    <span className="u-small">verified: <b>{verified.has(c.id) ? `${$(verified.get(c.id)!)}/yr` : "none yet"}</b></span>
                  </div>
                  <form action={setClaimStatus} className="u-row u-small">
                    <input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="household_id" value={id} />
                    <select name="status" defaultValue={c.status} className={cell}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                    <label>Renewal due <input type="date" name="renewal_due" defaultValue={c.renewal_due ?? ""} className={cell} /></label>
                    <button className="u-btn u-btn-secondary u-btn-sm">Update status</button>
                  </form>
                  <ul className="u-small u-muted">{entries.map((l) => <li key={l.id}>{l.created_at.slice(0, 10)} · {l.kind} · {$(l.annual_value)}/yr{l.verified_basis && ` · ${l.verified_basis}`}{l.note && ` · ${l.note}`}</li>)}</ul>
                  <form action={addLedgerEntry} className="u-row u-small">
                    <input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="household_id" value={id} />
                    <select name="kind" className={cell}><option value="approved">Approved (determination letter)</option><option value="received">Received (confirmed receipt)</option></select>
                    <input name="annual_value" type="number" step="any" min="0" required placeholder="Yearly value $" className="u-input u-input-sm" style={{ width: "9rem" }} />
                    <input name="effective_date" type="date" className={cell} />
                    <select name="evidence_document_id" required className={cell}><option value="">Evidence document…</option>{docs?.map((d) => <option key={d.id} value={d.id}>{d.kind}: {d.filename}</option>)}</select>
                    <input name="note" placeholder="Note" className="u-input u-input-sm" style={{ flex: 1, minWidth: "10rem" }} />
                    <button className="u-btn u-btn-secondary u-btn-sm">Add verified entry</button>
                  </form>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
