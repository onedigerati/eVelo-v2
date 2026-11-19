// Regenerates the chart's fixed IncomeResult (fixtures/incomeResult.json) when WRITE_INCOME_FIXTURE=1;
// otherwise checks the saved one still has the contract's shape.
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { INCOME_DEFAULTS, runIncomePaths } from '../../../engine/income'
import type { IncomeResult } from '../../../engine/incomeTypes'
import type { MarketData } from '../../../engine/types'
import fixture from './fixtures/incomeResult.json'

describe('income chart fixture', () => {
  it.skipIf(!process.env.WRITE_INCOME_FIXTURE)('writes the fixture from runIncomePaths', () => {
    const r = runIncomePaths(marketJson as unknown as MarketData, {
      ...INCOME_DEFAULTS,
      portfolio: 2_400_000,
      age: 58,
      horizonYears: 30,
      spending: 96_000,
      otherIncome: 30_000,
      incomeStartAge: 67,
      stockShare: 0.55,
      muniShare: 0.7,
      paths: 400,
      seed: 7,
    })
    const round = (_: string, v: unknown) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)
    writeFileSync(new URL('./fixtures/incomeResult.json', import.meta.url), JSON.stringify(r, round) + '\n')
  })

  it('has one median row per year, each with every field', () => {
    const r = fixture as IncomeResult
    expect(r.median).toHaveLength(r.years)
    expect(r.years).toBeGreaterThan(0)
    for (const row of r.median)
      for (const k of ['dividends', 'muniInterest', 'taxableInterest', 'treasuryInterest', 'otherIncome', 'tax', 'spending', 'gapSold'] as const)
        expect(Number.isFinite(row[k])).toBe(true)
  })
})
