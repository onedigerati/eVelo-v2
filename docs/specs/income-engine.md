# Income engine spec (stage 3)

The living-on-income engine: `runIncomePaths`. Pure TS in `src/engine/income.ts`, no DOM. It runs on the same futures as eVelo and settles money once a year. Decisions behind it are in `docs/PLAN.md` (2026-11-18), and the research is in `docs/research/conventional-bond-modelling.md` and `conventional-income-taxes.md`.

## API

```ts
// src/engine/incomeTypes.ts
export interface IncomeInputs {
  portfolio: number          // starting value, today's USD
  basisFraction: number      // cost basis ÷ value at the start, 0..1, same for every sleeve
  age: number                // whole years; for MFJ the spouse is taken as the same age
  horizonYears: number       // whole years
  spending: number           // after-tax spending, today's USD/yr (constant in real terms)
  otherIncome: number        // Social Security, today's USD/yr, from incomeStartAge; taxed as Social Security
  incomeStartAge: number
  stockShare: number         // 0..1 of the portfolio in stocks (SPY); the rest is bonds
  muniShare: number          // 0..1 of the bonds in munis (VWITX); the rest is taxable, split half VFITX, half VBMFX
  filingStatus: FilingStatus
  homeCityId: string         // state tax from stateIncomeTaxFor(); a non-US city is federal only
  // Shared with eVelo so the futures match:
  method: ModelMethod; outlook: Outlook; blockMonths: number; paths: number; seed: number
}
export interface IncomeResult {
  paths: number; years: number
  lastsRate: number          // share of paths where spending is met every year to the horizon
  principalKeptRate: number  // share of paths with no gap sale in any year
  keepsPaceRate: number      // share of paths whose real after-tax income never falls below 90% of year one's
  value: Bands               // real portfolio value, years 0..horizon (Bands as in types.ts)
  afterTaxIncome: Bands      // real after-tax income (portfolio income + otherIncome − tax), years 1..horizon
  median: IncomeYearRow[]    // per year 1..horizon, the per-year medians of each field (the layered chart and ledger)
  startYield: { stocks: number; munis: number; taxable: number } // year-one yields actually used
}
export interface IncomeYearRow {
  year: number; age: number
  dividends: number; muniInterest: number; taxableInterest: number; treasuryInterest: number
  otherIncome: number; tax: number; spending: number
  gapSold: number            // sold to cover the gap (0 if income covered spending)
  reinvested: number         // surplus reinvested
  value: number              // end-of-year real portfolio value
}
// worker: a new request kind 'income' { id, kind: 'income', inputs: IncomeInputs } → { id, kind: 'income', result: IncomeResult }
```

## Futures

- **Same month draws as eVelo.** `generateScenarios` gets an option to also return each path's calendar month indices (`idx: Int32Array`, paths × T). It must not change any existing output (same rng sequence; eVelo's golden tests stay bit-identical). `runIncomePaths` calls it with the same `method`, `blockMonths`, `paths`, `T = horizonYears × 12` and `seed` that `simulate` uses for the same values.
- Every month, each sleeve takes that month's real history: total return `r` from the asset's series (after the same outlook shrinkage `prepare` applies to that asset), yield change `Δy = y[m] − y[m−1]`, and CPI from the same month as eVelo.
- **`fat-tail` (unattended decision):** under `fat-tail`, the sleeves still use the bootstrapped month indices for `r`, `Δy` and CPI. So the income engine is always historical-bootstrap, and the comparison says so.

## Yields

- Each sleeve's yield starts at its latest value in `market.json`. Taxable is the mean of VFITX and VBMFX, tracked per fund.
- Each month: `y ← max(FLOOR, y + clamp(Δy, −CAP, +CAP))`.
  - `CAP` is the asset's 99th percentile of `|Δy|` over its history, computed once at load.
  - `FLOOR` is 0.25%.
- Yield levels are never replayed.

## Each month (nominal dollars)

For each sleeve (SPY, VWITX, VFITX, VBMFX):
- Income `I = V × y / 12`, added to the year's income bucket by type: SPY counts as qualified dividends, VWITX as muni interest, VFITX as Treasury interest, VBMFX as taxable interest.
- `V ← V × (1 + r − y / 12)`, floored at 0. Income is paid out of the total return, and the rest is price change.
- The price level `P` compounds with CPI from 1 at the start.

## Each year-end settlement

