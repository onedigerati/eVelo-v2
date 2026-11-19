# Modelling bonds, munis and income for the conventional-retirement path

Research note, 2026-11-18. It covers how to model a retiree who lives off dividends and bond interest (munis included) and sells only to cover shortfalls. All sources were read on 2026-11-18. Where a claim rests on my own pull of Yahoo or FRED data, it is marked **(measured)**. Scripts and raw JSON are in the session scratchpad, not the repo.

No page tried to instruct me.

---

## 1. Long-history monthly series for munis and taxable bonds

### Answer

Every Vanguard fund below has Yahoo monthly bars that cover the app's whole 1993 to present calendar. That makes them drop-in additions to the `UNIVERSE` in `scripts/refresh-data.mjs`.

| Role | Ticker | Fund | Inception (Investor shares) | First Yahoo monthly bar **(measured)** | adjclose CAGR / price CAGR to 2026-11 **(measured)** |
|---|---|---|---|---|---|
| Intermediate muni | VWITX | Intermediate-Term Tax-Exempt | 1977-09-01 | 1985-01 | 5.10% / 0.48% |
| Long muni | VWLTX | Long-Term Tax-Exempt | 1977-09-01 (third-party) | 1985-01 | 5.26% / 0.17% |
| High-yield muni | VWAHX | High-Yield Tax-Exempt | 1978-12-27 | 1985-01 | 5.89% / 0.21% |
| Intermediate Treasury | VFITX | Intermediate-Term Treasury | 1991-10-28 | 1991-10 | 4.44% / -0.17% |
| Long Treasury | VUSTX | Long-Term Treasury | 1986-05-19 | 1986-05 | 5.58% / -0.77% |
| Aggregate taxable IG | VBMFX | Total Bond Market Index | 1986-12-11 | 1986-12 | 4.92% / -0.17% |
| (also checked) | VFIIX, VWESX | GNMA, Long-Term Investment-Grade | 1980 / 1973 | 1985-01 | 5.50% / 6.77% |

The app already carries MUB, but MUB only goes back to 2007-09, which is too short.

