# PLAN.md — Recoup, Phase 1

## Architecture
- **Next.js (App Router, TS) + Tailwind** on Netlify; server actions/route handlers only, no separate API service.
- **Supabase**: Postgres + Auth (magic link via Resend SMTP) + Storage (private bucket, signed URLs ≤10 min) + RLS on every table. A **dedicated project** for Recoup (PII isolation, see DECISIONS).
- **Stripe**: Checkout (B2C $149, mode=payment), Invoices + ACH (B2B, two invoices 50/50), Customer Portal, webhook route with signature check + `stripe_event_id` unique key for idempotency.
- **Rules engine**: pure TS function `evaluate(household, program) -> {status, reasons[], value{low,likely,high}}`. Programs are `programs/*.yaml`, validated (zod) and loaded to `programs`/`program_versions` by a script. Rules are a small declarative DSL (comparisons over household facts, FPL/AMI lookups, any/all/not). No model in the decision path.
- **Anthropic API**: document field extraction and plain-language explanation only; outputs land in `documents.extracted` as `unconfirmed` until a human confirms.
- **PDFs**: `pdf-lib` filling public fillable forms; otherwise an HTML-to-PDF answers sheet.
- **Observability**: Sentry with PII scrubbing; structured logs carry IDs only.

## Data model (core)
organizations, users (profile + role: admin|reviewer|sponsor_viewer|household), households (org_id nullable, completed_by + relationship), household_members, consents (version, timestamp, share_with_org bool), programs, program_versions (immutable snapshot of YAML per change), evaluations (household, program_version, status, reasons, value range, reviewer_state), claims (status machine), ledger_entries (append-only: estimated/approved/received value, dates, evidence doc, verified_by), documents, reviews (reviewer, decision, seconds_spent), payments (webhook-synced), audit_log (append-only, trigger-written). Append-only enforced by DB triggers that reject UPDATE/DELETE on ledger and audit tables; corrections are new rows.
**"Verified" (guarantee) is a schema enum:** `verified_basis in ('determination_letter','confirmed_receipt')` plus a document or reviewer attestation; estimates never count.

## Build order
1. **Get paid:** auth, landing placeholder, Offer B Checkout, Offer A invoices+ACH, payments table, webhooks, thank-you page, live/test flag. 2. Intake + consent + RLS tests. 3. Engine + 5 programs + claim plan. 4. Packets + uploads + extraction. 5. Reviewer console + ledger + audit. 6. Sponsor dashboard + white-label link + report export. 7. Remaining programs, reminders, kill-criteria dashboard. Deploy and commit per slice.
Tests: engine unit (5+ synthetic households/program with cliff cases), RLS integration (household A cannot read B across every table), Stripe webhook fixtures (replay = no-op), one Playwright path.

## Risks
1. **Rule accuracy** (largest): official pages are inconsistent/hard to fetch and numbers change yearly. Mitigation: `needs_review` default, yearly bump workflow, human gate.
2. **Regulatory**: UPL/benefit-counseling, HIPAA with health-plan sponsors, TCPA. Mitigation: live mode off until counsel review; COMPLIANCE_CHECKLIST.
3. **Guarantee liability**: B2C refund rule and B2B shortfall credit create cash exposure before outcome data exists. Mitigation: precise definitions, cap on B2B pilot count.
4. **Reviewer time = margin**: tracked from slice 5; if >~45 min/household margin fails.
5. **Sensitive data**: no SSNs, signed URLs, no PII in logs, export/delete endpoint.
6. **Solo-founder bandwidth**: reviewer, support, and sales all land on Pep; keep v1 small.
