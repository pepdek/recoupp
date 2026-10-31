import { redirect } from "next/navigation";
import Link from "next/link";
import { getCtx } from "@/lib/household";
import { programs } from "@/lib/programs";
import { Pill } from "@/components/ui";

const STAGES: [string, string][] = [["recommended", "Found"], ["prepared", "Filled in"], ["submitted", "Sent in"], ["pending", "Agency deciding"], ["approved", "Approved"], ["receiving", "Getting it"]];
const NEXT: Record<string, string> = {
  recommended: "Download the answers sheet and fill in the application.",
  prepared: "Send it in, then tap “I sent it in” on your plan.",
  submitted: "Wait for a letter from the agency. Most take a few weeks.",
  pending: "Wait for the agency's decision.",
  needs_info: "The agency wants more. Check your mail and send it back.",
  approved: "Keep the approval letter. Upload it so we can log it.",
  denied: "You can usually appeal. Call us before the deadline on your letter.",
  receiving: "Nothing to do. We'll remind you before it renews.",
  renewal_due: "Renew now so it doesn't stop.",
};
const day = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function Track() {
  const { sb, household } = await getCtx("/track");
  if (!household) redirect("/intake");
  const { data: claims } = await sb.from("claims").select("*").eq("household_id", household.id).order("updated_at", { ascending: false });
  return (
    <main className="wrap-narrow">
      <h1>Where your paperwork is</h1>
      {!claims?.length && <p className="mt-4">Nothing to track yet. Claims show up here once your plan is ready. <Link href="/plan">See your plan</Link></p>}
      <ul className="mt-8 space-y-8">
        {claims?.map((c) => {
          const at = STAGES.findIndex(([k]) => k === (c.status === "renewal_due" ? "receiving" : c.status));
          return (
            <li key={c.id} className="ticket">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="!text-[1.5rem]">{programs.find((p) => p.id === c.program_id)?.name ?? c.program_id}</h2>
                <Pill status={c.status} />
              </div>
              <ol className="mt-4 border-l-2 border-ink/30 pl-6">
                {STAGES.map(([k, label], i) => (
                  <li key={k} className={`relative py-1.5 ${i > at ? "text-ink-2" : "font-bold"}`}>
                    <span aria-hidden className={`absolute -left-[2.1rem] top-3 size-4 rounded-full border-2 ${i < at ? "border-money bg-money" : i === at ? "border-ink bg-coral shadow-[0_0_16px_4px_rgba(255,160,80,.8)]" : "border-ink-2 bg-white"}`} />
                    {label}{i === at && <> <span className="small font-normal">· {day(c.updated_at)}</span></>}
                    <span className="sr-only">{i < at ? " (done)" : i === at ? " (you are here)" : " (not yet)"}</span>
                  </li>
                ))}
              </ol>
              <p className="slip small mt-4"><b>Next:</b> {NEXT[c.status]}{c.renewal_due && <> Renewal date: <b>{day(c.renewal_due)}</b>.</>}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
