# WA Program Shortlist (candidates, NOT yet verified)

Status key: **candidate** = official landing source identified, rule numbers not yet confirmed from a .gov/agency page. Nothing here may feed recommendations until Slice 3/7 verification sets `confidence: verified`. Value column is my rough order-of-magnitude for a low-income senior household, for ranking only; real formulas come from verified sources.

Research note (2026-10-30): only a few rule details were retrievable; several .gov pages 404/403'd through my fetcher and third-party sites conflict on numbers (MSP limits, Basic Food elderly/disabled tests, Pierce property-tax tiers). I have used none of those numbers. Every row needs a human or a second pass on the official page.

| # | Program | Agency | Rough annual value | Official source to verify against | Status / known open questions |
|---|---|---|---|---|---|
| 1 | Medicaid LTSS: COPES waiver, Community First Choice, nursing facility | DSHS ALTSA/HCS + HCA | $20k–$100k+ (services) | dshs.wa.gov/altsa; WAC 388-106 | candidate; **always needs-human-review** (functional assessment, 5-yr look-back) |
| 2 | Medicare Savings Programs (QMB / SLMB / QI) | HCA | ~$2,400 (2026 Part B premium $202.90/mo) + QMB cost-sharing | hca.wa.gov (program standard income & resources page); WAC 182-517-0100 | candidate; sources disagree on limits and on whether WA dropped the asset test in 2026. QI is first-come, funded-limited |
| 3 | Part D Extra Help (LIS) | SSA (auto-enrolled via MSP/Medicaid/SSI) | $500–$5,000 | ssa.gov/extrahelp | candidate; SSA site returned 403, fetch by hand |
| 4 | Apple Health (Medicaid), aged/blind/disabled and MAGI | HCA | $5k–$15k (coverage value) | hca.wa.gov; WAC 182-505 / 182-512 | candidate; value is avoided cost, show separately from cash-equivalent total |
| 5 | Basic Food (SNAP) | DSHS | $300–$2,500 | dshs.wa.gov Basic Food; WAC 388-478-0060, 388-400-0040 | candidate; elderly/disabled income and asset tests conflict across sources; BBCE at 200% FPL reported but unconfirmed |
| 6 | SSI + State Supplementary Payment (SSP) | SSA / DSHS | $8k–$12k (SSI) + small SSP | ssa.gov/ssi; WAC 388-474-0012, 388-478-0055 | candidate; SSP amounts not found, DSHS reviewing SSP rules in 2024 |
| 7 | Senior/disabled property tax exemption and deferral | County assessors; DOR | $500–$4,000 | dor.wa.gov threshold table; county pages (Pierce: piercecountywa.gov/702); RCW 84.36.381 | candidate; **county-specific**, thresholds change 2027 (HB 2621 reported). Need per-county table |
| 8 | Disabled veteran property tax exemption | County / DOR | $500–$3,000 | RCW 84.36.381 | candidate; fold into #7 data |
| 9 | LIHEAP heating/crisis + SHEAP | WA Commerce via local CAPs | $300–$1,500 | commerce.wa.gov/liheap | candidate; reported 150% FPL (LIHEAP), SHEAP up to 80% AMI, unconfirmed. Apply via local agency (Associated Ministries/Tacoma-Pierce CAP) |
| 10 | Tacoma Public Utilities: senior/disabled discount (Schedule A-2) + BCAP credit | TPU | $200–$900 | mytpu.org/assistance; A-2_2025.pdf | candidate; 2020 doc said 30% off for 62+/disabled <150% FPL, outdated. Call-confirm |
| 11 | Seattle City Light / SPU Utility Discount Program | Seattle HSD/SCL/SPU | $400–$1,200 | seattle.gov/UDP | candidate; reports of 60%/50% bill discounts and an eligibility change Jan 2027 (60% AMI). Verify which table applies |
| 12 | Puget Sound Energy HELP + other investor-owned utility aid | PSE / UTC | $200–$1,000 | pse.com; utc.wa.gov | candidate; not researched yet |
| 13 | Weatherization Assistance Program | Commerce via local CAPs | $2k–$8k one-time | commerce.wa.gov/weatherization | candidate; not researched yet |
| 14 | Subsidized housing: Section 8 HCV, public housing, Section 202 | HUD via THA/SHA/KCHA | $5k–$15k | tacomahousing.net; hud.gov | candidate; waitlists, low near-term probability. Track, don't promise |
| 15 | VA Pension / Aid & Attendance | VA | $10k–$25k | va.gov/pension | candidate; veterans/surviving spouses only; accredited-rep rules apply (see compliance) |
| 16 | ORCA LIFT / Regional Reduced Fare Permit | King Co. Metro et al. | $200–$600 | kingcounty.gov/orca-lift; myorca.com | candidate; LIFT <=200% FPL, RRFP age 65+/Medicare, $1 fares reported. Confirm Pierce Transit fares |
| 17 | Lifeline phone/internet | FCC / USAC | $111 ($9.25/mo) | lifelinesupport.org; hca.wa.gov/node/21386 | candidate; ACP ended 2024, no replacement found. No WA state supplement confirmed |
| 18 | Senior Farmers Market Nutrition Program | DSHS/WSDA via AAAs | $50–$100 | dshs.wa.gov/altsa | candidate; not researched yet |
| 19 | Family Caregiver Support Program / Senior Citizens Services Act | DSHS via Area Agencies on Aging | $500–$5,000 in services | dshs.wa.gov/altsa; local AAA | candidate; not researched yet |
| 20 | Emergency rent/utility relief (county/city, local CAP) | Varies | $500–$5,000 one-time | wa211.org; county HSD sites | candidate; funding is intermittent, treat as `needs_review` by default |

## Proposed Slice 3 five (highest value x verifiable x single statewide rule set)
1. Medicare Savings Programs  2. Part D Extra Help  3. Basic Food  4. Apple Health (ABD)  5. Senior/disabled property tax exemption (Pierce County first, since Tacoma is home market)
Reasons: statewide rules in WAC/CFR, large dollar value, MSP unlocks Extra Help (dependency edge for the claim plan). COPES and VA pension are high value but belong behind a human reviewer from day one.
