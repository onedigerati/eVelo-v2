# Taxes and conventions for the conventional-retirement (live-off-income) path

Research note, 2026-11-18. It covers the US tax rules and the practitioner conventions needed to model a retiree who lives off dividends and bond interest (municipal bonds included) and sells only to cover shortfalls. All sources were read on 2026-11-18 unless marked otherwise. A claim marked **(derived)** is arithmetic on a cited figure. A claim marked **(not verified)** comes from background knowledge and no page I read confirmed it.

No page tried to instruct me. Several primary pages could not be read: ssa.gov and ecfr.gov returned 403 or a block page, morningstar.com returned 403, and the Fidelity state tax guide PDF uses glyph-encoded text that would not extract. Where that left a gap, the confidence is lowered.

Companion note: [conventional-bond-modelling.md](conventional-bond-modelling.md) (data series and return modelling).

---

## 1. US federal tax for 2026 on investment income

### Answer

**Ordinary income brackets for 2026** (taxable income). Ordinary interest, non-qualified dividends, short-term gains and Treasury interest are taxed here. OBBBA made the TCJA rates permanent, so the seven rates carry on (Rev. Proc. 2025-32 §4.01).

| Rate | Single, up to | Married filing jointly, up to |
|---|---|---|
| 10% | $12,400 | $24,800 |
| 12% | $50,400 | $100,800 |
| 22% | $105,700 | $211,400 |
| 24% | $201,775 | $403,550 |
| 32% | $256,225 | $512,450 |
| 35% | $640,600 | $768,700 |
| 37% | above | above |

- **Standard deduction for 2026:** $16,100 single, $32,200 MFJ, $24,150 head of household. The additional amount for age 65+ is $1,650 per person, or $2,050 if unmarried (Rev. Proc. 2025-32 §4.14).
- **OBBBA senior deduction:** an extra $6,000 per person aged 65+ ($12,000 for a couple where both qualify) for 2025 to 2028. It phases out above $75,000 MAGI ($150,000 joint) (IRS newsroom). The phase-out rate is not on that page. 6% is commonly cited **(not verified)**.

**Qualified dividends and long-term capital gains** use the 0/15/20% schedule. The breakpoints are taxable-income levels, and these gains stack on top of ordinary income (Rev. Proc. 2025-32 §4.03):

| Filing status | 0% up to | 15% up to | 20% above |
|---|---|---|---|
| MFJ / surviving spouse | $98,900 | $613,700 | $613,700 |
| Single | $49,450 | $545,500 | $545,500 |
| Head of household | $66,200 | $579,600 | $579,600 |
| MFS | $49,450 | $306,850 | $306,850 |

- **Qualified vs ordinary dividends:** qualified dividends are "ordinary dividends that qualify to be taxed at lower capital gain rates", and the payer reports which are which on 1099-DIV (IRS Topic 404). The holding-period rule is 61 days in the 121-day window around the ex-date. Pub 550 has a "Holding period" section, but the part I read did not reach it **(not verified in text)**.
- **Bond-fund and REIT distributions** are ordinary income, not qualified dividends **(not verified)**.

**Net investment income tax (NIIT):**
- The rate is 3.8% on the lesser of net investment income and the amount by which MAGI exceeds the threshold.
- The thresholds are $250,000 MFJ, $200,000 single or head of household, and $125,000 MFS (IRS Topic 559).
- The thresholds are not indexed for inflation (CRS IF11820, via search summary), so more retirees cross them over time.
- Tax-exempt state and municipal bond interest is excluded from NII (IRS Topic 559). Since muni interest is also outside AGI, it does not raise NIIT MAGI either **(derived)**.
- Practical top rates: 23.8% on qualified dividends and LTCG, and 40.8% on taxable interest.

**Municipal bond interest:**
- **Federal:** interest on a state or local obligation "generally is not taxable". Interest on a private activity bond that is not a qualified bond is taxable (Pub 550, 2025).
- **AMT:** interest on qualified private activity bonds issued after 1986-08-07 is generally an AMT tax preference item, with exceptions such as qualified 501(c)(3) bonds (Pub 550). MSRB says the same (MSRB, Tax Treatment).
- **2026 AMT parameters** (Rev. Proc. 2025-32 §4.10):
  - Exemption: $140,200 MFJ, $90,100 unmarried.
  - The 28% rate starts at $244,500 of AMT income.
  - The exemption phases out from $1,000,000 MFJ ($500,000 unmarried) and is gone at $1,280,400 MFJ ($680,200 unmarried). That implies a 50% phase-out rate **(derived)**.
  - Practical upshot: AMT rarely bites a muni retiree, but AMT ("private activity") muni funds should be flagged, not assumed exempt.
