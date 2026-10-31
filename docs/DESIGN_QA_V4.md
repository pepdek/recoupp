# Design QA v4

Run October 31, 2026 on a production build (`next start`, port 3112), branch `design-v4-system`.

## Automated

| Check | Result |
|---|---|
| Unit tests (Phase 1, payments, rules, webhook, sponsor, review) plus `design-tokens` | 163 pass, 4 skipped (RLS, need keys) |
| `design-tokens` test (v4.css: font sizes on scale, two radii plus pill, no hex outside `:root`) | pass |
| Heading outline (`npm run check:headings`, 16 routes) | 1 H1 per page, no skipped levels |
| Lighthouse, mobile and desktop, 11 public pages (home, how-it-works, pricing, check, programs, a program page, about, for-sponsors, accessibility, contact, sources) | performance 100 everywhere; accessibility 100 on all except /about at 96 (an in-table link had no underline; fixed after this run, not re-run) |
| Contrast (live on `/design`, 16 pairs) | 0 failures; text pairs AAA except coral hover (AA) |
| Rendered font sizes on `/` and `/design` | only 14, 16, 18, 22, 36, 48, 56 px |
| Launch check (`npm run check:launch`) | warns on drafts; exits 1 with `LAUNCH_CHECK=1` (verified) |

## Not covered

- Pages not yet on u- parts: intake, plan, tracker, documents, account, login, review, admin, sponsor dashboards, `/thanks`, sponsor landing pages. They load the v4 type, color and button tokens through a bridge in `v4.css` but still use v3 layout classes, and still contain off-scale font sizes in v3 CSS and Tailwind classes. The token test does not cover them. Not re-viewed after the change.
- Mobile: layout checked in the in-app browser at 390 wide for horizontal scroll (one overflow found and fixed on `/programs`). Headless screenshots in `docs/qa/` at 390 are cropped by Chrome's minimum window width, so only the 1495 shots are reliable. No Playwright run; 360, 768 and 1024 widths not run page by page. Pages checked at 1495 only by eye, not all.
- Not tested: screen readers, a real older phone, 200% zoom on every page, email clients, a live Stripe payment. Checkout posts to the unchanged `/api/checkout` route; unit tests cover the webhook, not the new buttons end to end.
- Homepage is about 6.4 screens at 900px tall including footer and sources (target 5 to 6).
