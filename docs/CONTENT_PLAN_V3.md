# Content plan v3: the homepage argument (awaiting approval)

Branch `design-v3-argument` (from v2, `42bf6fa`). Nothing in design or code has changed yet. This is the plan and the words. Everything marked **[PLACEHOLDER]** is visible on the page until you replace it.

## 0. What I confirmed in the audit
I re-checked the live v2 page myself. The audit is right on every point I could test:
- **0 H1s.** First heading is an H2; the hero numeral is a styled `<p>`, and the figure appears twice (numeral plus card).
- Nav: logo and one link (2 anchors). Footer: 3 links, none to Privacy, Terms or Accessibility.
- No Open Graph tags, no JSON-LD. The only contact on the page is `dekpep@gmail.com`.
- Headings: H2 "Four steps", H3 Find/Fill/File/Follow, H2 "What a result looks like", H2 guarantee, H2 price, H2 questions. No problem or benefits section.
Not yet re-checked: layout at 390px and 1489px (earlier checks were at 375 and 320, and the comma collision from the audit). I'll check both widths with screenshots in the build.

## 1. Headline options (H1)
- **A (recommended):** "Washington has help with food, medicine and bills. Many people who qualify aren't getting it."
  Why: says where, what, and the gap. The gap is sourced (see C1). Careful word choice: "aren't getting it", not "never claim it", because the study measures who is enrolled, not who never applied.
- **B (emotional, for adult children):** "Is your parent missing help Washington already offers?" Good for a second test. Less clear on what we do.
- **C (benefit-first):** "Find the Washington benefits you or your parent qualify for. We fill in the forms."
Dropped: "Most people never claim it." I can't source "most", and for SNAP the national senior reach is high (America's Health Rankings: 86.8 per 100 low-income adults 60+, 2023), so a blanket claim would be wrong.

## 2. Page order and exact words (homepage `/`)
Section styles (four, so the page has rhythm): **Open** (no pane, big type on the field), **Glass** (the 86% frosted pane), **Solid** (flat white sheet, no blur, for dense or comparative content), **Warm** (tinted pane for money and decisions). Inside any pane, no cards inside cards.

### 1. Header (sticky) [style: glass bar]
`Wordmark` · How it works · What we check · Pricing · Questions · For organizations · Sign in · **[Check what I qualify for]** (coral) · display settings.
Mobile: wordmark, coral button, a "Menu" button. The menu opens with display settings at the top (W6), then the links. Also see decision D5 on how to show the toggles.

### 2. Hero [style: Open, with one Glass pane for the promise]
- Eyebrow: "Washington State · for people 60 and up, and the families who help them"
- **H1:** option A above.
- Support line: "More than 4 in 10 people who qualify for help with Medicare costs aren't enrolled.¹ We check about twenty Washington programs, fill in the forms, and follow each one until it's decided."
- Who it's for (three buttons, equal weight): **I'm 60 or older** · **I'm helping my parent** · **I run an organization**. The first two go to the free check (`/check?for=me` and `?for=parent`). The third goes to `/for-sponsors`.
- Primary button: "Check what I might qualify for" with small text "Free. No sign-up."
- Text link: "See what the full report costs"
- Proof line under the headline, once (not twice): "Example: a Medicare Savings Program can pay your Part B premium. That is $202.90 a month in 2026, about $2,435 a year.² Source: CMS, checked Oct 31, 2026."
- Three trust ticks: "A person reviews every result" · "We never ask for your Social Security number" · "Full refund if we find under $1,000 a year"
- Footnotes ¹ ² link to the sources in section 5.
First phone screen (390x844): eyebrow, H1, support line, the three buttons, primary button. Proof line starts just below the fold, which is fine.

### 3. Problem [style: Glass]
- Eyebrow: "The problem"
- **H2:** "Help exists. Getting it is the hard part."
- H3 "Every program is a different office." Body: "Medicare help comes from the state Health Care Authority. Food help comes from DSHS. Phone discounts are a federal program. Utility discounts come from your city. Each has its own form."
- H3 "The rules change every year." Body: "Income limits and amounts reset. The same facts get asked a different way on every form."
- H3 "One missed letter can end it." Body: "Agencies write back asking for more papers, and benefits have to be renewed. Miss a deadline and you may have to start over."
- Stat line (sourced): "In a 2025 study, more than 4 in 10 people who qualified for a Medicare Savings Program weren't enrolled.¹ Medicare Part B now costs $202.90 a month, up from $185 a year earlier.²"
- Bridge: "That's the gap we close."
No other statistics. If a number can't be sourced it stays out, and the point is made in words.

