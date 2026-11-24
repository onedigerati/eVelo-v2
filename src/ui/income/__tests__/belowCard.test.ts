// Swap the mixes, stage 3: below the card. The walkthrough and Same storm follow the Holdings
// switch — each plan's own result under "Each its own" (unchanged), the swapped pair under a shared
// mix (with a waiting state while it's worked out) — and say which mix they're on.

import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { CITIES } from '../../../data/cities'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS, runIncomePaths } from '../../../engine/income'
import type { IncomeInputs, IncomeResult } from '../../../engine/incomeTypes'
import { simulate } from '../../../engine/simulate'
import type { MarketData, PlanInputs, SimulationResult } from '../../../engine/types'
import { belowCard, belowMixLine, belowWaitText, comparedLine } from '../holdings'
import type { IncomeComputed } from '../incomeClient'
import { stormFutures, stormGate } from '../sameStorm'
import { swappedEveloPlan, swappedIncomeInputs } from '../swap'
import { resolvePair, SwapRuns, swapKey, type EveloComputed, type OwnEvelo, type SwapPair } from '../swapRuns'
import { buildYears, chapters } from '../walkthrough'

const plan: PlanInputs = {
  ...DEFAULT_INPUTS,
  holdings: [
    { symbol: 'SPY', weight: 0.7 },
    { symbol: 'MUB', weight: 0.1 },
    { symbol: 'BND', weight: 0.2 },
  ],
}
const income: IncomeInputs = { ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5 }
const ownIncome: IncomeComputed = { inputs: income, result: { tag: 'own-income' } as unknown as IncomeResult }
const ownResult = { tag: 'own-evelo' } as unknown as SimulationResult
const ownEvelo: OwnEvelo = { status: 'done', result: ownResult }
const swappedIncome: IncomeComputed = { inputs: { ...income, stockShare: 0.8 }, result: { tag: 'swapped-income' } as unknown as IncomeResult }
const swappedEvelo: EveloComputed = { inputs: { ...plan, holdings: [] }, result: { tag: 'swapped-evelo' } as unknown as SimulationResult }

describe('what the walkthrough and Same storm read (belowCard)', () => {
  it('“Each its own” reads each plan’s own result exactly as before, with no mix line', () => {
    const pair: SwapPair = { status: 'done', mode: 'own', borrowed: null, approximate: false, evelo: { inputs: plan, result: ownResult }, income: ownIncome }
    expect(belowCard('own', pair, plan, ownIncome, ownEvelo)).toEqual({ status: 'done', evelo: { inputs: plan, result: ownResult }, income: ownIncome, mixLine: null })
    // Nothing below until eVelo's own result is in, as before the switch.
    expect(belowCard('own', { status: 'loading', mode: 'own' }, plan, ownIncome, { status: 'loading' })).toEqual({ status: 'loading', mixLine: null })
    expect(belowCard('own', { status: 'empty', mode: 'own' }, plan, ownIncome, { status: 'empty' })).toEqual({ status: 'empty', mixLine: null })
  })

  it('a shared mix reads the swapped pair, each result with the inputs it ran for', () => {
    const a: SwapPair = { status: 'done', mode: 'evelo', borrowed: 'income', approximate: true, evelo: { inputs: plan, result: ownResult }, income: swappedIncome }
    const b = belowCard('evelo', a, plan, ownIncome, ownEvelo)
    expect(b).toMatchObject({ status: 'done', income: swappedIncome, evelo: { inputs: plan, result: ownResult } })
    const c: SwapPair = { status: 'done', mode: 'income', borrowed: 'evelo', approximate: false, evelo: swappedEvelo, income: ownIncome }
    expect(belowCard('income', c, plan, ownIncome, ownEvelo)).toMatchObject({ status: 'done', income: ownIncome, evelo: swappedEvelo })
  })

  it('waits (loading / error / empty) while the shared mix’s run isn’t in, never falling back to the own results', () => {
    for (const status of ['loading', 'error', 'empty'] as const) {
      const b = belowCard('income', { status, mode: 'income' }, plan, ownIncome, ownEvelo)
      expect(b).toEqual({ status, mixLine: comparedLine('income', plan, income) })
    }
    // A pair for another mode (never expected) reads as loading, not as this mode's.
    const stale: SwapPair = { status: 'done', mode: 'evelo', borrowed: 'income', approximate: true, evelo: { inputs: plan, result: ownResult }, income: swappedIncome }
    expect(belowCard('income', stale, plan, ownIncome, ownEvelo).status).toBe('loading')
  })

  it('the mix line is the card’s “what’s compared” line (plus “approximate” when the mode borrows)', () => {
    expect(belowMixLine('own', plan, income)).toBeNull()
    expect(belowMixLine('income', plan, income)).toBe(comparedLine('income', plan, income))
    expect(belowMixLine('income', plan, income)).toBe('Both plans on this mode’s mix: 60% stocks, 20% munis, 20% taxable bonds.')
    expect(belowMixLine('evelo', plan, income)).toBe(`${comparedLine('evelo', plan, income)} Living on income’s side is approximate.`)
    expect(belowMixLine('evelo', plan, income)).toMatch(/^Both plans on eVelo’s mix: 70% stocks, /)
  })

  it('the waiting line names what’s being re-run', () => {
    expect(belowWaitText('income', 'loading')).toMatch(/eVelo is re-run on this mode’s mix/)
    expect(belowWaitText('evelo', 'loading')).toMatch(/living on income is re-run on eVelo’s mix/)
    expect(belowWaitText('evelo', 'error')).toMatch(/Pick another mix/)
    expect(belowWaitText('income', 'empty')).toMatch(/holdings/)
  })
})

