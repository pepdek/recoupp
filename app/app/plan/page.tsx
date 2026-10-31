import { redirect } from "next/navigation";
import { getCtx } from "@/lib/household";
import { programs } from "@/lib/programs";
import { effectiveValue, isRecommended, type Evaluation } from "@/lib/review";
import { markClaim } from "./actions";

const $ = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const LABEL: Record<string, string> = { recommended: "Ready to apply", prepared: "Application prepared", submitted: "Submitted", pending: "Waiting for a decision", approved: "Approved", denied: "Denied", needs_info: "More information needed", receiving: "Receiving benefit", renewal_due: "Renewal due" };

export default async function Plan() {
  const { sb, household } = await getCtx("/plan");
  if (!household) redirect("/intake");
  if (!household.reviewed_at) {
    return (
      <main className="mx-auto max-w-xl p-6 text-xl">
        <h1 className="text-3xl font-semibold">Your plan</h1>
        <p className="mt-4">A person is checking your answers before we show results. We&apos;ll email you when it&apos;s ready.</p>
      </main>
    );
  }
  const [{ data: evs }, { data: claims }] = await Promise.all([
    sb.from("evaluations").select("*").eq("household_id", household.id),
    sb.from("claims").select("*").eq("household_id", household.id),
  ]);
  const items = ((evs ?? []) as Evaluation[]).filter(isRecommended).sort((a, b) => (effectiveValue(b) ?? 0) - (effectiveValue(a) ?? 0));
  return (
    <main className="mx-auto max-w-2xl space-y-5 p-6 text-xl">
      <h1 className="text-3xl font-semibold">Your plan</h1>
      <p className="text-base text-gray-700">Estimates only; not legal, tax, or financial advice. A person reviewed these, but each agency makes the final decision.</p>
      {!items.length && <p>We didn&apos;t find programs to recommend right now.</p>}
      {items.map((e) => {
        const p = programs.find((x) => x.id === e.program_id), c = claims?.find((x) => x.program_id === e.program_id), v = effectiveValue(e);
        return (
          <section key={e.id} className="rounded border p-4">
            <h2 className="text-2xl font-semibold">{p?.name ?? e.program_id}</h2>
            <p className="mt-1 text-base">{e.reason}</p>
            {e.reviewer_note && <p className="mt-1 text-base italic">Reviewer note: {e.reviewer_note}</p>}
            <p className="mt-2 text-base">Estimated value: {v == null ? "we can't estimate this one yet" : e.override_value_likely != null ? `about ${$(v)} a year` : e.value && e.value.low !== e.value.high ? `${$(e.value.low)} to ${$(e.value.high)} a year` : `about ${$(v)} a year`}</p>
            {c && <p className="mt-1 text-base">Status: <b>{LABEL[c.status] ?? c.status}</b></p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-base">
              <a className="underline" href={`/api/packet/${e.program_id}`}>Download answers sheet (PDF)</a>
              {p && <a className="underline" href={p.application.url} target="_blank" rel="noreferrer">Apply</a>}
              {c && c.status === "recommended" && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="prepared" /><button className="underline">I&apos;ve filled it out</button></form>}
              {c && (c.status === "recommended" || c.status === "prepared") && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="submitted" /><button className="underline">I&apos;ve submitted it</button></form>}
            </div>
          </section>
        );
      })}
      <a className="block underline" href="/documents">Upload documents</a>
    </main>
  );
}
