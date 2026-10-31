import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).maybeSingle(); // RLS scopes to your org
  if (!org) return new Response("not found", { status: 404 });
  const svg = await QRCode.toString(`${new URL(req.url).origin}/s/${slug}`, { type: "svg", margin: 1 });
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "private, max-age=3600" } });
}
