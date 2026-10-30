import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) await (await supabaseServer()).auth.exchangeCodeForSession(code);
  const next = url.searchParams.get("next") ?? "/";
  // same-origin paths only
  return Response.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/", url.origin), 303);
}
