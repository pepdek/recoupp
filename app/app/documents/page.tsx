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
    <main className="wrap-narrow space-y-8 py-8">
      <h1>Your documents</h1>
      <p >Files are private and only you and our review team can open them. We never ask for your Social Security number.</p>

      {ready.length > 0 && (
        <section className="space-y-4">
          <h2>Your application packets</h2>
          {ready.map(({ e, p }) => (
            <div key={e.program_id} className="ticket">
              <p className="font-bold">{p.name}</p>
              <p className="mt-1 ">{e.reason}</p>
              <p className="mt-2  font-bold">Gather these:</p>
              <ul className="list-disc pl-6 ">{p.documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <a className="mt-3 inline-block underline" href={`/api/packet/${e.program_id}`}>Download answers sheet (PDF)</a>
            </div>
          ))}
        </section>
      )}

      <Uploader householdId={household.id} kinds={KINDS} />

      <ul className="space-y-4">
        {docs?.map((d) => (
          <li key={d.id} className="box">
            <div className="flex items-center justify-between gap-3">
              <span>{label(d.kind)}<br /><span className=" muted">{d.filename}</span></span>
              <span className="space-x-4 ">
                {links[d.id] && <a className="" href={links[d.id]} target="_blank" rel="noreferrer">View</a>}
                <form action={deleteDocument} className="inline"><input type="hidden" name="id" value={d.id} /><button className="linkbtn">Delete</button></form>
              </span>
            </div>
            {d.extraction_status === "none" && (
              <form action={extractDocument} className="mt-3"><input type="hidden" name="id" value={d.id} /><button className="btn btn-quiet btn-sm">Read this document for me</button></form>
            )}
            {d.extraction_status === "failed" && <p className="mt-3  text-stamp font-bold">We couldn&apos;t read this one. A reviewer will look at it.</p>}
            {d.extraction_status === "done" && (
              <form action={confirmFields} className="mt-3 space-y-3 ">
                <input type="hidden" name="id" value={d.id} />
                <p className="font-bold">Is this right? Fix anything that&apos;s wrong, then tick what you confirm. Nothing is used until you confirm it.</p>
                {(d.extracted as Proposed[]).length === 0 && <p>We didn&apos;t find anything to fill in.</p>}
                {(d.extracted as Proposed[]).map((f, i) => (
                  <label key={i} className="flex items-center gap-3">
                    <input type="checkbox" name={`confirm_${i}`} defaultChecked={f.confirmed} className="size-6" />
                    <span className="w-44 shrink-0">{FIELD_LABEL[f.field] ?? f.field}</span>
                    <input name={`value_${i}`} defaultValue={f.final_value ?? f.value} className="input" />
                  </label>
                ))}
                {(d.extracted as Proposed[]).length > 0 && <button className="btn btn-sm">Save confirmations</button>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
