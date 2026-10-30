import { getCtx } from "@/lib/household";
import { deleteMyData } from "../intake/actions";

export default async function Account() {
  const { user, household } = await getCtx("/account");
  return (
    <main className="mx-auto max-w-xl p-6 text-xl">
      <h1 className="text-3xl font-semibold">Your data</h1>
      <p className="mt-2 text-gray-700">{user.email}</p>
      {household ? (
        <div className="mt-6 space-y-6">
          <a className="underline" href="/api/household/export">Download a copy (JSON)</a>
          <form action={deleteMyData}>
            <p>Deleting removes your answers and household members permanently. Payment records are kept by Stripe.</p>
            <button className="mt-3 rounded border border-red-700 px-5 py-2 text-red-700">Delete my data</button>
          </form>
        </div>
      ) : <p className="mt-4">We have no questionnaire data for you.</p>}
    </main>
  );
}
