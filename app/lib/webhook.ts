import type Stripe from "stripe";

export type Payment = {
  stripe_object_id: string; offer: "A" | "B"; org_id: string | null; email: string | null;
  amount_cents: number; stripe_payment_intent: string | null;
};
// Narrow seam so the handler is testable without Supabase/Stripe.
export type Store = {
  claimEvent(id: string, type: string): Promise<boolean>; // false = already processed
  releaseEvent(id: string): Promise<void>;
  upsertPayment(p: Payment): Promise<void>;
  markRefund(paymentIntent: string, refundedCents: number, amountCents: number): Promise<void>;
  invoicePaymentIntent(invoiceId: string): Promise<string | null>;
};

export async function processStripeEvent(event: Stripe.Event, s: Store): Promise<"duplicate" | "ok" | "ignored"> {
  if (!(await s.claimEvent(event.id, event.type))) return "duplicate";
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const o = event.data.object as Stripe.Checkout.Session;
        if (o.metadata?.offer !== "B" || o.payment_status !== "paid") return "ignored";
        await s.upsertPayment({
          stripe_object_id: o.id, offer: "B", org_id: null,
          email: o.customer_details?.email ?? o.customer_email ?? null,
          amount_cents: o.amount_total ?? 0,
          stripe_payment_intent: typeof o.payment_intent === "string" ? o.payment_intent : null,
        });
        return "ok";
      }
      case "invoice.paid": {
        const o = event.data.object as Stripe.Invoice;
        if (o.metadata?.offer !== "A" || !o.id) return "ignored";
        await s.upsertPayment({
          stripe_object_id: o.id, offer: "A", org_id: o.metadata.org_id ?? null,
          email: o.customer_email ?? null, amount_cents: o.amount_paid,
          stripe_payment_intent: await s.invoicePaymentIntent(o.id),
        });
        return "ok";
      }
      case "charge.refunded": {
        const o = event.data.object as Stripe.Charge;
        const pi = typeof o.payment_intent === "string" ? o.payment_intent : null;
        if (!pi) return "ignored";
        await s.markRefund(pi, o.amount_refunded, o.amount);
        return "ok";
      }
      default:
        return "ignored";
    }
  } catch (e) {
    await s.releaseEvent(event.id); // let Stripe retry
    throw e;
  }
}
