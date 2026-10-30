import { createClient } from "@supabase/supabase-js";

// Service role: server only, bypasses RLS. Used by webhooks and admin scripts.
export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
