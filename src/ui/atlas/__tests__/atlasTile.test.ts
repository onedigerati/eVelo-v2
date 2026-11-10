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

  it('shows the country beside the city name, after the name, quiet and hidden from AT only when the open button names it', () => {
    const country = (m: string) => m.match(/<span class="atile__country"([^>]*)>([^<]*)<\/span>/)
    const nameLine = (m: string) => m.match(/<div class="atile__city">(.*?)<\/div>/)?.[1] ?? ''
    // Profiled tile: decoration beside the stretched button, whose label already carries the country.
    const linked = { eyebrow: 'Best odds', row: lisbon, note: 'Rank 1 of 133', onProfile: () => {} }
    const m1 = html(linked)
    const c1 = country(m1)!
    expect(c1[2]).toBe('Portugal')
    expect(c1[1]).toContain('aria-hidden="true"')
    const line1 = nameLine(m1)
    expect(line1.indexOf('atile__country')).toBeGreaterThan(line1.indexOf('atile__open'))
    expect(line1.indexOf('atile__country')).toBeLessThan(line1.indexOf('atile__go--head'))
    expect(String(openButton(linked)!.props['aria-label'])).toBe(
      'Best odds: Lisbon, Portugal. Plan holds in 82% of futures, Rank 1 of 133. Open profile.',
    )
    expect(openButton(linked)!.props.children).toBe('Lisbon')
    expect(buttons(linked)).toHaveLength(1)
    // Plain tile: readable text right after the name.
    const m2 = html({ eyebrow: 'Your home', row: lisbon, note: 'Rank 1 of 133' })
    const c2 = country(m2)!
    expect(c2[2]).toBe('Portugal')
    expect(c2[1]).not.toContain('aria-hidden')
    expect(nameLine(m2)).toMatch(
      /<span class="atile__title"><span class="atile__name">Lisbon<\/span><span class="atile__country">Portugal<\/span><\/span>/,
    )
  })

  it('the country reads quieter than the name and is never a stub: beside the name when it fits whole, else under it (atlas.css)', () => {
    const css = readFileSync(new URL('../atlas.css', import.meta.url), 'utf8')
    const rule = (sel: string) => css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.:()>-]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? ''
    for (const [c, title, name, country, fs] of [
      ['atile', '.atile__title', '.atile__name', '.atile__country', '--fs-md'],
      ['pick', '.pick__title', '.pick__open', '.pick__country', '--fs-lg'],
    ] as const) {
      // The title shrinks with the line and wraps the country under the name when it doesn't fit
      // beside it. No fixed height and no clip: a wrapped country is shown, not hidden.
      const t = rule(title)
      expect(t).toMatch(/flex: 0 1 auto/)
      expect(t).toMatch(/min-width: 0/)
      expect(t).toMatch(/display: flex/)
      expect(t).toMatch(/flex-wrap: wrap/)
      expect(t).toMatch(/align-items: baseline/)
      expect(t).toMatch(/column-gap: 6px/)
      expect(t).not.toMatch(/height|overflow|position|z-index/)
      // The name never shrinks; it trims only once it alone is wider than the title.
      expect(rule(name)).toMatch(/flex: 0 0 auto/)
      expect(rule(name)).toMatch(/max-width: 100%/)
      expect(rule(name)).toMatch(/text-overflow: ellipsis/)
      // The country never shrinks and is never ellipsized; a very long one wraps its own text.
      const k = rule(country)
      expect(k).toMatch(/flex: 0 0 auto/)
      expect(k).toMatch(/max-width: 100%/)
      expect(k).toMatch(/white-space: normal/)
      expect(k).not.toMatch(/ellipsis|nowrap|min-width: 0|overflow|flex-shrink: 1|flex: 0 1/)
      expect(k).toMatch(/font-size: var\(--fs-sm\)/)
      expect(k).toMatch(/font-weight: 400/)
      expect(k).toMatch(/color: var\(--ink-3\)/)
      expect(k).not.toMatch(/position|z-index/)
      // The row lines up with the name's first line: baseline, and the chip centred on that line.
      expect(rule(`.${c}__city`)).toMatch(/align-items: baseline/)
      const chip = rule(`.${c}__city > .code-chip`)
      expect(chip).toMatch(/align-self: flex-start/)
      expect(chip).toMatch(new RegExp(`margin-top: calc\\(\\(var\\(${fs}\\) \\* var\\(--lh-body\\) - 18px\\) / 2\\)`))
    }
    expect(rule('.pick__title')).toMatch(/font-size: var\(--fs-lg\)/)
    expect(rule('.atile__city')).toMatch(/font-size: var\(--fs-md\)/)
    expect(rule('.atile__city')).toMatch(/font-weight: 560/)
    expect(rule('.pick__open')).toMatch(/font-size: var\(--fs-lg\)/)
  })

  it('no width-based stacking rules: no container queries and no viewport rules for the name line (atlas.css)', () => {
    const css = readFileSync(new URL('../atlas.css', import.meta.url), 'utf8')
    expect(css).not.toMatch(/@container|container-type|container:/)
    expect(css).not.toMatch(/\.atile:not\(:first-child\) \.atile__(title|country|city)/)
    expect(css).not.toMatch(/\n {2,}\.(atile|pick)__(title|country) \{/)
  })
})
