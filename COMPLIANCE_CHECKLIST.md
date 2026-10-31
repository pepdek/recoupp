# Compliance checklist: questions for a lawyer or advisor before going live

Not legal advice and no answers assumed. Each item is a question to resolve; Stripe live mode stays off until the high-priority ones are closed.

## High priority (block go-live)
1. **Unauthorized practice of law / benefits counseling (WA).** Does preparing applications, explaining eligibility, and tracking claims for a fee fall under UPL or a WA benefits-counseling or "application assistance" rule? Does a human reviewer need a license, certification, or supervision (for example Medicare/SHIBA counseling rules, DSHS, HCA)? Does the "answers sheet" model change the analysis versus filling official forms?
2. **Application assister registration.** Do we need to be a registered/certified assister (Washington Healthplanfinder, DSHS community partners, Medicare counseling, VA accredited representative for pension claims) for any program we prepare? VA: accredited-representative rules and the ban on charging fees for initial claims. May we charge for VA Pension help at all?
3. **Fee legality per program.** Are there programs where charging a household or a sponsor for help is restricted (VA, SSA representative fees, Medicaid)? Can the guarantee-based sponsor fee be structured to comply?
4. **Recovered-Income Guarantee and refund terms.** Review the exact wording (docs/legal/SPONSOR_AGREEMENT_DRAFT.md and the $149 refund) for enforceability, consumer-protection (WA CPA) compliance, and whether the cap-at-fees-paid choice is right. Is a "guarantee" regulated advertising?
5. **HIPAA.** If a health-plan sponsor sends us members, are we a business associate? What would a BAA require (safeguards, breach notice, subcontractors such as Supabase, Anthropic, Resend, Netlify, Stripe)? Can we avoid PHI by design, and does collecting Medicare/Medicaid status and medical expenses make us a covered entity or BA regardless?
6. **WA privacy law.** My Health My Data Act (health data of consumers: consent, separate authorization for sharing, deletion rights, private right of action). Other WA privacy requirements. Is the in-app consent text sufficient? Does the sponsor "share my results" opt-in meet MHMDA's authorization standard?
7. **E-sign and consent language.** ESIGN/UETA compliance for consent and terms acceptance. Consent on behalf of another person (family member or caseworker): is a representative's click enough? Do we need proof of authority (POA, guardianship)?
8. **Anthropic API and data processors.** Document contents are sent to Anthropic for extraction. Do our terms, privacy policy, and any sponsor contract disclose this? Zero-retention or DPA needs? Same for Supabase, Stripe, Resend, Netlify, Sentry.

## Medium priority
9. **Data retention and deletion.** The outcome ledger keeps de-identified rows after a household deletes their data (DECISIONS 34). Acceptable? Retention period for payments, audit logs, documents, reviews. Legal holds.
10. **TCPA and email rules.** Before any SMS: consent, quiet hours, opt-out, registration. For email reminders: CAN-SPAM vs transactional status, unsubscribe handling.
11. **Elder-specific consumer protection.** WA and federal rules on marketing to seniors, financial exploitation reporting duties, handling signs of diminished capacity or abuse during review.
12. **Sponsor agreement.** Data-sharing terms with banks/health plans/housing operators, white-label branding rights, indemnities, limitation of liability, who is "controller", and the minimum-cell-size reporting promise.
13. **Entity, insurance, and taxes.** Business entity, E&O/cyber insurance, sales tax on services in WA, 1099/payment-processing duties.
14. **Accessibility.** ADA/WCAG expectations for a site serving older adults and people with disabilities.
15. **Advertising claims.** "Verified" and "recovered income" language, testimonial rules, estimates disclaimers.
16. **Security review.** Penetration test or review before storing real documents; breach response plan; WA breach notification law; whether SSNs truly never enter (we blank them, and the extractor drops SSN-like values).

## Engineering follow-ups that depend on the answers
- Reviewer qualifications and training log (item 1-2).
- Per-program "may we help" flags that can turn a program off (item 2-3).
- Business-associate-ready logging, access controls, and subprocessors list (item 5, 8).
- Consent-text versioning is in place (`2026-10-v1`); new wording needs a new version and re-consent where required (item 6-7).
