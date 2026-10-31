// Writes each email's html + text to docs/email/ for review. The magic link is pasted into Supabase (Auth > Email Templates).
import { mkdirSync, writeFileSync } from "node:fs";
import { magicLinkEmail, receiptEmail, sponsorReportEmail } from "../lib/email";
import { message } from "../lib/reminders";

const dir = "../docs/email"; mkdirSync(dir, { recursive: true });
const out = (n: string, m: { html: string; text: string }) => { writeFileSync(`${dir}/${n}.html`, m.html); writeFileSync(`${dir}/${n}.txt`, m.text); };
out("magic-link", magicLinkEmail("{{ .ConfirmationURL }}"));
out("receipt", receiptEmail("$149", "https://example.test"));
out("reminder-renewal-7", message("renewal_7", "Basic Food", "https://example.test"));
out("sponsor-monthly", sponsorReportEmail("Demo Senior Center", "$19,719", 63, "https://example.test", "demo"));
