import { redirect } from "next/navigation";
import Uploader from "@/components/Uploader";
import { evaluateAll } from "@/lib/engine";
import { buildFacts } from "@/lib/facts";
import { packetAllowed } from "@/lib/packet";
import { programs } from "@/lib/programs";
import { getCtx } from "@/lib/household";
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

  // Checklists and packets appear only after a reviewer approves the plan.
  let ready: ReturnType<typeof evaluateAll> = [];
  if (household.reviewed_at && household.status === "completed") {
    const { data: members } = await sb.from("household_members").select("*").eq("household_id", household.id);
    ready = evaluateAll(programs, buildFacts(household, members ?? [])).filter((r) => packetAllowed(household, r));
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 text-xl">
      <h1 className="text-3xl font-semibold">Your documents</h1>
      <p className="text-gray-700">Files are private and only you and our review team can open them. We never ask for your Social Security number.</p>

      {ready.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your application packets</h2>
          {ready.map((r) => (
            <div key={r.program_id} className="rounded border p-4">
              <p className="font-semibold">{r.name}</p>
              <p className="mt-1 text-base">{r.reason}</p>
              <p className="mt-2 text-base font-semibold">Gather these:</p>
              <ul className="list-disc pl-6 text-base">{r.documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <a className="mt-3 inline-block underline" href={`/api/packet/${r.program_id}`}>Download answers sheet (PDF)</a>
            </div>
          ))}
        </section>
      )}

      <Uploader householdId={household.id} kinds={KINDS} />

      <ul className="space-y-4">
        {docs?.map((d) => (
          <li key={d.id} className="rounded border p-4">
            <div className="flex items-center justify-between gap-3">
              <span>{label(d.kind)}<br /><span className="text-base text-gray-600">{d.filename}</span></span>
              <span className="space-x-4 text-base">
                {links[d.id] && <a className="underline" href={links[d.id]} target="_blank" rel="noreferrer">View</a>}
                <form action={deleteDocument} className="inline"><input type="hidden" name="id" value={d.id} /><button className="text-red-700 underline">Delete</button></form>
              </span>
            </div>
            {d.extraction_status === "none" && (
              <form action={extractDocument} className="mt-3"><input type="hidden" name="id" value={d.id} /><button className="rounded border px-4 py-2 text-base">Read this document for me</button></form>
            )}
            {d.extraction_status === "failed" && <p className="mt-3 text-base text-red-700">We couldn&apos;t read this one. A reviewer will look at it.</p>}
            {d.extraction_status === "done" && (
              <form action={confirmFields} className="mt-3 space-y-3 text-base">
                <input type="hidden" name="id" value={d.id} />
                <p className="font-semibold">Is this right? Fix anything that&apos;s wrong, then tick what you confirm. Nothing is used until you confirm it.</p>
                {(d.extracted as Proposed[]).length === 0 && <p>We didn&apos;t find anything to fill in.</p>}
                {(d.extracted as Proposed[]).map((f, i) => (
                  <label key={i} className="flex items-center gap-3">
                    <input type="checkbox" name={`confirm_${i}`} defaultChecked={f.confirmed} className="size-6" />
                    <span className="w-44 shrink-0">{FIELD_LABEL[f.field] ?? f.field}</span>
                    <input name={`value_${i}`} defaultValue={f.final_value ?? f.value} className="w-full rounded border p-2" />
                  </label>
                ))}
                {(d.extracted as Proposed[]).length > 0 && <button className="rounded bg-black px-5 py-2 text-white">Save confirmations</button>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
