import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";

export async function requireAdmin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") redirect("/");
  return { sb, user };
}
