const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6 text-lg leading-relaxed">
      <h1 className="text-4xl font-semibold">Find the benefits you or your parent are missing</h1>
      <p className="mt-4">
        Washington has housing, food, health, utility, and tax help for older adults. We check every program, prepare the
        applications, and track them through approval and renewal.
      </p>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-2xl font-semibold">Family Benefits Recovery Report — $149</h2>
        <ul className="mt-3 list-disc pl-6">
          <li>Eligibility check across Washington programs, ranked by yearly dollar value</li>
          <li>Prefilled application packets and a plain-language document checklist</li>
          <li>90 days of deadline and renewal tracking</li>
          <li>Full refund if we don&apos;t find at least $1,000/year in likely benefits</li>
        </ul>
        <form action="/api/checkout" method="post" className="mt-4">
          <button className="rounded bg-black px-6 py-3 text-white">Buy the report</button>
        </form>
      </section>

      <section className="mt-6 rounded border p-5">
        <h2 className="text-2xl font-semibold">For senior-serving organizations</h2>
        <p className="mt-2">Founding Sponsor Pilot: 100 households, with a recovered-income guarantee and your own branded enrollment link.</p>
        {contact && <a className="mt-3 inline-block underline" href={`mailto:${contact}?subject=Founding Sponsor Pilot`}>Talk to us</a>}
      </section>

      <p className="mt-8 text-sm text-gray-600">
        Estimates only. Not legal, tax, or financial advice. A person reviews results and the agency makes the final decision.
      </p>
    </main>
  );
}