### 4. What we check [style: Solid]
- Eyebrow: "What we check"
- **H2:** "One set of answers. Every program that fits."
- Support: "We look at about twenty Washington programs. These are the ones where we can show you a published amount today."
- Seven H3 items, each one line plus a "Source" link and the checked date:
  - **Medicare premiums.** "A Medicare Savings Program can pay your Part B premium: $202.90 a month in 2026."
  - **Groceries.** "Basic Food (SNAP) helps pay for groceries. The monthly amount depends on household size and income." *(No dollar figure until I verify the October 2026 amounts; see section 6.)*
  - **Medicine.** "Extra Help lowers your Medicare drug costs. In 2026 a single person's income limit is $23,940 a year."
  - **Phone and internet.** "Lifeline takes $9.25 off a monthly phone or internet bill."
  - **Heating.** "Energy help (LIHEAP) pays part of a heating bill. The amount depends on your household and your local agency."
  - **Utilities.** "Tacoma Public Utilities takes 35% off electric, water and sewer for people who qualify. Seattle takes 60% off City Light and 50% off water bills."
  - **Transit.** "ORCA LIFT cuts King County transit fares to $1."
- Reviewer-only line: "We also look at property tax breaks, Apple Health, SSI, veterans' help and more. A person confirms those before you see them, so we don't show amounts for them yet."
- Payoff: "We check all of them from one set of answers." Link: "See every program."

### 5. How it works [style: Open]
- Eyebrow: "How it works"
- **H2:** "You answer once. We handle the forms."
- Four columns with matching top rules (no stagger), H3s: **Find** "Answer questions about money, bills and who lives at home. About 15 minutes. Save and come back any time." · **Fill** "We turn your answers into a sheet for each program. Nothing to copy by hand." · **File** "A person on our team checks it first. You get a list of papers to gather and where to send them." · **Follow** "We nudge you about missing papers, agency letters and renewal dates."
- Audience toggle right under the H2: **For me / For my parent**. It swaps "you/your" for "your parent/their" in these steps and in the FAQ. Default: "For my parent" when the visitor arrived by that entry button.

### 6. Sample result [style: Glass]
- Eyebrow: "Sample" with the pill "Demo data".
- **H2:** "Here's what a result looks like."
- Support: "A made-up household. The people and numbers are not real."
- Rows: Medicare Savings Program, about $2,435 a year, "Ready to apply"; Lifeline, about $111 a year, "Ready to apply"; Extra Help, "To be checked", "Waiting". Total "$2,546 a year, likely. Two programs counted. One needs a person to look first, so it isn't in the total." The amounts are computed from the same constants the engine uses.

### 7. Proof and sources [style: Solid]
- Eyebrow: "Proof"
- **H2:** "Every number comes from an official source."
- H3 **Sources.** "Rules checked against the Washington Health Care Authority, DSHS, the Social Security Administration, federal poverty guidelines, the FCC Lifeline program, King County Metro, Tacoma Public Utilities and Seattle City Light. Last checked [date from the programs data]. We show amounts only for the programs we've verified (8 today, counted from the data). A person reviews the rest."
- H3 **Who reviews your answers.** "[PLACEHOLDER: name], [role]. [PLACEHOLDER: photo slot] A short, true bio goes here." Plus "Why I built this" note in your voice, drafted from facts you give me (D3).
- H3 **What we can honestly show.** "We're new. We don't have customer stories yet, so we won't make any up. Here's what we offer instead: a refund if we find under $1,000 a year, a rule that only letters and confirmed payments count as 'verified', and a sample you can read." Components for quotes and verified totals ship now, driven by a data file with `verified: true`, and show a designed empty state until real data exists.

