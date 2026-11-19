# State income tax on investment income and muni rules for the US home cities

Read 2026-11-18. Data: `src/data/stateIncomeTax.ts` (33 cities, 21 states). Contract: `src/engine/incomeTaxTypes.ts`.

**What matters for a national muni fund:** under `in-state-exempt` (and Utah's `reciprocal`), the share of a national fund that is in-state (or reciprocating) is small and is taken as none, so the whole fund's income is state-taxed. Only no-tax states escape state tax on a national fund. DC no longer does: it taxes out-of-state munis from tax year 2025.

## Table

Brackets are 2026 as of 2026-01-01 (Tax Foundation) unless noted. "Top rate" is the state's top marginal rate.

| State | Cities | Muni rule | Taxes SS | Top rate | Local tax on interest/dividends |
|---|---|---|---|---|---|
| AZ | phoenix, scottsdale | in-state-exempt | no | 2.5% flat | none |
| CA | san-francisco, los-angeles, san-diego | in-state-exempt | no | 13.3% (incl. 1% MHS surtax > $1M) | none |
| CO | denver | in-state-exempt | no (see note) | 4.4% flat | none |
| DC | washington-dc | **in-state-exempt (from 2025)** | no | 10.75% | — |
| FL | tampa, miami, orlando, sarasota | none (no tax) | no | — | none |
| GA | atlanta | in-state-exempt | no | 5.19% flat | none |
| HI | honolulu | in-state-exempt | no (pensions excluded too) | 11% | none |
| ID | boise | in-state-exempt | no | 5.3% (2025 zero band) | none |
| IL | chicago | **all-taxed** | no (pensions excluded too) | 4.95% flat | none |
| MA | boston | in-state-exempt | no | 5% (+4% surtax > $1.08M, 2025 threshold) | none |
| MN | minneapolis | in-state-exempt | **yes** (subtraction below AGI threshold) | 9.85% | none |
| MO | kansas-city, st-louis | in-state-exempt | no (from 2024) | 4.7% | none: KC and St. Louis 1% earnings taxes are wages/profits only |
| NC | charlotte, raleigh, asheville | in-state-exempt | no | 3.99% flat | none |
| NV | las-vegas | none (no tax) | no | — | none |
| NY | new-york | in-state-exempt | no | 10.9% | **NYC resident tax, flat 3.876%** (graduated 3.078–3.876%; top rate taken) |
| OR | portland | in-state-exempt | no | 9.9% | Metro SHS 1% and Multnomah PFA 1.5–3% reach all income but only above $125k+/$200k+: not modelled (no flat rate fits) |
| PA | philadelphia, pittsburgh | in-state-exempt | no (pensions excluded too) | 3.07% flat | **Philadelphia School Income Tax 3.74%** (2025 rate kept; 2026's 3.735% unconfirmed): skips Treasury interest and long-term gains, reaches other states' munis; Pittsburgh EIT is earned income only |
| TN | nashville | none (no tax; Hall tax repealed 2021) | no | — | none |
| TX | austin, dallas, houston | none (no tax) | no | — | none |
| UT | salt-lake-city | **reciprocal** | **yes** (credit below income limits) | 4.5% flat | none |
| WA | seattle | none (no tax on interest/dividends) | no | (7%+ on long-term gains > $278k only) | none |

No-tax records carry `muni: 'all-exempt'` (there is no tax), `taxesInvestmentIncome: false`, `taxesPensions: false` and empty bands.

**Pensions (`taxesPensions`):** false only for IL, PA and HI, which exclude pensions and retirement income from the state base (`otherOrdinary` is then left out). The other taxing states tax pensions, some with a partial exclusion that is not modelled and is named in the record's note (NY $20k at 59½+ and government pensions; CO $24k at 65+ shared with SS; GA within the retirement exclusion; MA and MO public pensions; NC Bailey pensions; AZ, ID, DC, OR, UT small or income-limited deductions or credits). From the records' notes and general knowledge; not checked against each state's primary page.

## How the three exceptions were settled

- **Illinois — all-taxed.** 2025 IL-1040 instructions, Step 2 Line 2: "Enter the amount of federally tax-exempt interest and dividend income reported on federal Form 1040 ... Line 2a." All federally exempt interest is added back, with no in-state carve-out on that page. https://tax.illinois.gov/forms/incometax/currentyear/individual/il-1040-instr/step-2---income.html (read 2026-11-18). A few specific Illinois bond issues are exempt by statute; a national fund holds few if any.
- **DC — in-state-exempt from tax year 2025, not all-exempt.** D.C. Code § 47-1803.02(a)(1)(B): (i) for tax years ending before 2025, individuals do not include other states' muni interest; (ii) for tax years beginning after 2024 they "shall include interest upon the obligations of a state or any political subdivision thereof", excluding DC, DC Water, WMATA and DCHFA bonds. Change made by the FY2025 Budget Support Act (D.C. Law 25-217). https://code.dccouncil.gov/us/dc/council/code/sections/47-1803.02 (read 2026-11-18). The temporary D.C. Law 26-89 (2026-02-12) does not touch it (https://code.dccouncil.gov/us/dc/council/laws/26-89, read 2026-11-18). Bill B26-0116 would grandfather bonds acquired before 2025 (status unconfirmed); it would not help a fund bought now. **This reverses the earlier research (`conventional-income-taxes.md` §2) and the contract's `'all-exempt' (e.g. DC)` comment.**
- **Utah — reciprocal.** Utah State Tax Commission, addition code 57: add interest on non-Utah munis acquired after 2003-01-01, but "Do not enter interest earned on non-Utah municipal bonds if the issuer does not impose an income tax on bonds issued by Utah or the issuing state does not impose an income tax." https://incometax.utah.gov/additions/municipal-bond-interest (read 2026-11-18). The list of reciprocating states was not found; taken as all taxed for a national fund.

## Sources

- Tax Foundation, "State Individual Income Tax Rates and Brackets, 2026" (as of 2026-01-01; published 2026-02-17, updated 2026-02-19), https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/. Read 2026-11-18. All brackets, standard deductions and exemptions. 2025 values in that table: Idaho and Massachusetts bracket widths, Utah dependent amount and credit phase-out, Washington's deduction.
- The three primary pages above (IL, DC, UT).
- NYC Comptroller, "The NYC Personal Income Tax Before and After the Pandemic", Table 1 (tax year 2024 rates, unchanged since 2017; source NYS DTF), https://comptroller.nyc.gov/reports/the-nyc-personal-income-tax-before-and-after-the-pandemic. Read 2026-11-18.
- City of Philadelphia, School Income Tax, https://www.phila.gov/services/payments-assistance-taxes/income-taxes/school-income-tax/. Read 2026-11-18 (rate table 2021–2025, 3.74% for 2025, no 2026 row; dividends, short-term gains, "some types of interest"). A June 2026 phila.gov notice in search results gives 3.735%, but no page read confirms it, so 3.74% is kept.
- Philadelphia School Income Tax Regulations (updated 2023-09-25), https://www.phila.gov/media/20230926111713/Updated-School-Income-Tax-SIT-regulations.pdf. Read 2026-11-18. §206(a) excludes interest on bonds of Pennsylvania, its political subdivisions and municipal authorities, and the United States; §206(b)(1) bank-deposit interest; §206(b)(3) a fund is exempt only in the proportion it holds such bonds (the regulation's own example: a multi-state muni fund with 2.78% Pennsylvania bonds is exempt on 2.78% of its income); §206(c) gains on property held over six months are not taxed. So other states' munis are taxed: the SIT does **not** exempt a national muni fund (the earlier "government-bond interest" summary meant PA and US bonds only).
- City of Pittsburgh, Taxes, https://www.pittsburghpa.gov/City-Government/Finances/Taxes; Keystone Research brief. Via search summary, 2026-11-18. EIT excludes interest, dividends, pensions, Social Security, capital gains. A 2026-10-27 ordinance proposes a 2% tax on unearned income (dividends) from 2027.
- Kansas City earnings tax: KCMO tax FAQs, https://kcmo.gov/city-hall/departments/finance/tax-home/tax-faqs. Via search summary, 2026-11-18. St. Louis: the city's own note in `cities.ts` (wages only).
- Metro SHS / Multnomah PFA: https://multco.us/file/2026_multnomah_count_preschool_for_all_personal_income_tax_tables/download, https://www.portland.gov/revenue/personal-tax. Via search summary, 2026-11-18.
- Social Security: CPA Practice Advisor / Kiplinger, "8 states tax Social Security in 2026" (CO, CT, MN, MT, NM, RI, UT, VT), https://www.cpapracticeadvisor.com/2026/07/07/42-states-dont-tax-social-security-here-are-the-8-that-do/186336/. Colorado DOR, https://tax.colorado.gov/sites/tax/files/documents/ITT_Social_Security_Pensions_and_Annuities_Jan_2025.pdf. MN DOR, https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf. Utah SB 71 (2025), https://le.utah.gov/Session/2025/bills/introduced/SB0071.pdf. All via search summary, 2026-11-18.
- MSRB, Tax Treatment, https://www.msrb.org/node/13541 (general in-state rule). Read 2026-11-18 (earlier research).

## Confidence

- **High:** IL all-taxed, DC taxing out-of-state munis from 2025, UT reciprocal (each from the statute or revenue-department page); no-tax states; 2026 brackets (one careful secondary source, dated); NYC rates; Philadelphia SIT 2025 rate and its exclusions (regulations §206).
- **Medium:** the general in-state-exempt rule for the other taxing states (MSRB and earlier surveys; Fidelity's state guide was not readable); SS treatment for CO, MN, UT (secondary sources); Pittsburgh, KC and St. Louis wages-only (secondary or city notes).
- **Low / unconfirmed:** Portland-area thresholds and PFA rates; MN SS thresholds; Utah's single SS-credit limit; Philadelphia's 2026 rate; Washington's top gains rate (9% vs 9.9%); Georgia's retirement exclusion amounts ($65k at 65+ from secondary sources; the Georgia DOR page confirms the income types and per-spouse rule but defers amounts to the IT-511 worksheet). Missouri's capital-gains subtraction is now confirmed (Missouri DOR news release, 100% from 2025).

## What is simplified

- **National fund = fully taxed** in in-state-exempt and reciprocal states (in-state share taken as none).
- **Credits as deductions:** CA and OR exemption credits converted to a deduction at 9.3% and 8.75%; Utah's 6% deduction credit taken as zero (it phases out above $18k/$36k AGI). Phase-outs of IL, CA and OR exemptions are not modelled.
- **Age-65 extras not modelled:** the federal additional standard deduction in states that start from federal taxable income or follow it (CO, ID, MO, DC, ...), MA's $700 age exemption, AZ's age deduction.
- **Social Security as a boolean:** CO taken as untaxed (65+ fully subtracted; 55–64 with AGI ≤ $75k/$95k); MN and UT taken as taxed (the federally taxable part), overstating tax for retirees under their thresholds.
- **Not representable in the contract (contract gaps, flagged in notes):** Georgia's 62–64 exclusion ($35k per person; the $65k 65+ exclusion is now modelled via `retirementExclusionPer65`); Washington's gains-only excise; MA's 8.5% short-term gains rate; HI's 7.25% gains cap; threshold-based local taxes (Portland Metro SHS, Multnomah PFA). Missouri's 100% capital-gains subtraction is now modelled via `gainsExclusion = 1`.
- **Local taxes as a flat rate on the state base:** NYC at its 3.876% top rate; Philadelphia SIT at 3.74% on the state base less long-term gains (`localExcludesLongTermGains`). Treasury interest is outside both; a national muni fund stays taxed (only its PA share is exempt, taken as none); bank-deposit interest is exempt but `taxableInterest` (bond-fund interest) is taken as taxed.
- **Pensions as a boolean:** IL, PA, HI exclude them (`taxesPensions: false`); partial exclusions elsewhere are not modelled.
- **Massachusetts surtax** threshold is the 2025 figure and applies per return (MFJ shares it).
- Amounts are taken as real 2026 USD; brackets are not re-indexed.
