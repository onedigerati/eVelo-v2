import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { parseHash } from '../router'
import { baseUrl, decodeInputs, encodeInputs, INPUT_LIMITS, sanitizeInputs, shareUrl } from '../share'

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
        const inp = { ...DEFAULT_INPUTS, [k]: v, ...ltv }
        expect(sanitizeInputs(inp), `${k}=${v}`).toEqual(inp)
      }
    }
    const edge = { ...DEFAULT_INPUTS, paths: 10000, maxLtv: 0.3, targetLtvAfterCall: 0.25, ratioOverrides: { housing: 0.05, travel: 5 } }
    expect(sanitizeInputs(edge)).toEqual(edge)
  })
})
