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
      <main className="wrap-narrow py-10">
        <h1>You're done with the questions</h1>
        <p className="mt-4">A reviewer is checking your answers. We'll email you when your plan is ready.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link className="btn" href="/plan">See my plan</Link>
          <Link className="btn btn-quiet" href="/documents">Add documents</Link>
        </div>
        <p className="mt-6"><Link href="/account">Download or delete my data</Link></p>
      </main>
    );
  }
  return (
    <main className="wrap-narrow py-10">
      <h1>Before we start</h1>
      {sponsor && <p className="mt-3 font-bold">You're signing up through {sponsor.name}.</p>}
      <dl className="slip mt-6 space-y-4">
        <div><dt className="font-bold">What we ask</dt><dd>Who lives at home and their ages, income, savings, housing and bills, health coverage, and help you already get. Never your Social Security number.</dd></div>
        <div><dt className="font-bold">Why</dt><dd>To check which programs you may qualify for and fill in your paperwork.</dd></div>
        <div><dt className="font-bold">Who sees it</dt><dd>You and our review team. No one else, unless you say so.</dd></div>
        <div><dt className="font-bold">Delete it</dt><dd>Any time, from your account page. You can download a copy too.</dd></div>
      </dl>
      <form action={startIntake} className="mt-8 space-y-6">
        <input type="hidden" name="org" value={sponsor ? org : ""} />
        <label className="field">Who is filling this out?
          <select name="relationship" className="input" defaultValue="self">
            <option value="self">Me, for myself</option>
            <option value="family">A family member helping</option>
            <option value="caseworker">A caseworker helping</option>
            <option value="other">Someone else</option>
          </select>
        </label>
        <label className="check items-start"><input type="checkbox" name="consent" className="mt-1" />
          <span>I agree to the above. I want you to use my answers to check which programs I may qualify for. If I'm helping someone, they asked me to.</span>
        </label>
        {sponsor && (
          <label className="check items-start"><input type="checkbox" name="share" className="mt-1" />
            <span>Optional: let {sponsor.name} see my own results. Leave this empty and they see only combined totals.</span>
          </label>
        )}
        {error && <p role="alert" className="err">Please tick the first box to go on.</p>}
        <button className="btn">Go on</button>
      </form>
    </main>
  );
}
