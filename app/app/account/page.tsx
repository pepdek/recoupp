import { getCtx } from "@/lib/household";
import { deleteMyData } from "../intake/actions";

export default async function Account() {
  const { user, household } = await getCtx("/account");
  return (
    <main className="wrap-narrow py-10">
      <h1>Your data</h1>
      <p className="mt-2">{user.email}</p>
      {household ? (
        <div className="mt-6 space-y-6">
          <p><a className="btn btn-quiet" href="/api/household/export">Download a copy (JSON)</a></p>
          <form action={deleteMyData} className="slip">
            <p className="font-bold">Delete everything</p>
            <p className="mt-1">This removes your answers and household members for good. Stripe keeps its own payment records.</p>
            <button className="btn mt-4">Delete my data</button>
          </form>
        </div>
      ) : <p className="mt-4">We don't have any answers from you yet.</p>}
    </main>
  );
}
