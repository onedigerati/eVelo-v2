import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash } from '../router'

describe('hash routes', () => {
  it('reads plain and slash forms', () => {
    for (const r of ['plan', 'atlas', 'method', 'styleguide', 'outlook'] as const) {
      expect(parseHash(`#${r}`).route).toBe(r)
      expect(parseHash(`#/${r}`).route).toBe(r)
      expect(parseHash(`#${r.toUpperCase()}`).route).toBe(r)
    }
    expect(parseHash('').route).toBe('outlook')
    expect(parseHash('#/').route).toBe('outlook')
    expect(parseHash('#nope').route).toBe('outlook')
  })
  it('finds the share payload in every form', () => {
    expect(parseHash('#/?p=abc').params.get('p')).toBe('abc')
    expect(parseHash('#p=abc').params.get('p')).toBe('abc')
    expect(parseHash('#p=abc').route).toBe('outlook')
    expect(parseHash('#plan?p=abc').params.get('p')).toBe('abc')
    expect(parseHash('#plan?p=abc').route).toBe('plan')
  })
  it('writes plain hashes', () => {
    expect(hrefFor('atlas')).toBe('#atlas')
    expect(hrefFor('outlook')).toBe('#outlook')
  })
})
