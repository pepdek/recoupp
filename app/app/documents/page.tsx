import { redirect } from "next/navigation";
import Uploader from "@/components/Uploader";
import { packetAllowed } from "@/lib/packet";
import { programs } from "@/lib/programs";
import { getCtx } from "@/lib/household";
import type { Evaluation } from "@/lib/review";
import type { Proposed } from "@/lib/extract";
import { KINDS } from "@/lib/documents";
import { confirmFields, deleteDocument, extractDocument } from "./actions";

const label = (k: string) => KINDS.find((x) => x[0] === k)?.[1] ?? k;
const FIELD_LABEL: Record<string, string> = {
  recipient_name: "Name on document", document_date: "Document date", benefit_type: "Benefit", benefit_amount_monthly: "Monthly amount",
  decision: "Decision", decision_program: "Program", approved_amount_monthly: "Approved monthly amount", effective_date: "Effective date",
  address_line: "Address", account_balance: "Balance",
};

export default async function Documents() {
  const { sb, household } = await getCtx("/documents");
  if (!household) redirect("/intake");
  const { data: docs } = await sb.from("documents").select("*").eq("household_id", household.id).order("created_at");
  // Short-lived links so files are never publicly addressable.
  const links = Object.fromEntries(await Promise.all((docs ?? []).map(async (d) => [d.id, (await sb.storage.from("documents").createSignedUrl(d.storage_path, 300)).data?.signedUrl])));

  // Checklists and packets appear only for reviewer-approved recommendations (RLS hides everything else).
  const { data: evs } = await sb.from("evaluations").select("*").eq("household_id", household.id);
  const ready = ((evs ?? []) as Evaluation[]).filter((e) => packetAllowed(household, e)).map((e) => ({ e, p: programs.find((x) => x.id === e.program_id)! })).filter((x) => x.p);

  return (
    <main className="u-wrap-narrow u-app">
      <h1 className="u-title">Your documents</h1>
      <p>Files are private and only you and our review team can open them. We never ask for your Social Security number.</p>

      {ready.length > 0 && (
        <section className="u-stack">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>Your application packets</h2>
          {ready.map(({ e, p }) => (
            <div key={e.program_id} className="u-card u-stack">
              <b>{p.name}</b>
              <p>{e.reason}</p>
              <b>Gather these:</b>
              <ul style={{ paddingLeft: "var(--sp-3)" }}>{p.documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <a href={`/api/packet/${e.program_id}`}>Download answers sheet (PDF)</a>
            </div>
          ))}
        </section>
      )}

      <Uploader householdId={household.id} kinds={KINDS} />

      <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
        {docs?.map((d) => (
          <li key={d.id} className="u-card u-stack">
            <div className="u-row" style={{ justifyContent: "space-between" }}>
              <span>{label(d.kind)}<br /><span className="u-small u-muted">{d.filename}</span></span>
              <span className="u-row">
                {links[d.id] && <a href={links[d.id]} target="_blank" rel="noreferrer">View</a>}
                <form action={deleteDocument}><input type="hidden" name="id" value={d.id} /><button className="u-linkbtn">Delete</button></form>
              </span>
            </div>
            {d.extraction_status === "none" && (
              <form action={extractDocument}><input type="hidden" name="id" value={d.id} /><button className="u-btn u-btn-secondary u-btn-sm">Read this document for me</button></form>
            )}
            {d.extraction_status === "failed" && <p className="u-error">We couldn&apos;t read this one. A reviewer will look at it.</p>}
            {d.extraction_status === "done" && (
              <form action={confirmFields} className="u-stack">
                <input type="hidden" name="id" value={d.id} />
                <p><b>Is this right? Fix anything that&apos;s wrong, then tick what you confirm. Nothing is used until you confirm it.</b></p>
                {(d.extracted as Proposed[]).length === 0 && <p>We didn&apos;t find anything to fill in.</p>}
                {(d.extracted as Proposed[]).map((f, i) => (
                  <label key={i} className="u-choice">
                    <input type="checkbox" name={`confirm_${i}`} defaultChecked={f.confirmed} />
                    <span style={{ flex: "0 0 9rem" }}>{FIELD_LABEL[f.field] ?? f.field}</span>
                    <input name={`value_${i}`} defaultValue={f.final_value ?? f.value} className="u-input" />
                  </label>
                ))}
                {(d.extracted as Proposed[]).length > 0 && <button className="u-btn u-btn-primary u-btn-sm">Save confirmations</button>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
