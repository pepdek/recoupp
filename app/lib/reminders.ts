export type ReminderKind = "docs_missing" | "needs_info" | "renewal_30" | "renewal_7";
export type ClaimRow = { id: string; household_id: string; program_id: string; status: string; renewal_due: string | null; created_at: string };

export type Due = { claim: ClaimRow; kind: ReminderKind; key: string };

const DAY = 864e5;
const MAX_SENDS: Partial<Record<ReminderKind, number>> = { docs_missing: 3, needs_info: 4 };

/** ISO-ish week bucket so weekly reminders repeat at most once a week. */
export const weekKey = (d: Date) => `${d.getUTCFullYear()}-W${String(Math.ceil(((+d - +Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY + 1) / 7)).padStart(2, "0")}`;

/**
 * Which reminders are due right now. `sent` holds dedupe keys already sent; `docCount` is uploaded documents per household.
 * Pure on purpose: the cron route only fetches rows, calls this, and sends.
 */
export function dueReminders(now: Date, claims: ClaimRow[], docCount: Map<string, number>, sent: Set<string>): Due[] {
  const out: Due[] = [];
  const sentCount = (claimId: string, kind: string) => [...sent].filter((k) => k.startsWith(`${claimId}:${kind}:`)).length;
  const add = (claim: ClaimRow, kind: ReminderKind, bucket: string) => {
    const key = `${claim.id}:${kind}:${bucket}`;
    if (sent.has(key)) return;
    if (MAX_SENDS[kind] !== undefined && sentCount(claim.id, kind) >= MAX_SENDS[kind]!) return;
    out.push({ claim, kind, key });
  };
  for (const c of claims) {
    const ageDays = (+now - +new Date(c.created_at)) / DAY;
    if ((c.status === "recommended" || c.status === "prepared") && ageDays >= 7 && !(docCount.get(c.household_id) ?? 0)) add(c, "docs_missing", weekKey(now));
    if (c.status === "needs_info") add(c, "needs_info", weekKey(now));
    if (c.renewal_due) {
      const left = (+new Date(`${c.renewal_due}T00:00:00Z`) - +now) / DAY;
      if (left <= 7 && left > -30) add(c, "renewal_7", "once");
      else if (left <= 30 && left > 7) add(c, "renewal_30", "once");
    }
  }
  return out;
}

export const message = (kind: ReminderKind, program: string, site: string) => {
  const link = `${site}/plan`;
  const m: Record<ReminderKind, [string, string]> = {
    docs_missing: [`Documents for your ${program} application`, `You can finish your ${program} application faster by uploading your documents. Everything is private.\n\nUpload here: ${site}/documents`],
    needs_info: [`The agency needs more information for ${program}`, `The agency asked for more information about your ${program} application. Please check your plan and send what they need.\n\n${link}`],
    renewal_30: [`Your ${program} renews in about a month`, `It is almost time to renew ${program}. Renewing on time keeps your benefit from stopping.\n\n${link}`],
    renewal_7: [`Your ${program} renewal is due this week`, `Your ${program} renewal is due within a week. Please renew now so your benefit doesn't stop.\n\n${link}`],
  };
  return { subject: m[kind][0], text: `${m[kind][1]}\n\nThis is an automated reminder from Recoup. Reply to this email if you'd like us to stop sending reminders.` };
};
