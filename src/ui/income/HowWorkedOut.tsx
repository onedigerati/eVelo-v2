// "How this is worked out": the mode's own method notes. They live here, never on the Method page,
// which would give the mode away (docs/PLAN.md, 2026-11-18). Every claim follows the engine
// (src/engine/income.ts, incomeTax.ts; docs/specs/income-engine.md) and the plan's decisions.
import './incomeResults.css'

export function HowWorkedOut({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <details className="ihow" open={defaultOpen || undefined}>
      <summary className="ihow__summary">
        <span>How this is worked out</span>
        <svg className="ihow__chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="ihow__body">
        <h3>The same futures as eVelo</h3>
        <p>
          Each future is stitched from runs of real months drawn from history: the same draws eVelo makes with its default settings,
          the same seed, block length and number of futures. So with eVelo on its defaults, the two live through the same months in
          the same order, and their odds can be set side by side.
        </p>
        <p>
          The money sits in three sleeves, each a real fund’s history: stocks are the S&amp;P 500 fund (SPY), munis an
          intermediate-term tax-exempt fund (VWITX), and taxable bonds are held half in an intermediate-term Treasury fund (VFITX)
          and half in a total bond market fund (VBMFX).
        </p>

        <h3>Yields start at today’s</h3>
        <p>
          Each fund starts at its latest yield: a year of its payments over today’s price. From there, every month the yield moves
          by the change history saw in that drawn month, never by the old level, so a 1990s month can’t pay a 1990s coupon today.
          History’s long fall in yields is taken out of those changes, so yields wander around today’s level instead of sliding
          lower in every future. A single month’s move is capped at the fund’s largest usual move (its 99th percentile), and no
          yield falls below 0.25%. Income is the yield times what’s held; the rest of the month’s return is the price moving.
        </p>

        <h3>Income first, then selling</h3>
        <p>
          Once a year the income is settled. Dividends, coupons, interest and Social Security (from the age it starts) pay the
          bills first, after tax. Your spending stays the same in today’s dollars and rises with each future’s own inflation. If
          income falls short, the gap is sold from every sleeve in proportion to its size, and the sale’s gains are taxed (average
          cost), so the sale grows to cover its own tax. If income is more than enough, the surplus is reinvested at your mix.
          There is no other rebalancing. A future fails when it would have to sell more than it holds.
        </p>

        <h3>Three measures</h3>
        <p>
          <b>The money lasts</b>: the share of futures in which every year’s spending is met to the end of the plan. It’s the same
          test eVelo puts first. <b>Principal never sold</b>: the share in which no year sells anything to cover a gap, the strict
          promise of living on income. <b>Income keeps pace</b>: the share in which income after tax, in today’s dollars, never
          falls more than 10% below year one’s. A future that runs out counts as not keeping pace.
        </p>
        <p>
          The chart and the year-by-year table show the typical future: each figure is that year’s median across all futures.
        </p>

        <h3>Tax</h3>
        <p>
          Federal tax follows 2026 law, single or married filing jointly, with the standard deduction always taken. Qualified
          dividends and long-term gains get the 0, 15 and 20% rates, and the 3.8% net investment income tax applies above its
          threshold. Muni interest is federally tax-free, but it still counts when working out how much of Social Security is
          taxed. Brackets and deductions rise with inflation a year behind, as the IRS sets them from the year before; the net
          investment income and Social Security thresholds stay fixed in dollars, as the law has them.
        </p>
        <p>
          For a US home city, the state taxes investment income with its 2026 brackets and deductions. Treasury interest is
          state-tax-free. A national muni fund’s interest is state-taxed except in states with no income tax, since only the
          in-state share would be exempt and it’s taken as none. New York City and Philadelphia add their local tax on interest and
          dividends. Georgia’s retirement exclusion for those 65 and over is included.
        </p>

        <h3>What’s left out</h3>
        <ul>
          <li>The alternative minimum tax, and Medicare’s income-related premiums (IRMAA).</li>
          <li>
            State retirement-income exclusions and credits other than Georgia’s; Portland’s local income taxes, Washington’s
            capital-gains tax, Massachusetts’s short-term gains rate and Hawaii’s cap on the gains rate.
          </li>
          <li>
            Federal brackets really rise with the chained CPI, about a quarter point a year slower than the inflation used here, so
            over a long plan they drift slightly wider than the law’s.
          </li>
          <li>A home outside the US gets US federal tax only; local tax on the interest and dividends there isn’t modelled.</li>
          <li>
            The futures are always drawn from historical months, even when eVelo is set to fat tails: fat tails reshape a whole
            portfolio’s return, and this mode needs each fund’s own month.
          </li>
          <li>Taxable bonds are always half Treasury, half total bond market, not your own funds.</li>
        </ul>
      </div>
    </details>
  )
}