- **Reporting:** tax-exempt interest is shown on Form 1040 line 2a. That is information only (Pub 550).
- **Social Security provisional income includes muni interest:**
  - Pub 915 (2025) compares the base amount with "one-half of your benefits" plus "all your other income, including tax-exempt interest."
  - Base amounts: $25,000 single, $32,000 MFJ, and $0 if MFS and living together.
  - Up to 85% of benefits are taxable above $34,000 single or $44,000 MFJ.
  - These thresholds are statutory and not indexed (secondary sources; Pub 915 shows the same figures).
  - So muni interest can make Social Security benefits taxable even though the muni interest itself is never taxed.
- **IRMAA MAGI includes muni interest:**
  - The statute (42 USC 1395r(i)(4)) defines MAGI as AGI "increased by" tax-exempt interest.
  - It uses the tax year two years earlier: 2027 premiums use 2025 returns.
  - 2027 Part B tiers (CMS fact sheet, released 2026-11-17):

| Individual MAGI | Joint MAGI | Part B surcharge per month | Part D surcharge per month |
|---|---|---|---|
| up to $112,000 | up to $224,000 | $0 (standard $209.40) | $0 |
| to $141,000 | to $282,000 | $83.70 | $15.40 |
| to $177,000 | to $354,000 | $209.40 | $39.70 |
| to $212,000 | to $424,000 | $335.00 | $64.00 |
| under $500,000 | under $750,000 | $460.60 | $88.30 |
| $500,000 or more | $750,000 or more | $502.40 | $96.40 |

  The 2026 first-tier thresholds were $109,000 and $218,000, per secondary sources.

- **SALT cap (matters for the state term in tax-equivalent yield, TEY):**
  - $40,400 for 2026.
  - It is reduced by 30% of MAGI above $505,000, down to a $10,000 floor.
  - It reverts to $10,000 in 2030.
  - Source: secondary (Kiplinger and others via search), so confidence is medium.

### Sources
- IRS, Rev. Proc. 2025-32 (2026 inflation adjustments), https://www.irs.gov/pub/irs-drop/rp-25-32.pdf. Read 2026-11-18; text extracted locally from the PDF.
- IRS Topic 559, Net investment income tax, https://www.irs.gov/taxtopics/tc559. Read 2026-11-18.
- IRS Topic 404, Dividends, https://www.irs.gov/taxtopics/tc404. Read 2026-11-18.
- IRS Pub 550 (2025), https://www.irs.gov/publications/p550. Read 2026-11-18 (characters 0 to 200k).
- IRS Pub 915 (2025), https://www.irs.gov/publications/p915. Read 2026-11-18.
- IRS newsroom, OBBBA deductions for seniors, https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors. Read 2026-11-18.
- 42 USC 1395r (Cornell LII), https://www.law.cornell.edu/uscode/text/42/1395r. Read 2026-11-18.
- CMS, 2027 Medicare Parts A & B premiums and deductibles, https://www.cms.gov/newsroom/fact-sheets/2027-medicare-parts-b-premiums-deductibles. Read 2026-11-18.
- MSRB, Tax Treatment, https://www.msrb.org/node/13541. Read 2026-11-18.
- CRS IF11820 (NIIT not indexed), https://www.everycrsreport.com/reports/IF11820.html. Search summary only, 2026-11-18.
- Kiplinger, SALT deduction for 2026, https://kiplinger.com/taxes/salt-deduction-gets-an-update-for-2026-taxes. Search summary only, 2026-11-18.

### Confidence
- **High:** brackets, LTCG/QD breakpoints, standard deduction, AMT figures, NIIT thresholds and the muni exclusion, provisional-income inclusion, IRMAA MAGI definition and 2027 tiers.
- **Medium:** SALT cap figures, the qualified-dividend holding period, the senior-deduction phase-out rate.

