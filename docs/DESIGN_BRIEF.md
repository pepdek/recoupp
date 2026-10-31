# Design brief (Phase 2), awaiting approval

## Concept: "The envelope"
Benefits arrive as paper: letters, forms, stamps, checks. We keep that world and make it legible. Seed-packet and apothecary-label confidence, a well-set form underneath, and a rubber stamp that says APPROVED. One idea per screen on mobile.

Taste bar: the packaging confidence of craft-cannabis brands (oversized type, 70s warmth, label and sticker motifs, dry voice). No cannabis imagery, leaves, smoke or drug jokes. Structure borrowed from Swiss posters. No layouts or assets copied.

## Audiences, one system
- **Households:** body 20px, calm, one question per screen, 48px targets, Large-type and High-contrast toggles in the header (stored in a cookie so server pages render right).
- **Sponsors and reviewers:** body 16px, denser, same type and color, thinner rules, tables.

## Type (two families)
- **Display: Fraunces** (variable, OFL, soft and slightly wonky, reads like a printed poster headline).
- **Text: Atkinson Hyperlegible** (OFL, built for low vision, so a 74-year-old can tell 1 from l and 0 from O).
Both self-hosted through `next/font`. Numerals: Fraunces at huge sizes for dollar figures. No Inter, Roboto, system-ui or Geist (current Geist goes).

Scale (households / tools): body 20 / 16, small 17 / 14, h3 26 / 20, h2 36 / 26, h1 56 to 72 fluid / 36, hero number clamp(72px, 22vw, 200px). Leading 1.15 display, 1.5 text.

## Palette (5 tokens plus tints, all CSS variables in one file)
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--paper` | `#F4ECD8` | page background | base |
| `--paper-2` | `#E9DFC5` | slips, table stripes | ink on it 12.9:1 |
| `--ink` | `#1E1B16` | text, rules | 14.6:1 on paper (AAA) |
| `--forest` | `#2F4A2B` | secondary: links, buttons, verified | 8.4:1 on paper (AAA) |
| `--stamp` | `#B5381A` | the one hot accent: stamps, primary action, key figure | 5.0:1 on paper (AA, never body text) |
| `--mustard` | `#E0A921` | highlight fills only, never text on paper | ink on it 8.1:1 |

Rules: stamp red is used sparingly (one or two spots per screen). Meaning is never color alone: every status has a word and a shape. High-contrast mode keeps the cream paper, swaps text to pure black, thickens rules to 3px and drops the grain. No dark mode in v1.

## Shape and texture
Square corners (0 to 2px), deliberate asymmetry (one clipped corner on tickets). Thick 3px ink rules, dotted perforation lines, ticket stubs, envelope-window cutouts. Paper grain and halftone in two places only (landing hero, result hero). Stamps rotate 2 to 4 degrees with a rough SVG edge filter.

## Imagery and icons
No photos. Big type compositions, flat hand-built SVG (envelope, check, key, house, grocery bag, bulb, bus pass). One device: the **check-style ledger line** showing annual dollars found. About 20 custom icons, one stroke weight, drawn in SVG, none from a library. Photo slots marked `PHOTO SLOT` for later.

## Motion
Stamp-down on approval, counter ticking to the total, page-turn route transition. All off under `prefers-reduced-motion`. No parallax, no timers, no fake urgency.

## Voice
Neighbor who knows the paperwork. Short sentences, always the dollar figure and the next step. Example: "We found $4,380 a year you may be owed. Here's the first form, already filled in." Honest ranges, never false precision. Grade-6 target, checked by script. Banned list goes in `docs/BRAND.md`.

## Name options (placeholder "Recoup" is not applied)
1. **Second Notice.** Bill collectors send these; ours is good news. Dry, memorable, fits the stamp motif. Risk: sounds like a debt letter at first glance.
2. **Windowpane.** The envelope window that shows what's inside; we show what you're owed. Calm and visual. Risk: generic, many existing uses.
3. **Owed.** One word, blunt, states the promise. Risk: too bare to own as a trademark, and a bit scolding.
Why not keep Recoup: "recoupment" is the word agencies use for clawing money back (overpayments), a bad association for this audience.

Conflict check: web searches found no benefits company under any of the three names. That is not a trademark search. Before choosing, run a USPTO TESS search (classes 36, 45), a WA Secretary of State name check, and a domain check. I'd lean **Second Notice**, pending those.

## Existing inventory to redesign (Phase 1 repo)
Pages: `/` landing placeholder, `/thanks`, `/login`, `/intake` + `/intake/[step]`, `/documents`, `/plan`, `/account`, `/s/[slug]` (white-label entry), `/sponsor` + `/sponsor/[slug]`, `/review` + `/review/[id]`, `/admin` + `/admin/kill`.
Components: `Timer`, `Uploader` only. Everything else is raw Tailwind markup, so base components (button, input, ticket, stamp, stepper, table, toast) are new.
Not pages but user-facing: PDF answers sheet (`lib/packet.ts`), sponsor report PDF, reminder emails (`lib/reminders.ts`), Stripe receipt/checkout text. The magic-link email is Supabase-hosted and needs its template set in the dashboard.
Missing from the redesign list: no claim-tracker page exists yet, so it is built new (from `claims` + ledger), as is the sponsor landing page.
Setup today: Tailwind 4 with the default `create-next-app` globals and Geist fonts, so tokens go into `@theme` in `globals.css`.

## Plan after approval
Tokens and base components, then screens in your order, a preview deploy per screen with mobile and desktop screenshots, a self-critique pass against the bans, then Lighthouse and axe into `docs/DESIGN_QA.md`, plus `docs/BRAND.md`. Payments and Phase 1 tests re-run after each screen.

## Open items
- `frontend-design` skill isn't installed here; I'll follow this brief and the `artifact-design` and `dataviz` skills instead.
- Lighthouse and axe need Chrome; I'll run them through the built-in browser or `npx`.
