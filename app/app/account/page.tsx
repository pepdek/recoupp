import { getCtx } from "@/lib/household";
import { deleteMyData } from "../intake/actions";

export default async function Account() {
  const { user, household } = await getCtx("/account");
  return (
    <main className="u-wrap-narrow u-app">
      <h1 className="u-title">Your data</h1>
      <p className="u-muted">{user.email}</p>
      <nav aria-label="Your pages" className="u-row"><a href="/plan">Your plan</a><a href="/track">Track claims</a><a href="/documents">Documents</a></nav>
      {household ? (
        <>
          <p><a className="u-btn u-btn-secondary" href="/api/household/export">Download a copy (JSON)</a></p>
          <form action={deleteMyData} className="u-card u-stack">
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Delete everything</h2>
            <p>This removes your answers and household members for good. Stripe keeps its own payment records.</p>
            <button className="u-btn u-btn-secondary">Delete my data</button>
          </form>
        </>
      ) : <div className="u-empty">We don't have any answers from you yet.</div>}
    </main>
  );
}
