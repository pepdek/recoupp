# Design brief v2: Warm Liquid Glass (awaiting approval)

Branch `design-v2-glass`. v1 (paper and stamps) stays on `main`. This brief replaces v1's visual direction only. Audience split, voice, reading level, accessibility rules, screen list and "don't break payments" carry over. The ban on glassmorphism is lifted. So is the ban on parallax, for one pointer-driven composition on the landing page.

## 1. Idea
Frosted glass floating over a field of color painted by hand. Money is the light source: the annual figure glows, and the glass around it catches it. The page is composed like a small painting, with one signature moment per screen. Forms, payments and legal copy stay quiet and solid enough to read at a glance.

**Signature idea per screen** (one each, nothing competing):
1. Household landing: the oversized serif figure, breathing, with a pane of glass half-covering its lower edge so the light bends through the numeral. The glass shifts a few pixels with the pointer or device tilt.
2. Sponsor landing: one very large "5×" set in the display italic, cropped by the viewport edge, over a calm sage-and-sky field. The rest is dense and tidy.
3. Intake: the field changes color a little with each answered section, like the day moving. The question card stays still and solid.
4. Plan: the total as a luminous balance card that counts up and settles with one soft glow pulse. Programs sit around it as an uneven bento, not a grid of equals.
5. Tracker: a long vertical glass rail with a small bead of light at "you are here".
6. Reviewer: none. It is solid and calm. Glass appears as a single light accent on the header.
7. Sponsor dashboard: the guarantee meter as one glass gauge. Everything else is a plain bento of solid tiles.
8. Emails: a soft peach-to-apricot header band, then solid white cards.

