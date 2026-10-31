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
const cell = "cell";

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
    <main className="wrap space-y-8 py-6">
      <header>
        <h1>{h.city}, {h.county} County</h1>
        <p className="muted">Answered {h.relationship === "self" ? "by the household" : `by a ${h.relationship}`} · consent {consents?.map((c) => `${c.version} ${c.accepted_at.slice(0, 10)}`).join(", ")} · {h.reviewed_at ? `reviewed ${h.reviewed_at.slice(0, 10)}` : "awaiting review"}</p>
        {error && <p className="mt-2 text-pill font-bold">That didn&apos;t work ({error}). {error === "outcome" && "Choose an outcome before approving a needs-review item."}</p>}
      </header>

      <section>
        <h2>Household</h2>
        <ul className="mt-2">{members?.map((m) => <li key={m.id}>{m.first_name}, born {m.birth_year}{m.veteran && " · veteran"}{m.disabled && " · disability"}</li>)}</ul>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-3">
          {Object.entries(a).map(([k, v]) => <div key={k}><dt className="muted">{k}</dt><dd>{Array.isArray(v) ? v.join(", ") || "none" : String(v)}</dd></div>)}
        </dl>
      </section>

      <section>
        <h2>Documents</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {docs?.map((d) => {
            const f = confirmedFields(d.extracted as Proposed[]);
            return (
              <li key={d.id} className="box">
                {links[d.id] ? <a className="" href={links[d.id]} target="_blank" rel="noreferrer">{d.kind}: {d.filename}</a> : d.filename}
                <span className="ml-2 muted">{d.extraction_status}</span>
                {f.length > 0 && <div className="mt-1">Household-confirmed: {f.map((x) => `${x.field}=${x.value}`).join(" · ")}</div>}
              </li>
            );
          })}
          {!docs?.length && <li className="muted">None uploaded.</li>}
        </ul>
      </section>

      <section>
        <h2>Engine decisions</h2>
        {!evaluations.length ? (
          <form action={startReview} className="mt-2"><input type="hidden" name="household_id" value={id} /><button className="btn btn-sm">Start review (snapshot engine results)</button></form>
        ) : (
          <ul className="mt-2 space-y-4">
            {evaluations.map((e) => {
              const p = programs.find((x) => x.id === e.program_id);
              const v = effectiveValue(e);
              return (
                <li key={e.id} className="box">
                  <div className="flex flex-wrap justify-between gap-2">
                    <b>{p?.name ?? e.program_id}</b>
                    <span>engine: <b>{e.status}</b>{e.override_status && <> → reviewer: <b>{e.override_status}</b></>} · {e.review_state}{e.confidence !== "verified" && <span className="ml-1 font-bold">(unverified program)</span>}</span>
                  </div>
                  <p className="mt-1">{e.reason}</p>
                  <p className="text-sm muted">rule {e.rule_id} · v{e.program_version} · {v != null ? `${$(v)}/yr likely${e.value ? ` (${$(e.value.low)}–${$(e.value.high)})` : ""}` : "no verified value"}{p && <> · <a className="" href={p.source_urls[0]} target="_blank" rel="noreferrer">source</a> verified {p.last_verified}</>}</p>
                  {!h.reviewed_at && (
                    <form action={decideEvaluation} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <input type="hidden" name="id" value={e.id} /><input type="hidden" name="household_id" value={id} />
                      <select name="decision" defaultValue="approved" className={cell}><option value="approved">Approve</option><option value="rejected">Reject</option><option value="escalated">Escalate</option></select>
                      <select name="override_status" defaultValue={e.override_status ?? ""} className={cell}><option value="">Keep engine outcome</option><option value="eligible">Set eligible</option><option value="likely">Set likely</option><option value="unlikely">Set unlikely</option></select>
                      <input name="override_value" placeholder="Yearly value $" defaultValue={e.override_value_likely ?? ""} className={`cell w-32`} />
                      <input name="note" placeholder="Note" defaultValue={e.reviewer_note ?? ""} className={`cell min-w-48 flex-1`} />
                      <button className="btn btn-quiet btn-sm">Save</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!!evaluations.length && !h.reviewed_at && (
        <section className="box">
          <h2>Finish</h2>
          <p className="text-sm muted">{undecided ? `${undecided} evaluation(s) still undecided.` : "All decided. Finishing releases the plan to the household and creates their claims."}</p>
          <form className="mt-2 space-y-2">
            <input type="hidden" name="household_id" value={id} /><Timer />
            <textarea name="notes" placeholder="Household notes" className={`cell w-full`} />
            <div className="flex gap-2">
              <button formAction={finishReview} disabled={!!undecided} className="btn btn-sm disabled:opacity-40">Approve and release</button>
              <button formAction={escalateHousehold} className="btn btn-quiet btn-sm">Log escalation and leave</button>
            </div>
          </form>
        </section>
      )}

      {h.reviewed_at && (
        <section>
          <h2>Claims and outcome ledger</h2>
          <ul className="mt-2 space-y-4">
            {claims?.map((c) => {
              const entries = (ledger ?? []).filter((l) => l.claim_id === c.id);
              return (
                <li key={c.id} className="box">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b>{programs.find((p) => p.id === c.program_id)?.name ?? c.program_id}</b>
                    <span className="text-sm">verified: <b>{verified.has(c.id) ? `${$(verified.get(c.id)!)}/yr` : "none yet"}</b></span>
                  </div>
                  <form action={setClaimStatus} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="household_id" value={id} />
                    <select name="status" defaultValue={c.status} className={cell}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                    <label>Renewal due <input type="date" name="renewal_due" defaultValue={c.renewal_due ?? ""} className={cell} /></label>
                    <button className="btn btn-quiet btn-sm">Update status</button>
                  </form>
                  <ul className="mt-2 text-sm muted">{entries.map((l) => <li key={l.id}>{l.created_at.slice(0, 10)} · {l.kind} · {$(l.annual_value)}/yr{l.verified_basis && ` · ${l.verified_basis}`}{l.note && ` · ${l.note}`}</li>)}</ul>
                  <form action={addLedgerEntry} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="household_id" value={id} />
                    <select name="kind" className={cell}><option value="approved">Approved (determination letter)</option><option value="received">Received (confirmed receipt)</option></select>
                    <input name="annual_value" type="number" step="any" min="0" required placeholder="Yearly value $" className={`cell w-36`} />
                    <input name="effective_date" type="date" className={cell} />
                    <select name="evidence_document_id" required className={cell}><option value="">Evidence document…</option>{docs?.map((d) => <option key={d.id} value={d.id}>{d.kind}: {d.filename}</option>)}</select>
                    <input name="note" placeholder="Note" className={`cell min-w-40 flex-1`} />
                    <button className="btn btn-quiet btn-sm">Add verified entry</button>
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
