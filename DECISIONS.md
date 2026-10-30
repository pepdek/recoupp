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
