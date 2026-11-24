// The walkthrough section's shell renders from real-shaped results (docs/PLAN.md stage 2).
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeResult } from '../../../engine/incomeTypes'
import type { Bands, SimulationResult } from '../../../engine/types'
import { TwinLedgers } from '../TwinLedgers'
import { buildYears, chapters } from '../walkthrough'
import { isPlaying, Walkthrough } from '../Walkthrough'
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

  it('the ledgers say Social Security starts in its start year, given the year before, and not after', () => {
    const years = buildYears(income, inputs, evelo)
    const arrives = chapters(years, inputs).find((c) => c.key === 'arrives')!
    const s = arrives.from
    expect(years[s].age).toBe(67)
    const at = renderToStaticMarkup(<TwinLedgers row={years[s]} prev={years[s - 1]} phone={false} />)
    expect(at.match(/Social Security starts\./g)).toHaveLength(2)
    const after = renderToStaticMarkup(<TwinLedgers row={years[s + 1]} prev={years[s]} phone={false} />)
    expect(after).not.toContain('Social Security starts.')
  })

  it('Back and Next stay focusable at the ends: aria-disabled, not disabled', () => {
    const html = renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide />)
    const prev = html.match(/<button[^>]*data-testid="wt-prev"[^>]*>/)![0]
    const next = html.match(/<button[^>]*data-testid="wt-next"[^>]*>/)![0]
    expect(prev).toContain('aria-disabled="true"')
    expect(prev).not.toMatch(/\sdisabled=/)
    expect(next).toContain('aria-disabled="false"')
  })

  it('the ledgers show tax once, in the header', () => {
    const years = buildYears(income, inputs, evelo)
    const html = renderToStaticMarkup(<TwinLedgers row={years[0]} prev={null} phone={false} />)
    expect(html.match(/>Tax</g)).toBeNull()
    expect(html).toContain('tax <span')
  })

  it('Play stops when the years or chapters change: it only runs for the list it started on', () => {
    const a = chapters(buildYears(income, inputs, evelo), inputs)
    const b = chapters(buildYears(income, inputs, evelo), inputs)
    expect(isPlaying(a, a)).toBe(true)
    expect(isPlaying(a, b)).toBe(false)
    expect(isPlaying(null, a)).toBe(false)
  })
})

describe('Walkthrough under the Holdings switch', () => {
  it('says which mix it’s on when given a mix line, and nothing extra under “Each its own”', () => {
    const line = 'Both plans on this mode’s mix: 60% stocks, 40% bonds.'
    const shared = renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide mixLine={line} />)
    expect(shared).toContain('data-testid="wt-mix"')
    expect(shared).toContain(line)
    const own = renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide />)
    expect(own).not.toContain('wt-mix')
    expect(renderToStaticMarkup(<Walkthrough income={income} incomeInputs={inputs} evelo={evelo} wide mixLine={null} />)).toBe(own)
  })
})
