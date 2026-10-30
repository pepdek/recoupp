import { evaluateAll } from "@/lib/engine";
import { buildFacts } from "@/lib/facts";
import { buildAnswersSheet, packetAllowed } from "@/lib/packet";
import { programs } from "@/lib/programs";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: Promise<{ program: string }> }) {
  const { program: id } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("login required", { status: 401 });
  const { data: h } = await sb.from("households").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!h || h.status !== "completed") return new Response("no completed questionnaire", { status: 404 });
  const { data: members } = await sb.from("household_members").select("*").eq("household_id", h.id).order("created_at");
  const p = programs.find((x) => x.id === id);
  if (!p || !members?.length) return new Response("not found", { status: 404 });

  const results = evaluateAll(programs, buildFacts(h, members));
  const r = results.find((x) => x.program_id === id)!;
  if (!packetAllowed(h, r)) return new Response("not available until a reviewer approves your plan", { status: 403 });

  const pdf = await buildAnswersSheet(p, r, h, members);
  await sb.rpc("log_event", { p_action: "packet.generated", p_entity: "household", p_entity_id: h.id, p_detail: { program: id, version: p.version } });
  return new Response(Buffer.from(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${id}-answers-sheet.pdf"` } });
}
