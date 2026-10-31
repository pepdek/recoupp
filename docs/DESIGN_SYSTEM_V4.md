# Recoupp design system v4: calm financial software

Branch `design-v4-system`, from v3. Live specimen: `/design` (noindex), rendered from the same tokens and parts the product will use. Source of truth for tokens: `app/app/v4.css` (`:root`). Parts: `app/components/v4.tsx`, `V4Tabs.tsx`. Components are prefixed `u-` so they cannot collide with v1 to v3 classes still used by signed-in pages.

Reference is the principles of Stripe's site (restraint, whitespace, a rigorous scale, product UI as the hero, one system everywhere), never its assets, colors, copy or layouts.

## Positioning the design carries

Recoupp is software plus a human guarantee that does the paperwork. It is not a brochure and not a nonprofit. The free alternatives (NCOA BenefitsCheckUp, SHIBA, Area Agencies on Aging) are named honestly. Recoupp wins by showing the work product: the filled form, the papers checklist, the tracker, the reminders.

## Color

Cool base, warm accent. Ratios are computed, not estimated; `/design` recomputes them from the hex values on every render.

| Token | Hex | Use | Check |
|---|---|---|---|
| `--ink` | `#14202b` | Text | 16.5 on white (AAA) |
| `--ink-2` | `#44525f` | Secondary text | 8.0 on white, 7.4 on subtle (AAA) |
| `--surface` | `#ffffff` | Page, cards | |
| `--subtle` | `#f4f6f8` | Bands, table heads | |
| `--border` | `#d5dce3` | Dividers (decorative) | |
| `--border-strong` | `#6b7a88` | Control edges | 4.4 on white (AA non-text needs 3) |
| `--brand` | `#0b4f5c` | Links, selected, icons | 9.2 on white, 8.5 on subtle (AAA) |
| `--brand-deep` | `#083a44` | Hover, text on tint | 10.8 on brand tint (AAA) |
| `--brand-tint` | `#e7f1f3` | Selected fill | |
| `--accent` | `#ff8a6b` | The one main action per screen (coral) | ink on it 7.2 (AAA); hover `#ff7f5c` 6.6 (AA) |
| `--money` / tint `#e5f4ea` | `#0a5c36` | Money, approved | 7.1 (AAA) |
| `--wait` / tint `#fff3d9` | `#6e4200` | Waiting, renewal due | 7.8 (AAA) |
| `--bad` / tint `#fdeceb` | `#9a1717` | Problems | 7.3 (AAA) |
| `--wash` | `#fbefe9` | Hero background wash only | ink on it 14.7 |

Rules. Links are brand teal, no underline until hover or focus in navigation, cards and footers. **In running text links stay underlined** (1px): teal against ink is only about 1.8:1, so color alone would fail WCAG 1.4.1. This is the one place we depart from "no underline". Focus ring on coral is 4.0 (needs 3). Gradients appear only as the hero wash. Status is always icon + word + tint, never color alone. Coral is lighter than the first draft (`#ff7a59`) so ink text on it clears 7:1 for older readers.

## Type

One sans, Figtree (already loaded, humanist, strong numerals). Instrument Serif appears only on the dollar figure. Sizes in rem so the browser's text-size setting scales everything. Tabular numerals for money. Line length about 68 characters.

| Token | px | Weight | Use |
|---|---|---|---|
| `--fs-figure` | 56 | 400 serif | Dollar figure, once per page |
| `--fs-h1` | 40 mobile, 48 desktop | 700 | One per page, two or three lines |
| `--fs-h2` | 28 / 36 | 600 | States a conclusion |
| `--fs-h3` | 20 / 22 | 600 | Item and component titles |
| `--fs-body` | 18 | 400 | Never below 17, line height 1.6 |
| `--fs-small` | 16 | 400 to 600 | Hints, nav, table cells, small buttons |
| `--fs-caption` | 14 | 600 | Badges, table heads, citation numbers |

Deviation from the brief's suggestion (small 14, caption 13): small is 16 and caption 14, because older adults are a core audience. Nothing is conveyed only at caption size. A test (`tests/design-tokens.test.ts`) fails on any font size outside this scale in `v4.css`; it widens to every page as they are rebuilt.

## Shape, depth, space, motion

Two radii: 8px (controls, tables, alerts) and 16px (cards, panels). Pill radius for badges and status only. 1px borders. Shadows: `--sh-1` hairline, `--sh-2` for raised panels. No blur layers. Spacing steps 8, 16, 24, 32, 48, 64, 96. Motion is 140ms hover and focus, 180ms toast, 240ms progress; all disabled under `prefers-reduced-motion`. No parallax or floating shapes.

## Components (all on `/design`)

Button (primary, secondary, ghost; 44, 48, 56px tall; disabled), text input with hint and error, select, radio and checkbox choice cards, stepper and progress bar, badge and status (Ready to apply, Waiting, Submitted, Approved, Renewal due, Needs info), card (plain, link, raised), alert (info, ok, waiting, problem), toast, header (desktop and mobile menu), footer, tabs (arrow keys), accordion (native `details`), citation popover (native `popover`, no script), responsive data table (stacks below 640px), pricing card (family and sponsor), form-packet preview, timeline tracker, verified total and family story (data-driven, `verified: true` flag, designed empty states), icons (24 custom, one 2px stroke).

## Site map

Header on every page: wordmark, How it works (`/how-it-works`), What we check (`/programs`), Pricing (`/pricing`), For organizations (`/for-sponsors`), About (`/about`), Sign in, and one short button, **Free check**. Sign in is `nowrap`. Links fold into a menu below 1100px. Footer: Product, Company, Legal (Terms (draft), Privacy (draft), Accessibility, Sources). Homepage is about 5 to 6 screens and links into the full pages. Every v3 URL keeps working.

## Hero concept

Left: one H1 (48px at most), one promise line, two buttons. Right: a raised result panel built from real parts and labeled "Demo data": the single dollar figure with its citation, then program rows with status badges. Below the hero: "Your packet" (filled form, papers checklist, reminders timeline), so the fee is visibly the work product.

## W9: no display selector in the header

Removed. Defaults replace it: 18px body at 1.6 line height, ink on white at 16.5:1, secondary text at 8:1, 48px targets, visible focus rings, rem units (browser text size works), 200% zoom reflows, `prefers-contrast: more` darkens borders and secondary text, `prefers-reduced-motion` stops motion. The footer carries an Accessibility link to a page with a text-size control and the statement. A saved v3 `ui` cookie is migrated silently when the layout moves to v4.

Trade-off: a control in the header was findable in one tap, and some older users do use it. Browser zoom and the Accessibility page cover the same need with less clutter. Verify with real users and a real old phone before launch, since the defaults must hold without any toggle.

## Temporary scaffolding

While v4 is built page by page, `v4.css` hides the v1 to v3 header, footer, sticky bar and painted background on pages that render `.v4-root` (a `body:has(...)` rule). It goes away when the root layout moves to v4.

## Not done in this step (by design)

No page other than `/design` is rebuilt. Not started: header and footer in the root layout, homepage, `/check` flow, `/programs`, `/pricing`, `/how-it-works`, `/about`, `/for-sponsors`, legal pages, `LAUNCH_BLOCKERS.md`, the build-failing PLACEHOLDER check, Playwright screenshots in `docs/qa/`, Lighthouse and axe runs for v4. Those follow approval.
