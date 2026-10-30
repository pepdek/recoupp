import { stripe, siteUrl } from "@/lib/stripe";
import { admin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

// Customer Portal for sponsor users: org's Stripe customer only.
export async function POST() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  if (!user) return new Response("login required", { status: 401 });
  const db = admin();
  const { data: p } = await db.from("profiles").select("org_id").eq("id", user.id).single();
  const { data: org } = p?.org_id ? await db.from("organizations").select("stripe_customer_id").eq("id", p.org_id).single() : { data: null };
  if (!org?.stripe_customer_id) return new Response("no billing account", { status: 404 });
  const s = await stripe().billingPortal.sessions.create({ customer: org.stripe_customer_id, return_url: siteUrl() });
  return Response.redirect(s.url, 303);
}
