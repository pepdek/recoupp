import { BRAND } from "./brand";
import { renderEmail } from "./email";

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
  const m: Record<ReminderKind, { subject: string; heading: string; body: string; cta: [string, string] }> = {
    docs_missing: { subject: `Papers for your ${program} application`, heading: "Your papers are the slow part.", body: `Upload what you have for ${program}. A photo from your phone works. Everything stays private.`, cta: ["Upload papers", `${site}/documents`] },
    needs_info: { subject: `The agency wants more for ${program}`, heading: "The agency asked for more.", body: `They need more information on your ${program} application. Check your mail, then send them what they asked for.`, cta: ["See my plan", `${site}/plan`] },
    renewal_30: { subject: `Your ${program} renews in about a month`, heading: "Renewal is a month away.", body: `Renew ${program} on time so it doesn't stop. It's easier to do it now than to restart later.`, cta: ["See my plan", `${site}/plan`] },
    renewal_7: { subject: `Your ${program} renewal is due this week`, heading: "Renew this week.", body: `Your ${program} renewal is due within a week. Renew now so your benefit doesn't stop.`, cta: ["See my plan", `${site}/plan`] },
  };
  const x = m[kind];
  const mail = renderEmail({ heading: x.heading, paragraphs: [x.body], cta: { label: x.cta[0], url: x.cta[1] }, footnote: `This is an automated reminder from ${BRAND}. Reply to this email if you'd like us to stop sending reminders.` });
  return { subject: x.subject, text: mail.text, html: mail.html };
};