### What it changes in the plan
- **Model taxes by character.** The engine's flat `dividendTaxDrag` is not enough for an income-only retiree. Tax each year's income by its character:
  - qualified dividends and LTCG on the stacked 0/15/20% schedule;
  - taxable interest and non-qualified distributions as ordinary income;
  - NIIT above the fixed $200k/$250k thresholds;
  - muni interest at 0% federal.
- **Inflation-index the brackets but not NIIT or the Social Security thresholds.** In a real-dollar engine, NIIT and SS thresholds should shrink in real terms each year, and that matters over 30 years.
- **Treat muni interest as never federally taxed but always counted:**
  - in Social Security provisional income, which can raise the taxable share of benefits to 85%;
  - in IRMAA MAGI, with a two-year lag and cliff tiers.

  A "tax-free" muni ladder can still cost a couple thousands a year in Medicare surcharges. Show this when Social Security or Medicare is in the plan.
- **AMT:** add an "AMT-subject muni share" input defaulting to 0, or simply note that national muni funds may hold some private activity bonds. Full AMT modelling is not worth it at retiree incomes below about $1M.
- **Large qualified-dividend income stays in the 0% band.** A retiree with modest ordinary income can take a lot of qualified dividends and LTCG at 0%. For MFJ: $98,900 of taxable income plus the $32,200 standard deduction, plus $3,300 of aged additions for two people, plus up to $12,000 of senior deduction **(derived)**. So an income-only strategy's federal tax can be near zero, and the comparison with Buy-Borrow-Die (BBD) must use the bracket model, not a flat drag.

---

## 2. State treatment of municipal bond interest and tax-equivalent yield

### Answer

**General rule:**
- Most income-tax states exempt interest on their own (in-state) munis for residents and tax interest on other states' munis (MSRB: rules "vary and not all states provide an exemption").
- The Supreme Court upheld this discrimination in *Department of Revenue of Kentucky v. Davis*, 553 U.S. 328 (2008), 7–2. About 41 states had the same scheme at the time (Justia, plus commentary via search).
- **Treasury interest is the mirror image:** federally taxed, but "No state or local taxes" (TreasuryDirect).

**Exceptions relevant to the app's US home cities:**

