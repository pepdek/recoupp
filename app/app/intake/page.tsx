import { redirect } from "next/navigation";
import Link from "next/link";
import { getCtx } from "@/lib/household";
import { startIntake } from "./actions";

export default async function Intake({ searchParams }: { searchParams: Promise<{ error?: string; org?: string }> }) {
  const { error, org } = await searchParams;
  const { sb, household } = await getCtx(`/intake${org ? `?org=${encodeURIComponent(org)}` : ""}`);
  const sponsor = org ? (await sb.rpc("org_public", { p_slug: org })).data?.[0] : null;
  if (household?.status === "in_progress") redirect(`/intake/${household.step}`);
  if (household) {
    return (
      <main className="u-wrap-narrow u-app">
        <h1 className="u-title">You're done with the questions</h1>
        <p>A reviewer is checking your answers. We'll email you when your plan is ready.</p>
        <div className="u-row">
          <Link className="u-btn u-btn-primary" href="/plan">See my plan</Link>
          <Link className="u-btn u-btn-secondary" href="/documents">Add documents</Link>
        </div>
        <p><Link href="/account">Download or delete my data</Link></p>
      </main>
    );
  }
  return (
    <main className="u-wrap-narrow u-app">
      <h1 className="u-title">Before we start</h1>
      {sponsor && <p><b>You're signing up through {sponsor.name}.</b></p>}
      <dl className="u-card u-stack">
        <div><dt style={{ fontWeight: 600 }}>What we ask</dt><dd>Who lives at home and their ages, income, savings, housing and bills, health coverage, and help you already get. Never your Social Security number.</dd></div>
        <div><dt style={{ fontWeight: 600 }}>Why</dt><dd>To check which programs you may qualify for and fill in your paperwork.</dd></div>
        <div><dt style={{ fontWeight: 600 }}>Who sees it</dt><dd>You and our review team. No one else, unless you say so.</dd></div>
        <div><dt style={{ fontWeight: 600 }}>Delete it</dt><dd>Any time, from your account page. You can download a copy too.</dd></div>
      </dl>
      <form action={startIntake} className="u-stack">
        <input type="hidden" name="org" value={sponsor ? org : ""} />
        <label className="u-label">Who is filling this out?
          <select name="relationship" className="u-input" defaultValue="self">
            <option value="self">Me, for myself</option>
            <option value="family">A family member helping</option>
            <option value="caseworker">A caseworker helping</option>
            <option value="other">Someone else</option>
          </select>
        </label>
        <label className="u-choice"><input type="checkbox" name="consent" />
          <span>I agree to the above. I want you to use my answers to check which programs I may qualify for. If I'm helping someone, they asked me to.</span>
        </label>
        {sponsor && (
          <label className="u-choice"><input type="checkbox" name="share" />
            <span>Optional: let {sponsor.name} see my own results. Leave this empty and they see only combined totals.</span>
          </label>
        )}
        {error && <p role="alert" className="u-error">Please tick the first box to go on.</p>}
        <button className="u-btn u-btn-primary">Go on</button>
      </form>
    </main>
  );
}
