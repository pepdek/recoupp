# Programs verification (as of 2026-10-30)

Method: official pages read through a fetch tool that summarizes pages. Several .gov sites returned 403/404 or were too large to read. "Verified" below means the figure was read on an official page; a human should still spot-check each against the live page before go-live.

| Program | Engine confidence | What was verified (official source) | Still needs a human |
|---|---|---|---|
| Medicare Savings Program | **verified** | Tiers 110% / 120% / 138% FPL and no resource test: WAC 182-517-0100. 2026 FPL ($15,960 single, $21,640 couple): aspe.hhs.gov. Resulting limits ($1,463 / $1,596 / $1,835 per month single) match figures seen on secondary sites. | HCA's own dollar table could not be read; confirm it matches. 2026 Part B premium ($202.90) seen only in secondary sources (CMS page 404). QI funding limits. $20 income exclusion and earned-income rules (used only to send borderline cases to review). Couple vs 3+ person households. |
| Extra Help (Part D LIS) | **verified** | 2026 limits ($23,940 / $32,460 income; $18,090 / $36,100 resources) and automatic enrollment via MSP, SSI, full Medicaid: medicare.gov. | SSA page returned 403; cross-check. No verified dollar value, so none is shown. Burial exclusion ($1,500 per person) is an unverified review-band input. |
| Basic Food (SNAP) | **verified** (limits and max benefit) | Gross 130%, net 100% and maximum allotment by household size, effective 10/1/2025: WAC 388-478-0060. Elderly/disabled households need only meet the net limit. | Net-income deductions (standard, medical, shelter) not verified, so the engine compares gross income and sends the gap to a reviewer. 30% benefit-reduction rate not fetched. The 2x "unlikely" ceiling is a screening heuristic, not a rule. FY2027 tables (Oct 2026) not checked: USDA page returned 403. Minimum benefit not modeled. |
| Apple Health (aged/blind/disabled) | **needs_review** | Who counts as aged/blind/disabled and that SSI income/resource methods apply: WAC 182-512-0050. | All dollar limits (HCA page too large to read). Never auto-recommended. |
| Senior/disabled property tax exemption | **needs_review** | Age 61, ownership, residence and tier structure: RCW 84.36.381. | County income thresholds (Pierce page 403; DOR table not current). Law changes for taxes collected in 2027+ (2025 c 200, 2026 c 163). Never auto-recommended. |

## Added in Slice 7

| Program | Engine confidence | What was verified (official source) | Still needs a human |
|---|---|---|---|
| Lifeline | **verified** | 135% of 2026 FPL table and qualifying programs (Medicaid, SNAP, SSI, federal housing aid, Veterans Pension): lifelinesupport.org. | The $9.25 monthly benefit is from secondary sources, so the value is provisional. |
| ORCA LIFT | **verified** | 200% FPL monthly table (sizes 1-6), Apple Health / Basic Food / WIC qualify, $1 fare: kingcounty.gov. | The page's sizes 7-8 don't match 200% of the 2026 guidelines (sent to review). The age-65 Regional Reduced Fare Permit was only in secondary sources (sent to review). No dollar value shown. |
| LIHEAP | **verified** (income screen) | 150% FPL, apply through a local provider, once per Oct-Sep year: commerce.wa.gov/liheap (page dated April 2024). | The linked guidelines PDF wasn't read; benefit amounts, funding and any priority rules. Never "eligible", only "likely". |
| Tacoma Public Utilities | **verified** | Discount Rate (35% off, 62+/disability, income table) and Bill Credit Assistance Plan (credits, income table): mytpu.org. | TPU account facts (name on account, single-metered, primary residence) are not collected; reviewer confirms. Value assumes the questionnaire's electric/water bills are TPU bills. |
| Seattle Utility Discount Program | **verified** (2026 table) | 2026 income table, 60% City Light and 50% SPU discounts: seattle.gov. | Reported eligibility change from January 2027 (60% of area median income) was not on the page. Re-verify in January. |
| Medicaid long-term care (COPES) | needs_review | WAC 388-106-0320 located. | Everything: assessment, limits, look-back. |
| SSI + state supplement | needs_review | Aged/blind/disabled categories (WAC 182-512-0050). | Federal rate, limits, state supplement amounts; ssa.gov blocked our fetcher. |
| Disabled veteran property tax | needs_review | RCW 84.36.381 structure. | County thresholds. |
| VA Pension / Aid & Attendance | needs_review | Service, age/disability and discharge rules (va.gov). | Income and net-worth limits, rates. Fee rules (accredited rep) in the compliance list. |
| Weatherization | needs_review | Page located (commerce.wa.gov/weatherization). | Income test (200% FPL or 60% SMI reported by secondary sources). |
| PSE HELP | needs_review | None official read. | 80% AMI reported by secondary sources; service area; funding. |
| Subsidized housing | needs_review | HUD page located. | Local income limits and waitlists. |
| Senior Farmers Market Nutrition Program | needs_review | DOH page located. | Age and yearly income table (seen only in affidavits); benefit about $80. |
| Family Caregiver Support Program | needs_review | None official (two DSHS URLs 404). | Eligibility and services via local Area Agency on Aging. |
| Emergency rent/utility relief | needs_review | wa211.org located. | Specific, currently funded programs by county. |

Stubs only ever produce "needs human review", "unlikely", or "already receiving", enforced by the engine and tested.
