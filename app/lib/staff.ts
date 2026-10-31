import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";

/** Admin or reviewer only; everyone else is sent home. RLS enforces the same on the data. */
export async function requireStaff() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/review");
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin" && p?.role !== "reviewer") redirect("/");
  return { sb, user, role: p.role as "admin" | "reviewer" };
}
