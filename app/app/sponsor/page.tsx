import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function SponsorHome() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/sponsor");
  const { data: p } = await sb.from("profiles").select("role, org_id").eq("id", user.id).single();
  if (p?.role === "sponsor_viewer" && p.org_id) {
    const { data: org } = await sb.from("organizations").select("slug").eq("id", p.org_id).single();
    if (org) redirect(`/sponsor/${org.slug}`);
  }
  redirect(p?.role === "admin" || p?.role === "reviewer" ? "/review" : "/");
}
