import { describe, expect, it } from 'vitest'
import { INCOME_DEFAULTS, INCOME_LIMITS } from '../../engine/income'
import { FLOW_DEFAULTS, INCOME_KEY, loadIncomeFlow, loadIncomeInputs, sanitizeIncomeFlow, sanitizeIncomeInputs, saveIncomeInputs } from '../incomeState'

function fakeStorage(init: Record<string, string> = {}) {
  const map = new Map(Object.entries(init))
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}
const load = (s: string) => loadIncomeInputs(fakeStorage({ [INCOME_KEY]: s }))

describe('income state', () => {
  it('lives under evelo:v2:income', () => {
    expect(INCOME_KEY).toBe('evelo:v2:income')
  })

  it('starts on the defaults with nothing stored, or no storage', () => {
    expect(loadIncomeInputs(fakeStorage())).toEqual(INCOME_DEFAULTS)
    expect(loadIncomeInputs(null)).toEqual(INCOME_DEFAULTS)
  })

  it('falls back to the defaults on bad JSON or the wrong shape', () => {
    for (const bad of ['{not json', '', 'null', '5', '"x"', '[1,2]', 'true', '[]']) expect(load(bad)).toEqual(INCOME_DEFAULTS)
  })

  it('falls back to the defaults when storage throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
    }
    expect(loadIncomeInputs(throwing)).toEqual(INCOME_DEFAULTS)
  })

  it('ignores __proto__, constructor and unknown keys, and never pollutes prototypes', () => {
    const r = load('{"__proto__":{"polluted":1,"portfolio":5},"constructor":{"prototype":{"x":1}},"extra":9,"spending":50000}')
    expect(r).toEqual({ ...INCOME_DEFAULTS, spending: 50000 })
    expect(Object.keys(r).sort()).toEqual(Object.keys(INCOME_DEFAULTS).sort())
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype)
    // Inherited keys on an object are not own keys either.
    const inherited = Object.create({ portfolio: 7 })
    expect(sanitizeIncomeInputs(inherited).portfolio).toBe(INCOME_DEFAULTS.portfolio)
  })

  it('keeps the default for wrong types and non-finite numbers', () => {
    const r = sanitizeIncomeInputs({
      portfolio: '5000000',
      age: null,
      spending: Number.NaN,
      otherIncome: Number.POSITIVE_INFINITY,
      stockShare: [0.5],
      filingStatus: 1,
      homeCityId: { id: 'x' },
      method: true,
    })
    expect(r).toEqual(INCOME_DEFAULTS)
  })

  it('checks enumerations and the home city', () => {
    expect(sanitizeIncomeInputs({ filingStatus: 'mfj', method: 'fat-tail', outlook: 'conservative' })).toMatchObject({
      filingStatus: 'mfj',
      method: 'fat-tail',
      outlook: 'conservative',
    })
    const bad = sanitizeIncomeInputs({ filingStatus: 'married', method: 'magic', outlook: 'rosy', homeCityId: '__proto__' })
    expect(bad).toEqual(INCOME_DEFAULTS)
    expect(sanitizeIncomeInputs({ homeCityId: 'constructor' }).homeCityId).toBe(INCOME_DEFAULTS.homeCityId)
  })

  it('clamps out-of-range numbers to INCOME_LIMITS and rounds whole-number fields', () => {
    const lo = sanitizeIncomeInputs({ portfolio: -5, age: 3, horizonYears: 0, stockShare: -1, muniShare: -0.2, blockMonths: 1, seed: -9, basisFraction: -1 })
    expect(lo).toMatchObject({ portfolio: 0, age: INCOME_LIMITS.age[0], horizonYears: 1, stockShare: 0, muniShare: 0, blockMonths: 6, seed: 0, basisFraction: 0 })
    const hi = sanitizeIncomeInputs({ portfolio: 1e20, age: 200, horizonYears: 99, stockShare: 3, otherIncome: 1e12, incomeStartAge: 99, seed: 2 ** 40 })
    expect(hi).toMatchObject({ portfolio: 1e10, age: 85, horizonYears: 40, stockShare: 1, otherIncome: 1_000_000, incomeStartAge: 80, seed: 2 ** 31 - 1 })
    expect(sanitizeIncomeInputs({ age: 61.6, horizonYears: 29.4 })).toMatchObject({ age: 62, horizonYears: 29 })
  })

  it("keeps the path count to eVelo's own choices", () => {
    expect(sanitizeIncomeInputs({ paths: 4000 }).paths).toBe(4000)
    expect(sanitizeIncomeInputs({ paths: 7 }).paths).toBe(INCOME_DEFAULTS.paths)
  })

  it('round-trips through storage', () => {
    const s = fakeStorage()
    const inputs = { ...INCOME_DEFAULTS, portfolio: 2_500_000, spending: 90_000, stockShare: 0.4, muniShare: 0.7, filingStatus: 'mfj' as const, age: 67 }
    saveIncomeInputs(s, inputs)
    expect(JSON.parse(s.map.get(INCOME_KEY)!)).toEqual(inputs)
    expect(loadIncomeInputs(s)).toEqual(inputs)
  })

  it('a failing save does not throw', () => {
    const full = {
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveIncomeInputs(full, INCOME_DEFAULTS)).not.toThrow()
    expect(() => saveIncomeInputs(null, INCOME_DEFAULTS)).not.toThrow()
  })
})

describe('income flow (step / done)', () => {
  it('starts on question 1, not done', () => {
    expect(loadIncomeFlow(fakeStorage())).toEqual(FLOW_DEFAULTS)
    expect(loadIncomeFlow(null)).toEqual({ step: 1, done: false })
    expect(load('{"spending":50000}')).toEqual({ ...INCOME_DEFAULTS, spending: 50000 })
  })
  it('clamps and rounds the step to 1–6, and takes done only as true', () => {
    expect(sanitizeIncomeFlow({ step: 4, done: true })).toEqual({ step: 4, done: true })
    expect(sanitizeIncomeFlow({ step: 0 }).step).toBe(1)
    expect(sanitizeIncomeFlow({ step: 99 }).step).toBe(6)
    expect(sanitizeIncomeFlow({ step: 2.6 }).step).toBe(3)
    for (const bad of [NaN, Infinity, '3', null]) expect(sanitizeIncomeFlow({ step: bad }).step).toBe(1)
    for (const bad of ['true', 1, {}, null]) expect(sanitizeIncomeFlow({ done: bad }).done).toBe(false)
    for (const bad of [null, [], 'x', 5]) expect(sanitizeIncomeFlow(bad)).toEqual(FLOW_DEFAULTS)
    expect(sanitizeIncomeFlow(JSON.parse('{"__proto__":{"done":true,"step":5}}'))).toEqual(FLOW_DEFAULTS)
  })
  it('bad JSON is the default flow', () => {
    expect(loadIncomeFlow(fakeStorage({ [INCOME_KEY]: '{not json' }))).toEqual(FLOW_DEFAULTS)
  })
  it('round-trips beside the inputs under the same key', () => {
    const s = fakeStorage()
    const inputs = { ...INCOME_DEFAULTS, spending: 90_000 }
    saveIncomeInputs(s, inputs, { step: 4, done: true })
    expect(JSON.parse(s.map.get(INCOME_KEY)!)).toEqual({ ...inputs, step: 4, done: true })
    expect(loadIncomeInputs(s)).toEqual(inputs)
    expect(loadIncomeFlow(s)).toEqual({ step: 4, done: true })
  })
})
