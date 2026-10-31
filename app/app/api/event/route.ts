import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Funnel counter. Accepts only a fixed list of event names and a short page path; stores nothing else.
// ponytail: no per-IP rate limit; add one (or a bot filter) if the counts get noisy.
const Body = z.object({ name: z.enum(["page_view", "cta_click", "check_start", "check_complete", "checkout_start"]), page: z.string().max(80).default("/") });
export async function POST(req: Request) {
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return new Response(null, { status: 400 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  await sb.rpc("log_site_event", { p_name: b.data.name, p_page: b.data.page });
  return new Response(null, { status: 204 });
}
