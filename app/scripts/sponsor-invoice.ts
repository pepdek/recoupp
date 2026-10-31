// Usage: npx tsx scripts/sponsor-invoice.ts --org "Name" --slug name --email a@b.org [--viewer dash@org.com] [--households 100] [--fee 9900]
// Creates org + Stripe customer + invoice 1 of 2 (50%, ACH + card). Invoice 2 is created by hand at household 50.
import { parseArgs } from "node:util";
import { stripe } from "../lib/stripe";
import { admin } from "../lib/supabase-admin";

const { values: v } = parseArgs({ options: { org: { type: "string" }, slug: { type: "string" }, viewer: { type: "string" }, email: { type: "string" }, households: { type: "string", default: "100" }, fee: { type: "string", default: "9900" } } });
if (!v.org || !v.slug || !v.email) throw new Error("--org --slug --email required");
const n = Number(v.households), fee = Number(v.fee), half = Math.round((n * fee) / 2);
if (n < 100) throw new Error("pilot minimum is 100 households");

const s = stripe(), db = admin();
const cust = await s.customers.create({ name: v.org, email: v.email });
const { data: org, error } = await db.from("organizations").insert({ name: v.org, slug: v.slug, fee_cents: fee, min_households: n, stripe_customer_id: cust.id }).select().single();
if (error) throw error;

if (v.viewer) { // sponsor dashboard login, applied when they first sign in
  const { error: ve } = await db.from("staff_emails").insert({ email: v.viewer.toLowerCase(), role: "sponsor_viewer", org_id: org.id });
  if (ve) throw ve;
}

const inv = await s.invoices.create({
  customer: cust.id, collection_method: "send_invoice", days_until_due: 14,
  payment_settings: { payment_method_types: ["us_bank_account", "card"] },
  metadata: { offer: "A", org_id: org.id, part: "1of2" },
  description: `Founding Sponsor Pilot, ${n} households at $${fee / 100}. Invoice 1 of 2 (50% at signup).`,
});
await s.invoiceItems.create({ customer: cust.id, invoice: inv.id, amount: half, currency: "usd", description: "Founding Sponsor Pilot: 50% at signup" });
const sent = await s.invoices.sendInvoice(inv.id!);
console.log("org", org.id, "invoice", sent.hosted_invoice_url);
