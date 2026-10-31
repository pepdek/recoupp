import { dueReminders, message, type ClaimRow } from "@/lib/reminders";
import { programs } from "@/lib/programs";
import { admin } from "@/lib/supabase-admin";

// Called daily by netlify/functions/reminders-cron.mts. ?dry=1 lists what would be sent without sending.
export async function POST(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("forbidden", { status: 403 });
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const db = admin(), now = new Date();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: claims } = await db.from("claims").select("id, household_id, program_id, status, renewal_due, created_at").not("status", "in", "(denied)");
  const hids = [...new Set((claims ?? []).map((c) => c.household_id))];
  const [{ data: docs }, { data: log }, { data: hhs }] = await Promise.all([
    db.from("documents").select("household_id").in("household_id", hids),
    db.from("reminder_log").select("dedupe_key").in("claim_id", (claims ?? []).map((c) => c.id)),
    db.from("households").select("id, owner_id").in("id", hids),
  ]);
  const docCount = new Map<string, number>();
  for (const d of docs ?? []) docCount.set(d.household_id, (docCount.get(d.household_id) ?? 0) + 1);
  const due = dueReminders(now, (claims ?? []) as ClaimRow[], docCount, new Set((log ?? []).map((l) => l.dedupe_key)));
  if (dry) return Response.json({ due: due.map((d) => ({ claim: d.claim.id, kind: d.kind })) });

  let sent = 0, failed = 0;
  for (const d of due) {
    const owner = hhs?.find((h) => h.id === d.claim.household_id)?.owner_id;
    const email = owner ? (await db.auth.admin.getUserById(owner)).data.user?.email : null;
    if (!email || !process.env.RESEND_API_KEY) { failed++; continue; }
    // Claim the slot first so a retry or overlapping run can't double-send; release it if sending fails.
    const { error: ce } = await db.from("reminder_log").insert({ claim_id: d.claim.id, kind: d.kind, dedupe_key: d.key });
    if (ce) continue;
    const name = programs.find((p) => p.id === d.claim.program_id)?.name ?? "your application";
    const m = message(d.kind, name, site);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM ?? "Recoup <onboarding@resend.dev>", to: email, subject: m.subject, text: m.text, html: m.html }),
    });
    if (res.ok) sent++; else { failed++; await db.from("reminder_log").delete().eq("dedupe_key", d.key); }
  }
  return Response.json({ due: due.length, sent, failed }); // counts only: no addresses in logs
}
