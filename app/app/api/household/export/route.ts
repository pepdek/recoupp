import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("login required", { status: 401 });
  const { data: h } = await sb.from("households").select("*").eq("owner_id", user.id);
  const ids = (h ?? []).map((x) => x.id);
  const [members, consents] = await Promise.all([
    sb.from("household_members").select("*").in("household_id", ids),
    sb.from("consents").select("*").in("household_id", ids),
  ]);
  await sb.rpc("log_event", { p_action: "household.exported", p_entity: "user", p_entity_id: user.id });
  return new Response(JSON.stringify({ households: h, members: members.data, consents: consents.data }, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="my-data.json"' },
  });
}