describe('below the card on a shared mix, from real engine runs', () => {
  const market = marketJson as unknown as MarketData
  // Synced futures (as the comparison needs for Same storm).
  const inc: IncomeInputs = { ...income, horizonYears: plan.horizonYears, seed: plan.seed, blockMonths: plan.blockMonths, method: plan.method }
  const own = simulate(market, CITIES, plan)
  const ownInc: IncomeComputed = { inputs: inc, result: runIncomePaths(market, inc) }
  const swE = swappedEveloPlan(plan, inc)
  const swI = swappedIncomeInputs(inc, plan)!
  const cache = new Map<string, EveloComputed | IncomeComputed>([
    [swapKey('evelo', swE), { inputs: swE, result: simulate(market, CITIES, swE) }],
    [swapKey('income', swI), { inputs: swI, result: runIncomePaths(market, swI) }],
  ])
  const runs = new SwapRuns(cache)
  const ownRun: OwnEvelo = { status: 'done', result: own }
  const below = (mode: 'own' | 'evelo' | 'income') => {
    const b = belowCard(mode, resolvePair(mode, plan, ownInc, ownRun, runs), plan, ownInc, ownRun)
    if (b.status !== 'done') throw new Error(`not done: ${b.status}`)
    return b
  }
  const picks = (fs: ReturnType<typeof stormFutures>) => fs.map((f) => [f.label, f.path])

  it('the walkthrough reads the swapped pair’s per-year results; “Each its own” is unchanged', () => {
    const o = below('own')
    expect(buildYears(o.income.result, o.income.inputs, o.evelo.result)).toEqual(buildYears(ownInc.result, inc, own))
    for (const mode of ['income', 'evelo'] as const) {
      const b = below(mode)
      const years = buildYears(b.income.result, b.income.inputs, b.evelo.result)
      const sw = mode === 'income' ? cache.get(swapKey('evelo', swE))! : cache.get(swapKey('income', swI))!
      expect(b[mode === 'income' ? 'evelo' : 'income']).toBe(sw)
      expect(years).not.toEqual(buildYears(ownInc.result, inc, own))
      expect(chapters(years, b.income.inputs).length).toBeGreaterThan(0)
    }
    // eVelo on the mode's mix: eVelo's rows come from the swapped run, the mode's from its own.
    const e = below('income')
    const ownYears = buildYears(ownInc.result, inc, own)
    const eYears = buildYears(e.income.result, e.income.inputs, e.evelo.result)
    expect(eYears.map((y) => y.income)).toEqual(ownYears.map((y) => y.income))
    expect(eYears.map((y) => y.evelo)).not.toEqual(ownYears.map((y) => y.evelo))
  })

  it('Same storm gets the swapped plan: same path indices, each plan’s path on the shared mix, gate holds', () => {
    const o = below('own')
    const ownFutures = stormFutures(o.evelo.inputs, o.evelo.result, o.income.inputs, o.income.result)
    expect(ownFutures.length).toBeGreaterThan(0)
    for (const mode of ['income', 'evelo'] as const) {
      const b = below(mode)
      expect(stormGate(b.evelo.inputs, b.evelo.result, b.income.inputs, b.income.result)).toBe('shown')
      if (mode === 'income') expect(b.evelo.inputs).toBe(swE)
      else expect(b.income.inputs).toBe(swI)
      const fs = stormFutures(b.evelo.inputs, b.evelo.result, b.income.inputs, b.income.result)
      expect(picks(fs)).toEqual(picks(ownFutures))
      // Each plan's path is its run on the shared mix.
      for (const f of fs) {
        const es = b.evelo.result.samples!.find((s) => s.key === f.keys[0])!
        const is = b.income.result.samples!.find((s) => s.key === f.keys[0])!
        expect(f.years.map((y) => y.evelo)).toEqual(es.years.slice(0, f.years.length))
        expect(f.years.map((y) => y.income)).toEqual(is.years.slice(0, f.years.length))
      }
      const borrowed = mode === 'income' ? fs.map((f) => f.years.map((y) => y.evelo)) : fs.map((f) => f.years.map((y) => y.income))
      const ownSide = mode === 'income' ? ownFutures.map((f) => f.years.map((y) => y.evelo)) : ownFutures.map((f) => f.years.map((y) => y.income))
      expect(borrowed).not.toEqual(ownSide)
    }
  })

  it('the gate still holds on a shared mix: unsynced futures hide Same storm with the comparison’s reason', () => {
    const unsynced: IncomeInputs = { ...inc, seed: inc.seed + 1 }
    const swI2 = swappedIncomeInputs(unsynced, plan)!
    expect(stormGate(plan, own, swI2, { samples: null } as unknown as IncomeResult)).toBe('different-futures')
    expect(stormGate(swappedEveloPlan(plan, unsynced), own, unsynced, { samples: null } as unknown as IncomeResult)).toBe('different-futures')
  })
})
