import { reportCsv, reportPdf, type Stats } from "@/lib/report";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (!org) return new Response("not found", { status: 404 });
  const { data, error } = await sb.rpc("sponsor_stats", { p_org: org.id });
  if (error || !data) return new Response("not allowed", { status: 403 });
  const asof = new Date().toISOString().slice(0, 10);
  const csv = new URL(req.url).searchParams.get("format") === "csv";
  await sb.rpc("log_event", { p_action: "sponsor.report_exported", p_entity: "organization", p_entity_id: org.id, p_detail: { format: csv ? "csv" : "pdf" } });
  const body = csv ? reportCsv(data as Stats, asof) : Buffer.from(await reportPdf(data as Stats, asof));
  return new Response(body, { headers: { "content-type": csv ? "text/csv" : "application/pdf", "content-disposition": `attachment; filename="${slug}-report-${asof}.${csv ? "csv" : "pdf"}"` } });
}
