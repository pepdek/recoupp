import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { processStripeEvent, type Payment, type Store } from "../lib/webhook";

function fake() {
  const seen = new Set<string>(); const pay = new Map<string, Payment & { refunded?: number }>();
  const store: Store = {
    async claimEvent(id) { if (seen.has(id)) return false; seen.add(id); return true; },
    async releaseEvent(id) { seen.delete(id); },
    async upsertPayment(p) { if (!pay.has(p.stripe_object_id)) pay.set(p.stripe_object_id, p); },
    async markRefund(pi, r) { for (const p of pay.values()) if (p.stripe_payment_intent === pi) p.refunded = r; },
    async invoicePaymentIntent() { return "pi_inv"; },
  };
  return { store, pay };
}
const ev = (id: string, type: string, object: object) => ({ id, type, data: { object } }) as unknown as Stripe.Event;

describe("stripe webhook", () => {
  it("is idempotent: replaying an event records one payment", async () => {
    const { store, pay } = fake();
    const e = ev("evt_1", "checkout.session.completed", { id: "cs_1", metadata: { offer: "B" }, payment_status: "paid", amount_total: 14900, customer_details: { email: "a@b.c" }, payment_intent: "pi_1" });
    expect(await processStripeEvent(e, store)).toBe("ok");
    expect(await processStripeEvent(e, store)).toBe("duplicate");
    expect(pay.size).toBe(1);
  });
  it("records sponsor invoices and applies refunds", async () => {
    const { store, pay } = fake();
    await processStripeEvent(ev("evt_2", "invoice.paid", { id: "in_1", metadata: { offer: "A", org_id: "o1" }, amount_paid: 495000 }), store);
    await processStripeEvent(ev("evt_3", "charge.refunded", { payment_intent: "pi_inv", amount_refunded: 1000, amount: 495000 }), store);
    expect(pay.get("in_1")?.refunded).toBe(1000);
  });
  it("releases the claim on failure so Stripe can retry", async () => {
    const { store } = fake();
    store.upsertPayment = async () => { throw new Error("db down"); };
    const e = ev("evt_4", "checkout.session.completed", { id: "cs_4", metadata: { offer: "B" }, payment_status: "paid", amount_total: 14900 });
    await expect(processStripeEvent(e, store)).rejects.toThrow();
    store.upsertPayment = async () => {};
    expect(await processStripeEvent(e, store)).toBe("ok");
  });
});
