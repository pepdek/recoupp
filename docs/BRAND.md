# Brand (Phase 2)

Name: **"Recoup" is a placeholder.** One line (`app/lib/brand.ts`) changes it everywhere. Options and the case against Recoup are in `DESIGN_BRIEF.md`.

## Wordmark and mark
Type-only wordmark set in Fraunces Bold, tracked to -0.045em, with a stamp ring around the first letter (a dotted inner ring, tilted 6 degrees). The mark is that ring and works as favicon (`app/app/icon.svg`) and as a stamp. SVGs: `app/public/brand/mark.svg`, `wordmark.svg`. These SVGs reference Fraunces by name and fall back to Georgia, so they are not outlined yet. Outline them once the name is final.

## Color tokens (defined once, in `app/app/globals.css` under `@theme`)
| Token | Hex | Use |
|---|---|---|
| paper | #F4ECD8 | page |
| paper-2 | #E9DFC5 | slips, stripes |
| ink | #1E1B16 | text, rules |
| forest | #2F4A2B | links, verified, secondary button |
| stamp | #B5381A | primary action, key figure. Never body text |
| mustard | #E0A921 | highlights and focus ring. Fill only |
High contrast mode (header toggle, stored in the `ui` cookie): pure black text, thicker rules, no grain.

## Type
Display: Fraunces (SOFT 60, WONK 1). Text: Atkinson Hyperlegible. Household body 20px, tools 16px (`.tool` wrapper). Larger-text toggle scales the root 125%. Scale: h1 clamp 36 to 68px, h2 28 to 40px, h3 24px, hero number clamp 72 to 176px, line height 1.1 display and 1.5 text.

## Spacing and shape
Spacing is Tailwind's 4px scale, page gutters 16px, narrow column 40rem, wide 68rem. Corners are square. Tickets have one clipped corner. Rules are 3px ink (1px in tools). Perforation is a 3px dotted line. Hard 4px offset shadow on buttons only.

## Motifs and where they go
- **Ticket** (`.ticket`): a program, a step, a claim.
- **Slip** (`.slip`, dashed edge): terms, notes, next step.
- **Cheque** (`.cheque`): the one place dollars are shown big. One per screen.
- **Stamp** (`.stamp`): statuses, always a word, never color alone.
- **Strip** (`.strip`): intake progress.
- **Grain**: landing hero and plan hero only.

## Voice
Neighbor who knows the paperwork. Short sentences. Name the dollar figure and the next step. Grade 6 or below for households (checked with Flesch-Kincaid: landing 5.0, thanks 6.8).

### Ten do and don't
| Don't | Do |
|---|---|
| Unlock your hidden benefits journey | We found $2,435 a year you may be owed. |
| Our seamless platform streamlines applications | We fill in the form. You check it and send it. |
| An error occurred. Please retry. | Something doesn't look right. Check your answers and try again. |
| Your submission has been received | Got it. Thank you. |
| Empower your family's financial future | Many people who qualify never apply. |
| Eligibility determination pending | A person is checking your answers. |
| Leverage our guarantee | Under $1,000 a year? You pay nothing. |
| Not just a form, but a partner | A filled-in sheet and a list of papers. |
| Please be advised that documents are required | Upload what you have. A phone photo works. |
| Your renewal date is approaching | Renew this week. |

## Banned
Visual: purple-to-blue gradients, glowing orbs, mesh gradients, glassmorphism, neon, Inter, Roboto, system-ui, Space Grotesk, emoji as icons, default-weight Lucide or Heroicons, stock photos, AI imagery, centered-everything, uniform 8px cards in a grid, shadows on everything, the hero plus three icon cards layout.
Copy: Unlock, Empower, Seamless, Revolutionize, Elevate, Journey, Leverage, "in today's fast-paced world", "Not X, but Y", em-dash-heavy rhythm, lorem ipsum, John Doe, round-number fake stats, placeholder logos.
