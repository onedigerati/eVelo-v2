// Hashes every pre-stage-3 figure (verifier). Run on HEAD+working tree and on a scratch worktree of 323810c;
// the hashes must be equal. simulate drops elapsedMs, yearly, samples; income drops samples.
import { createHash } from 'node:crypto'
import { describe, it } from 'vitest'
import marketJson from '../../../src/data/market.json'
import { CITIES } from '../../../src/data/cities'
import { DEFAULT_INPUTS } from '../../../src/engine/defaults'
import { INCOME_DEFAULTS, runIncomePaths } from '../../../src/engine/income'
import { simulate } from '../../../src/engine/simulate'
import { runAtlas } from '../../../src/engine/atlas'
import { solveSpending } from '../../../src/engine/solve'
import type { MarketData, PlanInputs } from '../../../src/engine/types'

const market = marketJson as unknown as MarketData
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex')
const plan = (o: Partial<PlanInputs>): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), paths: 400, ...o })
const PLANS: [string, PlanInputs][] = [
  ['default', plan({})],
  ['bootstrap 30y seed 3 block 24', plan({ method: 'bootstrap', horizonYears: 30, seed: 3, blockMonths: 24 })],
  ['fat-tail', plan({ method: 'fat-tail', seed: 9 })],
  ['existing loan', plan({ method: 'bootstrap', existingLoan: 900_000 })],
  ['retire later', plan({ method: 'bootstrap', retireInYears: 6, savingsWhileWorking: 40_000, moveInYears: 8 })],
]
const INCOMES = [
  ['income defaults', { ...INCOME_DEFAULTS }],
  ['income bootstrap 40y seed 5', { ...INCOME_DEFAULTS, method: 'bootstrap', horizonYears: 40, seed: 5, paths: 500 }],
  ['income fat-tail', { ...INCOME_DEFAULTS, method: 'fat-tail', paths: 300 }],
] as const

describe('verifier: old figures hash', () => {
  it('hashes', () => {
    const lines: string[] = []
    for (const [name, inp] of PLANS) {
      const { elapsedMs: _e, yearly: _y, samples: _s, ...rest } = simulate(market, CITIES, inp) as any
      lines.push(`simulate ${name} (method ${inp.method}): ${sha(rest)}`)
    }
    for (const [name, inp] of INCOMES) {
      const { samples: _s, ...rest } = runIncomePaths(market, inp as any) as any
      lines.push(`income ${name}: ${sha(rest)}`)
    }
    const ids = CITIES.slice(0, 12).map((c) => c.id)
    for (const [name, inp] of PLANS.slice(0, 3)) {
      const small = { ...inp, paths: 200 }
      lines.push(`atlas ${name}: ${sha(runAtlas(market, CITIES, small, ids))}`)
      lines.push(`solve ${name}: ${sha(solveSpending(market, CITIES, small, 0.85))}`)
    }
    console.log('HASHES\n' + lines.join('\n'))
  })
})
