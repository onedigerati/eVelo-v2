// The Atlas and the solver run the kernel with no recorder, so the eVelo yearly tallies (recorded
// only when simulate passes one) must leave them untouched. These hashes were captured before the
// tallies were added (at 2d9ccfc) and pin both outputs bit for bit.

import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { runAtlas } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import { solveSpending } from '../solve'
import type { PlanInputs } from '../types'
import { CITIES_FIX, syntheticMarket } from './fixtures'

const mkt = syntheticMarket(240, [
  { symbol: 'QQQ', alpha: 0.002, beta: 1.2, noise: 0.02, cls: 'etf-equity' },
  { symbol: 'BND', alpha: 0.003, beta: 0.1, noise: 0.01, first: 120 },
])
const holdings = [{ symbol: 'SPY', weight: 0.5 }, { symbol: 'QQQ', weight: 0.3 }, { symbol: 'BND', weight: 0.2 }]
const plan = (o: Partial<PlanInputs>): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), holdings, paths: 300, horizonYears: 25, ...o })
const PLANS: [string, PlanInputs][] = [
  ['default', plan({})],
  ['existing loan', plan({ existingLoan: 900_000 })],
  ['retire later', plan({ retireInYears: 6, savingsWhileWorking: 40_000, moveInYears: 8 })],
  ['fat tail', plan({ method: 'fat-tail', destCityId: 'zurich' })],
]
const IDS = CITIES_FIX.map((c) => c.id)
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex')

function digest() {
  return sha(PLANS.map(([, inp]) => ({ atlas: runAtlas(mkt, CITIES_FIX, inp, IDS), solve: solveSpending(mkt, CITIES_FIX, inp, 0.85) })))
}

// Captured on arm64. libm rounding can differ by arch (see SIM_BOOTSTRAP in income.test.ts); add an
// arch's hash from a run of the pre-tally commit there.
const GOLDEN: Record<string, string> = {
  arm64: 'b86829e4c63111a3224457af57ce65a19743d166ed9a9e432ef3ce3f41f13f08',
}

describe('Atlas and solve are unchanged by the yearly tallies', () => {
  it.skipIf(!GOLDEN[process.arch])('atlas and solve outputs match the golden from before', () => {
    const d = digest()
    console.log(`atlas+solve digest (${process.arch}): ${d}`)
    expect(d).toBe(GOLDEN[process.arch])
  })
})
