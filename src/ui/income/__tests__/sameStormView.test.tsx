// Same storm's view (docs/PLAN.md stage 4): shown vs hidden, the chips, the chart's text
// alternative, and the chart's pure helpers. The gate and futures are mocked (sameStorm.ts is
// tested on its own).
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IncomeInputs, IncomeResult } from '../../../engine/incomeTypes'
import type { PlanInputs, SimulationResult } from '../../../engine/types'
import type { StormFuture, StormGate, StormYear } from '../sameStorm'
import { defaultFuture, SameStorm } from '../SameStorm'
import { easeOut, forcedSaleYears, ltvDomain, stormAgeTicks, stormChartLabel, stormPoints, tweenPoints, worthDomain } from '../sameStormChart'

const state = vi.hoisted(() => ({ gate: 'shown' as string, futures: [] as unknown[] }))
vi.mock('../sameStorm', () => ({
  stormGate: () => state.gate,
  stormFutures: () => state.futures,
  stormHiddenText: (g: string) => `Hidden because ${g}.`,
}))

const row = (age: number, inc: number, nw: number, ltv: number, forced = 0): StormYear => ({
  age,
  income: { portfolio: inc, dividendsInterest: 0, socialSecurity: 0, sold: 0, tax: 0, reinvested: 0 },
  evelo: { netWorth: nw, portfolio: nw, loan: 0, ltv, borrowed: 0, interest: 0, forcedSaleSold: forced },
})
const future = (keys: StormFuture['keys'], label: string, years: StormYear[]): StormFuture => ({ keys, label, path: 1, years, callLtv: 0.5, caption: `${label} caption.` })

const early = future(['earlyCrash'], 'Early crash', [row(60, 1.9e6, 1.95e6, 0.1), row(61, 1.6e6, 1.5e6, 0.3), row(62, 1.5e6, 1.4e6, 0.35)])
const typical = future(['typical', 'lucky'], 'Typical · Lucky', [row(60, 2.1e6, 2.1e6, 0.05), row(61, 2.2e6, 2.3e6, 0.08), row(62, 2.3e6, 2.5e6, 0.1)])
const late = future(['lateCrash'], 'Late crash', [row(60, 2e6, 2e6, 0.1), row(61, 1.8e6, 1.2e6, 0.55, 2.5e5), row(62, 1.7e6, -1e5, 0.45, 1e5)])

const props = {
  evelo: {} as PlanInputs,
  eveloResult: { netWorth: { p50: [2e6] }, ltv: { p50: [0] } } as unknown as SimulationResult,
  income: {} as IncomeInputs,
  incomeResult: { value: { p50: [2e6] } } as unknown as IncomeResult,
}
const render = (phone = false) => renderToStaticMarkup(<SameStorm {...props} phone={phone} />)

