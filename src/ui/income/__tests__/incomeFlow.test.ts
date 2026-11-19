import { describe, expect, it } from 'vitest'
import { CITIES } from '../../../data/cities'
import { cityGroups, fieldText, layersFor, muniHint, parseField, parseMoney, parseShare, parseWhole, recapLine, shareText } from '../incomeFlow'
import { INCOME_DEFAULTS } from '../../../engine/income'

describe('layersFor', () => {
  it('draws nothing on questions 1–2, then one layer per question, and all five on the results', () => {
    expect([1, 2, 3, 4, 5, 6].map((s) => layersFor(s, false))).toEqual([0, 0, 1, 2, 3, 4])
    for (const s of [1, 3, 6]) expect(layersFor(s, true)).toBe(5)
  })
  it('stays in 0–4 for odd steps while asking', () => {
    expect(layersFor(0, false)).toBe(0)
    expect(layersFor(99, false)).toBe(4)
    expect(layersFor(NaN, false)).toBe(0)
    expect(layersFor(3.4, false)).toBe(1)
  })
})

describe('parseMoney', () => {
  it('reads the ways people type amounts', () => {
    expect(parseMoney('2.4M')).toBe(2_400_000)
    expect(parseMoney('2.4m')).toBe(2_400_000)
    expect(parseMoney('$96,000')).toBe(96_000)
    expect(parseMoney('96k')).toBe(96_000)
    expect(parseMoney(' 96K ')).toBe(96_000)
    expect(parseMoney('$1.2 million')).toBe(1_200_000)
    expect(parseMoney('40 thousand')).toBe(40_000)
    expect(parseMoney('0')).toBe(0)
    expect(parseMoney('$0')).toBe(0)
  })
  it('rejects what is not an amount, or negative', () => {
    for (const bad of ['', 'lots', '-5k', '1.2.3', '$', 'k', '12%']) expect(parseMoney(bad)).toBeNull()
  })
})

describe('parseShare and parseWhole', () => {
  it('reads shares as percent with or without the sign', () => {
    expect(parseShare('60')).toBeCloseTo(0.6)
    expect(parseShare('60%')).toBeCloseTo(0.6)
    expect(parseShare('0')).toBe(0)
    expect(parseShare('100%')).toBe(1)
    expect(parseShare('120')).toBeNull()
    expect(parseShare('abc')).toBeNull()
  })
  it('reads whole years', () => {
    expect(parseWhole('62')).toBe(62)
    expect(parseWhole('30 years')).toBe(30)
    expect(parseWhole('62.6')).toBe(63)
    expect(parseWhole('sixty')).toBeNull()
    expect(parseWhole('')).toBeNull()
  })
  it('dispatches by kind', () => {
    expect(parseField('money', '2.4M')).toBe(2_400_000)
    expect(parseField('share', '55%')).toBeCloseTo(0.55)
    expect(parseField('whole', '67')).toBe(67)
  })
})

describe('cityGroups', () => {
  it("lists eVelo's US home cities first, then every other city once", () => {
    const g = cityGroups()
    expect(g[0].label).toBe('United States')
    expect(g[0].cities.length).toBeGreaterThan(0)
    expect(g[0].cities.every((c) => c.countryCode === 'US')).toBe(true)
    expect(g.slice(1).every((x) => x.cities.every((c) => c.countryCode !== 'US'))).toBe(true)
    expect(g.reduce((n, x) => n + x.cities.length, 0)).toBe(CITIES.length)
  })
})

describe('recap and hint', () => {
  it('recaps only the questions before this one', () => {
    expect(recapLine(1, INCOME_DEFAULTS)).toBe('')
    expect(recapLine(2, { ...INCOME_DEFAULTS, portfolio: 2_400_000, spending: 96_000 })).toBe('$2.4M saved, $96,000 a year')
    expect(recapLine(5, { ...INCOME_DEFAULTS, stockShare: 0.55, muniShare: 0.7 })).toMatch(/55% in stocks · 70% of bonds in munis$/)
  })
  it('names the two starting yields when known', () => {
    expect(muniHint({ munis: 0.031, taxable: 0.042 })).toContain('3.1%')
    expect(muniHint({ munis: 0.031, taxable: 0.042 })).toContain('4.2%')
    expect(muniHint(null)).toMatch(/no federal tax/)
  })
})

describe('shareText', () => {
  it('shows a share under 10% to one decimal when it is not a whole percent, so 0.4% never reads 0%', () => {
    expect(shareText(parseShare('0.4')!)).toBe('0.4%')
    expect(shareText(parseShare('0.4%')!)).toBe('0.4%')
    expect(shareText(0.075)).toBe('7.5%')
    expect(shareText(0.05)).toBe('5%')
    expect(shareText(0)).toBe('0%')
    expect(shareText(0.0996)).toBe('10%')
    expect(shareText(0.6)).toBe('60%')
    expect(shareText(0.555)).toBe('56%')
    // At rest the field reads back as what was typed, and re-parses to the same share.
    expect(fieldText('share', 0.004)).toBe('0.4%')
    expect(parseShare(shareText(0.004))).toBeCloseTo(0.004, 9)
  })
})
