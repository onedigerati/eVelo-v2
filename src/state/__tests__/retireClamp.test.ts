import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { normalizeInputs } from '../../engine/simulate'
import type { PlanInputs } from '../../engine/types'
import { clampAfterPatch, clampAfterReplace, clampAfterSet } from '../loanClamp'
import { keepRetireBeforeHorizon, maxRetireInYears } from '../retireClamp'
import { sanitizeInputs } from '../share'

const plan = (over: Partial<PlanInputs> = {}): PlanInputs => ({ ...DEFAULT_INPUTS, horizonYears: 30, retireInYears: 12, ...over })

describe('maxRetireInYears', () => {
  it('is 15, or a year before the horizon ends', () => {
    expect(maxRetireInYears(30)).toBe(15)
    expect(maxRetireInYears(16)).toBe(15)
    expect(maxRetireInYears(15)).toBe(14)
    expect(maxRetireInYears(10)).toBe(9)
    expect(maxRetireInYears(1)).toBe(0)
    expect(maxRetireInYears(NaN)).toBe(0)
  })
})

describe('keepRetireBeforeHorizon', () => {
  it('passes a retire-in below the horizon through untouched (same object)', () => {
    const p = plan()
    expect(keepRetireBeforeHorizon(p)).toBe(p)
  })

  it('pulls retirement in below a shorter horizon, and rounds / zeroes junk as the engine does', () => {
    expect(keepRetireBeforeHorizon(plan({ horizonYears: 10 })).retireInYears).toBe(9)
    expect(keepRetireBeforeHorizon(plan({ retireInYears: 40 })).retireInYears).toBe(15)
    expect(keepRetireBeforeHorizon(plan({ retireInYears: -3 })).retireInYears).toBe(0)
    expect(keepRetireBeforeHorizon(plan({ retireInYears: 2.4 })).retireInYears).toBe(2)
    expect(keepRetireBeforeHorizon(plan({ retireInYears: NaN })).retireInYears).toBe(0)
  })

  it('agrees with the engine and the share-link sanitizer', () => {
    for (const horizonYears of [10, 12, 15, 16, 30])
      for (const retireInYears of [0, 1, 5, 9, 11, 14, 15, 20]) {
        const p = plan({ horizonYears, retireInYears })
        const r = keepRetireBeforeHorizon(p).retireInYears
        expect(r).toBe(normalizeInputs(p).retireInYears)
        expect(r).toBe(sanitizeInputs(p).retireInYears)
      }
  })
})

describe('the store clamps retire-in when the horizon drops', () => {
  it('setInput: a lower horizon pulls retirement in with it', () => {
    const c = clampAfterSet(plan({ horizonYears: 15, retireInYears: 14 }), 'horizonYears', 10)
    expect(c.inputs.horizonYears).toBe(10)
    expect(c.inputs.retireInYears).toBe(9)
    // a higher horizon leaves it alone
    expect(clampAfterSet(plan({ horizonYears: 15, retireInYears: 14 }), 'horizonYears', 30).inputs.retireInYears).toBe(14)
  })

  it('setInput: retire-in itself is capped below the horizon', () => {
    expect(clampAfterSet(plan({ horizonYears: 12 }), 'retireInYears', 15).inputs.retireInYears).toBe(11)
  })

  it('patchInputs and replaceInputs clamp it too', () => {
    expect(clampAfterPatch(plan(), { horizonYears: 10 }).inputs.retireInYears).toBe(9)
    expect(clampAfterReplace(plan({ horizonYears: 11 })).inputs.retireInYears).toBe(10)
  })

  it('does not report a loan lowering for it', () => {
    expect(clampAfterSet(plan(), 'horizonYears', 10).lowered).toBeNull()
  })
})
