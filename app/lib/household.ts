import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";

// RLS-scoped client + the signed-in user's most recent household (if any).
export async function getCtx(next: string) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const { data: household } = await sb.from("households").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { sb, user, household };
}
