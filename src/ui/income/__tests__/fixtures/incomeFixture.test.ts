// The preview's fixture IncomeResult, made by the engine. Rewrite it with
//   INCOME_FIXTURE=write npx vitest run src/ui/income/__tests__/fixtures
// Otherwise this checks the saved file still has the contract's shape.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import marketJson from '../../../../data/market.json'
import { INCOME_DEFAULTS, runIncomePaths } from '../../../../engine/income'
import type { IncomeInputs, IncomeResult } from '../../../../engine/incomeTypes'
import type { MarketData } from '../../../../engine/types'

/** Small: 200 futures, the defaults otherwise. */
const FIXTURE_INPUTS: IncomeInputs = { ...INCOME_DEFAULTS, paths: 200 }
const file = fileURLToPath(new URL('./incomeResult.json', import.meta.url))

describe('income fixture', () => {
  it('is an IncomeResult with a row per year', () => {
    if (process.env.INCOME_FIXTURE === 'write' || !existsSync(file)) {
      const r = runIncomePaths(marketJson as unknown as MarketData, FIXTURE_INPUTS)
      writeFileSync(file, JSON.stringify(r) + '\n')
    }
    const r = JSON.parse(readFileSync(file, 'utf8')) as IncomeResult
    expect(r.median).toHaveLength(r.years)
    expect(r.afterTaxIncome.p50).toHaveLength(r.years)
    expect(r.value.p50).toHaveLength(r.years + 1)
    for (const k of ['lastsRate', 'principalKeptRate', 'keepsPaceRate'] as const) {
      expect(r[k]).toBeGreaterThanOrEqual(0)
      expect(r[k]).toBeLessThanOrEqual(1)
    }
  })
})