### 8. Free help exists [style: Solid, a simple comparison table]
- Eyebrow: "Free help"
- **H2:** "Free help is real. Here's what we add."
- Three rows (each checked on an official page, see section 5):
  - **BenefitsCheckUp** (National Council on Aging): "Free online screening for nearly 2,000 programs across the country. It doesn't process applications. It lists each agency's contact, with phone, chat and local centers for in-person application help."
  - **SHIBA** (Washington Office of the Insurance Commissioner): "Free, unbiased help with Medicare questions. Call 800-562-6900 and ask for your local office."
  - **Area Agencies on Aging** (DSHS): "Local offices that help older adults and their families find services and programs. Find yours through Washington's Community Living Connections."
- Our row: "Recoupp checks about twenty Washington programs from one set of answers, fills in each form, has a person check it, and reminds you about letters and renewals. The full report is $149."
- Closing line: "If you have time and a patient helper, those are good places to start. If you want it done in one sitting, that's us."
- Pending D4 (you confirm I name these three).

### 9. Guarantee and price [style: Warm]
- **H2:** "Find under $1,000 a year? You pay nothing."
- Four plain terms (unchanged from v2): paid once before you start; "likely benefits" means programs a person reviewed and marked likely or eligible; refund if under $1,000 a year; agencies decide approvals.
- Price block: "$149. One time. No subscription. No upsell." with the five included items and the button "Get my full report". Under it: "Not sure yet? Do the free check first."

### 10. Questions [style: Glass]
- **H2:** "Questions people ask"
- Open by default: "Do you need my Social Security number?" (No. We never ask for it. Our sheets leave a blank line and you write it in.) · "Who looks at my answers?" (You and a reviewer on our team. A community group that sent you sees totals only, unless you tick the box to share.) · "What if you find nothing?" (You get all $149 back. The line is $1,000 a year in likely benefits.)
- Collapsed: "Are the dollar figures exact?" · "Is this legal or tax advice?" · "What do I need to have ready?" (Medicare card, proof of income such as a Social Security award letter, recent bills.) · "How long does it take?" · "Who is behind this?" (links to About)
- "Can my son or daughter do this for me?" moves out of the FAQ into section 5 (the For me / For my parent toggle).

### 11. For organizations strip, final call to action, footer
- Strip [Glass]: "Run a group that serves older adults?" → "See the pilot".
- Final CTA [Warm]: **H2** "Find out what you might qualify for." Button "Check what I might qualify for (free)". Line: "Questions? Call [PLACEHOLDER phone] or write [PLACEHOLDER support@your-domain]."
- Footer [Glass]: columns Product (How it works, What we check, Pricing, Programs), Company (About, Contact, For organizations), Legal (Terms (draft), Privacy (draft), Accessibility statement), Display settings. "What we are": a paperwork service. "What we are not: a law firm, a government agency, a tax preparer or a financial adviser." Name line: "Recoupp: get back what's yours." Address [PLACEHOLDER], phone [PLACEHOLDER], email [PLACEHOLDER].

## 3. Heading outline (the build checks this)
`/`: **H1** hero → H2 Problem (3 × H3) → H2 What we check (7 × H3) → H2 How it works (4 × H3) → H2 Sample (3 × H3) → H2 Proof (3 × H3) → H2 Free help (3 × H3) → H2 Guarantee and price → H2 Questions → H2 final call to action. FAQ questions are `<summary>`, not headings. Footer has a visually hidden H2 "Site information".
Other pages (one H1 each): `/check` "What might you qualify for?"; `/about` "Who is behind Recoupp"; `/programs` "Programs we check"; `/programs/[id]` program name, then H2 What it pays, Who qualifies, How to apply, Where this comes from; `/privacy`, `/terms`, `/accessibility`, `/contact`; existing pages keep their H1.
Type scale tokens so levels differ visibly: H1 clamp 44 to 84px, H2 clamp 32 to 48px, H3 26px, eyebrow 15px uppercase tracked. A script `scripts/check-headings.ts` crawls the built public routes, prints each outline, and exits 1 if a page doesn't have exactly one H1 or skips a level. It runs against the built server after `next build` (it can't run inside the build itself).

