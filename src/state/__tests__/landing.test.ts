import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash, resolveRoute } from '../router'

const APP = ['plan', 'outlook', 'atlas', 'method', 'styleguide'] as const

describe('first-visit rule (resolveRoute)', () => {
  it('shows the landing on a first visit to the bare URL, without setting the flag', () => {
    for (const h of ['', '#', '#/']) expect(resolveRoute(h, false)).toEqual({ route: 'home', entered: false })
  })

  it('opens the planner at the bare URL once the app has been entered', () => {
    for (const h of ['', '#', '#/']) expect(resolveRoute(h, true)).toEqual({ route: 'plan', entered: true })
  })

  it('sends route hashes straight to the app on a first visit, and counts as entering', () => {
    for (const r of APP) {
      expect(resolveRoute(`#${r}`, false)).toEqual({ route: r, entered: true })
      expect(resolveRoute(`#${r}`, true)).toEqual({ route: r, entered: true })
    }
  })

  it('reads the legacy slash forms as app routes', () => {
    for (const r of APP) expect(resolveRoute(`#/${r}`, false)).toEqual({ route: r, entered: true })
  })

  it('never shows the landing for a share link, in any form', () => {
    expect(resolveRoute('#p=abc', false)).toEqual({ route: 'outlook', entered: true })
    expect(resolveRoute('#/?p=abc', false)).toEqual({ route: 'outlook', entered: true })
    expect(resolveRoute('#?p=abc', false)).toEqual({ route: 'outlook', entered: true })
    expect(resolveRoute('#plan?p=abc', false)).toEqual({ route: 'plan', entered: true })
  })

  it('always shows the landing for #home, leaving the flag as it was', () => {
    expect(resolveRoute('#home', false)).toEqual({ route: 'home', entered: false })
    expect(resolveRoute('#home', true)).toEqual({ route: 'home', entered: true })
    expect(resolveRoute('#/home', false)).toEqual({ route: 'home', entered: false })
    expect(resolveRoute('#HOME', true)).toEqual({ route: 'home', entered: true })
  })

  it('treats an unknown hash like the bare URL', () => {
    expect(resolveRoute('#nope', false)).toEqual({ route: 'home', entered: false })
    expect(resolveRoute('#nope', true)).toEqual({ route: 'plan', entered: true })
  })

  it('writes #home for the landing', () => {
    expect(hrefFor('home')).toBe('#home')
    expect(parseHash('#home').route).toBe('home')
  })
})
