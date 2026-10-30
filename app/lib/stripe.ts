import Stripe from "stripe";

// Test mode unless STRIPE_LIVE=true. Keys are read lazily so builds work without them.
export const live = () => process.env.STRIPE_LIVE === "true";
const pick = (base: string) => process.env[`${base}_${live() ? "LIVE" : "TEST"}`] ?? "";

export const stripe = () => new Stripe(pick("STRIPE_SECRET_KEY"));
export const webhookSecret = () => pick("STRIPE_WEBHOOK_SECRET");
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
