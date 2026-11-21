// The walkthrough section's shell renders from real-shaped results (docs/PLAN.md stage 2).
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeResult } from '../../../engine/incomeTypes'
import type { Bands, SimulationResult } from '../../../engine/types'
import { Walkthrough } from '../Walkthrough'
import fixture from './fixtures/incomeResult.json'

const income = fixture as IncomeResult
const n = income.years
const band = (a: number[]): Bands => ({ p5: a, p25: a, p50: a, p75: a, p95: a })
const seq = (f: (i: number) => number, len: number) => Array.from({ length: len }, (_, i) => f(i))
const evelo = {
  inputs: { age: 58, horizonYears: n, otherIncome: 30_000, incomeStartAge: 67, retireInYears: 0 },
  netWorth: band(seq((i) => 2.4e6 + i * 5e4, n + 1)),
  portfolioValue: band(seq((i) => 2.4e6 + i * 9e4, n + 1)),
  loan: band(seq((i) => i * 4e4, n + 1)),
  ltv: band(seq((i) => i / 100, n + 1)),
  yearly: { borrowed: seq(() => 6e4, n), interest: seq((i) => i * 1e3, n), forcedSaleSold: seq(() => 0, n), repaid: seq(() => 0, n), wealthTax: seq(() => 0, n) },
} as unknown as SimulationResult
const inputs = { ...INCOME_DEFAULTS, age: 58, horizonYears: n, otherIncome: 30_000, incomeStartAge: 67 }

describe('Walkthrough', () => {
  it('renders the section, a tab per chapter, the controls and the first chapter’s years on the slider', () => {
    const html = renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide />)
    for (const id of ['walkthrough', 'wt-tab-before', 'wt-tab-arrives', 'wt-tab-estate', 'wt-prev', 'wt-next', 'wt-play', 'wt-year', 'wt-chart', 'wt-ledgers', 'wt-story-income', 'wt-story-evelo'])
      expect(html).toContain(`data-testid="${id}"`)
    expect(html).toContain('role="tablist"')
    expect(html).toMatch(/data-testid="wt-year"[^>]*min="0"[^>]*max="8"|min="0"[^>]*max="8"[^>]*data-testid="wt-year"/)
    expect(html).toContain('Chapter 1 of')
    expect(html).toContain('Before Social Security')
  })

  it('on a phone the rail shows ages only', () => {
    const html = renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide={false} />)
    expect(html).toContain('wt--phone')
    expect(html).not.toContain('wt__tab-name')
  })
})
