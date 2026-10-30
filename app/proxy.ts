import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps the Supabase session cookie fresh; auth gating happens in pages.
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (all) => {
        all.forEach((c) => req.cookies.set(c.name, c.value));
        res = NextResponse.next({ request: req });
        all.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      },
    },
  });
  await sb.auth.getUser();
  return res;
}

export const config = { matcher: ["/intake/:path*", "/account/:path*", "/api/household/:path*", "/api/portal"] };
