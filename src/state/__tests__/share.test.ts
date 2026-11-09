import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { parseHash } from '../router'
import * as engineSim from '../../engine/simulate'
import { normalizeInputs } from '../../engine/simulate'
import { baseUrl, decodeInputs, encodeInputs, INPUT_LIMITS, MAX_RETIRE_IN_YEARS, MAX_SAVINGS_WHILE_WORKING, sanitizeInputs, shareUrl } from '../share'

describe('share links', () => {
  it('round-trips changed inputs', () => {
    const inputs = { ...DEFAULT_INPUTS, portfolio: 7_250_000, destCityId: 'lisbon', holdings: [{ symbol: 'SPY', weight: 1 }] }
    const s = encodeInputs(inputs)
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeInputs(s)).toEqual(inputs)
  })
  it('defaults encode compactly', () => {
    expect(encodeInputs(DEFAULT_INPUTS).length).toBeLessThan(20)
  })
  it('rejects garbage and wrong types', () => {
    expect(decodeInputs('not-base64!!')).toBeNull()
    const bad = btoa(JSON.stringify({ v: 1, d: { portfolio: 'lots', age: 60, method: 7 } })).replace(/=+$/, '')
    const out = decodeInputs(bad)!
    expect(out.portfolio).toBe(DEFAULT_INPUTS.portfolio)
    expect(out.age).toBe(60)
    expect(out.method).toBe(DEFAULT_INPUTS.method)
  })
  it('builds a full URL whose hash decodes back to the plan', () => {
    const inputs = { ...DEFAULT_INPUTS, age: 61 }
    const url = shareUrl(inputs, baseUrl({ href: 'https://ex.com/evelo/?x=1#atlas', protocol: 'https:' }, ''))
    expect(url.startsWith('https://ex.com/evelo/?x=1#p=')).toBe(true)
    const p = parseHash(new URL(url).hash).params.get('p')!
    expect(decodeInputs(p)).toEqual(inputs)
    expect(baseUrl({ href: 'about:srcdoc', protocol: 'about:' }, 'https://host.example/a#b')).toBe('https://host.example/a')
  })

  it('clamps hostile numbers to the UI ranges', () => {
    const enc = (d: object) => btoa(JSON.stringify({ v: 1, d })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
    const out = decodeInputs(
      enc({
        capGainsRate: 5, portfolio: -1e6, horizonYears: 500, moveInYears: -3, maxLtv: 1.5, targetLtvAfterCall: 2,
        loanRate: -0.5, dividendTaxDrag: 3, paths: 1e9, blockMonths: 0, seed: -4.7, age: 7, basisFraction: 9,
        expatFactor: -2, otherIncome: -5, incomeStartAge: 300, budget: { housing: -100, dining: 1e30 },
        ratioOverrides: { housing: 1000, dining: -1 }, holdings: [{ symbol: 'SPY', weight: 7 }],
      }),
    )!
    expect(out.capGainsRate).toBe(0.6)
    expect(decodeInputs(enc({ capGainsRate: -3 }))!.capGainsRate).toBe(0)
    expect(out.portfolio).toBe(0)
    expect(out.horizonYears).toBe(40)
    expect(out.moveInYears).toBe(0)
    expect(out.maxLtv).toBe(0.8)
    expect(out.targetLtvAfterCall).toBe(0.75)
    expect(out.targetLtvAfterCall).toBeLessThan(out.maxLtv)
    expect(out.loanRate).toBe(0.02)
    expect(out.dividendTaxDrag).toBe(0.015)
    expect(out.paths).toBe(DEFAULT_INPUTS.paths)
    expect(out.blockMonths).toBe(6)
    expect(out.seed).toBe(0)
    expect(out.age).toBe(30)
    expect(out.basisFraction).toBe(1)
    expect(out.expatFactor).toBe(0)
    expect(out.otherIncome).toBe(0)
    expect(out.incomeStartAge).toBe(80)
    expect(out.budget.housing).toBe(0)
    expect(out.budget.dining).toBe(1e9)
    expect(out.ratioOverrides).toEqual({ housing: 5, dining: 0.05 })
    expect(out.holdings).toEqual([{ symbol: 'SPY', weight: 1 }])
    // the target LTV is kept 5 points under a lowered threshold
    expect(sanitizeInputs({ ...DEFAULT_INPUTS, maxLtv: 0.4, targetLtvAfterCall: 0.45 }).targetLtvAfterCall).toBe(0.35)
  })

  it('leaves every plan inside the UI ranges unchanged', () => {
    expect(sanitizeInputs(structuredClone(DEFAULT_INPUTS))).toEqual(DEFAULT_INPUTS)
    for (const [k, [lo, hi]] of Object.entries(INPUT_LIMITS)) {
      for (const v of [lo, hi]) {
        // As the UI does, keep the post-sale target 5 points under the threshold.
        const ltv = k === 'targetLtvAfterCall' ? { maxLtv: 0.8 } : k === 'maxLtv' ? { targetLtvAfterCall: Math.min(0.45, Math.round((v - 0.05) * 100) / 100) } : {}
        // An existing loan sits under the portfolio; the field's top end needs the largest portfolio.
        const loan = k === 'existingLoan' ? { portfolio: INPUT_LIMITS.portfolio[1] } : {}
        const inp = { ...DEFAULT_INPUTS, [k]: v, ...ltv, ...loan }
        expect(sanitizeInputs(inp), `${k}=${v}`).toEqual(inp)
      }
    }
    const edge = { ...DEFAULT_INPUTS, paths: 10000, maxLtv: 0.3, targetLtvAfterCall: 0.25, ratioOverrides: { housing: 0.05, travel: 5 } }
    expect(sanitizeInputs(edge)).toEqual(edge)
    // A balance $1 under the portfolio, or past the margin-call LTV, is a valid plan.
    for (const existingLoan of [500_000, 2_999_999]) {
      const p = { ...DEFAULT_INPUTS, portfolio: 3_000_000, existingLoan }
      expect(sanitizeInputs(p)).toEqual(p)
    }
  })

  describe('existing loan', () => {
    const enc = (d: object) => btoa(JSON.stringify({ v: 1, d })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
    const loanOf = (d: object) => decodeInputs(enc(d))!.existingLoan

    it('defaults to no loan and still encodes short', () => {
      expect(DEFAULT_INPUTS.existingLoan).toBe(0)
      expect(encodeInputs(DEFAULT_INPUTS).length).toBeLessThan(20)
    })
    it('loads an old share link or saved plan without the field as 0', () => {
      const { existingLoan: _, ...old } = { ...DEFAULT_INPUTS, portfolio: 4_000_000, age: 58 }
      expect('existingLoan' in old).toBe(false)
      expect(sanitizeInputs(old).existingLoan).toBe(0)
      expect(sanitizeInputs(old)).toEqual({ ...old, existingLoan: 0 })
      expect(loanOf({ portfolio: 4_000_000, age: 58 })).toBe(0)
    })
    it('round-trips a balance', () => {
      const inputs = { ...DEFAULT_INPUTS, portfolio: 3_000_000, existingLoan: 500_000 }
      expect(decodeInputs(encodeInputs(inputs))).toEqual(inputs)
    })
    it('clamps hostile balances', () => {
      expect(loanOf({ existingLoan: -250_000 })).toBe(0)
      expect(loanOf({ existingLoan: 'lots' })).toBe(0)
      expect(loanOf({ existingLoan: null })).toBe(0)
      expect(loanOf({ existingLoan: { n: 1 } })).toBe(0)
      expect(sanitizeInputs({ ...DEFAULT_INPUTS, existingLoan: Number.NaN }).existingLoan).toBe(0)
      expect(sanitizeInputs({ ...DEFAULT_INPUTS, existingLoan: Infinity }).existingLoan).toBe(0)
      // at or above the portfolio: kept $1 under it
      expect(loanOf({ portfolio: 3_000_000, existingLoan: 3_000_000 })).toBe(2_999_999)
      expect(loanOf({ portfolio: 3_000_000, existingLoan: 9e15 })).toBe(2_999_999)
      // the portfolio is clamped first, then the loan under it
      expect(loanOf({ portfolio: -1e6, existingLoan: 100 })).toBe(0)
      expect(loanOf({ portfolio: 1e12, existingLoan: 1e12 })).toBe(1e10 - 1)
    })
  })

  describe('retire later', () => {
    const enc = (d: object) => btoa(JSON.stringify({ v: 1, d })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
    const dec = (d: object) => decodeInputs(enc(d))!

    it('uses the engine’s limits', () => {
      expect(MAX_RETIRE_IN_YEARS).toBe(engineSim.MAX_RETIRE_IN_YEARS)
      expect(MAX_SAVINGS_WHILE_WORKING).toBe(engineSim.MAX_SAVINGS_WHILE_WORKING)
    })
    it('defaults to retiring now with no savings, and still encodes short', () => {
      expect(DEFAULT_INPUTS.retireInYears).toBe(0)
      expect(DEFAULT_INPUTS.savingsWhileWorking).toBe(0)
      expect(encodeInputs(DEFAULT_INPUTS).length).toBeLessThan(20)
    })
    it('round-trips both fields through a share link and the saved plan', () => {
      const inputs = { ...DEFAULT_INPUTS, retireInYears: 4, savingsWhileWorking: 85_000, destCityId: 'lisbon' }
      expect(decodeInputs(encodeInputs(inputs))).toEqual(inputs)
      expect(sanitizeInputs(JSON.parse(JSON.stringify(inputs)))).toEqual(inputs)
      // each on its own too
      for (const d of [{ retireInYears: 15 }, { savingsWhileWorking: 1_000_000 }]) {
        const one = { ...DEFAULT_INPUTS, ...d }
        expect(decodeInputs(encodeInputs(one))).toEqual(one)
      }
    })
    it('loads an old share link or saved plan without them as 0', () => {
      const { retireInYears: _r, savingsWhileWorking: _s, ...old } = { ...DEFAULT_INPUTS, portfolio: 4_000_000, age: 58 }
      expect('retireInYears' in old || 'savingsWhileWorking' in old).toBe(false)
      expect(sanitizeInputs(old)).toEqual({ ...old, retireInYears: 0, savingsWhileWorking: 0 })
      expect(dec({ portfolio: 4_000_000, age: 58 })).toMatchObject({ retireInYears: 0, savingsWhileWorking: 0 })
    })
    it('clamps retire-in to whole years in 0–15, below the horizon', () => {
      expect(dec({ retireInYears: -3 }).retireInYears).toBe(0)
      expect(dec({ retireInYears: 99 }).retireInYears).toBe(15)
      expect(dec({ retireInYears: 9e300 }).retireInYears).toBe(15)
      expect(dec({ retireInYears: 3.4 }).retireInYears).toBe(3)
      expect(dec({ retireInYears: 4.6 }).retireInYears).toBe(5)
      // the horizon (itself clamped first) caps it: retirement comes before the plan ends
      expect(dec({ horizonYears: 10, retireInYears: 12 }).retireInYears).toBe(9)
      expect(dec({ horizonYears: 3, retireInYears: 12 }).retireInYears).toBe(9)
      expect(dec({ horizonYears: 12.4, retireInYears: 15 }).retireInYears).toBe(11)
      expect(dec({ horizonYears: 40, retireInYears: 15 }).retireInYears).toBe(15)
    })
    it('clamps savings to $0–$1M', () => {
      expect(dec({ savingsWhileWorking: -50_000 }).savingsWhileWorking).toBe(0)
      expect(dec({ savingsWhileWorking: 5e9 }).savingsWhileWorking).toBe(1_000_000)
      expect(dec({ savingsWhileWorking: 1e308 }).savingsWhileWorking).toBe(1_000_000)
      expect(dec({ savingsWhileWorking: 12_345.5 }).savingsWhileWorking).toBe(12_345.5)
    })
    it('treats hostile values as 0', () => {
      for (const bad of ['5', 'lots', null, true, [4], { n: 4 }, { valueOf: 4 }]) {
        expect(dec({ retireInYears: bad, savingsWhileWorking: bad }), JSON.stringify(bad)).toMatchObject({ retireInYears: 0, savingsWhileWorking: 0 })
      }
      for (const bad of [Number.NaN, Infinity, -Infinity]) {
        const out = sanitizeInputs({ ...DEFAULT_INPUTS, retireInYears: bad, savingsWhileWorking: bad })
        expect(out.retireInYears, String(bad)).toBe(0)
        expect(out.savingsWhileWorking, String(bad)).toBe(0)
      }
      // a JSON number too big for a double parses as Infinity: dropped, not clamped to the top
      const huge = btoa('{"v":1,"d":{"retireInYears":1e999,"savingsWhileWorking":1e999}}').replace(/=+$/, '')
      expect(decodeInputs(huge)).toMatchObject({ retireInYears: 0, savingsWhileWorking: 0 })
      // prototype-style keys are ignored and leave the plan intact
      const proto = btoa('{"v":1,"d":{"constructor":{"retireInYears":9},"__proto__":{"retireInYears":9,"savingsWhileWorking":9},"retireInYears":2}}').replace(/=+$/, '')
      const out = decodeInputs(proto)!
      expect(out).toEqual({ ...DEFAULT_INPUTS, retireInYears: 2 })
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
      expect(({} as Record<string, unknown>).retireInYears).toBeUndefined()
    })
    it('agrees with the engine’s normalizeInputs on anything it lets through', () => {
      for (const d of [{ retireInYears: 7.5, horizonYears: 12 }, { retireInYears: 40, savingsWhileWorking: 2e6 }, { retireInYears: -1, savingsWhileWorking: -1 }]) {
        const out = dec(d)
        expect(normalizeInputs(out), JSON.stringify(d)).toBe(out) // already normal: returned as is
      }
    })
  })

  describe('amountOverrides', () => {
    const enc = (d: object) => btoa(JSON.stringify({ v: 1, d })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
    const ao = (raw: unknown) => sanitizeInputs({ ...DEFAULT_INPUTS, amountOverrides: raw }).amountOverrides

    it('round-trips through a share link and the saved plan', () => {
      const inputs = { ...DEFAULT_INPUTS, destCityId: 'lisbon', amountOverrides: { lisbon: { housing: 24_000, dining: 0 }, 'st-louis': { travel: 5000 } } }
      expect(decodeInputs(encodeInputs(inputs))).toEqual(inputs)
      // store.ts saves inputs as JSON and reloads them through sanitizeInputs
      expect(sanitizeInputs(JSON.parse(JSON.stringify(inputs)))).toEqual(inputs)
    })
    it('drops unknown cities and categories, and empty maps', () => {
      expect(ao({ atlantis: { housing: 1 }, lisbon: { housing: 1, yachts: 2 } })).toEqual({ lisbon: { housing: 1 } })
      expect(ao({ lisbon: { yachts: 2 } })).toBeUndefined()
      expect(ao({ lisbon: {} })).toBeUndefined()
      expect(ao({})).toBeUndefined()
      expect(ao([{ housing: 1 }])).toBeUndefined()
      expect(ao('lisbon')).toBeUndefined()
      expect(ao({ lisbon: [1, 2] })).toBeUndefined()
      expect('amountOverrides' in sanitizeInputs({ ...DEFAULT_INPUTS })).toBe(false)
    })
    it('keeps only finite numbers, clamped to [0, BUDGET_MAX]', () => {
      expect(ao({ lisbon: { housing: '9', dining: NaN, travel: Infinity, healthcare: null, groceries: -50, transport: 1e30 } })).toEqual({
        lisbon: { groceries: 0, transport: 1e9 },
      })
      // NaN / Infinity arrive as null through JSON
      const out = decodeInputs(enc({ amountOverrides: { lisbon: { housing: -1, dining: 1e12, travel: null } } }))!
      expect(out.amountOverrides).toEqual({ lisbon: { housing: 0, dining: 1e9 } })
    })
    it('ignores prototype-pollution keys', () => {
      const raw = JSON.parse('{"__proto__":{"housing":1},"constructor":{"housing":2},"lisbon":{"__proto__":{"x":1},"constructor":3,"housing":4}}')
      const out = ao(raw)!
      expect(out).toEqual({ lisbon: { housing: 4 } })
      expect(Object.keys(out)).toEqual(['lisbon'])
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
      expect(Object.getPrototypeOf(out.lisbon)).toBe(Object.prototype)
      expect(({} as Record<string, unknown>).housing).toBeUndefined()
      // the same guard now covers ratio overrides
      expect(sanitizeInputs({ ...DEFAULT_INPUTS, ratioOverrides: { constructor: 2, housing: 1 } }).ratioOverrides).toEqual({ housing: 1 })
    })
  })
})
