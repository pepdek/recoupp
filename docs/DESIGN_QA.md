# Design QA

## Lighthouse (production build, mobile profile, headless Chrome, 2026-10-30)
| Page | Performance | Accessibility | Best practices |
|---|---|---|---|
| `/` | 100 | 100 | 100 |
| `/for-sponsors` | 100 | 100 | 100 |
| `/thanks` | 100 | 100 | 100 |
| `/login` | 100 | 100 | 100 |
| `/design` (all base components) | 100 | 100 | 100 |
Lighthouse's accessibility score runs axe-core rules. First run on `/` scored 96 and found two real issues (an `aria-label` on a span, and a link whose accessible name didn't match its visible text). Both are fixed.

## Not covered (be careful with "done")
- **Signed-in screens** (intake, plan, tracker, documents, account, reviewer, sponsor dashboard, admin) were typechecked and built but **not opened in a browser or audited**. They need a login, and I have none. The same classes appear on `/design`, which passes.
- **Screen reader testing** (VoiceOver/NVDA) was **not done**. Landmarks, labels, fieldsets, a skip link, `aria-current` on the progress strip and `role="alert"` errors are in place.
- **200% zoom, Larger text and High contrast modes** were set up with rem units and CSS variables but **not tested** in a browser.
- **Contrast** was computed for the five tokens (ink 14.6, forest 8.4, stamp 5.0 on paper, mustard fill 8.1 with ink). High-contrast values were not computed.
- **Reading grade** (Flesch-Kincaid on rendered text): `/` 5.0, `/thanks` 6.8, `/for-sponsors` 8.0. `/login` scores 9.8, which comes from only 88 words with almost no sentence breaks.
- Emails were rendered to `docs/email/` and **not sent or opened in a mail client**. Magic link needs pasting into Supabase.

## Self-critique against the bans
Fixed during the pass: horizontal overflow from the page-turn animation (now clipped, transform only); status dots that were color-only on the kill dashboard (now stamped words); default Geist fonts and default gray/black Tailwind styling on every signed-in page; queue rows as a card list (now a table with j/k keys).
Known gaps:
- The landing hero figure is the Part B premium ($202.90 x 12). `msp.yaml` lists that premium as an unverified input. Confirm at cms.gov before launch.
- The intake flow has no running "dollars found so far". Results are shown only after a human review (DECISIONS 33), and a live preview would change that rule. Your call.
- Large-numeral counter, stamp-down and page-turn are implemented. They switch off with reduced motion.
- No claim documents or photos: slots for photos are not added because no photos are planned yet.
- Whole site is now server-rendered per request (the layout reads the display-settings cookie), so there is no static caching. Performance scores are fine; revisit if traffic grows.
- PDF answers sheets and the sponsor report PDF were not restyled.
- Wordmark SVGs are not outlined (waiting for the final name).
