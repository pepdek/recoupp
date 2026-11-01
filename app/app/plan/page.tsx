import { redirect } from "next/navigation";
import Link from "next/link";
import { getCtx } from "@/lib/household";
import { programs } from "@/lib/programs";
import { effectiveValue, isRecommended, type Evaluation } from "@/lib/review";
import Icon from "@/components/Icon";
import { Claim, Status } from "@/components/v4";
import { money } from "@/components/ui";
import Counter from "@/components/Counter";
import { markClaim } from "./actions";

export default async function Plan() {
  const { sb, household } = await getCtx("/plan");
  if (!household) redirect("/intake");
  if (!household.reviewed_at) {
    return (
      <main className="u-wrap-narrow u-app">
        <p><Status s="waiting" /></p>
        <h1 className="u-title">A person is checking your answers.</h1>
        <p>We look at every result before you see it, so the number you get is one you can trust. We'll email you when it's ready.</p>
        <p><Link href="/documents">Add documents while you wait</Link></p>
      </main>
    );
  }
  const [{ data: evs }, { data: claims }] = await Promise.all([
    sb.from("evaluations").select("*").eq("household_id", household.id),
    sb.from("claims").select("*").eq("household_id", household.id),
  ]);
  const items = ((evs ?? []) as Evaluation[]).filter(isRecommended).sort((a, b) => (effectiveValue(b) ?? 0) - (effectiveValue(a) ?? 0));
  const total = items.reduce((s, e) => s + (effectiveValue(e) ?? 0), 0);
  const range = items.reduce((r, e) => (e.override_value_likely != null ? { lo: r.lo + (effectiveValue(e) ?? 0), hi: r.hi + (effectiveValue(e) ?? 0) } : { lo: r.lo + (e.value?.low ?? effectiveValue(e) ?? 0), hi: r.hi + (e.value?.high ?? effectiveValue(e) ?? 0) }), { lo: 0, hi: 0 });
  const next = items.find((e) => { const c = claims?.find((x) => x.program_id === e.program_id); return !c || c.status === "recommended" || c.status === "prepared"; });
  return (
    <main className="u-wrap-narrow u-app">
      <section className="u-card u-raised u-stack" aria-labelledby="total">
        <p id="total" className="u-small u-muted">Your plan</p>
        {items.length ? (
          <>
            <p className="u-figure"><Counter to={Math.round(total)} /></p>
            <p style={{ fontSize: "var(--fs-h3)", fontWeight: 600 }}>a year we think you may be owed.</p>
            <p>{range.hi > range.lo ? `Our range is ${money(range.lo)} to ${money(range.hi)}. ` : ""}These are estimates. Each agency decides, and a person on our team checked every one below.</p>
          </>
        ) : (
          <>
            <h1 className="u-title">Nothing to apply for right now.</h1>
            <p>We checked every program and none fit your answers today. If anything changes, like income, bills or who lives at home, tell us and we'll check again.</p>
          </>
        )}
      </section>

      {next && (
        <section className="u-card u-row" style={{ justifyContent: "space-between" }} aria-label="First step">
          <div><p className="u-small u-muted">Do this first</p><h2 style={{ fontSize: "var(--fs-h3)" }}>{programs.find((p) => p.id === next.program_id)?.name ?? next.program_id}</h2></div>
          <div className="u-row">
            <a className="u-btn u-btn-primary" href={`/api/packet/${next.program_id}`}><Icon name="download" size={20} />Get the filled-in sheet</a>
            <Link className="u-btn u-btn-secondary" href="/track">Track my claims</Link>
          </div>
        </section>
      )}

      <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
        {items.map((e) => {
          const p = programs.find((x) => x.id === e.program_id), c = claims?.find((x) => x.program_id === e.program_id), v = effectiveValue(e);
          const rng = v != null && e.override_value_likely == null && e.value && e.value.low !== e.value.high;
          return (
            <li key={e.id} className="u-card u-stack">
              <div className="u-row" style={{ justifyContent: "space-between" }}>
                <h2 style={{ fontSize: "var(--fs-h3)" }}>{p?.name ?? e.program_id}</h2>
                {c && <Claim status={c.status} />}
              </div>
              <p className="u-num" style={{ fontSize: "var(--fs-h2)", fontWeight: 700 }}>{v == null ? "No number yet" : rng ? `${money(e.value!.low)} to ${money(e.value!.high)}` : `About ${money(v)}`}{v != null && <span className="u-small u-muted" style={{ fontWeight: 400 }}> a year</span>}</p>
              <p>{e.reason}</p>
              {e.reviewer_note && <p className="u-small"><b>Note from your reviewer:</b> {e.reviewer_note}</p>}
              <div className="u-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--sp-2)", gap: "var(--sp-1) var(--sp-3)" }}>
                <a href={`/api/packet/${e.program_id}`}>Answers sheet (PDF)</a>
                {p && <a href={p.application.url} target="_blank" rel="noreferrer">Where to apply</a>}
                {c?.status === "recommended" && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="prepared" /><button className="u-linkbtn">I filled it out</button></form>}
                {c && (c.status === "recommended" || c.status === "prepared") && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="submitted" /><button className="u-linkbtn">I sent it in</button></form>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="u-small u-muted"><Link href="/documents">Add documents</Link> · Estimates only. Not legal, tax or financial advice.</p>
    </main>
  );
}
