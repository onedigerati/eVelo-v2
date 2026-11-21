// The walkthrough's overview net-worth chart: both plans' median real net worth over every year, the
// chapter's span lit, tap or click (or keyboard) to pick a year (docs/PLAN.md stage 2).
// STUB: the foundation's placeholder; the chart builder replaces it, keeping WalkthroughChartProps.

import type { WalkthroughChartProps } from './walkthrough'

export function WalkthroughChart({ years, chapters, chapter, year }: WalkthroughChartProps) {
  const c = chapters[chapter]
  return (
    <div className="wt__placeholder" data-testid="wt-chart">
      Net-worth chart: {years.length} years, chapter {c?.name}, year age {years[year]?.age}.
    </div>
  )
}
