# DECISIONS.md (defaults I chose; override any)

1. **Repo at `~/recoup`**, git-initialized in Slice 1. Working name "Recoup" kept as placeholder only.
2. **Dedicated Supabase project**, not the shared LawStack project. Sensitive PII of seniors should not share a blast radius with other products. (Needs your OK on cost, see questions.)
3. **Live Stripe mode stays off** until COMPLIANCE_CHECKLIST items are cleared; test mode everywhere until then.
4. **Pricing/guarantees as written:** $99/household (100 min), $149 B2C, 5x guarantee, $1,000 B2C refund threshold. B2B 50% at signup via invoice 1, 50% at household 50 via invoice 2 (triggered by enrolled-count, I send it manually from admin in v1, not automatically).
5. **Rule DSL is minimal:** YAML conditions with all/any/not and comparison ops over household facts. No scripting, no expression engine library.
6. **Value ranges** stored as low/likely/high per program; cash-equivalent total reported separately from avoided-cost items (Medicaid/LTSS coverage), so the 5x guarantee test uses cash-equivalent verified value only. This is a business-definition choice for the contract; flag to your attorney.
7. **Roles:** Postgres RLS keyed off `auth.uid()` + a `role` claim; sponsor viewers see only aggregates unless the household's consent row has `share_with_org = true`.
8. **PDFs:** pdf-lib for fillable public forms, HTML answers sheet otherwise. No SSN fields ever populated.
9. **Email:** Resend (magic link, receipts via Stripe, reminders). SMS deferred.
10. **Extraction model:** Claude via Anthropic API, structured output, every value `unconfirmed` until confirmed.
11. **Analytics:** own `events` table (funnel + kill criteria), no third-party tracker, so no PII leaves the stack.
12. **Home market first:** Pierce County property-tax and Tacoma Public Utilities rules go first among local programs.
13. **Unverified = hidden:** any program with `confidence: needs_review` runs through the reviewer queue and is never auto-shown.
14. **Intake = one topic per screen** (income/bills have several fields on one screen) rather than strictly one field per screen; keeps the flow to ~10 screens. Revisit if drop-off data says otherwise.
15. **Consents** are insert-only (updates blocked); revoking/changing = new row. They are deleted with the household on a delete request; the deletion itself is kept in `audit_log` (no PII, just ids).
16. **Clients write audit rows only via `log_event()`** (actor forced to `auth.uid()`); `audit_log` has no client insert policy.
17. **`owner_id`/`org_id` on households can't be changed by clients** (column-level grants); sponsor-linked households arrive in Slice 6 via the white-label link.
18. Turned off Next `cacheComponents`: auth-gated dynamic pages don't benefit and it broke prerendering.
19. **No `proxy.ts` for now.** Netlify CLI 23.6 on Node 24 fails to bundle Next 16's Node-runtime proxy as an edge function (Deno `findSourceMap` error). Without it Supabase session cookies aren't refreshed on page loads, so a signed-in user is sent back to `/login` after the access token expires (~1h). Re-add the proxy (it's in git history, commit "Slice 2") once deploys run from Netlify's own build or the CLI is fixed.
20. **Engine reads programs from `lib/programs.generated.json`**, built from `/programs/*.yaml` by `prebuild`/`pretest` (schema-validated; build fails on a bad program). Each program carries a content-hash `version`. Loading into the `programs`/`program_versions` tables is deferred to Slice 5, when evaluations need the foreign key.
21. **Hard safety net in the engine:** a program with `confidence: needs_review` can never return eligible/likely, regardless of its YAML. Needs-human-review results are `reviewer_only`.
22. **Money totals:** the plan total counts eligible + likely only. Needs-review values are reported separately as "pending review". Values with unverified inputs flag the total as provisional. Programs without a verified value formula (Extra Help, Apple Health, property tax) show no dollar figure rather than an invented one.
23. **Ages are bracketed** (birth year only): "certain" vs "possible" age, with the uncertain band sent to review.
24. **Household of 3+ people goes to review** for Medicare programs because unit composition (who is the spouse) isn't collected yet.
25. **Packets are "answers sheets", not filled official forms.** I haven't verified any agency's fillable PDF URL or field names, and rule 3 says don't invent. Each sheet lays out the household's answers, why we think they qualify, a blank line for SSN/Medicare number, the evidence checklist, and how to apply. Official-form filling is added per program once a form is verified.
26. **Packet and checklist gate:** only after `households.reviewed_at` is set (clients can't write it; reviewer console sets it in Slice 5), only for `verified` programs with eligible/likely results. Until Slice 5 no household can get a packet; `scripts`-free demo is the unit test.
27. **Extraction model: `claude-sonnet-5-5`** (override with `EXTRACTION_MODEL`), effort `low`, structured output via `messages.parse` + zod (Sonnet 5.5 rejects forced tool use). I chose Sonnet over the Opus default to keep per-household API cost down for the margin test; switch if accuracy disappoints. Field names are an allow-list; SSN-like or 9+ digit values are dropped server-side. Refusals mark the document "failed" for manual review (no server-side fallback).
28. **Human confirmation:** extracted values start unconfirmed; the household edits and ticks what is right; `confirmedFields()` is the only reader. Reviewer re-verification of evidence for the ledger arrives in Slice 5.
29. **Known gap:** `extraction_usage` (token counts for the margin calculation) is written by the user's own session under RLS, so a determined user could alter their own usage numbers. Move to a service-role write when the service key is in place.
30. **Storage:** private `documents` bucket, 10 MB, PDF/JPG/PNG only, path `<household_id>/<uuid>.<ext>`, owner/staff RLS, viewing via 5-minute signed URLs, direct browser upload (avoids function body limits).
