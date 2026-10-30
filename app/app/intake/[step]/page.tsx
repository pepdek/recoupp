import { notFound, redirect } from "next/navigation";
import { STEPS } from "@/lib/intake";
import { getCtx } from "@/lib/household";
import { addMember, finishIntake, removeMember, saveStep } from "../actions";

const inputCls = "mt-1 w-full rounded border p-3 text-xl";

export default async function StepPage({ params, searchParams }: { params: Promise<{ step: string }>; searchParams: Promise<{ error?: string }> }) {
  const { step: id } = await params;
  const { error } = await searchParams;
  const { sb, household } = await getCtx(`/intake/${id}`);
  if (!household) redirect("/intake");
  if (household.status === "completed") redirect("/intake");
  const idx = STEPS.findIndex((s) => s.id === id);
  const total = STEPS.length + 1;

  if (id === "review") {
    const { data: members } = await sb.from("household_members").select("first_name, birth_year").eq("household_id", household.id);
    return (
      <main className="mx-auto max-w-xl p-6 text-xl">
        <p className="text-sm text-gray-600">Step {total} of {total}</p>
        <h1 className="mt-1 text-3xl font-semibold">Check your answers</h1>
        <p className="mt-3">{members?.map((m) => `${m.first_name} (born ${m.birth_year})`).join(", ")} · {household.city}, {household.county} County</p>
        <p className="mt-3">You can go back to any step from your email link. When you submit, a reviewer checks everything before we show you results.</p>
        <form action={finishIntake} className="mt-6"><button className="rounded bg-black px-6 py-3 text-white">Submit</button></form>
      </main>
    );
  }
  const step = STEPS[idx];
  if (!step) notFound();
  const a = (household.answers ?? {}) as Record<string, unknown>;

  const head = (
    <>
      <p className="text-sm text-gray-600">Step {idx + 1} of {total}</p>
      <h1 className="mt-1 text-3xl font-semibold">{step.title}</h1>
      {step.help && <p className="mt-2 text-gray-700">{step.help}</p>}
      {error && <p className="mt-3 text-red-700">Please check your answers and try again.</p>}
    </>
  );

  if (id === "members") {
    const { data: members } = await sb.from("household_members").select("id, first_name, birth_year").eq("household_id", household.id).order("created_at");
    return (
      <main className="mx-auto max-w-xl p-6 text-xl">
        {head}
        <ul className="mt-4 space-y-2">
          {members?.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded border p-3">
              <span>{m.first_name}, born {m.birth_year}</span>
              <form action={removeMember}><input type="hidden" name="id" value={m.id} /><button className="text-red-700 underline">Remove</button></form>
            </li>
          ))}
        </ul>
        <form action={addMember} className="mt-6 space-y-4 rounded border p-4">
          <p className="font-semibold">{members?.length ? "Add another person" : "Add the first person (the older adult)"}</p>
          <label className="block">First name<input name="first_name" required className={inputCls} /></label>
          <label className="block">Year of birth<input name="birth_year" type="number" inputMode="numeric" required className={inputCls} /></label>
          <label className="flex gap-3"><input type="checkbox" name="veteran" className="size-6" />Veteran</label>
          <label className="flex gap-3"><input type="checkbox" name="disabled" className="size-6" />Has a disability</label>
          <button className="rounded border px-5 py-2">Add person</button>
        </form>
        <form action={saveStep.bind(null, id)} className="mt-6"><button className="rounded bg-black px-6 py-3 text-white">Next</button></form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6 text-xl">
      {head}
      <form action={saveStep.bind(null, id)} className="mt-6 space-y-5">
        {step.fields.map((f) => (
          <label key={f.name} className="block">
            {f.label}
            {f.kind === "number" && <input name={f.name} type="number" inputMode="decimal" min="0" step="any" required defaultValue={String(a[f.name] ?? "")} className={inputCls} />}
            {f.kind === "text" && <input name={f.name} required defaultValue={String(a[f.name] ?? "")} className={inputCls} />}
            {f.kind === "select" && (
              <select name={f.name} required defaultValue={String(a[f.name] ?? "")} className={inputCls}>
                <option value="" disabled>Choose…</option>
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            )}
            {f.kind === "checkboxes" && (
              <span className="mt-2 block space-y-2">
                {f.options.map(([v, l]) => (
                  <span key={v} className="flex gap-3"><input type="checkbox" name={f.name} value={v} defaultChecked={(a[f.name] as string[] | undefined)?.includes(v)} className="size-6" />{l}</span>
                ))}
              </span>
            )}
            {f.kind === "number" && f.hint && <span className="block text-sm text-gray-600">{f.hint}</span>}
          </label>
        ))}
        <button className="rounded bg-black px-6 py-3 text-white">Save and continue</button>
      </form>
    </main>
  );
}