| Case | States | Status |
|---|---|---|
| No broad personal income tax, so all muni interest is untaxed | FL, TX, NV, TN, WA, also AK, SD, WY | App's `cities.ts` already flags FL/TX/NV/TN; WA taxes some capital gains but not interest **(not verified)** |
| Tax in-state munis too (little or no in-state benefit) | **Illinois** (Chicago), Iowa, Oklahoma, Wisconsin | Schwab 2020 and IDC 2021 survey, via search summaries. Medium |
| Exempt out-of-state munis too | **District of Columbia** (repeal restored exemption for any state's munis, 2013) | DCFPI, via search. Medium |
| Partial | Indiana: out-of-state munis acquired after 2011-12-31 are taxable | IDC 2021 survey, via search. Medium |
| Reciprocity | **Utah** (Salt Lake City): exempts out-of-state munis only if the issuing state does not tax Utah's munis | One secondary source; a second could not confirm. **Low** |

- **Muni fund distributions** ("exempt-interest dividends") are state-exempt only in proportion to the fund's in-state holdings, which for a national fund is usually small. Most states have no percentage threshold, but some (for example California) require 50% of the fund in state munis before any pass-through **(not verified)**.

**Tax-equivalent yield (TEY):**
- Basic form: TEY = muni yield / (1 − t).
- With state tax on an in-state muni, the combined rate is t = f + s − f·s **if state tax is deductible federally** (itemizer under the SALT cap), and t = f + s if it is not.
- Most retirees take the standard deduction, so the no-deduction form is usually right. Fidelity's tables assume no deduction (search summaries of Eaton Vance, Fidelity, CFI).
- **Out-of-state muni vs Treasury vs corporate:** compare after-tax yields directly rather than through one TEY:
  - muni_out: y·(1 − s)
  - muni_in: y
  - Treasury: y·(1 − f)
  - corporate: y·(1 − f − s), or y·(1 − f)(1 − s) if deducting
- Example with today's yields (§3): 10-year AAA muni about 3.28%, 10-year Treasury 5.07%.
  - At f = 24%, s = 5% (no deduction): TEY of an in-state muni = 3.28/(1 − 0.29) = 4.62%. The Treasury's after-tax yield is 5.07 × 0.76 = 3.85%, against 3.28% for the muni. The Treasury wins on yield at that bracket **(derived)**.
  - At f = 32%, s = 9.3% (CA): muni 3.28% vs Treasury 3.45%, roughly even **(derived)**.
  - That matches the Bond Buyer report (2026-11-17) of "low muni-to-Treasury ratios" right now.

### Sources
- MSRB, Tax Treatment, https://www.msrb.org/node/13541. Read 2026-11-18.
- *Dept. of Revenue of Ky. v. Davis*, 553 U.S. 328 (2008), https://supreme.justia.com/cases/federal/us/553/328. Holding via search summary, 2026-11-18.
- TreasuryDirect, Treasury Notes, https://www.treasurydirect.gov/marketable-securities/treasury-notes/. Read 2026-11-18.
- Schwab, "Crossing state lines" (2020-11-05), https://workplace.schwab.com/content/crossing-state-lines-5-reasons-to-consider-other-states-munis. The page returned 403; content via search summary, 2026-11-18.
- ICI/IDC 2021 state tax survey, https://idc.org/system/files/2021-12/state_tax_2021_survey2.pdf. Via search summary, 2026-11-18.
- Fidelity Capital Markets, State Tax Guide for tax year 2025 (as of Feb 2026), https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/fixed-income/fcm-state-tax-guide-for-tax-year-2025.pdf. Downloaded 2026-11-18, but its text would not extract. **It is the best source for a full state table, so read it manually before shipping per-state flags.**
- TEY formula: Eaton Vance calculator https://www.eatonvance.com/tax-equivalent-yield-calculator and CFI https://corporatefinanceinstitute.com/resources/fixed-income/tax-equivalent-yield. Via search summaries, 2026-11-18.

### Confidence
- **High:** the general in-state/out-of-state rule, *Davis*, Treasury state exemption, the TEY algebra.
- **Medium:** the IL/IA/OK/WI, DC and IN exceptions.
- **Low:** Utah reciprocity, fund pass-through thresholds.

### What it changes in the plan
- **Add a per-state muni rule to the US home-city data** (new fields beside `NO_STATE_TAX`):
  - `muniInState`: exempt or taxed
  - `muniOutOfState`: exempt, taxed or reciprocal
  - a flat or top marginal state rate on interest and dividends

  Default to in-state exempt and out-of-state taxed. Override Illinois (both taxed), DC (both exempt) and the no-tax states. Mark Utah as unverified.
- **Model the muni sleeve as in-state or national.** A national muni fund held by a resident of a taxing state pays state tax on most of its income. An in-state sleeve has less diversification. The simplest honest default: national fund, state-taxed except in no-tax states and DC.
- **Choose munis vs Treasuries by after-tax yield.** At today's ratios Treasuries often beat munis below the 32% bracket, especially in high-tax states, since Treasuries are state-exempt. If the app picks the bond sleeve automatically, use the after-tax comparison above. If the user picks it, show the TEY.
- **Use the no-deduction combined rate by default.** Only use f + s − f·s when the user itemizes.

---

## 3. Conventions for "living off income" and how success is judged

### Answer

**Yields today and historically:**
- **S&P 500 dividend yield:**
  - About 1.1% trailing: 1.12% on 2026-04-30 per S&P DJI, the lowest since 2002, against an average of 1.83% since then. A record low of about 1.04% was reported in August 2026.
  - The Shiller series since 1871 averages about 4.2%, ranging from 1.1% (2000) to 13.8% (1932). Recent readings are about 1.1% (eco3min/ChartRow/MacroRadar mirrors of Shiller data).
  - Buybacks now return much of the cash that dividends once did, so yield understates payout.
- **Treasuries (par yield curve, 2026-11-18):** 1y 4.62%, 2y 4.80%, 5y 4.89%, 10y 5.07%, 30y 5.41% (US Treasury).
- **AAA munis (Refinitiv MMD, 2026-11-12):** 2y about 2.75%, 10y about 3.28%, 30y about 4.77% (Bond Buyer). Muni/Treasury ratios are therefore about 57% at 2y, 65% at 10y and 88% at 30y **(derived)**.
  - Franklin Templeton (via search) put the 10y ratio at 74% on 2026-10-16, against a 10-year average of 79%.
  - Treat ratios as moving between about 60% and 90%.
- **Dividend cuts:** S&P 500 dividends fell about 23 to 24% in 2008–09 and took about four years to regain the peak (InvestmentNews, Morningstar, via search).
  - Pre-1950 cuts were near 50% with about 20-year real recoveries, for example 1929 and 1910 (ERN).
  - Real dividends peaked in 1966 and did not recover until about 1990 (search summaries).

**Common rules:**
- **Income-only / "never touch principal":** spend interest and dividends, never sell.
  - Kitces (2017) frames cash flow as four interchangeable pillars: interest, dividends, capital gains, principal.
  - He warns that income-only invites "stretch for yield" (longer or lower-quality bonds, concentration in high-dividend sectors) and drastic underspending.
  - Vanguard (Bupp et al., 2021) recommends total return with a spending rule. Its reasons: income tilts change the risk profile and diversification, and income can be taxed more heavily than gains.
- **Dividend-growth investing:** hold dividend payers expecting dividends to grow with or above inflation.
  - ERN found four dividend ETFs did not beat the S&P 500 over their histories and fell further in the 2020 bear market.
- **Bucket strategy (Evensky, popularised by Christine Benz):**
  - Bucket 1 is cash for years 1 to 2.
  - Bucket 2 is bonds and balanced funds for years 3 to 10.
  - Bucket 3 is stocks.
  - Interest and dividends flow into bucket 1, which is refilled "opportunistically, with current income and/or rebalancing proceeds". In a downturn, refill from bonds and accumulated income, not stocks.
  - Benz: buckets do not fix a too-high withdrawal rate (Benz 2022 deck and Morningstar, via search; morningstar.com returned 403).
  - This is the closest practitioner match to "live off income, sell only for shortfalls".
- **Bond ladders:** hold each rung to maturity so the payout is known. A retirement-income ladder spends the coupons and maturing principal rather than reinvesting them.
  - A TIPS ladder gives inflation-protected real cash flows, but it depletes and tops out at about 30 years.
  - Selling rungs early sacrifices later spending (Retirement Researcher, via search).
- **The 4% rule (comparison):**
  - Bengen (1994): a 4% initial withdrawal, then inflation-adjusted, lasted at least 30 years in every historical US period. "Safe" meant the portfolio lasted the minimum horizon. He later revised it to 4.5%, then 4.7%.
  - Trinity study (Cooley, Hubbard and Walz, AAII Journal, 1998): success rate is the share of historical periods where the portfolio lasted the full payout period. A 50/50 portfolio over 30 years: 100% at 4%, 68% at 5%, 43% at 6% (Pfau's summary).

**How "success" is defined for income-only.** There is no single standard. Practitioners and researchers judge it on three different axes:

1. **Principal never sold.** This is the "never touch principal" pledge.
   - ERN's 100%-equity, dividends-only test: every cohort from 1920 onward ended with positive 30-year real price return.
   - So "never sold" plus "real principal intact" almost always holds historically for an all-stock portfolio.
2. **Real income keeps up** with the target or inflation.
   - This is the usual failure mode: real income drawdowns of about 20% after 1950, and about 50% before.
   - ERN measures drawdown from the prior real peak, recovery time, and income volatility. When starting CAPE was 20 or more, the median initial dividend budget was below 4%. So the strategy fails in the same regimes as the 4% rule ("we haven't really found a hedge against Sequence Risk").
3. **Spending target met each year.** For a strategy that sells for shortfalls, as specified here, success means the same as for a total-return Monte Carlo: the target was met every year and the portfolio never hit zero. The extra statistics are how often, and how much, principal had to be sold.

### Sources
- S&P DJI, "Why dividend and capital return strategies have stood out in 2026", https://www.spglobal.com/spdji/en/education/article/talkingpoints-why-dividend-and-capital-return-strategies-have-stood-out-in-2026/. Via search summary, 2026-11-18.
- 24/7 Wall St (2026-08-12), record-low S&P 500 yield, https://247wallst.com/investing/2026/08/12/the-sp-500-yield-is-the-lowest-in-history-5-members-of-the-legacy-index-yield-6-or-more/. Via search summary, 2026-11-18.
- Shiller-series mirrors: https://eco3min.fr/en/sp500-dividend-yield-dataset/, https://chartrow.com/sp500/dividend-yield, https://www.macroradar.io/sp500-dividend-yield. Via search summary, 2026-11-18. The app's own data pipeline can compute this directly.
- US Treasury daily par yield curve, https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=202611. Read 2026-11-18.
- The Bond Buyer, "Muni yields follow UST yields higher" (2026-11-12), https://www.bondbuyer.com/news/muni-yields-follow-ust-yields-higher. Read 2026-11-18. Also the Nov 17 piece, via search.
- Franklin Templeton weekly municipal monitor, https://www.franklintempleton.com/articles/en/series/weekly-municipal-monitor. The page would not render; figures via search summary, 2026-11-18.
- Kitces, "Four pillars of retirement income portfolios" (2017-03-22), https://www.kitces.com/blog/four-pillars-retirement-income-portfolios-interest-dividends-capital-gains-principal/. Read 2026-11-18.
- Vanguard, Bupp, Clarke, Daga and Pakula, "Total-return investing: A smart response to shrinking yields" (2021), summarised at https://robberger.com/research/total-return-investing-a-smart-response-to-shrinking-yields/. Read 2026-11-18 (secondary).
- Early Retirement Now, SWR Series Part 40, dividends-only (2020-10-14), https://earlyretirementnow.com/2020/10/14/dividends-only-swr-series-part-40/. Read 2026-11-18.
- InvestmentNews / Simply Safe Dividends / Morningstar on the 2008–09 dividend cut, https://www.investmentnews.com/opinion/dividend-cuts-shouldnt-worry-investors/191207 and https://simplysafedividends.com/world-of-dividends/posts/1038-what-happens-to-dividends-during-recessions-and-bear-markets. Via search summary, 2026-11-18.
- Benz bucket framework, https://uwra.wildapricot.org/resources/Documents/Presentations/Presentations2021-22/Christine%20Benz%20Buckets%20May%202022-compressed%20(1).pdf and https://www.morningstar.com/portfolios/bucket-approach-building-retirement-portfolio. The Morningstar page returned 403; via search summary, 2026-11-18.
- Retirement Researcher on TIPS ladders, https://retirementresearcher.com/how-do-i-build-a-tips-bond-ladder-for-retirement-income/. Via search summary, 2026-11-18.
- Bengen (1994), reproduction at https://robberger.com/research/determining-withdrawal-rates-using-historical-data. Via search summary, 2026-11-18.
- Trinity study summary, Pfau, https://retirementresearcher.com/safe-withdrawal-rates-for-retirement-and-the-trinity-study. Via search summary, 2026-11-18.

### Confidence
- **High:** Treasury yields; the Kitces and Vanguard positions; ERN's findings; the 4% rule and Trinity definitions.
- **Medium:** S&P 500 yield level (sources differ by method: about 1.1% trailing vs 1.6% forward-weighted); muni yields and ratios (one MMD read, prior week); bucket sizing; dividend-cut magnitudes.
- **Low:** none material.

### What it changes in the plan
- **Use realistic yields, or the strategy will look impossible or rosy.**
  - Equity dividend yield: use the data's own trailing yield (about 1.1 to 1.3% now, about 4% historically). Never use a flat 4%.
  - Bond yield: start from today's curve (Treasury 10y 5.07%, AAA muni 10y about 3.3%) and evolve it with the data in the companion note.
  - On a 60/40 portfolio today, natural yield is about 0.6 × 1.2% + 0.4 × 5% ≈ 2.7% taxable, or about 2.0% with munis **(derived)**. That is well under 4%, so "income only" will usually need shortfall sales. That is the honest headline.
- **Define the strategy as a bucket/shortfall rule.** Spend dividends and coupons first, then cash. Sell bonds before stocks when stocks are down, and stocks otherwise. Rebalance annually.
- **Report three success measures so it compares with BBD's Monte Carlo rate:**
  - **Funded rate:** share of paths that meet the real spending target every year and never deplete. This is the same definition as the existing success rate, so it compares like with like.
  - **Principal-intact rate:** share of paths that never sold principal. Also report the median and worst total principal sold, as a share of the starting portfolio.
  - **Income-kept-pace rate:** share of paths where real portfolio income never fell more than X% (say 20%) below its starting level. Also report the worst real income drawdown.
- **Show the 4% rule as a reference line** alongside these: Bengen/Trinity success means lasting 30 years with inflation-adjusted withdrawals.
- **Tax income by character every year (§1)**, because the income approach's tax load is part of what is being compared. Vanguard's tax point and the 0% QD band both cut the same way: income-only can be cheap for modest spenders and expensive above the NIIT and IRMAA lines.
