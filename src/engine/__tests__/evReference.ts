// Independent scalar reference of ONE eVelo (buy-borrow-die) loan path, month by month, for the
// stage 1 yearly tallies (docs/PLAN.md, "eVelo yearly tallies"). Test-only. Written to be read, not
// to be fast, from the rules in the kernel's header comment (src/engine/kernel.ts), not from its loop.
//
// Scope: retired from month 0, no existing loan (so no opening sale), staying home (no move, no FX
// walk), no inheritance tax; optionally a flat wealth tax on net worth from year 0 (a taxed home). Returns are taken as given per month (pass them after the
// dividend-tax drag).
//
// Month t, in order:
//   1. price level P *= 1 + infl[t]; portfolio V *= 1 + ret[t].
//   2. interest = L × loanRate/12 on the loan before this month's interest; L += interest.
//   3. need = (spending − income once started) × P. need > 0 is borrowed (L += need). A surplus
//      (need < 0) repays the loan first; what is left over is reinvested (V and cost basis rise).
//   3b. At each year-end month (t % 12 = 11), with a wealth tax: w = rate × (V − L)/P (real, if the
//      base is > 0) is added to the loan as w × P.
//   4. Broken if V <= 0 or V <= L: the lender liquidates; nothing more happens on this path.
//   5. If L > maxLtv × V, a forced sale of S shares brings the loan to targetLtv:
//        (L − S(1 − g·tax)) / (V − S) = targetLtv,   g = max(0, 1 − basis/V)
//      the proceeds after capital-gains tax, S(1 − g·tax), repay the loan; basis falls pro rata.
//      A sale that can't reach the target (S >= V, or S not > 0) breaks the path.
//
// Tallies (per year y = months 12y..12y+11), "real" = each month's nominal amount ÷ that month's P:
//   borrowed       Σ need/P over months with need > 0
//   interest       Σ interest/P
//   forcedSaleSold Σ S/P (shares sold by margin calls, gross of tax)
//   repaid         Σ (surplus applied to the loan + forced-sale proceeds applied to the loan)/P
//   wealthTax      Σ w (real wealth tax added to the loan)
//   loanEnd        L/P at the year's last month (0 once broken)
// Nominal versions of the flows are returned too: the nominal loan identity
//   L_end = L_start + borrowed + interest + wealthTax − repaid
// holds exactly, while the real one also loses the year's inflation erosion of the balance.
//
// AMBIGUITY: the month a path breaks still counts that month's borrowing, interest and wealth tax
// (they were added to the loan before the lender liquidated); every later month adds 0.

export interface EvRefInputs {
  portfolio: number
  basisFraction: number
  /** Annual loan rate (decimal); interest capitalizes monthly at loanRate / 12. */
  loanRate: number
  maxLtv: number
  targetLtv: number
  capGainsRate: number
  /** Spending, today's USD per month (inflated by the path's price level). */
  spendingMonthly: number
  /** Other income (Social Security), today's USD per month, from `incomeStartMonth` on. */
  incomeMonthly: number
  incomeStartMonth: number
  /** Monthly portfolio returns (after any drag) and monthly inflation; equal lengths, a multiple of 12. */
  ret: ArrayLike<number>
  infl: ArrayLike<number>
  /** Flat annual wealth tax rate on real net worth, charged at each year-end; absent = none. */
  wealthTaxRate?: number
}

export interface EvRefYears {
  borrowed: number[]
  interest: number[]
  forcedSaleSold: number[]
  repaid: number[]
  wealthTax: number[]
  /** Real loan at each year's end (0 once broken). */
  loanEnd: number[]
  /** Price level at each year's end. */
  priceEnd: number[]
  nominal: {
    borrowed: number[]
    interest: number[]
    forcedSaleSold: number[]
    repaid: number[]
    wealthTax: number[]
    loanEnd: number[]
  }
  /** First month a forced sale (or the breaking liquidation) happened, or -1. */
  firstCallMonth: number
  broken: boolean
  /** Month the path broke, or -1. */
  breakMonth: number
}

export function evReference(inp: EvRefInputs): EvRefYears {
  const months = inp.ret.length
  const years = Math.floor(months / 12)
  const zeros = () => new Array<number>(years).fill(0)
  const out: EvRefYears = {
    borrowed: zeros(),
    interest: zeros(),
    forcedSaleSold: zeros(),
    repaid: zeros(),
    wealthTax: zeros(),
    loanEnd: zeros(),
    priceEnd: zeros(),
    nominal: { borrowed: zeros(), interest: zeros(), forcedSaleSold: zeros(), repaid: zeros(), wealthTax: zeros(), loanEnd: zeros() },
    firstCallMonth: -1,
    broken: false,
    breakMonth: -1,
  }
  const monthlyRate = inp.loanRate / 12

  let portfolio = inp.portfolio
  let basis = inp.portfolio * inp.basisFraction
  let loan = 0
  let price = 1

  for (let t = 0; t < months; t++) {
    const y = Math.floor(t / 12)
    price *= 1 + inp.infl[t]

    if (!out.broken) {
      // 1. market
      portfolio *= 1 + inp.ret[t]

      // 2. interest on last month's balance
      const interest = loan * monthlyRate
      loan += interest
      out.interest[y] += interest / price
      out.nominal.interest[y] += interest

      // 3. spending less income
      const income = t >= inp.incomeStartMonth ? inp.incomeMonthly : 0
      const need = (inp.spendingMonthly - income) * price
      if (need > 0) {
        loan += need
        out.borrowed[y] += need / price
        out.nominal.borrowed[y] += need
      } else if (need < 0) {
        const surplus = -need
        const toLoan = Math.min(surplus, loan)
        loan -= toLoan
        out.repaid[y] += toLoan / price
        out.nominal.repaid[y] += toLoan
        const leftover = surplus - toLoan
        portfolio += leftover
        basis += leftover
      }

      // 3b. year-end wealth tax on real net worth, borrowed
      if (inp.wealthTaxRate && t % 12 === 11) {
        const base = (portfolio - loan) / price
        if (base > 0) {
          const w = inp.wealthTaxRate * base
          loan += w * price
          out.wealthTax[y] += w
          out.nominal.wealthTax[y] += w * price
        }
      }

      // 4. insolvency
      if (portfolio <= 0 || portfolio <= loan) {
        out.broken = true
        out.breakMonth = t
        if (out.firstCallMonth < 0) out.firstCallMonth = t
      } else if (loan > inp.maxLtv * portfolio) {
        // 5. margin call
        if (out.firstCallMonth < 0) out.firstCallMonth = t
        const gainShare = basis < portfolio ? 1 - basis / portfolio : 0
        const keep = 1 - gainShare * inp.capGainsRate // proceeds per $ sold, after tax
        const sold = (loan - inp.targetLtv * portfolio) / (keep - inp.targetLtv)
        if (!(sold > 0) || sold >= portfolio) {
          out.broken = true
          out.breakMonth = t
        }
        else {
          const proceeds = sold * keep
          basis *= 1 - sold / portfolio
          portfolio -= sold
          loan -= proceeds
          out.forcedSaleSold[y] += sold / price
          out.nominal.forcedSaleSold[y] += sold
          out.repaid[y] += proceeds / price
          out.nominal.repaid[y] += proceeds
        }
      }
    }

    if (t % 12 === 11) {
      out.priceEnd[y] = price
      out.loanEnd[y] = out.broken ? 0 : loan / price
      out.nominal.loanEnd[y] = out.broken ? 0 : loan
    }
  }
  return out
}
