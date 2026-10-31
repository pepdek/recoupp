export default function Thanks() {
  return (
    <main className="wrap-narrow py-10">
      <p><span className="stamp stamp-forest stamp-down">Paid</span></p>
      <h1 className="mt-4">Got it. Thank you.</h1>
      <p className="mt-4">Stripe is emailing your receipt.</p>
      <div className="ticket mt-6">
        <p className="font-bold">Next step</p>
        <p>Check your email. We're sending a sign-in link so you can start the questions. It takes about 15 minutes, and you can stop and come back.</p>
      </div>
      <p className="small mt-6">Remember: if we find under $1,000 a year in likely benefits, you get your $149 back.</p>
    </main>
  );
}