## 2. Type (two families)
- **Display: Instrument Serif** (regular and italic, SIL OFL). Condensed and high-contrast, so a six-character dollar figure fits a 360px phone at huge size. The italic is used for one accent word per page, never more.
- **UI and body: Figtree** (variable, OFL). Open apertures and clear 1, l, I and 0, O, which matters at 20px for people over 70. It is not an Inter or SF look-alike; the round, friendly forms suit the warmth.
- Checked: Figtree has tabular figures (`tnum`), so tables and the reviewer tools align. Instrument Serif does not, so the counting-up total reserves its final width (an invisible copy of the final number) to stop it jittering.
- Both through `next/font`, self-hosted. Geist and Fraunces and Atkinson come out.
- Scale (households / tools): body 20 / 16px, small 17 / 14, h3 26 / 20, h2 40 / 28, h1 clamp(44px, 9vw, 84px) with -0.03em tracking, hero numeral clamp(96px, 30vw, 240px) at 0.92 line height. Leading 1.5 on body.
- **Comma collision fix:** hero numeral gets `line-height: 0.92` plus `padding-bottom: 0.14em` (room for the comma's descender) and a 0.35em gap before the next line. I will confirm with a screenshot at 360, 768 and 1280px.

## 3. Color
**Field** (painted, blurred shapes, never directly behind small text):
| Name | Hex | Role |
|---|---|---|
| Peach | `#FFD3B0` | base light |
| Apricot | `#FFB27A` | warm center |
| Marigold | `#F4B93E` | sun |
| Rose-clay | `#D98B7A` | warm shadow |
| Sage | `#A9BFA0` | calm |
| Pale sky | `#BFD9E8` | cool counterpoint, light |
| Deep teal | `#1F5F63` | cool counterpoint, depth. The worst case for contrast |

Base page color `#FFF3E6`. The warm/cool tension is apricot against sky and teal, with the light coming from top left. No purple, no blue-violet, no default mesh.

**Text and meaning** (each tested on the *worst-case glass surface*, defined below as `#E0E9E9`):
| Token | Hex | Contrast on worst surface |
|---|---|---|
| ink | `#1B1714` | 14.4:1 |
| ink-2 (secondary text) | `#4A3F38` | 8.3:1 |
| money / approved (green) | `#0A4526` | 9.0:1 |
| waiting (amber) | `#5E3800` | 8.3:1 |
| problem (red) | `#80190F` | 8.2:1 |
| link (burnt coral) | `#7F2605` | 7.8:1 |
Primary button: ink label on a coral-to-marigold gradient, `#FF8A5B` to `#FFB04A`, 7.7:1 to 9.8:1 (AAA across the whole gradient). Light status fills sit behind dark text (green fill `#D6F2DF` with `#0A4526` is 8.7:1). Every status carries a word and an icon, never color alone.

**Worst-case method.** Worst case is the darkest field color (deep teal) behind a glass pane. A pane that carries text has a white fill at **86% or more**, which composites to `#E0E9E9` over deep teal. Ink on that is 14.4:1, ink-2 8.3:1, and the weakest semantic color 7.8:1. Panes with less fill (decorative only) never hold text. I'll re-run this check as a script against the real rendered backgrounds before each screen ships.

## 4. The glass recipe (exact CSS, one layer)
```css
:root {
  --glass-fill: rgb(255 255 255 / 0.86);        /* text panes: 86% minimum */
  --glass-fill-light: rgb(255 255 255 / 0.55);   /* decorative only, no text */
  --glass-blur: 22px; --glass-sat: 1.6;
  --r-card: 28px; --r-inner: 20px; --r-pill: 999px;
  --edge-top: rgb(255 255 255 / 0.95); --edge-bot: rgb(255 255 255 / 0.25);
  --shadow: 0 1px 1px rgb(60 30 10 / .06), 0 8px 24px -6px rgb(120 60 20 / .18), 0 24px 60px -20px rgb(120 60 20 / .22);
}
.glass {
  position: relative; border-radius: var(--r-card);
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
          backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
  box-shadow: var(--shadow), inset 0 1px 0 var(--edge-top);
}
.glass::before { /* 1px top-lit border: bright at the top, faint at the bottom */
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(180deg, var(--edge-top), var(--edge-bot));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.glass::after { /* specular, follows --mx/--my on key cards only */
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: .0;
  background: radial-gradient(420px circle at var(--mx, 30%) var(--my, 0%), rgb(255 255 255 / .55), transparent 60%);
}
.glass[data-light]::after { opacity: 1; }
/* grain to stop banding: 160px SVG noise tile at 4% */
.field::after { content:""; position:fixed; inset:0; pointer-events:none; opacity:.04; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
```
- **Field** is 3 to 4 absolutely placed, blurred radial shapes (plain CSS `radial-gradient` layers on one element, no images, no `backdrop-filter`). Each page has its own hand-set composition. Drift is a 20 to 40s `transform` loop.
- **Layer budget:** `backdrop-filter` appears only on `.glass` panes and the sticky nav. Glass is never nested (inner parts use solid tints). At most 3 glass panes in the viewport on mobile, and the plan page uses 2. The reviewer console uses 0 (solid) plus a thin glass header.
- **Fallbacks:** `@supports not (backdrop-filter: blur(1px))` raises the fill to 96%.
- **Form inputs:** solid `#FFFFFF`, 2px border `#4A3F38`, 52px tall, a visible label always above, never a placeholder as a label.
- **Focus ring:** 3px ink ring plus 3px marigold halo (`outline: 3px solid #1B1714; box-shadow: 0 0 0 6px #F4B93E`), tested over glass, solid, and the coral button.

## 5. Calm mode and system preferences
One switch swaps glass for solid and stills everything. Header gets three toggles: **Calm**, Larger text, High contrast (all remembered in the `ui` cookie).
- **Calm** (also automatic under `prefers-reduced-transparency: reduce` and `prefers-contrast: more`): fills become opaque `#FFFBF5`, 2px ink borders, no blur, no shadows beyond one hairline, field becomes one flat peach `#FFEBD6`, drift and specular off. Text is ink on `#FFFBF5` (17:1).
- **High contrast:** black text, 3px borders, solid surfaces. **Larger text:** root 125%.
- `prefers-reduced-motion` turns off drift, pointer light, count-up (shows the final number), glow pulse and morphs.

## 6. Motion
Springs via CSS `linear()` easing, tuned to an iOS feel (about 380ms, slight overshoot): card lift on hover/focus (translateY -3px, shadow deepens), pill morph on status change (width and color transition, no snap), count-up over 1.1s then one 600ms glow pulse. Specular and tilt on exactly two things: the results total and the primary button. Page change is a quick 220ms fade-and-rise. No scroll-jacking, no parallax beyond the single landing composition, no timers, no fake urgency.

## 7. Icons
About 24 custom SVG icons, 2px stroke, round caps and joins, slightly generous curves (SF-Symbols-like weight, drawn by hand, no library). I'll redraw v1's set, since v1's open-corner quirk won't match. No emoji.

## 8. Fixes carried from v1
- Hero comma collision: see section 2.
- Corner-fold overlap on the Medicare Savings Program row: v2 has no folded corners. Dollar amounts get their own right-aligned column with a reserved 7ch width.
- Default-looking line icons: replaced with the custom set.

## 9. Keep from v1
The dollar-first hero idea (re-done as a luminous balance card), the guarantee as its own glass object with the four plain terms and the line that agencies decide, status vocabulary as glass pills with icons (Ready to apply, Waiting, Submitted, Approved, Renewal due), DEMO DATA labels on all sample content, every word of copy, the four steps (Find, Fill, File, Follow), Stripe checkout, all Phase 1 behavior and tests.

## 10. Emails
No backdrop blur in email. A soft peach-to-apricot gradient header band (with a solid `#FFD3B0` fallback for clients that drop gradients), then solid white cards with rounded corners and an ink-on-coral button. System fonts stand in for web fonts (Georgia for display, Verdana for body). Plain-text twins stay.

## 11. Three moods, in words
1. **Late-afternoon kitchen.** Sun low through a window onto a counter. Everything warm, soft, slightly overexposed. Paper bills in the light, nothing urgent.
2. **Sea glass on a windowsill.** Frosted, a little uneven, catching a bright edge. A pane you can see through but not read through.
3. **A well-hung gallery wall.** Lots of room, one big piece, the label small and exact. Nothing is shouting. You know the number first.

## 12. Performance and testing plan
Budget: Lighthouse mobile performance 85+, accessibility 95+, run at the Moto G Power profile and a throttled old-iPhone-class CPU. Fields and grain are CSS/SVG, no image weight. If a screen fails, I cut a glass pane before shipping. Axe and Lighthouse results go in `docs/DESIGN_QA_V2.md`, with the worst-case contrast script's output.

## 13. Process and deploys
- Branch: `design-v2-glass` (created). `main` is untouched.
- **Both versions live at once:** I'll deploy `main` as alias `v1` and the branch as alias `v2` (draft URLs on the same Netlify site, so neither touches production). v1 only exists today as an unaliased draft URL, so I'll redeploy it first.
- Order: tokens, base components (button, input, card, pill, stepper, table, toast, nav), then screens 1 to 8. After each screen: deploy, send URL, mobile and desktop screenshots, and what I checked. Self-critique against "generic glass UI kit" after each.

## 14. Honest caveats
- I can't log in, so signed-in screens will again only be visually checked through a `/design` specimen page and a build. If you give me a way to sign in as a test user (or okay a dev-only fixture route), I can check them for real.
- The $2,435 hero is still the Part B premium, flagged unverified in `msp.yaml`.
- `backdrop-filter` is heavy on old Android. Calm mode and the 3-pane budget are the guard, and I will test it instead of assuming.

## Changes after founder review (Oct 31)
Name is Recoupp. Flat buttons with no shine or pointer highlight. Display toggles live in the footer, not the nav. No cards inside cards: inside a pane, content is divided by hairlines. Richer top-left of the field. Sections 5 and 6 above describe the earlier behavior where they differ.
