import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";

export default async function SponsorLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.rpc("org_public", { p_slug: slug });
  const org = data?.[0];
  if (!org) notFound();
  await sb.rpc("log_visit", { p_slug: slug });
  return (
    <main className="u-wrap-narrow u-app">
      {org.logo_url?.startsWith("https://") && /* eslint-disable-next-line @next/next/no-img-element */ <img src={org.logo_url} alt={org.name} style={{ maxHeight: "5rem" }} />}
      <h1 className="u-title">{org.name} wants you to check this.</h1>
      <p>Washington has help with food, health costs, bills and taxes for older adults. Many people who qualify never apply. Answer some questions and we'll check, then fill in the paperwork. A real person reviews every result.</p>
      <p><a href={`/intake?org=${encodeURIComponent(slug)}`} className="u-btn u-btn-primary u-btn-lg">Start now</a></p>
      <div className="u-alert u-alert-info u-small"><div><b>Your answers are private.</b>
        <p>{org.name} sees combined totals only, unless you choose to share your own results. {BRAND} gives estimates, not legal, tax or financial advice. Each agency makes the final decision.</p>
      </div></div>
    </main>
  );
}
