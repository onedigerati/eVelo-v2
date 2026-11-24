// Worker message growth from samples (verifier): JSON and structured-clone byte size, default plans.
import { serialize } from 'node:v8'
import { it } from 'vitest'
import marketJson from '../../../src/data/market.json'
import { CITIES } from '../../../src/data/cities'
import { DEFAULT_INPUTS } from '../../../src/engine/defaults'
import { INCOME_DEFAULTS, runIncomePaths } from '../../../src/engine/income'
import { simulate } from '../../../src/engine/simulate'
import type { MarketData } from '../../../src/engine/types'
const market = marketJson as unknown as MarketData
it('sizes', () => {
  const sim = simulate(market, CITIES, { ...DEFAULT_INPUTS, horizonYears: 40 })
  const inc = runIncomePaths(market, { ...INCOME_DEFAULTS, horizonYears: 40 })
  for (const [name, r] of [['simulate 4000x40y', sim], ['income 40y', inc]] as const) {
    const { samples, ...rest } = r as any
    const j = JSON.stringify(samples).length, jr = JSON.stringify(rest).length
    const c = serialize(samples).length, cr = serialize(rest).length
    console.log(`${name}: samples ${samples.length} entries x ${samples[0].years.length} rows; JSON ${j} B vs rest ${jr} B (+${((100 * j) / jr).toFixed(1)}%); structured clone ${c} B vs rest ${cr} B (+${((100 * c) / cr).toFixed(1)}%)`)
  }
})
