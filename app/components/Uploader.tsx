"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerDocument } from "@/app/documents/actions";

const OK = ["application/pdf", "image/jpeg", "image/png"];

export default function Uploader({ householdId, kinds }: { householdId: string; kinds: readonly (readonly [string, string])[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, fd = new FormData(form), file = fd.get("file") as File;
    if (!file?.size) return setMsg("Choose a file first.");
    if (!OK.includes(file.type)) return setMsg("Please use a PDF, JPG or PNG.");
    if (file.size > 10 * 1024 * 1024) return setMsg("That file is over 10 MB.");
    setBusy(true); setMsg("");
    try {
      const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const path = `${householdId}/${crypto.randomUUID()}.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg"}`;
      const up = await sb.storage.from("documents").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      await registerDocument({ path, kind: fd.get("kind"), filename: file.name, mime: file.type, size: file.size });
      form.reset(); router.refresh();
    } catch { setMsg("Upload failed. Please try again."); }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded border p-4">
      <label className="block">What is it?
        <select name="kind" className="mt-1 w-full rounded border p-3 text-xl">{kinds.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </label>
      <input name="file" type="file" accept="application/pdf,image/jpeg,image/png" className="block w-full text-lg" />
      <button disabled={busy} className="rounded bg-black px-6 py-3 text-white disabled:opacity-50">{busy ? "Uploading…" : "Upload"}</button>
      {msg && <p className="text-red-700">{msg}</p>}
    </form>
  );
}
