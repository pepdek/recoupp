export default function Thanks() {
  return (
    <main className="u-wrap-narrow u-app">
      <p><span className="u-badge u-badge-ok">Paid</span></p>
      <h1 className="u-title">Got it. Thank you.</h1>
      <p>Stripe is emailing your receipt.</p>
      <div className="u-alert u-alert-info"><div><b>Next step</b><p>Check your email. We're sending a sign-in link so you can start the questions. It takes about 15 minutes, and you can stop and come back.</p></div></div>
      <p className="u-small u-muted">Remember: if we find under $1,000 a year in likely benefits, you get your $149 back.</p>
    </main>
  );
}
