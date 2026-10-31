# Design QA v2 (warm liquid glass)

v1 (paper and stamps): https://v1--recoup-founder-app.netlify.app  
v2 (this branch): alias `v2`, see the deploy URL in the chat.

## Worst-case contrast (`npx tsx scripts/contrast-v2.ts`, exits 1 if any text pair is under 7:1)
Text tokens on the 86% white pane composited over each field color. The darkest case (deep teal) gives surface `#E0E9E9`:
ink 14.4, ink-2 8.3, money green 9.0, waiting amber 8.3, problem red 8.2, link 7.8. Every other field color is higher. Button ink on the coral-to-marigold gradient: 7.7 and 9.8. The hero numeral (`#7F2605`, large text, needs 3:1) is 5.4 to 8.8 on every field color except clay, where it is 3.6. That is AA for large text, not AAA; the same figure appears again in the balance card at 9+.

## Lighthouse (production build, mobile profile, headless Chrome)
| Page | Performance | Accessibility | Best practices | LCP | CLS |
|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 0.8s | 0 |
| `/for-sponsors` | 100 | 100 | 100 | 0.8s | 0 |
| `/thanks` | 100 | 100 | 100 | 0.8s | 0 |
| `/login` | 100 | 100 | 100 | 0.8s | 0 |
| `/design` | 100 | 100 | 100 | 0.8s | 0 |
Lighthouse's accessibility score runs axe-core rules. This is a fast desktop CPU with simulated mobile throttling. I did **not** test on a mid-range Android or an old iPhone, so the "old device" glass-cost requirement is **unverified**.

## Checked by hand
- Calm mode (header toggle): fills go opaque `#FFFBF5`, 2px ink borders, blur 0, flat peach field, drift stopped. Verified in the browser at 375px.
- Mobile 375px: no horizontal scroll; page text sits on panes. The nav is not sticky on phones (three toggles took two rows).
- Hero comma: the figure has 0.14em bottom padding and the pane starts below the comma. Checked at 375px and 800px.
- No dollar amount can collide with a fold: v2 has no folds, and amounts have a reserved-width column.

## Not covered
- **Signed-in screens** (intake, plan, tracker, documents, account, reviewer, dashboards, admin) were typechecked and built only. No login is available, so the new intake stepper, plan bento, tracker rail and dashboards have **not been seen rendered**. `/design` shows the shared parts.
- **Screen readers**, 200% zoom, Larger text and High contrast with the new glass: not tested.
- **Backdrop-filter budget:** at most 2 blurred panes are in a phone viewport at once on the landing page, but the page holds 9 in total. The plan page and tools use solid tiles (no blur) inside one pane. Not tested on slow hardware.
- Emails rendered to `docs/email/`, not opened in a mail client.
- The specular highlight and count-up were not recorded; they only respond to a real pointer.
- Tests: 160 passed, 4 skipped, same as Phase 1. Stripe code untouched.

## Self-critique (does it read as a template?)
Pushed further: the numeral is Instrument Serif at hero scale with a breathing glow, a pane overlaps it, and the field is hand-placed per page rather than a mesh. The sponsor page has a cropped italic 5×. Still weak: the field is pale next to the brief's "painterly" ask, and the landing page leans on one pane style in every section. Both want a stronger color pass once you've seen it.
