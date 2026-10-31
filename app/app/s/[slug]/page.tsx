import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export default async function SponsorLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.rpc("org_public", { p_slug: slug });
  const org = data?.[0];
  if (!org) notFound();
  await sb.rpc("log_visit", { p_slug: slug });
  return (
    <main className="mx-auto max-w-xl p-6 text-xl leading-relaxed">
      {org.logo_url?.startsWith("https://") && /* eslint-disable-next-line @next/next/no-img-element */ <img src={org.logo_url} alt={org.name} className="mb-6 max-h-20" />}
      <h1 className="text-3xl font-semibold">{org.name} has teamed up with Recoup</h1>
      <p className="mt-4">Washington has housing, food, health, utility, and tax help for older adults. Answer a few questions and we&apos;ll check which programs you may qualify for and prepare the applications. A real person reviews every result.</p>
      <a href={`/intake?org=${encodeURIComponent(slug)}`} className="mt-6 inline-block rounded bg-black px-6 py-3 text-white">Get started</a>
      <p className="mt-8 text-sm text-gray-600">Your answers are private. {org.name} sees only combined totals unless you choose to share your own results. Estimates only; not legal, tax, or financial advice; the agency makes the final decision.</p>
    </main>
  );
}
