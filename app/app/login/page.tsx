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
    <main className="wrap-narrow py-10">
      <h1>Sign in</h1>
      {sent ? (
        <div className="ticket mt-6"><p className="font-bold">Check your email.</p><p>We sent you a link. Open it on this device. No password needed.</p></div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="field">Your email
            <span className="hint">We'll send you a one-time link.</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>
          <button className="btn">Email me the link</button>
        </form>
      )}
    </main>
  );
}
