# Programs verification (as of 2026-10-30)

Method: official pages read through a fetch tool that summarizes pages. Several .gov sites returned 403/404 or were too large to read. "Verified" below means the figure was read on an official page; a human should still spot-check each against the live page before go-live.

| Program | Engine confidence | What was verified (official source) | Still needs a human |
|---|---|---|---|
| Medicare Savings Program | **verified** | Tiers 110% / 120% / 138% FPL and no resource test: WAC 182-517-0100. 2026 FPL ($15,960 single, $21,640 couple): aspe.hhs.gov. Resulting limits ($1,463 / $1,596 / $1,835 per month single) match figures seen on secondary sites. | HCA's own dollar table could not be read; confirm it matches. 2026 Part B premium ($202.90) seen only in secondary sources (CMS page 404). QI funding limits. $20 income exclusion and earned-income rules (used only to send borderline cases to review). Couple vs 3+ person households. |
| Extra Help (Part D LIS) | **verified** | 2026 limits ($23,940 / $32,460 income; $18,090 / $36,100 resources) and automatic enrollment via MSP, SSI, full Medicaid: medicare.gov. | SSA page returned 403; cross-check. No verified dollar value, so none is shown. Burial exclusion ($1,500 per person) is an unverified review-band input. |
| Basic Food (SNAP) | **verified** (limits and max benefit) | Gross 130%, net 100% and maximum allotment by household size, effective 10/1/2025: WAC 388-478-0060. Elderly/disabled households need only meet the net limit. | Net-income deductions (standard, medical, shelter) not verified, so the engine compares gross income and sends the gap to a reviewer. 30% benefit-reduction rate not fetched. The 2x "unlikely" ceiling is a screening heuristic, not a rule. FY2027 tables (Oct 2026) not checked: USDA page returned 403. Minimum benefit not modeled. |
| Apple Health (aged/blind/disabled) | **needs_review** | Who counts as aged/blind/disabled and that SSI income/resource methods apply: WAC 182-512-0050. | All dollar limits (HCA page too large to read). Never auto-recommended. |
| Senior/disabled property tax exemption | **needs_review** | Age 61, ownership, residence and tier structure: RCW 84.36.381. | County income thresholds (Pierce page 403; DOR table not current). Law changes for taxes collected in 2027+ (2025 c 200, 2026 c 163). Never auto-recommended. |

Not started (see docs/PROGRAM_SHORTLIST.md): the other 15 candidates.