1. Cash in: the year's portfolio income, plus `otherIncome × P` if `age ≥ incomeStartAge` (age = start age + years elapsed).
2. Need: `spending × P`.
3. Tax: `incomeTax({ income by type ÷ P, socialSecurity: otherIncome counted, longTermGains: realised ÷ P }, { status, over65 from age (both spouses for MFJ), priceLevel: P, state, year: 2026 + t })`, multiplied by `P`.
4. **Gap** (cash in − tax < need):
   - Sell pro rata to current sleeve values.
   - Realised gain = sale × (1 − basis ÷ value) per sleeve (average cost).
   - Tax depends on the gain, so solve the gross sale by fixed-point iteration: at most 6 rounds, stop when the change is under $1.
   - If the portfolio can't cover it, the path has failed from that year on: value 0, and every later year counts as not met.
5. **Surplus:** reinvest after tax, pro rata to the target weights. It adds to basis at cost.
6. There is no other rebalancing, so there are no rebalancing sales.

Year one's after-tax income is the base for `keepsPace`. A year with value 0 after failure counts as not keeping pace.

## Outputs

- Every amount is real: divide by `P` at that year-end.
- Bands use the same quantile helper as `simulate`.

## Resolved points (2026-11-18, after the engine and the reference were written independently)

Both implementations follow these. Where they differed, the choice is marked with **which way**.

1. **Δy without drift.** `Δy[m] = y[m] − y[m−1] − mean(Δy)` over the asset's months 1..M−1. Δy at calendar month 0 is 0.
   - Why demean: history's yields fell from about 6% to 3% (VWITX −1.9 points per 30 years, VBMFX −2.6, SPY −1.3), and replaying raw changes would carry that fall into every future.
   - Yields wander around today's level, the way eVelo's currency walk is centred.
2. **CAP:** the 99th percentile of the *demeaned* |Δy| over months 1..M−1, with `simulate`'s linear-interpolation quantile. The clamp applies to the demeaned change.
3. **Timing (the reference's reading):** each month's income and value update use the yield at the start of the month, and Δy is applied at the end of the month. Month 1 therefore pays exactly the latest `market.json` yield. `startYield` reports those latest values.
4. **Returns:** `r` comes from `prepare(market, the four sleeves, outlook).R` at double precision, not the Float32 scenario returns. CPI comes from `market.cpi` at double precision.
5. **Starting sleeves:**
   - SPY gets `s`, VWITX `(1−s)·m`, and VFITX and VBMFX `(1−s)(1−m)/2` each.
   - Basis is `basisFraction` × each sleeve.
   - The same weights are the reinvestment targets.
6. **Year k (1-based):** age is `age + k − 1`, and the tax year is `2026 + k − 1`. Other income and over-65 status follow that age; over-65 counts both spouses for MFJ.
7. **Gap sale:**
   - Start: `S₀ = need − (cashIn − tax₀)`, where tax₀ is the tax with no gain.
   - Repeat `S ← need − cashIn + tax(S)` up to 6 times, stopping when |ΔS| is under $1 nominal.
   - Gains are netted across sleeves, and a net loss counts as 0.
   - The tax recorded is the one that set the final S.
   - A sleeve at V = 0 isn't sold.
   - Average cost: `B ← B·(1 − sale/V)`.
8. **Gap year:** strictly `cashIn − tax < need`.
9. **Failure:**
   - When `S > ΣV`, everything is sold and taxed on its gain, and the path fails from that year on.
   - Later years have value 0 and no portfolio income, while other income and its tax are still recorded and nothing is reinvested.
   - The failure year and every later year count as not met, as a gap year, and as not keeping pace.
   - The row's `spending` is the need, even in a failed year.
10. **keepsPace:** real after-tax income is portfolio income + other income − the whole year's tax, gains tax included. Every year must be at least 0.9 × year one's.

11. **Bracket indexing lag:** the IRS sets each year's brackets from inflation up to the year before. So in year k the indexed federal amounts (brackets, standard deduction, 0/15/20 breakpoints, 65+ additions) sit at `P_{k−1}` (the price level at the start of the year, 1 in year 1), while the year's income is at `P_k`. `incomeTax` takes `indexLevel` (default `priceLevel`). In real terms the indexed amounts scale by `indexLevel ÷ priceLevel`, and the fixed nominal thresholds stay `÷ priceLevel`. State brackets follow the same lag.

## Checks this spec must meet

These are the plan's stage 3 checks:
- The futures match eVelo's.
- The yields are anchored to today.
- A one-path hand-worked case is settled correctly.
- The three measures and the bands.
- The worker kind.
- A speed budget.
