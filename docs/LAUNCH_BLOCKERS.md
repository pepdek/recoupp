# Launch blockers

Visible on the live drafts today. Nothing here is invented: each placeholder stays visible until the real item exists. `npm run check:launch` lists them; it fails the build when `LAUNCH_CHECK=1` and only warns otherwise. Set `LAUNCH_CHECK=1` in the Netlify environment of the live site (not drafts: Netlify CLI draft builds report CONTEXT=production, so that variable cannot tell them apart).

| Blocker | Who supplies it | Where it lives |
|---|---|---|
| Reviewer name | Founder | `app/about/page.tsx` (Reviewer block, `<Ph4>name</Ph4>`) |
| Reviewer role | Founder | `app/about/page.tsx` |
| Reviewer photo and short, true bio | Founder | `app/about/page.tsx` (photo slot and bio) |
| Founder note, "Why we built this" | Founder, own voice, true | `app/about/page.tsx` |
| Phone number | Founder | env `NEXT_PUBLIC_CONTACT_PHONE`; rendered by `PhoneLink4` in `components/v4.tsx` (footer, About, Contact, homepage) |
| Support email on your own domain | Founder | env `NEXT_PUBLIC_SUPPORT_EMAIL`; `EmailLink4` in `components/v4.tsx` |
| Business address (Washington) | Founder | env `NEXT_PUBLIC_CONTACT_ADDRESS` (footer, About, Contact) |
| Phone hours | Founder | `app/contact/page.tsx` |
| "Terms (draft)" and "Privacy (draft)" labels | Attorney review, then founder confirms | Footer in `components/v4.tsx`; page titles in `app/terms/page.tsx`, `app/privacy/page.tsx`; drafts in `docs/legal/` |
| Real customer stories and a verified total | Real households, with written permission | Not on the site. The designed empty states are in `app/design/page.tsx`. Do not add numbers until decision letters exist. |

Other open items before launch (not placeholders): confirm the "Recoupp" trademark and domain; Basic Food monthly amounts (FY2027 tables unchecked); test with a screen reader and an older phone; live Stripe payment test; BenefitsCheckUp "nearly 2,000" is from 2022.

The build check does not scan rendered HTML, because the header reads cookies and pages render per request. It checks the source for placeholder components that no environment variable can fill, for unset contact variables, and for "(draft)" in the footer.
