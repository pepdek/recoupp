# Design QA v2 (warm liquid glass)

v1 (paper and stamps): https://v1--recoup-founder-app.netlify.app  
v2 (this branch): alias `v2`, see the deploy URL in the chat.

## Worst-case contrast (`npx tsx scripts/contrast-v2.ts`, exits 1 if any text pair is under 7:1)
Color pass 2 made the field richer (apricot `#FF9A52`, marigold `#F9B21C`, clay `#D4705F`, sage `#8FB08A`, sky `#8EC5E8`, plus an ember glow). Text tokens on the 86% white pane over each field color: the darkest case (deep teal, surface `#E0E9E9`) gives ink 14.4, ink-2 8.3, money green 9.0, waiting amber 8.3, problem red 8.2, link 7.8. Every other field color is higher. The tinted warm and sage panes (88% fill) are checked over teal too: lowest is link at 7.5. Button ink on the coral-to-marigold gradient: 7.7 and 9.8. The hero numeral is now `#5C1B04` (large text, needs 3:1): 4.0 to 11.9 on every field color. The weakest is clay at 3.9 (AA large). The figure also appears in the balance card at 9+.

## Lighthouse after the review changes (production build, mobile profile, headless Chrome, signed-in pages through a local-only test login)
| Page | Performance | Accessibility | Best practices |
|---|---|---|---|
| `/` | 100 | 100 | 100 |
| `/for-sponsors` | 100 | 100 | 100 |
| `/design` | 100 | 100 | 100 |
| `/plan` (signed in) | 100 | 100 | 100 |
| `/track` (signed in) | 100 | 100 | 100 |
| `/intake/income` (signed in) | 100 | 100 | 100 |
| `/documents` (signed in) | 100 | 100 | 100 |
| `/review` (reviewer) | 100 | 100 | 100 |
| `/sponsor/demo-seniors` (sponsor) | 100 | 100 | 96 (QR image aspect ratio, fixed afterward, not re-run) |
Lighthouse's accessibility score is axe-core. With a 6x CPU slowdown (a rough stand-in for an old phone, **not a real device**): `/` 100, `/plan` 100, `/intake/income` 100 for performance, LCP 0.8 to 1.0s, total blocking time under 80ms.

## Signed-in screens, seen rendered
Using seeded demo households and local-only test logins (removed afterward, see below), I looked at plan, tracker, intake step, reviewer queue, reviewer household page and the sponsor dashboard in the browser at phone width.
Found and fixed: **the v2 intake form was broken.** The form-label class `.field` collided with the background layer's `.field` class, so every label was pinned to the top of the page. The background is now `.paint`. This bug was on the earlier v2 deploy; the redeploy fixes it.
Also fixed: the nav said "Sign in" when signed in (now "Account", which links to plan, tracker and documents); the reviewer queue table touched the pane edge.

## Reflow and display modes
At 320px wide, no element overflows on `/`, `/for-sponsors`, and the signed-in sponsor dashboard, with **Larger text, High contrast and Calm all on** (root 20px). 320px is WCAG's 400% zoom case, which is stricter than 200%.

## After your feedback (Oct 31)
Buttons are flat: solid coral, no gloss, no shine, hover fills marigold. The pointer-following highlight is gone everywhere. Display toggles (Calm, Larger text, High contrast) moved from the nav to the footer under "Display", so the nav is just the wordmark and one link. Inside a pane, tiles no longer become cards: they are plain blocks divided by hairlines (the terms, the steps, sample rows, pricing, sponsor sections). Plan tiles stay as cards because they are not inside another card. The brand is "Recoupp". The top-left of the page is richer.

## Still not covered
- A real old phone: not tested.
- Screen readers (VoiceOver, NVDA): not tested. Landmarks, labels, fieldsets, skip link, `aria-current` on the stepper and `role="alert"` errors are in place.
- 200% zoom itself was not run (320px reflow was).
- Emails: rendered to `docs/email/`, not opened in a mail client.
- The footer is now the only place for Calm, Larger text and High contrast. A person who needs Larger text has to scroll to the footer on first visit (the choice is then remembered). `prefers-reduced-transparency` and `prefers-contrast: more` switch Calm on automatically.
- Tests: 160 passed, 4 skipped. Stripe code untouched.
- Test data: seeded demo rows and test logins were created in the dev Supabase project for these checks and then removed (including the ledger rows, which needed the append-only trigger lifted for one statement; it was re-enabled and verified).
