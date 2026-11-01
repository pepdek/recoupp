"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

export default function Login() {
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(new URLSearchParams(location.search).get("next") ?? "/")}` } });
    setSent(true);
  }
  return (
    <main className="u-wrap-narrow u-app">
      <h1 className="u-title">Sign in</h1>
      {sent ? (
        <div className="u-alert u-alert-ok" role="status"><div><b>Check your email.</b><p>We sent you a link. Open it on this device. No password needed.</p></div></div>
      ) : (
        <form onSubmit={submit} className="u-stack">
          <label className="u-label">Your email
            <span className="u-hint">We'll send you a one-time link.</span>
            <input name="email" type="email" required autoComplete="email" className="u-input" />
          </label>
          <button className="u-btn u-btn-primary">Email me the link</button>
        </form>
      )}
    </main>
  );
}
