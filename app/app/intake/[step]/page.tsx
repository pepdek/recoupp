import { notFound, redirect } from "next/navigation";
import { STEPS } from "@/lib/intake";
import { getCtx } from "@/lib/household";
import { Steps4 } from "@/components/v4";
import { addMember, finishIntake, removeMember, saveStep } from "../actions";

export default async function StepPage({ params, searchParams }: { params: Promise<{ step: string }>; searchParams: Promise<{ error?: string }> }) {
  const { step: id } = await params;
  const { error } = await searchParams;
  const { sb, household } = await getCtx(`/intake/${id}`);
  if (!household) redirect("/intake");
  if (household.status === "completed") redirect("/intake");
  const idx = STEPS.findIndex((s) => s.id === id);
  const total = STEPS.length + 1;
  const note = <p className="u-small u-muted">Your answers save when you tap the button. Close this page any time and use your email link to come back. We'll show your number after a person checks your answers.</p>;

  if (id === "review") {
    const { data: members } = await sb.from("household_members").select("first_name, birth_year").eq("household_id", household.id);
    return (
      <main className="u-wrap-narrow u-app">
        <Steps4 total={total} current={total} />
        <h1 className="u-title">Look it over</h1>
        <div className="u-card">
          <p><b>{members?.map((m) => `${m.first_name} (born ${m.birth_year})`).join(", ")}</b></p>
          <p>{household.city}, {household.county} County</p>
        </div>
        <p>Want to change something? Use the link in your email to go back to any step. When you send it in, a reviewer checks everything before you see results.</p>
        <form action={finishIntake}><button className="u-btn u-btn-primary">Send it in</button></form>
        {note}
      </main>
    );
  }
  const step = STEPS[idx];
  if (!step) notFound();
  const a = (household.answers ?? {}) as Record<string, unknown>;

  const head = (
    <>
      <Steps4 total={total} current={idx + 1} />
      <h1 className="u-title">{step.title}</h1>
      {step.help && <p>{step.help}</p>}
      {error && <p role="alert" className="u-error">Something doesn't look right. Please check your answers and try again.</p>}
    </>
  );

  if (id === "members") {
    const { data: members } = await sb.from("household_members").select("id, first_name, birth_year").eq("household_id", household.id).order("created_at");
    return (
      <main className="u-wrap-narrow u-app">
        {head}
        <ul className="u-stack" style={{ listStyle: "none", padding: 0 }}>
          {members?.map((m) => (
            <li key={m.id} className="u-card u-row" style={{ justifyContent: "space-between" }}>
              <b>{m.first_name}, born {m.birth_year}</b>
              <form action={removeMember}><input type="hidden" name="id" value={m.id} /><button className="u-linkbtn">Remove</button></form>
            </li>
          ))}
        </ul>
        <form action={addMember} className="u-card u-stack">
          <h2 style={{ fontSize: "var(--fs-h3)" }}>{members?.length ? "Add another person" : "Add the first person (the older adult)"}</h2>
          <label className="u-label">First name<input name="first_name" required autoComplete="given-name" className="u-input" /></label>
          <label className="u-label">Year of birth<input name="birth_year" type="number" inputMode="numeric" required className="u-input" /></label>
          <label className="u-choice"><input type="checkbox" name="veteran" />Veteran</label>
          <label className="u-choice"><input type="checkbox" name="disabled" />Has a disability</label>
          <button className="u-btn u-btn-secondary">Add person</button>
        </form>
        <form action={saveStep.bind(null, id)}><button className="u-btn u-btn-primary">Next</button></form>
        {note}
      </main>
    );
  }

  return (
    <main className="u-wrap-narrow u-app">
      {head}
      <form action={saveStep.bind(null, id)} className="u-stack">
        {step.fields.map((f) =>
          f.kind === "checkboxes" ? (
            <fieldset key={f.name} className="u-step-q u-stack">
              <legend>{f.label}</legend>
              {f.options.map(([v, l]) => (
                <label key={v} className="u-choice"><input type="checkbox" name={f.name} value={v} defaultChecked={(a[f.name] as string[] | undefined)?.includes(v)} />{l}</label>
              ))}
            </fieldset>
          ) : (
            <label key={f.name} className="u-label">
              {f.label}
              {f.kind === "number" && f.hint && <span className="u-hint">{f.hint}</span>}
              {f.kind === "number" && <input name={f.name} type="number" inputMode="decimal" min="0" step="any" required defaultValue={String(a[f.name] ?? "")} className="u-input" />}
              {f.kind === "text" && <input name={f.name} required defaultValue={String(a[f.name] ?? "")} className="u-input" />}
              {f.kind === "select" && (
                <select name={f.name} required defaultValue={String(a[f.name] ?? "")} className="u-input">
                  <option value="" disabled>Choose one</option>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
            </label>
          ),
        )}
        <button className="u-btn u-btn-primary">Save and go on</button>
      </form>
      {note}
    </main>
  );
}
