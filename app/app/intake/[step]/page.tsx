import { notFound, redirect } from "next/navigation";
import { STEPS } from "@/lib/intake";
import { getCtx } from "@/lib/household";
import { Strip } from "@/components/ui";
import { addMember, finishIntake, removeMember, saveStep } from "../actions";

export default async function StepPage({ params, searchParams }: { params: Promise<{ step: string }>; searchParams: Promise<{ error?: string }> }) {
  const { step: id } = await params;
  const { error } = await searchParams;
  const { sb, household } = await getCtx(`/intake/${id}`);
  if (!household) redirect("/intake");
  if (household.status === "completed") redirect("/intake");
  const idx = STEPS.findIndex((s) => s.id === id);
  const total = STEPS.length + 1;
  const note = <p className="slip small mt-8">Your answers save when you tap the button. Close this page any time and use your email link to come back. We'll show your number after a person checks your answers.</p>;

  if (id === "review") {
    const { data: members } = await sb.from("household_members").select("first_name, birth_year").eq("household_id", household.id);
    return (
      <main className="wrap-narrow py-8">
        <Strip total={total} current={total} />
        <h1 className="mt-6">Look it over</h1>
        <div className="ticket mt-6">
          <p className="font-bold">{members?.map((m) => `${m.first_name} (born ${m.birth_year})`).join(", ")}</p>
          <p>{household.city}, {household.county} County</p>
        </div>
        <p className="mt-4">Want to change something? Use the link in your email to go back to any step. When you send it in, a reviewer checks everything before you see results.</p>
        <form action={finishIntake} className="mt-6"><button className="btn">Send it in</button></form>
        {note}
      </main>
    );
  }
  const step = STEPS[idx];
  if (!step) notFound();
  const a = (household.answers ?? {}) as Record<string, unknown>;

  const head = (
    <>
      <Strip total={total} current={idx + 1} />
      <h1 className="mt-6">{step.title}</h1>
      {step.help && <p className="mt-3">{step.help}</p>}
      {error && <p role="alert" className="err mt-4">Something doesn't look right. Please check your answers and try again.</p>}
    </>
  );

  if (id === "members") {
    const { data: members } = await sb.from("household_members").select("id, first_name, birth_year").eq("household_id", household.id).order("created_at");
    return (
      <main className="wrap-narrow py-8">
        {head}
        <ul className="mt-6 space-y-3">
          {members?.map((m) => (
            <li key={m.id} className="ticket flex items-center justify-between gap-3">
              <span className="font-bold">{m.first_name}, born {m.birth_year}</span>
              <form action={removeMember}><input type="hidden" name="id" value={m.id} /><button className="linkbtn">Remove</button></form>
            </li>
          ))}
        </ul>
        <form action={addMember} className="slip mt-6 space-y-5">
          <h2 className="!text-[1.5rem]">{members?.length ? "Add another person" : "Add the first person (the older adult)"}</h2>
          <label className="field">First name<input name="first_name" required autoComplete="given-name" className="input" /></label>
          <label className="field">Year of birth<input name="birth_year" type="number" inputMode="numeric" required className="input" /></label>
          <label className="check"><input type="checkbox" name="veteran" />Veteran</label>
          <label className="check"><input type="checkbox" name="disabled" />Has a disability</label>
          <button className="btn btn-quiet">Add person</button>
        </form>
        <form action={saveStep.bind(null, id)} className="mt-6"><button className="btn">Next</button></form>
        {note}
      </main>
    );
  }

  return (
    <main className="wrap-narrow py-8">
      {head}
      <form action={saveStep.bind(null, id)} className="mt-6 space-y-6">
        {step.fields.map((f) =>
          f.kind === "checkboxes" ? (
            <fieldset key={f.name}>
              <legend className="font-bold">{f.label}</legend>
              <div className="mt-2">
                {f.options.map(([v, l]) => (
                  <label key={v} className="check"><input type="checkbox" name={f.name} value={v} defaultChecked={(a[f.name] as string[] | undefined)?.includes(v)} />{l}</label>
                ))}
              </div>
            </fieldset>
          ) : (
            <label key={f.name} className="field">
              {f.label}
              {f.kind === "number" && f.hint && <span className="hint">{f.hint}</span>}
              {f.kind === "number" && <input name={f.name} type="number" inputMode="decimal" min="0" step="any" required defaultValue={String(a[f.name] ?? "")} className="input" />}
              {f.kind === "text" && <input name={f.name} required defaultValue={String(a[f.name] ?? "")} className="input" />}
              {f.kind === "select" && (
                <select name={f.name} required defaultValue={String(a[f.name] ?? "")} className="input">
                  <option value="" disabled>Choose one</option>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
            </label>
          ),
        )}
        <button className="btn">Save and go on</button>
      </form>
      {note}
    </main>
  );
}
