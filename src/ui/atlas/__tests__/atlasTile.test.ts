import { describe, expect, it, vi } from 'vitest'

// atlasData imports the store and the sim client, which touch `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/sim', () => ({}))
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { CITY_BY_ID } from '../../../data/cities'
import { hasProfile } from '../../../data/expatPicks'
import type { Ranked } from '../atlasData'
import { Tile, tileOpenLabel, type TileProps } from '../AtlasTile'

const row = (cityId: string, successRate = 0.82, rank = 1): Ranked =>
  ({ cityId, successRate, spendUsd: 50_000, costRatio: 0.7, city: CITY_BY_ID[cityId], rank }) as Ranked

type El = ReactElement<Record<string, unknown> & { children?: ReactNode }>

/** Every host <button> in the tile's own render output (Tile has no hooks, so it can be called). */
function buttons(props: TileProps): El[] {
  const out: El[] = []
  const walk = (n: ReactNode) => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!isValidElement(n)) return
    const el = n as El
    if (el.type === 'button') out.push(el)
    walk(el.props.children)
  }
  walk(Tile(props))
  return out
}
const openButton = (props: TileProps) => buttons(props).find((b) => String(b.props.className).includes('atile__open'))
const html = (props: TileProps) => renderToStaticMarkup(createElement(Tile, props))

describe('Tile', () => {
  const lisbon = row('lisbon')

  it('a profiled tile renders exactly one button, the stretched open button, which opens the profile', () => {
    expect(hasProfile('lisbon')).toBe(true)
    const onProfile = vi.fn()
    const bs = buttons({ eyebrow: 'Your home', row: lisbon, note: 'Rank 1 of 133', onProfile })
    expect(bs).toHaveLength(1)
    expect(bs[0].props.className).toContain('atile__open')
    ;(bs[0].props.onClick as () => void)()
    expect(onProfile).toHaveBeenCalledTimes(1)
    const m = html({ eyebrow: 'Your home', row: lisbon, onProfile })
    expect(m).toContain('class="atile atile--link"')
    expect(m.match(/<button/g)).toHaveLength(1)
  })

  it('names the city and "open profile" in the accessible name, and hides the "Profile →" decoration', () => {
    const props = { eyebrow: 'Best odds', row: lisbon, note: '30% cheaper than home', onProfile: () => {} }
    const label = String(openButton(props)!.props['aria-label'])
    expect(label).toBe(tileOpenLabel('Best odds', lisbon, '30% cheaper than home'))
    expect(label).toContain('Lisbon')
    expect(label).toMatch(/Open profile\.$/)
    const m = html(props)
    const go = m.match(/<span class="atile__go[^"]*"[^>]*>/g) ?? []
    expect(go).toHaveLength(2)
    for (const tag of go) expect(tag).toContain('aria-hidden="true"')
  })

  it('a tile without a profile, the empty destination and the loading tile render no open button and no link styling', () => {
    const cases: TileProps[] = [
      { eyebrow: 'Your home', row: lisbon, note: 'Rank 1 of 133' },
      { eyebrow: 'Your destination', empty: 'Staying home.', onProfile: () => {} },
      { eyebrow: 'Best odds', onProfile: () => {} },
    ]
    for (const props of cases) {
      expect(openButton(props)).toBeUndefined()
      const m = html(props)
      expect(m).not.toContain('atile--link')
      expect(m).not.toContain('atile__open')
      expect(m).not.toContain('atile__go')
    }
  })

  it('"Make destination" is its own button above the overlay: it chooses, it does not open', () => {
    const onProfile = vi.fn()
    const choose = vi.fn()
    const props: TileProps = { eyebrow: 'Best odds', row: lisbon, action: { label: 'Make destination', onClick: choose }, onProfile }
    const bs = buttons(props)
    expect(bs).toHaveLength(2)
    const make = bs.find((b) => String(b.props.className).includes('atile__action'))!
    expect(make.props.children).toContain('Make destination')
    ;(make.props.onClick as () => void)()
    expect(choose).toHaveBeenCalledTimes(1)
    expect(onProfile).not.toHaveBeenCalled()
    expect(openButton(props)!.props.onClick).toBe(onProfile)
  })

  it('the open button stretches over the whole tile, with Make destination stacked above it (atlas.css)', () => {
    const css = readFileSync(new URL('../atlas.css', import.meta.url), 'utf8')
    const rule = (sel: string) => css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.:()-]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? ''
    expect(rule('.atile')).toMatch(/position: relative/)
    const overlay = rule('.atile__open::after')
    expect(overlay).toMatch(/position: absolute/)
    expect(overlay).toMatch(/inset: 0/)
    const z = (s: string) => Number(s.match(/z-index: (\d+)/)?.[1])
    expect(z(rule('.atile__action'))).toBeGreaterThan(z(overlay))
    expect(rule('.atile--link:has(.atile__open:focus-visible)')).toMatch(/box-shadow: var\(--focus-ring\)/)
  })
})
