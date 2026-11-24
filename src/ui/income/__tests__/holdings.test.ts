// Swap the mixes, stage 2: the Holdings switch's pure logic — the choices, the line saying what's
// compared, the approximate note, the mix bars (the borrower shows what it borrows) and which
// result each column reads under a choice.

import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeResult } from '../../../engine/incomeTypes'
import type { PlanInputs, SimulationResult } from '../../../engine/types'
import { incomeHoldings, mixParts } from '../compare'
import { APPROX_NOTE, approxNote, comparedLine, compareMixes, compareSides, HOLDINGS_CHOICES, sharesText, waitText } from '../holdings'
import type { IncomeComputed } from '../incomeClient'
import type { EveloComputed, OwnEvelo, SwapPair } from '../swapRuns'

const plan: PlanInputs = {
  ...DEFAULT_INPUTS,
  holdings: [
    { symbol: 'SPY', weight: 0.7 },
    { symbol: 'MUB', weight: 0.1 },
    { symbol: 'BND', weight: 0.2 },
  ],
}
const income = { ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5 }
const ownIncome: IncomeComputed = { inputs: income, result: { tag: 'own-income' } as unknown as IncomeResult }
const ownResult = { tag: 'own-evelo' } as unknown as SimulationResult
const ownEvelo: OwnEvelo = { status: 'done', result: ownResult }
const swappedIncome: IncomeComputed = { inputs: { ...income, stockShare: 0.7 }, result: { tag: 'swapped-income' } as unknown as IncomeResult }
const swappedEvelo: EveloComputed = { inputs: plan, result: { tag: 'swapped-evelo' } as unknown as SimulationResult }

describe('the Holdings choices', () => {
  it('are three, "Each its own" first', () => {
    expect(HOLDINGS_CHOICES.map((c) => c.label)).toEqual(['Each its own', 'Both on eVelo’s mix', 'Both on this mode’s mix'])
    expect(HOLDINGS_CHOICES.map((c) => c.value)).toEqual(['own', 'evelo', 'income'])
  })
})

describe("what's compared", () => {
  it('puts the shares in plain words, leaving out zero parts', () => {
    expect(sharesText({ stockShare: 0.6, muniShare: 0.5 })).toBe('60% stocks, 20% munis, 20% taxable bonds')
    expect(sharesText({ stockShare: 0.6, muniShare: 0 })).toBe('60% stocks, 40% bonds')
    expect(sharesText({ stockShare: 1, muniShare: 0 })).toBe('100% stocks')
  })
  it('says nothing under "Each its own", so the default view is unchanged', () => {
    expect(comparedLine('own', plan, income)).toBeNull()
    expect(approxNote('own')).toBeNull()
  })
  it("names eVelo's mix, mapped onto stocks and munis", () => {
    expect(comparedLine('evelo', plan, income)).toBe('Both plans on eVelo’s mix: 70% stocks, 10% munis, 20% taxable bonds.')
    expect(comparedLine('evelo', { holdings: [] }, income)).toBe('Both plans on eVelo’s mix.')
  })
  it("names this mode's mix", () => {
    expect(comparedLine('income', plan, income)).toBe('Both plans on this mode’s mix: 60% stocks, 20% munis, 20% taxable bonds.')
  })
  it("notes the mode's run is approximate only on eVelo's mix", () => {
    expect(approxNote('evelo')).toBe(APPROX_NOTE)
    expect(APPROX_NOTE).toMatch(/approximate/)
    expect(APPROX_NOTE).toMatch(/stock and muni shares/)
    expect(approxNote('income')).toBeNull()
  })
})

describe('the mix bars', () => {
  const own = { income: mixParts(incomeHoldings(income)), evelo: mixParts(plan.holdings) }
  it('each its own: no borrowing', () => {
    expect(compareMixes('own', plan, income)).toEqual({ income: { parts: own.income, borrowed: false }, evelo: { parts: own.evelo, borrowed: false } })
  })
  it("on eVelo's mix the mode shows eVelo's holdings, tagged borrowed", () => {
    expect(compareMixes('evelo', plan, income)).toEqual({ income: { parts: own.evelo, borrowed: true }, evelo: { parts: own.evelo, borrowed: false } })
  })
  it("on this mode's mix eVelo shows the mode's four funds, tagged borrowed", () => {
    const m = compareMixes('income', plan, income)
    expect(m.evelo).toEqual({ parts: own.income, borrowed: true })
    expect(m.evelo.parts.map((p) => p.symbol)).toEqual(['SPY', 'VWITX', 'VFITX', 'VBMFX'])
    expect(m.income).toEqual({ parts: own.income, borrowed: false })
  })
})

describe('which result each column reads', () => {
  it("each its own: the plans' own results, eVelo waiting as before", () => {
    const pair: SwapPair = { status: 'done', mode: 'own', borrowed: null, approximate: false, evelo: { inputs: plan, result: ownResult }, income: ownIncome }
    const s = compareSides('own', pair, plan, ownIncome, ownEvelo)
    expect(s.income).toEqual({ status: 'done', value: ownIncome })
    expect(s.evelo).toEqual({ status: 'done', value: { inputs: plan, result: ownResult } })
    const waiting = compareSides('own', { status: 'loading', mode: 'own' }, plan, ownIncome, { status: 'loading' })
    expect(waiting).toEqual({ income: { status: 'done', value: ownIncome }, evelo: { status: 'loading' } })
  })
  it("a shared mix that's in: the swapped pair's results", () => {
    const pair: SwapPair = { status: 'done', mode: 'evelo', borrowed: 'income', approximate: true, evelo: { inputs: plan, result: ownResult }, income: swappedIncome }
    expect(compareSides('evelo', pair, plan, ownIncome, ownEvelo).income).toEqual({ status: 'done', value: swappedIncome })
    const pair2: SwapPair = { status: 'done', mode: 'income', borrowed: 'evelo', approximate: false, evelo: swappedEvelo, income: ownIncome }
    expect(compareSides('income', pair2, plan, ownIncome, ownEvelo).evelo).toEqual({ status: 'done', value: swappedEvelo })
  })
  it('while a swapped run loads, only the borrower waits', () => {
    const a = compareSides('evelo', { status: 'loading', mode: 'evelo' }, plan, ownIncome, ownEvelo)
    expect(a).toEqual({ income: { status: 'loading' }, evelo: { status: 'done', value: { inputs: plan, result: ownResult } } })
    const b = compareSides('income', { status: 'error', mode: 'income' }, plan, ownIncome, ownEvelo)
    expect(b).toEqual({ income: { status: 'done', value: ownIncome }, evelo: { status: 'error' } })
  })
})

describe('a waiting column', () => {
  it("keeps eVelo's own lines under each its own", () => {
    expect(waitText('evelo', 'loading', false)).toBe('Working out eVelo’s futures…')
    expect(waitText('evelo', 'error', false)).toBe('eVelo’s figures couldn’t be worked out. Reload to try again.')
  })
  it("says the borrower is re-running, or briefly that it couldn't", () => {
    expect(waitText('income', 'loading', true)).toBe('Re-running living on income on eVelo’s mix…')
    expect(waitText('evelo', 'loading', true)).toBe('Re-running eVelo on this mode’s mix…')
    expect(waitText('income', 'error', true)).toMatch(/couldn’t be worked out/)
    expect(waitText('income', 'empty', true)).toMatch(/no mix to borrow/)
  })
})