## 4. The other pieces
- **Free check `/check` (W15, default D1).** Five questions: county, who it's for, age range (60 to 64, 65 to 74, 75 and up), household size (1, 2, 3 or more), monthly income band, and "Does anyone have Medicare?". Results: programs that "may qualify", each with the published amount line (same words as section 4), **no personal total**, and a note that the full report checks all twenty and fills in the forms. The rules run in the browser against the program data; nothing is sent or stored without a checkbox consent. Method: evaluate each verified program at the bottom and top of the income band; show "may qualify" if either passes; unknown facts (savings, rent) stay unknown and are labeled "we'll confirm". Reviewer-only programs are never shown as matches.
- **Nav and mobile (W6, W16).** Sticky header with the coral button. Mobile gets a sticky bottom bar: "Check what I qualify for" plus a tap-to-call button. All tap targets 48px. I test at 390x844 and 360px.
- **About `/about`** with the reviewer and founder placeholders, address, phone, support email and the name line.
- **Privacy, Terms, Accessibility.** Privacy and Terms are rendered from `docs/legal/*_DRAFT.md` with a visible "Draft for attorney review" banner. The accessibility statement is written from what's actually been tested (see `DESIGN_QA_V2.md`: Lighthouse and reflow tested; screen readers and a real old phone not tested) and names a contact for problems.
- **Program pages (W18).** Template per program from the programs data: what it pays, who qualifies (published limits from the data), how to apply (the data's application link), source link, last-checked date, free-check button. First five: Medicare Savings Program, Extra Help, Basic Food, Lifeline, Energy help. Then ORCA LIFT, Tacoma Public Utilities, Seattle. Basic Food shows no dollar amount until verified.
- **Metadata (W19).** Per-page titles and descriptions, canonical URLs, favicon (done), and generated share images (1200x630) via the framework's image route.
- **Structured data (W20).** JSON-LD for Organization, FAQPage (matching the on-page FAQ exactly) and Service; validated with Google's Rich Results test where possible and a schema check script.
- **Analytics (W21).** Our own `events` table (already used for the funnel): page view, CTA click, free-check start and finish, checkout start and finish. No names, emails or answers in events; no third-party scripts on household pages.
- **Section 8 of the prompt, sponsor page:** only nav, headings, rhythm, footer and trust apply for now.

## 5. Citations
Every number on the page, where it comes from, and when I checked it. "Official" means I read the agency or publisher page myself on the check date.

| # | Claim on the page | Source | Status | Checked |
|---|---|---|---|---|
| C1 | More than 4 in 10 eligible people aren't enrolled in a Medicare Savings Program (56.7% of eligible beneficiary-years were enrolled, 95% CI 54.5% to 59.0%; 2018 to 2020; so 41% to 45% weren't) | Kotb, Su, Sinaiko. JAMA Netw Open 2025;8(10):e2535408. https://pmc.ncbi.nlm.nih.gov/articles/PMC12495494/ | Primary article read. "Not enrolled" is 100 minus the published enrolled share. National figure, not Washington-specific | 2026-10-31 |
| C2 | Part B premium $202.90 a month in 2026; $185.00 in 2025 | CMS fact sheet, Nov 14, 2025. https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles | Official, read | 2026-10-31 |
| C3 | "About $2,435 a year" | $202.90 x 12 = $2,434.80, rounded | Computed | 2026-10-31 |
| C4 | MSP income tiers and what the program does | WAC 182-517-0100 (in `programs/msp.yaml`) | Program data, `last_verified` 2026-10-30. The program file still lists the premium as an "unverified input"; C2 now verifies it, so I'll update the file | 2026-10-30 |
| C5 | Lifeline $9.25 a month ($111 a year) | lifelinesupport.org (in `programs/lifeline.yaml`) | Program data | 2026-10-30 |
| C6 | Tacoma Public Utilities 35% discount | https://www.mytpu.org/?p=1005 (in `tpu_assistance.yaml`) | Program data | 2026-10-30 |
| C7 | Seattle 60% City Light and 50% SPU discounts | seattle.gov payment assistance page (in `seattle_udp.yaml`) | Program data | 2026-10-30 |
| C8 | ORCA LIFT $1 fare | King County Metro page (in `orca_lift.yaml`) | Program data | 2026-10-30 |
| C9 | Extra Help 2026 single-person income limit $23,940 | medicare.gov and ssa.gov pages (in `extra_help.yaml`) | Program data | 2026-10-30 |
| C10 | Energy help (LIHEAP) is delivered through local agencies | https://www.commerce.wa.gov/liheap (in `liheap.yaml`) | Program data (no amount shown) | 2026-10-30 |
| C11 | Basic Food amount | WAC 388-478-0060 and DSHS (in `basic_food.yaml`) | **Not shown.** Table is the 2026 federal year; the October 2026 tables haven't been checked (known gap) | not verified |
| C12 | SHIBA is free, unbiased Medicare help; 800-562-6900 | Washington OIC. https://insurance.wa.gov/about-shiba-services | Official, read | 2026-10-31 |
| C13 | BenefitsCheckUp: free, no registration required, nearly 2,000 programs, doesn't process applications, offers local in-person application help | NCOA, June 27, 2022. https://www.ncoa.org/article/ncoas-newly-redesigned-benefitscheckup-makes-it-easier-for-older-adults-to-worry-less-age-better | Official, but the program count is from 2022. I'll recheck the live site before launch | 2026-10-31 |
| C14 | Area Agencies on Aging help older adults and caregivers find services; local lookup | DSHS. https://www.dshs.wa.gov/ALTSA/resources | Official, read. The page doesn't state cost or eligibility, so I'm not stating either | 2026-10-31 |
| C15 | "About twenty programs", "8 verified" | Counted from `programs/*.yaml` at build time | Computed from our data | build date |
| C16 | $1,000-a-year refund line, $149, 4 terms | Our own offer (`DECISIONS.md` 4) | Our terms | n/a |
Not used because I couldn't source them: any "most people never claim" claim, any Washington-specific take-up figure, any count of Washington agencies, and any dollar amount for Basic Food, property tax, Apple Health or SSI.

