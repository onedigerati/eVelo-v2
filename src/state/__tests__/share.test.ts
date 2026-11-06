import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { parseHash } from '../router'
import { baseUrl, decodeInputs, encodeInputs, shareUrl } from '../share'

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
})
