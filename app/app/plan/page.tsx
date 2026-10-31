import { redirect } from "next/navigation";
import Link from "next/link";
import { getCtx } from "@/lib/household";
import { programs } from "@/lib/programs";
import { effectiveValue, isRecommended, type Evaluation } from "@/lib/review";
import { Icon, Pill, money } from "@/components/ui";
import Counter from "@/components/Counter";
import { markClaim } from "./actions";

export default async function Plan() {
  const { sb, household } = await getCtx("/plan");
  if (!household) redirect("/intake");
  if (!household.reviewed_at) {
    return (
      <main className="wrap-narrow">
        <p><span className="pill pill-amber"><Icon name="clock" size={16} />In review</span></p>
        <h1 className="mt-4">A person is checking your answers.</h1>
        <p className="mt-4">We look at every result before you see it, so the number you get is one you can trust. We'll email you when it's ready.</p>
        <p className="mt-4"><Link href="/documents">Add documents while you wait</Link></p>
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
    <main className="wrap py-8">
      {/* Signature: the luminous balance. It counts up, settles, and the glass catches the light. */}
      <section className="glass pad pulse" aria-labelledby="total">
        <p id="total" className="small font-bold">Your plan</p>
        {items.length ? (
          <>
            <p className="bignum mt-1"><Counter to={Math.round(total)} /></p>
            <p className="display text-[1.75rem] leading-tight md:text-[2.4rem]">a year we think you may be <em>owed</em>.</p>
            <p className="mt-3 max-w-xl">{range.hi > range.lo ? `Our range is ${money(range.lo)} to ${money(range.hi)}. ` : ""}These are estimates. Each agency decides, and a person on our team checked every one below.</p>
          </>
        ) : (
          <>
            <h1 className="mt-2">Nothing to apply for right now.</h1>
            <p className="mt-3 max-w-xl">We checked every program and none fit your answers today. If anything changes, like income, bills or who lives at home, tell us and we'll check again.</p>
          </>
        )}
      </section>

      {next && (
        <section className="glass pad mt-6 md:flex md:items-center md:justify-between md:gap-6" aria-label="First step">
          <div><p className="small font-bold">Do this first</p><p className="display mt-1 text-3xl">{programs.find((p) => p.id === next.program_id)?.name ?? next.program_id}</p></div>
          <p className="mt-4 flex flex-wrap gap-3 md:mt-0">
            <a className="btn" href={`/api/packet/${next.program_id}`}><Icon name="download" />Get the filled-in sheet</a>
            <Link className="btn btn-quiet" href="/track">Track my claims</Link>
          </p>
        </section>
      )}

      {/* Bento: the biggest program gets the wide tile; the rest sit unevenly around it */}
      <ul className="mt-6 grid gap-5 md:grid-cols-6">
        {items.map((e, i) => {
          const p = programs.find((x) => x.id === e.program_id), c = claims?.find((x) => x.program_id === e.program_id), v = effectiveValue(e);
          const rng = v != null && e.override_value_likely == null && e.value && e.value.low !== e.value.high;
          const span = i === 0 ? "md:col-span-6" : i % 3 === 1 ? "md:col-span-4" : "md:col-span-2";
          return (
            <li key={e.id} className={`ticket ${span}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="!text-[1.75rem]">{p?.name ?? e.program_id}</h2>
                {c && <Pill status={c.status} down={c.status === "approved"} />}
              </div>
              <p className="display mt-3 text-4xl leading-none">{v == null ? "No number yet" : rng ? `${money(e.value!.low)} to ${money(e.value!.high)}` : `About ${money(v)}`}{v != null && <span className="small ml-2 font-sans">a year</span>}</p>
              <p className="mt-3">{e.reason}</p>
              {e.reviewer_note && <p className="small mt-2"><b>Note from your reviewer:</b> {e.reviewer_note}</p>}
              <hr className="perf my-4" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <a href={`/api/packet/${e.program_id}`}>Answers sheet (PDF)</a>
                {p && <a href={p.application.url} target="_blank" rel="noreferrer">Where to apply</a>}
                {c?.status === "recommended" && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="prepared" /><button className="linkbtn">I filled it out</button></form>}
                {c && (c.status === "recommended" || c.status === "prepared") && <form action={markClaim}><input type="hidden" name="claim_id" value={c.id} /><input type="hidden" name="status" value="submitted" /><button className="linkbtn">I sent it in</button></form>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="small mt-8 inline-block rounded-full bg-white/85 px-4 py-2"><Link href="/documents">Add documents</Link> · Estimates only. Not legal, tax or financial advice.</p>
    </main>
  );
}
