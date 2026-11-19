# Does Yahoo's adjclose give VFITX's total return?

Research note, 2026-11-18. It follows up the worry in `conventional-bond-modelling.md` §1 that Yahoo's VFITX distribution events contain lumps that adjclose ignores, so adjclose might understate total return in years with capital-gain distributions.

**Verdict on the check:** PASS. Every one of 20 calendar years checked (1999 to 2011, 2013, 2016, 2018, 2020, 2023, 2024 and 2025) matches Vanguard's published Investor-share return within 0.06 points, far inside the 0.5-point bar. That includes all nine of those years with a lump distribution.

**Recommendation:** treat adjclose as sound for VFITX and use it unchanged. Do **not** add the lumps back. Adjclose already reflects them. Adding them again would double-count, and the event-based rebuild is the one that drifts from Vanguard (see below).

## Method

`scripts/check-vfitx.mjs` makes the same request as `fetchYahoo` in `scripts/refresh-data.mjs`: `v8/finance/chart/VFITX?interval=1mo&events=div,split` with the same User-Agent, starting from 1991-01. It is a read-only GET. For every full calendar year it reports:

- **adjTR**: the adjclose return from the December close to the next December close. This is what the app uses.
- **price**: the same return computed from the raw close.
- **evTR**: a rebuild from the raw close plus that month's Yahoo distribution events, chained month by month.
- **events**: the year's distribution events, with lumps flagged. A lump is a month whose events exceed 3 times the year's median month.

I then compared adjTR with the 1-year "Average Annual Total Returns, Return Before Taxes" figures in Vanguard's prospectuses filed with the SEC. The May 2009 prospectus also lists ten calendar-year returns (1999 to 2008) as text.

## Command and output

`node scripts/check-vfitx.mjs` (re-run 2026-11-18 after the fix below; events are keyed by their UTC date):

```
VFITX (Vanguard Interm-Term Treasury Inv), Yahoo monthly, 1991-10 .. 2026-10
year    adjTR   price    evTR  events  median     max  lumps
1992    7.66    0.86    7.62   0.675   0.057   0.059  
1993    7.31    1.42    7.30   0.625   0.052   0.057  
1994   -4.55  -10.08   -4.58   0.595   0.049   0.056  
1995   20.51   12.98   20.45   0.665   0.056   0.057  
1996    1.96   -4.23    1.93   0.649   0.055   0.056  
1997    8.99    2.40    8.95   0.648   0.055   0.056  
1998   10.65    4.40   10.61   0.631   0.053   0.055  
1999   -3.46   -9.07   -3.50   0.627   0.053   0.054  
2000   14.08    7.11   14.03   0.649   0.054   0.056  
2001    7.61    1.66    7.57   0.626   0.053   0.056  
2002   14.17    6.89   14.13   0.756   0.050   0.222  12:0.222
2003    2.41   -3.31    2.39   0.666   0.041   0.148  03:0.148
2004    3.42   -1.23    3.40   0.519   0.042   0.059  
2005    2.34   -2.93    2.32   0.585   0.043   0.101  
2006    3.15   -1.56    3.13   0.499   0.042   0.043  
2007   10.02    5.11    9.99   0.495   0.041   0.043  
2008   13.35    6.98   13.35   0.683   0.038   0.268  12:0.268
2009   -1.66   -8.35   -1.68   0.809   0.031   0.370  03:0.144 12:0.370
2010    7.38    2.16    7.35   0.569   0.026   0.238  12:0.238
2011    9.81    3.27    9.78   0.725   0.021   0.500  12:0.500
2012    2.69    0.00    2.69   0.311   0.013   0.092  03:0.087 12:0.092
2013   -3.08   -4.96   -3.08   0.223   0.014   0.061  12:0.061
2014    4.33    2.25    4.32   0.227   0.016   0.042  
2015    1.52   -0.97    1.52   0.283   0.016   0.097  12:0.097
2016    1.19   -1.51    1.18   0.307   0.015   0.133  12:0.133
2017    1.59   -0.18    1.59   0.196   0.017   0.018  
2018    1.01   -1.36    1.00   0.255   0.022   0.024  
2019    6.31    3.85    6.30   0.263   0.022   0.027  
2020    8.20    3.17    8.19   0.567   0.013   0.436  12:0.436
2021   -2.27   -3.33   -2.27   0.125   0.009   0.029  03:0.029
2022  -10.43  -12.11  -10.43   0.196   0.017   0.022  
2023    4.07    0.50    4.06   0.344   0.030   0.033  
2024    1.39   -2.60    1.38   0.395   0.033   0.037  
2025    7.56    3.39    5.82   0.231   0.033   0.034
```

(The script also prints a four-line legend, omitted here.)

## Published figures and comparison

All returns are for Investor shares, before taxes, in percent. Diff is Yahoo adjTR minus the published figure, in points.