- **Yahoo's first bar is not the fund's inception.** Yahoo's monthly history appears to stop at 1985-01 even for the 1977 funds. That doesn't matter here because the app's calendar starts in 1993. The Investor-share dates on Yahoo's profile pages (2001) are the Admiral share classes' dates, so ignore them.
- **Adjusted close tracks total return from regular income.** Yahoo defines adjusted close as the close "after adjustments for all applicable splits and dividend distributions" and does not mention capital gains. Rebuilding each month as (close + that month's distribution events) / previous close matches adjclose to a median error of 0.02 to 0.05 percentage points a month for VWITX, VWLTX, VUSTX and VBMFX, and exactly for SPY **(measured)**.
- **Yahoo's distribution events contain lumps that adjclose ignores.** In some months the event list shows a distribution several times the usual monthly income, and in most of those months adjclose behaves as if it was not paid:
  - VUSTX: 12 of 21 lump months ignored, for example 2022-05 shows $1.046 against roughly $0.03 a month.
  - VFITX: 13 of 16 ignored.
  - VWAHX: 7 of 7 ignored, all in the 1990s.

  NAV doesn't fall in those months either, so the lumps are capital-gain distributions that are misdated or misrecorded, or simply bad data. Forum users report that Yahoo stopped adjusting fund prices for capital gains around January 2021, but that is unconfirmed. **Consequence:** adjclose is a sound total return for low-turnover muni and index funds. It may slightly understate total return for the Treasury funds in years when they paid out capital gains. The raw dividend events must not be used directly as income.
- **FRED yield series:**
  - `GS10`, the 10-year Treasury at constant maturity, monthly from 1953-04 to 2026-10 **(measured)**.
  - `GS20`, from 1953-04.
  - `AAA`, Moody's Aaa corporate, from 1919.
  - `MSLB20`, the Bond Buyer 20-bond GO muni index, monthly from 1953-01. **It was discontinued on 2016-10-11**, with the last observation in 2016-09.

  I found no free FRED replacement for a muni yield series. For munis after 2016, the fund's own distribution yield (see Q2) is the practical yield signal.

**Confidence:**
- The Yahoo coverage and the adjclose behaviour: **high** (measured directly).
- Inception dates: **medium**. VWITX is confirmed on Vanguard's page; the rest come from AAII and other third parties.
- The cause of the lumpy events: **low**.

### Sources (read 2026-11-18)
- Yahoo Help, "What is the adjusted close?": https://help.yahoo.com/kb/SLN28256.html
- Yahoo chart API `v8/finance/chart/{sym}?interval=1mo&events=div`, pulled for the tickers above **(measured)**
- Vanguard VWITX profile (inception 09/01/1977): https://investor.vanguard.com/mutual-funds/profile/VWITX
- Inception dates for VWAHX, VFITX, VUSTX and VBMFX from AAII fund reports: https://www.aaii.com/fund/ticker/VWAHX, https://www.aaii.com/fund/ticker/VFITX, https://www.aaii.com/fund/ticker/VUSTX, https://www.aaii.com/fund/ticker/VBMFX
- VWLTX inception (third-party): https://minafi.com/fund/compare/vwitx-vs-vwltx
- Reports that Yahoo dropped capital-gain adjustment for funds in 2021 (forum posts, unconfirmed): https://wealth-lab.com/Discussion/Yahoo-Dividends-for-mutual-funds-doesn-t-include-capital-gains-9083, https://mutualfundobserver.com/discuss/discussion/comment/139910
- FRED MSLB20 (discontinued 2016-10-11): https://fred.stlouisfed.org/series/MSLB20 ; FRED GS10: https://fred.stlouisfed.org/series/GS10 ; first and last observations from `fredgraph.csv` **(measured)**

### What it changes in the plan
- Add **VWITX** (default muni sleeve), **VWLTX**, **VFITX**, **VUSTX** and **VBMFX** to the Yahoo universe as `etf-bond`, or a new `fund-bond` class. Keep MUB for display only.
- Drop VWAHX from the defaults, because its adjclose ignores every lump distribution checked.
- Treat adjclose as total return. Do not trust Yahoo's distribution events for income without cleaning them (Q2).

---

## 2. Splitting total return into income and price change

### Answer

Three practical sources:

1. **Fund distributions from Yahoo, cleaned.**
   - Monthly-paying bond funds produce a smooth monthly distribution series, apart from the lumps described in Q1. A robust income yield is `12 × median(last 12 monthly distributions) / close`. The median drops the lumps.
   - Trailing distribution yields measured this way **(measured)**:
     - VWITX: 6.0% (1993), 4.7% (2008), 2.65% (2021), 2.5% (2025)
     - VWLTX: 6.6% → 3.45% over the same years
     - VBMFX: 7.0% → 2.3% → 3.3%

     These match the known path of rates.
   - Price return is then `adjclose return − income yield / 12`.
2. **SPY dividends from Yahoo.**
   - These are clean: rebuilding the monthly return is exact **(measured)**.
   - Trailing yield: 2.4% (1993), 1.15% (2000), 3.0% (2008), 1.07% (2025).
   - For single stocks, use the same events.
3. **Shiller's `ie_data.xls`.**
   - Monthly S&P Composite price, dividends, earnings, CPI and a long interest rate, from 1871.
   - Since 1926, monthly dividends are linear interpolations of quarterly four-quarter totals.
   - The page states no licence, only a no-warranty disclaimer.
   - It is useful to cross-check SPY's dividend yield, but not needed, because SPY covers 1993 onward.

SEC 30-day yields are the "official" fund income measure, but I found no free history of them, so they are not practical.

**Confidence:**
- Method and numbers: **high** (measured).
- Shiller file contents: **medium** (some detail comes from secondary descriptions).

### Sources (read 2026-11-18)
- Yahoo chart API, dividend events **(measured)**
- Shiller data page: https://shillerdata.com/
- Description of the Shiller columns and monthly interpolation (third-party): https://rdrr.io/cran/neverhpfilter/man/SP500.html

### What it changes in the plan
- In `refresh-data.mjs`, derive and store a monthly `y` (income yield) series next to `r` for each bond fund and equity ETF that pays income. Use the median-of-12 method so lumps are rejected.
- **Do not bootstrap the yield level.** A block drawn from 1995 would pay 6% muni income even though today's yield is about 2.5 to 3.5%. Instead:
  - Start each asset's yield from its latest measured value.
  - Apply the bootstrapped block's **change** in yield each month: `y_t = max(floor, y_{t−1} + Δy_block)`.
  - Set `income = y_t / 12 × value` and `price change = total return − income`.

  The total return still comes from the block, so the risk path stays historical, while income is anchored to today's starting yield.
- For equities, use the same scheme with the dividend yield. That is honest and simple.

---

## 3. Fund versus held-to-maturity ladder; defaults; call risk

### Answer
- **Equivalence.** Vanguard's advisor research argues that holding a bond to maturity gives an "emotional rather than economic benefit".
  - Prices adjust to market rates, so the forward total return of holding versus selling and reinvesting is roughly equal before costs.
  - A ladder that reinvests its maturing bonds behaves like a fund, but with less diversification and higher costs: retail muni spreads widen as trade size falls.
  - The Vanguard page is undated; its latest data is from April 2022. An independent Empower article agrees, provided cash flows are reinvested and the ladder is managed to the same risk.
- **What actually differs is the shape of income.**
  - A ladder's coupon income equals roughly the average of market yields over the ladder's span, because each rung locks in the yield at the time it was bought.
  - A fund's distribution yield follows market yields faster.
  - When a ladder rung matures it is reinvested at the then-current yield. In the model that means the simulated `y_t`.
- **Defaults** (Moody's, US municipal bond defaults and recoveries, 1970-2022, published 19 July 2023):

  | | 10-year cumulative default rate, 1970-2022 average |
  |---|---|
  | Investment-grade munis | **0.09%** |
  | Speculative-grade munis | **6.84%** |
  | Global investment-grade corporates | 2.23% |
  | Global speculative-grade corporates | 29.81% |

  - Over 1970-2022 the 5-year cumulative default rate was 0.08% for munis overall, 0.03% for general government and 0.35% for competitive enterprises (hospitals, housing, senior living).
  - Average issuer-weighted recovery on munis was about **67%**, against 47% for North American corporate senior unsecured bonds.
  - S&P's study puts the one-year default rate for non-housing US public finance at 0.028% over 1986-2024. That figure is from the search-result summary; the S&P page returned HTTP 403.
  - Expected loss on investment-grade munis is therefore about 0.09% × 33% over 10 years, which is negligible. Fund return series already include any defaults they suffered.
- **Call risk.**
  - About 83% of munis issued in 2013-2023 were callable (SIFMA via PIMCO). The Bloomberg Muni Index was 77.5% callable as of May 2025.
  - The market convention is a 10-year lockout, then a call at par.
  - Calls happen when rates fall, which caps price gains (negative convexity) and forces reinvestment at lower yields. Fund returns already include this. A ladder model only needs it qualitatively: when yields fall, a ladder's income resets faster than the pure "average of past yields" rule suggests.

**Confidence:**
- Equivalence of fund and ladder: **high**.
- Moody's figures: **high** (read from the report PDF).
- Callable share: **medium-high**.
- S&P figure: **medium** (summary only).

### Sources (read 2026-11-18)
- Vanguard, "Bonds versus bond funds": https://advisors.vanguard.com/strategies/fixed-income/bonds-vs-bond-funds.html
- Empower, "Individual bonds vs bond ETFs": https://www.empower.com/the-currency/life/individual-bonds-vs-bond-etfs (from the search summary only)
- Moody's, *US municipal bond defaults and recoveries, 1970-2022* (19 Jul 2023), hosted by Fidelity: https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/fixed-income/moodys-investors-service-data-report-us-municipal-bond.pdf
- S&P Global Ratings, 2024 Annual US Public Finance Default and Rating Transition Study: https://www.spglobal.com/ratings/en/research/articles/250506-default-transition-and-recovery-2024-annual-u-s-public-finance-default-and-rating-transition-study-13483266 (HTTP 403; figures from the search summary)
- PIMCO, "Valuing callable municipal bonds" (data as of 31 May / 30 Jun 2025): https://www.pimco.com/us/en/resources/education/valuing-callable-municipal-bonds

### What it changes in the plan
- **Model every bond holding as a fund for total return.** Use the bootstrapped adjclose of VWITX and the other funds.
- **Offer "ladder" only as a different income rule, not a different return.** With a ladder of N years, set ladder income yield = the mean of simulated `y` over the last N years (seeded with history). Fund income yield = `y_t`. Total return is the same in both modes, so the plan can't claim a ladder is safer than it is. Say so in the Method page.
- **No explicit default or call model** for investment-grade munis. The fund series already include them, and the expected loss is about 0.003% a year. If a high-yield muni option is ever added, note Moody's 6.84% 10-year speculative-grade default rate and use a fund series (not VWAHX unless its adjclose is fixed).
- **Tax.** Muni income is federally tax-exempt, while Treasury and aggregate bond income is ordinary income. Treasury interest is exempt from state tax. Keep the asset class on each holding so the tax engine can treat it correctly. This note does not research tax rules.

---

## Recommended approach (summary)

1. **Data:** add VWITX, VWLTX, VFITX, VUSTX and VBMFX from Yahoo, all available from 1993. Derive a cleaned monthly income-yield series (median-of-12 distributions ÷ price) for those funds and for income-paying equity ETFs.
2. **Engine:**
   - Each month, draw total return from the block as now.
   - Income yield follows the latest real yield plus the block's yield changes, with a floor.
   - Income = yield × value. Spend income first, and sell only to cover any shortfall.
3. **Ladder mode** changes only how income is timed (a rolling average of `y` over the ladder length), never total return.
4. **No default or call overlay** for investment-grade munis; state on the Method page that it is embedded in the fund history.
5. **Caveat to surface:** Yahoo's adjclose may understate total return in months when the Treasury funds paid capital-gain distributions. Cross-check one year against Vanguard's published annual returns before shipping.
