import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash, topNav } from '../router'

describe('top nav', () => {
  const labels = (desktop: boolean) => topNav('plan', desktop).items.map((n) => n.label)
  it('shows one Plan item on desktop, Plan and Outlook on tablet', () => {
    expect(labels(true)).toEqual(['Plan', 'Atlas', 'Method'])
    expect(labels(false)).toEqual(['Plan', 'Outlook', 'Atlas', 'Method'])
  })
  it('lights Plan on plan and outlook on desktop only', () => {
    expect(topNav('plan', true).active).toBe('plan')
    expect(topNav('outlook', true).active).toBe('plan')
    expect(topNav('outlook', false).active).toBe('outlook')
    expect(topNav('plan', false).active).toBe('plan')
    expect(topNav('atlas', true).active).toBe('atlas')
    expect(topNav('styleguide', true).active).toBeNull()
    expect(topNav('home', false).active).toBeNull()
  })
})

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
