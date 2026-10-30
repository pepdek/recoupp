"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

export default function Login() {
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    setSent(true);
  }
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {sent ? (
        <p className="mt-4 text-lg">Check your email for a sign-in link.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <label className="block text-lg">Email
            <input name="email" type="email" required className="mt-1 w-full rounded border p-3 text-lg" />
          </label>
          <button className="rounded bg-black px-5 py-3 text-lg text-white">Email me a link</button>
        </form>
      )}
    </main>
  );
}
