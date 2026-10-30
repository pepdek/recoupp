import { redirect } from "next/navigation";
import Link from "next/link";
import { getCtx } from "@/lib/household";
import { startIntake } from "./actions";

export default async function Intake({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { household } = await getCtx("/intake");
  if (household?.status === "in_progress") redirect(`/intake/${household.step}`);
  if (household) {
    return (
      <main className="mx-auto max-w-xl p-6 text-xl">
        <h1 className="text-3xl font-semibold">Your questionnaire is complete</h1>
        <p className="mt-4">A reviewer will check your results. We&apos;ll email you when your plan is ready.</p>
        <Link className="mt-6 inline-block underline" href="/account">Download or delete my data</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-xl p-6 text-xl leading-relaxed">
      <h1 className="text-3xl font-semibold">Before we start</h1>
      <div className="mt-4 space-y-3">
        <p><b>What we ask:</b> household members and ages, income, savings, housing and bill costs, health coverage, and benefits you already get. We never ask for your Social Security number.</p>
        <p><b>Why:</b> to check which programs you may qualify for and prepare your applications.</p>
        <p><b>Who sees it:</b> you and our review team. No one else sees it unless you tell us they can.</p>
        <p><b>Delete anytime:</b> from your account page, or by emailing us. You can also download a copy.</p>
      </div>
      <form action={startIntake} className="mt-6 space-y-5">
        <label className="block">Who is filling this out?
          <select name="relationship" className="mt-1 w-full rounded border p-3" defaultValue="self">
            <option value="self">I&apos;m answering for myself</option>
            <option value="family">I&apos;m a family member helping</option>
            <option value="caseworker">I&apos;m a caseworker helping</option>
            <option value="other">Someone else</option>
          </select>
        </label>
        <label className="flex gap-3"><input type="checkbox" name="consent" className="mt-2 size-6" />
          <span>I agree to the above and want Recoup to use my answers to check my eligibility. (If I&apos;m helping someone, they&apos;ve asked me to.)</span>
        </label>
        {error && <p className="text-red-700">Please check the box to continue.</p>}
        <button className="rounded bg-black px-6 py-3 text-white">Continue</button>
      </form>
      <p className="mt-8 text-sm text-gray-600">Estimates only. Not legal, tax, or financial advice. A person reviews results; the agency decides.</p>
    </main>
  );
}