## 6. Open items I found while verifying
- **Basic Food.** Oct 1, 2026 starts the new federal year. Our table is the previous year's, so I'm leaving the dollar amount off the page until I can read the new one. This is the one place the old build could now be wrong. The same table drives the plan page, so I'd verify it before more households run through it.
- **`msp.yaml` premium flag.** Mark `part_b_premium_monthly` verified against C2.
- **Gmail address** appears on the page, in emails, and as the Stripe contact.
- **Stripe statement descriptor** can only be set once the name is final.
- **Resend sender domain** needs your domain (D3) before the email "from" line can move off the shared test address.

## 7. Decisions (defaults apply if you don't answer; every placeholder stays visible)
- **D1 Free check scope.** Default: program names plus the published amounts, "may qualify", no personal total. Alternative: a ballpark range, which breaks the "totals come only from reviewed results" rule.
- **D2 Name.** "Recoupp" (two p's, as you set it) or "Recoup"? Default: Recoupp.
- **D3 Identity and contact.** Business-domain email, phone, Washington address, and whether your name and photo go on About. Default: visible placeholders; the Gmail comes off the page.
- **D4 Free-help names.** OK to name BenefitsCheckUp, SHIBA and Area Agencies on Aging? Default: yes, respectfully, as drafted in section 2.8.
- **D5 Display toggles (a conflict to settle).** v3 says toggles go in the header. After v2 you told me you didn't like the three pills in the nav. Default: one small "Aa" display button in the header that opens a panel with Calm, Larger text and High contrast, plus a copy in the footer. Alternative: three pills again.

## 8. Build order after approval
1. Header and nav, headings tokens, section styles. 2. Homepage sections in the order above. 3. `/check`. 4. About, Contact, Privacy, Terms, Accessibility. 5. Program pages. 6. Metadata, share images, JSON-LD, analytics. 7. Heading script, Lighthouse and axe, reading level, and Stripe and Phase 1 tests. 8. Preview deploy as alias `v3` with screenshots at 1489px and 390px after each page. v1 and v2 stay live.
Self-critique for each page: one H1, plain headings, nothing uncited, no banned words, readable on glass, first screen answers who it's for, what I get and what to do.
Out of scope as listed: ad creative, outbound, automation, multi-state support, and a full sponsor-page rewrite.