| Year | Vanguard published | Yahoo adjTR | Diff | Lump year? | Source |
|---|---|---|---|---|---|
| 1999 | -3.52 | -3.46 | +0.06 | | [A] |
| 2000 | 14.03 | 14.08 | +0.05 | | [A] |
| 2001 | 7.55 | 7.61 | +0.06 | | [A] |
| 2002 | 14.15 | 14.17 | +0.02 | yes | [A] |
| 2003 | 2.37 | 2.41 | +0.04 | yes | [A] |
| 2004 | 3.40 | 3.42 | +0.02 | | [A] |
| 2005 | 2.32 | 2.34 | +0.02 | | [A] |
| 2006 | 3.14 | 3.15 | +0.01 | | [A] |
| 2007 | 9.98 | 10.02 | +0.04 | | [A] |
| 2008 | 13.32 | 13.35 | +0.03 | yes | [A] |
| 2009 | -1.69 | -1.66 | +0.03 | yes | [B] |
| 2010 | 7.35 | 7.38 | +0.03 | yes | [C] |
| 2011 | 9.80 | 9.81 | +0.01 | yes | [D] |
| 2013 | -3.09 | -3.08 | +0.01 | yes | [E] |
| 2016 | 1.19 | 1.19 | 0.00 | yes | [F] |
| 2018 | 1.00 | 1.01 | +0.01 | | [G] |
| 2020 | 8.21 | 8.20 | -0.01 | yes | [H] |
| 2023 | 4.07 | 4.07 | 0.00 | | [I] |
| 2024 | 1.38 | 1.39 | +0.01 | | [J] |
| 2025 | 7.53 | 7.56 | +0.03 | | [K] |

Sources, all SEC EDGAR filings by Vanguard Fixed Income Securities Funds (CIK 106444), read 2026-11-18:

- [A] Prospectus (485BPOS), May 2009. Calendar-year returns 1999 to 2008 are given as text. https://www.sec.gov/Archives/edgar/data/106444/000093247109001084/fixedincome485bfinal052009.txt
- [B] Summary prospectus (497K), 2010-05-28. https://www.sec.gov/Archives/edgar/data/106444/000093247110002196/bondfundsspi035.htm
- [C] 497K, 2011-05-26. https://www.sec.gov/Archives/edgar/data/106444/000093247111002783/fixedincome_spi035.htm
- [D] 497K, 2012-05-30. https://www.sec.gov/Archives/edgar/data/106444/000093247112004734/inttermtreasury_spi035.htm
- [E] 497K, 2014-05-28. https://www.sec.gov/Archives/edgar/data/0000106444/000093247114005773/spi035052014inter-termtreasu.htm
- [F] 497K, 2017-05-26. https://www.sec.gov/Archives/edgar/data/106444/000093247117004256/sp35.htm
- [G] 497K, 2019-05-29. https://www.sec.gov/Archives/edgar/data/106444/000093247119007135/sp_035final.htm
- [H] 497K, 2021-05-28. https://www.sec.gov/Archives/edgar/data/106444/000168386321003790/f9120d1.htm
- [I] 497K, 2024-05-24. https://www.sec.gov/Archives/edgar/data/106444/000168386324004013/f38787d1.htm
- [J] 497K, 2025-05-29. https://www.sec.gov/Archives/edgar/data/106444/000168386325004864/f42138d1.htm
- [K] 497K, 2026-05-28. https://www.sec.gov/Archives/edgar/data/106444/000010644426000218/f45290d1.htm

Vanguard's own fund profile page (investor.vanguard.com) did not render its returns table for the fetcher, so I used the SEC copies of the prospectuses. Aggregators such as totalrealreturns.com were skipped because they are built from Yahoo's adjclose, which would make the check circular. No page tried to instruct me.

## What this says about the "ignored lumps"

- **Adjclose is right in every lump year** (2002, 2003, 2008, 2009, 2010, 2011, 2013, 2016 and 2020). Yahoo's close falls by the lump, and adjclose carries it through. So adjclose does not ignore these capital-gain distributions.
- **Adjclose is about 0.02 to 0.06 points a year high in 1999 to 2011.** That fits a small rounding or reinvestment-timing gap and does not matter for the app.
- **The first run of this check misdated events.** It keyed each event by its date plus 12 hours, which files a payment stamped late on a month's last day under the next month. That moved payments between months and years and made the event rebuild (evTR) drift by up to 1.6 points (2002) and show doubled "median" months. Keyed by the UTC date, as `monthlyDistributions` in `scripts/income-yield.mjs` does, evTR matches adjTR within 0.06 points in every year from 1992 to 2024. This also explains the earlier note's month-level "13 of 16 ignored": a dating mismatch, not missing return.
- **Recent events are incomplete.** 2025's evTR is 5.82 against adjTR 7.56 and the published 7.53: Yahoo has no VFITX distribution events after 2025-07, so the year's events total 0.231 for seven months. Raw events must still not be used directly as income.

## Recommendation

- Use VFITX's adjclose as its total-return series as it stands. No correction is needed.
- Do not add lump distributions back. That would double-count about 0.1 to 0.5 points in lump years.
- For income yield, do not use raw events as they come. `scripts/income-yield.mjs` takes the median of the trailing 12 months' payments (rejecting lumps) and fills a monthly payer's event-less months with the payout implied by adjclose against the raw close, which agrees with the events to a median 0.4% where both exist.
- The same check is worth repeating for VUSTX before relying on it. Run `node scripts/check-vfitx.mjs VUSTX` and compare against its own prospectus.
