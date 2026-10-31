# Design QA v2 (warm liquid glass)

v1 (paper and stamps): https://v1--recoup-founder-app.netlify.app  
v2 (this branch): alias `v2`, see the deploy URL in the chat.

## Worst-case contrast (`npx tsx scripts/contrast-v2.ts`, exits 1 if any text pair is under 7:1)
Color pass 2 made the field richer (apricot `#FF9A52`, marigold `#F9B21C`, clay `#D4705F`, sage `#8FB08A`, sky `#8EC5E8`, plus an ember glow). Text tokens on the 86% white pane over each field color: the darkest case (deep teal, surface `#E0E9E9`) gives ink 14.4, ink-2 8.3, money green 9.0, waiting amber 8.3, problem red 8.2, link 7.8. Every other field color is higher. The tinted warm and sage panes (88% fill) are checked over teal too: lowest is link at 7.5. Button ink on the coral-to-marigold gradient: 7.7 and 9.8. The hero numeral is now `#5C1B04` (large text, needs 3:1): 4.0 to 11.9 on every field color. The weakest is clay at 3.9 (AA large). The figure also appears in the balance card at 9+.

## Lighthouse (production build, run before color pass 2; not rerun, mobile profile, headless Chrome)
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
Pushed further: the numeral is Instrument Serif at hero scale with a breathing glow, a pane overlaps it, and the field is hand-placed per page rather than a mesh. The sponsor page has a cropped italic 5×. Color pass 2 added richer field colors, an ember glow behind the numeral, and warm and sage tinted panes so the landing sections aren't all one white. The top-left of the page is still fairly pale under the nav.
