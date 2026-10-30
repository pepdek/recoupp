export default function Thanks() {
  return (
    <main className="mx-auto max-w-xl p-6 text-lg">
      <h1 className="text-3xl font-semibold">Thank you</h1>
      <p className="mt-4">Your payment was received. A receipt is on its way from Stripe.</p>
      <p className="mt-4">Next step: we&apos;ll email you a sign-in link to start your household questionnaire.</p>
      <p className="mt-6 text-sm text-gray-600">Estimates only. Not legal, tax, or financial advice. A person reviews results; the agency decides.</p>
    </main>
  );
}
