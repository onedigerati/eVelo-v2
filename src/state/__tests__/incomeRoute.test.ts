// The living-on-income mode is hidden: `#income` resolves, but no nav or visible list names it, and
// nothing on the main site links to it.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NAV_ROUTES, parseHash, resolveRoute, topNav, type Route } from '../router'

const SRC = join(__dirname, '..', '..')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? files(p) : [p]
  })
}

describe('the hidden #income route', () => {
  it('resolves #income (and #/income) to the mode, including on a fresh visit', () => {
    expect(parseHash('#income')).toMatchObject({ route: 'income', known: true })
    expect(parseHash('#/income').route).toBe('income')
    expect(resolveRoute('#income')).toBe('income')
  })

  it('is in no nav list, on any breakpoint, and lights no nav item', () => {
    expect(NAV_ROUTES.map((n) => n.route)).not.toContain('income')
    expect(NAV_ROUTES.map((n) => n.href.toLowerCase()).join(' ')).not.toContain('income')
    const routes: Route[] = ['home', 'plan', 'outlook', 'atlas', 'method', 'styleguide', 'income']
    for (const desktop of [true, false]) {
      for (const r of routes) {
        const { items, active } = topNav(r, desktop)
        expect(items.map((n) => n.route)).not.toContain('income')
        expect(active).not.toBe('income')
      }
    }
  })

  it('is linked from nowhere on the main site but the earned coupon (only the shell that renders it and the mode itself)', () => {
    const allowed = new Set(['state/router.ts', 'ui/shell/AppShell.tsx'])
    const offenders = files(SRC)
      .filter((p) => /\.(tsx?|css|html|json|md)$/.test(p) && !p.includes('__tests__'))
      .map((p) => relative(SRC, p).split('\\').join('/'))
      .filter((r) => !r.startsWith('ui/income/') && !r.startsWith('engine/') && !allowed.has(r))
      .filter((r) => /#\/?income\b|['"]income['"]|IncomeMode/.test(readFileSync(join(SRC, r), 'utf8')))
    expect(offenders).toEqual(['ui/landing/LandingView.tsx'])
    // The landing's one mention is the coupon, rendered only after five quick arrow clicks
    // (arrowDoor.ts; proven by e2e/door.mjs).
    const landing = readFileSync(join(SRC, 'ui/landing/LandingView.tsx'), 'utf8')
    const mentions = landing.split('\n').filter((l) => /#\/?income\b|['"]income['"]|IncomeMode/.test(l))
    expect(mentions).toHaveLength(1)
    expect(mentions[0]).toContain('className="landing__coupon"')
  })
})
