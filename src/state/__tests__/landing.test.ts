import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash, resolveRoute } from '../router'

const APP = ['plan', 'outlook', 'atlas', 'method', 'styleguide'] as const

describe('default-page rule (resolveRoute)', () => {
  it('shows the landing for the bare URL, on every visit', () => {
    for (const h of ['', '#', '#/', '#//']) expect(resolveRoute(h)).toBe('home')
  })

  it('treats an unknown hash like the bare URL', () => {
    for (const h of ['#nope', '#/nope', '#plans']) expect(resolveRoute(h)).toBe('home')
  })

  it('sends route hashes straight to the app', () => {
    for (const r of APP) expect(resolveRoute(`#${r}`)).toBe(r)
  })

  it('reads the legacy slash forms as app routes', () => {
    for (const r of APP) expect(resolveRoute(`#/${r}`)).toBe(r)
  })

  it('never shows the landing for a share link, in any form', () => {
    expect(resolveRoute('#p=abc')).toBe('outlook')
    expect(resolveRoute('#/?p=abc')).toBe('outlook')
    expect(resolveRoute('#?p=abc')).toBe('outlook')
    expect(resolveRoute('#plan?p=abc')).toBe('plan')
  })

  it('shows the landing for #home in any form', () => {
    for (const h of ['#home', '#/home', '#HOME']) expect(resolveRoute(h)).toBe('home')
  })

  it('writes #home for the landing', () => {
    expect(hrefFor('home')).toBe('#home')
    expect(parseHash('#home').route).toBe('home')
  })
})
