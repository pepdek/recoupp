# Recoup (working name): Phase 1

Completed benefit claims for low-income older adults in Washington State. Households (or sponsors for their members) pay; we screen, prepare, and track; a human reviews everything consequential. Not legal, tax, or financial advice.

## Layout
- `app/` Next.js 16 (App Router, TypeScript, Tailwind), Supabase, Stripe
- `programs/*.yaml` benefit rules as data (sources, `last_verified`, `confidence`). Built into `app/lib/programs.generated.json` by `prebuild`/`pretest`
- `supabase/migrations/` schema + RLS (`0001`-`0006`; already applied to the dev project, see below)
- `docs/` PROGRAM_SHORTLIST, legal drafts; root: `PLAN.md`, `DECISIONS.md`, `PROGRAMS_VERIFICATION.md`, `COMPLIANCE_CHECKLIST.md`

## Run locally
```bash
cd app
cp .env.example .env.local     # fill in the values (see below)
npm install --legacy-peer-deps
npm run dev                    # http://localhost:3000
npm test                       # unit tests (160+); RLS integration tests skip without a service key
npm run test:rls               # RLS integration tests (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
npx tsx scripts/plan.ts '{"ss":1400,"tenure":"own"}'   # print a claim plan for a synthetic household
```

## Environment
`app/.env.example` lists everything. Needed to take money: `STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST` (and `_LIVE` pair, used only when `STRIPE_LIVE=true`). `SUPABASE_SERVICE_ROLE_KEY` for the webhook, the sponsor script and RLS tests. `ANTHROPIC_API_KEY` for document reading. `RESEND_API_KEY` + Supabase Auth SMTP for magic-link and reminder email. `CRON_SECRET` for the daily reminders job. **Keep `STRIPE_LIVE=false` until `COMPLIANCE_CHECKLIST.md` is cleared.**

## Database
Project `recoup` (ref `lqxbxhjzyhwqknwmirmx`, us-west-1). Migrations were applied through the Supabase MCP tool; the SQL files in `supabase/migrations` are the source of truth (`0005`/`0006` match what is deployed, including two follow-up fixes folded in). For a fresh project run them in order. Set Auth SMTP to Resend in the Supabase dashboard so magic links send from your domain.

## Roles
- Admin/reviewer/sponsor viewer accounts come from the `staff_emails` allow-list, applied when a profile is first created (the person signs in once by magic link): `insert into staff_emails values ('x@y.com','reviewer');` (sponsor viewers also need `org_id`, or use `scripts/sponsor-invoice.ts --viewer`). `dekpep@gmail.com` is seeded as admin.
- Everyone else is a household.

## Money flows
- **Offer B ($149):** landing page -> Stripe Checkout -> webhook writes `payments`.
- **Offer A (sponsor pilot):** `npx tsx scripts/sponsor-invoice.ts --org "Name" --slug name --email billing@org --viewer dash@org` creates the org, a Stripe customer, a sponsor-dashboard login, and invoice 1 of 2 (50%, ACH + card). Create invoice 2 by hand at household 50.
- Webhook `/api/webhooks/stripe` (events: `checkout.session.completed`, `invoice.paid`, `charge.refunded`) is signature-verified and idempotent. Enable the Stripe Customer Portal in the dashboard for `/api/portal`.

## Pages
`/` landing · `/s/<slug>` sponsor-branded entry · `/intake` questionnaire · `/documents` uploads · `/plan` household plan · `/account` export/delete · `/review` reviewer queue · `/sponsor/<slug>` sponsor dashboard · `/admin`, `/admin/kill` admin.

## Demo data
`npm run seed:sql > /tmp/seed.sql` prints SQL for a demo sponsor and 10 synthetic households (8 waiting for review, 2 reviewed with verified outcomes). Paste it into the Supabase SQL editor. `npx tsx scripts/seed-sql.ts --cleanup` prints the SQL that removes it. Demo emails are `demo-N@example.test` and can't sign in.

## Deploy (Netlify)
`netlify.toml` builds `app/` with the Next plugin; the daily reminder trigger is `app/netlify/functions/reminders-cron.mts`. Set the env vars in the Netlify site settings (and `NEXT_PUBLIC_SITE_URL` to the real URL), then `netlify deploy --build` for a draft or `--prod`. Add a Stripe webhook endpoint pointing at `<site>/api/webhooks/stripe`. Known issue: no session-refresh `proxy.ts` yet (DECISIONS 19).

## Not done in Phase 1
See the status list in `DECISIONS.md` (bottom): Sentry, the Playwright happy path, and live end-to-end runs with real keys are outstanding.