describe('SameStorm', () => {
  beforeEach(() => {
    state.gate = 'shown'
    state.futures = [early, typical, late]
  })

  it('shown: heading, lede, a chip per future with the typical one selected, the chart and the caption', () => {
    const html = render()
    expect(html).toContain('data-testid="same-storm"')
    expect(html).toContain('Same storm, two boats')
    expect(html).toContain('Pick a future to see both plans live through the same months.')
    expect(html).toContain('role="tablist"')
    for (const k of ['earlyCrash', 'typical', 'lateCrash']) expect(html).toContain(`data-testid="storm-chip-${k}"`)
    expect(html).not.toContain('storm-chip-lucky')
    const chip = html.match(/<button[^>]*data-testid="storm-chip-typical"[^>]*>([^<]*)</)!
    expect(chip[0]).toContain('aria-selected="true"')
    expect(chip[0]).toContain('tabindex="0"')
    expect(chip[1]).toBe('Typical · Lucky')
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(html).toContain('data-testid="storm-chart"')
    expect(html).toContain('Typical · Lucky caption.')
    expect(html).toMatch(/aria-live="polite"[^>]*>Typical · Lucky caption\./)
    expect(html).not.toContain('storm-hidden')
  })

  it('the chart carries a text alternative for the chosen future', () => {
    const html = render()
    const chart = html.match(/<div[^>]*data-testid="storm-chart"[^>]*>/)![0]
    expect(chart).toContain('role="img"')
    expect(chart).toContain('typical · lucky future')
    expect(chart).toContain('At 63: living on income $2.3M, eVelo $2.5M after its loan.')
    expect(chart).toContain('no forced sale')
  })

  it('without a typical future the first chip is selected', () => {
    state.futures = [early, late]
    const html = render(true)
    expect(html).toMatch(/<button[^>]*aria-selected="true"[^>]*data-testid="storm-chip-earlyCrash"/)
    expect(html).toContain('ss--phone')
  })

  it.each(['fat-tail', 'different-futures', 'different-years', 'no-samples'] as StormGate[])('hidden (%s): the heading and one muted line, no chips or chart', (gate) => {
    state.gate = gate
    const html = render()
    expect(html).toContain('Same storm, two boats')
    expect(html).toContain(`data-testid="storm-hidden"`)
    expect(html).toContain(`Hidden because ${gate}.`)
    expect(html).not.toContain('role="tablist"')
    expect(html).not.toContain('storm-chart')
  })

  it('shown with no futures falls back to the no-samples line', () => {
    state.futures = []
    expect(render()).toContain('Hidden because no-samples.')
  })
})

describe('Same storm chart helpers', () => {
  it('default chip: the one holding typical, else the first', () => {
    expect(defaultFuture([early, typical, late])).toBe(1)
    expect(defaultFuture([early, late])).toBe(0)
  })

  it('points start at the plans’ start and follow the year ends', () => {
    const p = stormPoints(late, { income: 2e6, evelo: 2e6, ltv: 0 })
    expect(p.income).toEqual([2e6, 2e6, 1.8e6, 1.7e6])
    expect(p.evelo).toEqual([2e6, 2e6, 1.2e6, -1e5])
    expect(p.ltv).toEqual([0, 0.1, 0.55, 0.45])
    expect(stormPoints(late, null).ltv[0]).toBe(0.1)
    expect(stormPoints(late, { income: NaN }).income[0]).toBe(2e6)
  })

  it('tween eases from one future to the next, and snaps on a length mismatch', () => {
    const a = stormPoints(early, null)
    const b = stormPoints(late, null)
    expect(tweenPoints(a, b, 0).income).toEqual(a.income)
    expect(tweenPoints(a, b, 1)).toBe(b)
    expect(tweenPoints(a, b, 0.5).evelo[3]).toBeCloseTo((1.4e6 - 1e5) / 2)
    expect(tweenPoints({ income: [1], evelo: [1], ltv: [0] }, b, 0.2)).toBe(b)
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0.5)
  })

  it('domains are shared by every future: net worth through 0, loan-to-value past the call', () => {
    const all = [early, typical, late].map((f) => stormPoints(f, null))
    expect(worthDomain(all)).toEqual([-1e5, 2.5e6])
    expect(ltvDomain(all, 0.5)).toEqual([0, 0.625])
    expect(ltvDomain([{ income: [], evelo: [], ltv: [0.9, 1.4] }], 0.5)).toEqual([0, 1])
  })

  it('forced sales and the label name the years and the total', () => {
    expect(forcedSaleYears(late)).toEqual([1, 2])
    const label = stormChartLabel(late)
    expect(label).toContain('peaks at 55% against a 50% margin call')
    expect(label).toContain('forced sales of $350K in 2 years (ages 61, 62)')
    expect(label).toContain('eVelo −$100K after its loan')
  })

  it('age ticks: the ends and round ages between', () => {
    expect(stormAgeTicks(60, 90, false)).toEqual([60, 65, 70, 75, 80, 85, 90])
    expect(stormAgeTicks(58, 93, true)).toEqual([58, 70, 80, 93])
  })
})
