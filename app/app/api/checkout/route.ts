import { stripe, siteUrl } from "@/lib/stripe";

// Offer B: $149 Family Benefits Recovery Report. No card data touches us.
export async function POST() {
  const s = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd", unit_amount: 14900,
        product_data: {
          name: "Family Benefits Recovery Report",
          description: "WA benefits eligibility check, prepared packets, 90 days of deadline tracking. Refund if under $1,000/yr in likely benefits identified.",
        },
      },
    }],
    metadata: { offer: "B" },
    success_url: `${siteUrl()}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/`,
  });
  return Response.redirect(s.url!, 303);
}
