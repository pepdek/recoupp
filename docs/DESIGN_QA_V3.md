# Design QA v3 (the homepage argument)

Branch `design-v3-argument`, built from v2. Checked on a production build on Oct 31, 2026. v1, v2 and v3 are meant to be live side by side (see the deploy URLs in the chat).

## Checks that ran
**Heading outline** (`npm run check:headings`, crawls the built public routes): exactly one H1 and no skipped levels on `/`, `/check`, `/about`, `/contact`, `/programs`, two program pages, `/for-sponsors`, `/privacy`, `/terms`, `/accessibility`, `/login`. The homepage is H1, then ten H2s and their H3s, each H2 a statement ("Help exists. Getting it is the hard part."). The script can't run inside the build itself, so it is a separate step after `next build` and is not wired into CI.

**Lighthouse** (mobile profile, headless Chrome; the accessibility score is axe-core):
| Page | Perf | Access. | Best pr. | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/check` | 100 | 100 | 100 | 100 |
| `/about` | 100 | 100 | 100 | 100 |
| `/contact` | 100 | 100 | 100 | 100 |
| `/programs` | 100 | 100 | 100 | 100 |
| `/programs/medicare-savings-program` | 100 | 100 | 100 | 100 |
| `/accessibility` | 100 | 100 | 100 | 100 |
| `/for-sponsors` | 100 | 100 | 100 | 100 |
| `/privacy` | 100 | 100 | 100 | 63 (on purpose: the draft pages are marked noindex) |
With a 6x CPU slowdown (a rough stand-in for an old phone, not a real device): `/` and `/check` both score 100 for performance, LCP 0.8 to 0.9s. These runs were before the last two small header fixes (button wrapping, nav breakpoint), which don't change page weight.

**Reading level** (Flesch-Kincaid on rendered page text, header and footer removed): homepage 5.8 (target met), `/check` 7.3, accessibility statement 7.7. Program pages 8.5 to 9.7, higher because they carry limits and legal names. `/about` and `/contact` show 9.5 to 9.6 only because the bracketed placeholders are few, long "sentences". `/programs` showed 12.6 because list lines lacked full stops; I added them after measuring and did not re-measure.

**Banned words and personal email:** none of Unlock, Empower, Seamless, Revolutionize, Elevate, Journey, Leverage, "fast-paced", lorem, John Doe appear on the pages above. The Gmail address is gone from every page.

**Metadata and structured data:** unique titles and descriptions, canonical URLs, Open Graph and Twitter tags, a generated 1200x630 share image (returns 200). JSON-LD on the homepage: Organization, Service and FAQPage; the FAQ markup matches the visible questions and answers exactly (8 of 8). Program pages carry GovernmentService markup. Not run through Google's Rich Results test.

**Free check:** run in the browser with Pierce County, Tacoma, age 65 to 74, one person, income $1,500 to $2,500, Medicare yes. It returned 7 programs as "May qualify" and no total. The form can't put answers in the web address (a first test did, which led me to fix it). ORCA LIFT only matches in King County because that is the only source we verified (DECISIONS 56).

**Tests:** 160 passed, 4 skipped (same as before). The $149 checkout route is unchanged; the buttons post to it exactly as before. I did not run a live Stripe payment (no keys here).

## Layout
First phone screen at 390x844: eyebrow, H1, promise, primary button, "Free. No sign-up.", and the pricing link are all in view, plus the sticky bottom button. Sections use four styles (open field, frosted pane, solid pane, warm pane); inside a pane there are no cards, only hairlines. Desktop at 1489 wide: one-row header with five links, "Aa", account link and the coral button. I checked mobile section by section in the dev server and the final desktop header on the production build. I did not take a full-page screenshot of every section at both widths.

## Open items and honest gaps
- **Placeholders (visible on the page):** reviewer name, role, photo and bio; founder note; phone; address; support email on your own domain. Nothing else is invented. There are no testimonials or customer counts.
- **Tap-to-call** appears only when `NEXT_PUBLIC_CONTACT_PHONE` is set; it isn't set, so the sticky bar has just the main button.
- **Basic Food** shows no dollar figure until the October 2026 tables are checked. The plan page still uses last year's table (DECISIONS 56 area; PROGRAMS_VERIFICATION).
- **BenefitsCheckUp's "nearly 2,000 programs"** is from a June 2022 announcement; recheck the live site before launch.
- **Stripe statement descriptor and receipt contact**, and the email "from" domain, wait for your domain and the final name.
- **The full report page, plan and intake** were not changed in v3.
- **Not tested:** screen readers, a real old phone, a mail client, a real payment, 200% zoom (320px reflow was tested on v2 pages, not re-run on every new v3 page).
- **Funnel events** (`site_events`, migration 0007) were applied to the dev project; a bot can inflate counts because there is no rate limit.

## Round 2 (Oct 31): sources in APA, and no more cards
**Sources.** Every external number now has a small numbered link in the text. All numbers on a page open one "Sources (N)" accordion near the footer and jump to the matching entry, which is highlighted and focused. Entries are APA 7 (author, date, title, URL, retrieved date), numbered in order of first appearance on the page (not alphabetical, so the numbers read in order). Pages with sources: homepage (15), `/programs` (12), `/check` (12, cited after results show), each program page (1 to 3), and the accessibility statement (WCAG 2.2). Pages with no outside claims (About, Contact, For organizations, Privacy, Terms, Sign in) have no block. Checked on the production build: on every page, each cited number has an entry and each entry is cited (`/check` cites only after the results appear). The accordion opens from a link even when it is closed, and a second click on the same number works.
Titles were copied from the pages themselves. Two pages wouldn't load for my reader (Lifeline eligibility, SSA Extra Help), so their entries use a bracketed description, which APA allows. Please check those two against the live pages. The WAC entries have no title because I didn't read one off the page.

**Cards.** The frosted panes, ticket tiles, check-style box, rounded tables and glowing numeral are gone. The site is now one paper page on the painted background, laid out like a printed article: a short numbered label in the left margin (01 The problem, 02 What we check, and so on), content to its right, a thick rule between sections, thin rules between items, two flat tinted bands (the terms and the closing call to action), and one painted shape in the hero. Buttons are unchanged. Pills remain only for status words. All other pages inherit this: narrow pages are a plain column, tables are flat, callouts are a single marigold bar. The reading text is on one solid surface, so contrast no longer depends on what is behind a pane: ink is 14.3 to 17.3 on the hero gradient and bands, the link color 7.7 to 9.3.

**Rechecked on the production build:** one H1 and no skipped levels on all 12 public pages; Lighthouse 100 on all four scores for `/`, `/check`, `/programs`, a program page, `/accessibility`, `/for-sponsors` and `/about` (6x CPU slowdown on `/` also 100); tests 160 passed, 4 skipped.

**Not rechecked:** the signed-in screens (plan, tracker, intake, documents, reviewer, dashboards) pick up the new flat style from the shared CSS, and I simplified the plan page's list. I removed the test logins and demo data last round, so I haven't seen these screens rendered since this change. Full-page screenshots at both widths were taken for the homepage, a program page and the sponsor page only.
