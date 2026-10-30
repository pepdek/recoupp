import { stripe, webhookSecret } from "@/lib/stripe";
import { admin } from "@/lib/supabase-admin";
import { processStripeEvent, type Store } from "@/lib/webhook";

export async function POST(req: Request) {
  const body = await req.text(); // raw body required for signature check
  const sig = req.headers.get("stripe-signature") ?? "";
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, webhookSecret());
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  const db = admin();
  const store: Store = {
    async claimEvent(id, type) {
      const { error } = await db.from("stripe_events").insert({ id, type });
      if (!error) return true;
      if (error.code === "23505") return false;
      throw error;
    },
    async releaseEvent(id) { await db.from("stripe_events").delete().eq("id", id); },
    async upsertPayment(p) {
      const { error } = await db.from("payments").upsert({ ...p, status: "paid" }, { onConflict: "stripe_object_id", ignoreDuplicates: true });
      if (error) throw error;
    },
    async markRefund(pi, refunded, amount) {
      const { error } = await db.from("payments").update({
        refunded_cents: refunded, status: refunded >= amount ? "refunded" : "partially_refunded",
      }).eq("stripe_payment_intent", pi);
      if (error) throw error;
    },
    async invoicePaymentIntent(invoiceId) {
      const list = await stripe().invoicePayments.list({ invoice: invoiceId });
      const p = list.data[0]?.payment;
      return p?.type === "payment_intent" && typeof p.payment_intent === "string" ? p.payment_intent : null;
    },
  };

  try {
    const result = await processStripeEvent(event, store);
    return Response.json({ result });
  } catch {
    return new Response("processing error", { status: 500 }); // no payload/PII in logs
  }
}
