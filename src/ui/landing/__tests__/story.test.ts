import { describe, expect, it } from 'vitest'
import { CITY_BY_ID } from '../../../data/cities'
import { categoryRatios } from '../../../engine/cost'
import {
  BASIS,
  bandFor,
  DEST_ODDS,
  HOME_ODDS,
  BEATS,
  COPY,
  DEST,
  DEST_SPEND,
  HOME,
  HOME_SPEND,
  MARGIN_LTV,
  PORTFOLIO,
  YEARS,
  destinationSpend,
  loanSeries,
  money,
} from '../story'

const cities = [HOME, DEST]

describe('landing story: model', () => {
  it('uses the brief: $2.5M, $1.0M basis, 7%, 30 years from 60 to 90, margin call at 50%', () => {
    expect(PORTFOLIO).toBe(2_500_000)
    expect(BASIS).toBe(1_000_000)
    expect(MARGIN_LTV).toBe(0.5)
    expect(YEARS).toBe(30)
    for (const c of cities) {
      const s = c.series
      for (const arr of Object.values(s)) expect(arr).toHaveLength(31)
      expect(s.age[0]).toBe(60)
      expect(s.age[30]).toBe(90)
      expect(s.portfolio[0]).toBe(2_500_000)
      expect(s.portfolio[1]).toBeCloseTo(2_675_000, 6)
      expect(s.portfolio[30]).toBeCloseTo(2_500_000 * 1.07 ** 30, 4)
      for (let t = 0; t <= 30; t++) {
        expect(s.basis[t]).toBe(1_000_000)
        expect(s.gains[t]).toBeCloseTo(s.portfolio[t] - 1_000_000, 6)
        expect(s.marginCall[t]).toBeCloseTo(0.5 * s.portfolio[t], 6)
        expect(s.heirs[t]).toBeCloseTo(s.portfolio[t] - s.loan[t], 6)
      }
    }
  })

  it('follows loan = (loan + spend·1.03^t)·1.06 exactly', () => {
    const l = loanSeries(80_000)
    expect(l).toHaveLength(31)
    expect(l[0]).toBe(0)
    expect(l[1]).toBeCloseTo(84_800, 6) // (0 + 80,000) × 1.06
    expect(l[2]).toBeCloseTo((84_800 + 82_400) * 1.06, 6) // 177,232
    expect(l[2]).toBeCloseTo(177_232, 6)
    for (let t = 0; t < 30; t++) expect(l[t + 1]).toBeCloseTo((l[t] + 80_000 * 1.03 ** t) * 1.06, 6)
    expect(HOME.series.loan).toEqual(loanSeries(HOME_SPEND))
    expect(DEST.series.loan).toEqual(loanSeries(DEST_SPEND))
  })

  it('keeps both loans under the margin-call line every year', () => {
    for (const c of cities) {
      for (let t = 0; t <= 30; t++) expect(c.series.loan[t], `${c.name} at ${60 + t}`).toBeLessThan(c.series.marginCall[t])
    }
  })

  it('ends with a smaller loan and more for heirs in Bangkok', () => {
    expect(DEST.atEnd.loan).toBeLessThan(HOME.atEnd.loan)
    expect(DEST.atEnd.heirs).toBeGreaterThan(HOME.atEnd.heirs)
    for (const c of cities) {
      expect(c.atEnd.heirs).toBeCloseTo(c.atEnd.portfolio - c.atEnd.loan, 6)
      expect(c.atEnd.loan).toBe(c.series.loan[30])
      expect(c.atEnd.portfolio).toBe(c.series.portfolio[30])
    }
  })
})

describe('landing story: spending', () => {
  it('spends $80K a year in St. Louis', () => {
    expect(HOME).toMatchObject({ id: 'st-louis', name: 'St. Louis', spend: 80_000 })
  })

  it("derives Bangkok's spending from the app's cost data (about $47K)", () => {
    const stl = CITY_BY_ID['st-louis']
    const bkk = CITY_BY_ID['bangkok']
    expect(DEST).toMatchObject({ id: 'bangkok', name: 'Bangkok' })
    expect(DEST.spend).toBe(DEST_SPEND)
    expect(DEST_SPEND).toBe(80_000 * categoryRatios(stl, bkk, 0).other)
    expect(DEST_SPEND).toBe(destinationSpend(80_000, 'st-louis', 'bangkok'))
    expect(DEST_SPEND).toBeCloseTo((80_000 * bkk.idx.col) / stl.idx.col, 6)
    expect(DEST_SPEND).toBeGreaterThan(40_000)
    expect(DEST_SPEND).toBeLessThan(55_000)
    expect(money(DEST_SPEND)).toBe('$47K')
  })

  it('follows the data: another destination gives another figure', () => {
    expect(destinationSpend(80_000, 'st-louis', 'lisbon')).not.toBe(DEST_SPEND)
    expect(() => destinationSpend(80_000, 'st-louis', 'nowhere')).toThrow()
  })
})

describe('landing story: odds', () => {
  it("keeps Bangkok at the map's 93% (band 4)", () => {
    expect(DEST_ODDS).toBe(93)
    expect(DEST.odds).toBe(93)
  })

  it("gives St. Louis the map's home-city figure at the same $80K (63%), lower band than Bangkok", () => {
    expect(HOME_ODDS).toBe(63)
    expect(HOME.odds).toBe(63)
    expect(bandFor(HOME.odds)).toBe(2)
    expect(bandFor(DEST.odds)).toBe(4)
  })

  it('classifies on the 80 / 65 / 45 / 35 thresholds', () => {
    expect([100, 80, 79, 65, 64, 45, 44, 35, 34, 0].map(bandFor)).toEqual([4, 4, 3, 3, 2, 2, 1, 1, 0, 0])
  })
})

describe('landing story: copy', () => {
  it('formats money as $2.5M / $47K', () => {
    expect(money(2_500_000)).toBe('$2.5M')
    expect(money(19_030_000)).toBe('$19.0M')
    expect(money(80_000)).toBe('$80K')
    expect(money(1_000_000)).toBe('$1.0M')
  })

  it("has four beats with today's step copy", () => {
    expect(BEATS.map((b) => [b.n, b.title])).toEqual([
      ['01', 'Buy'],
      ['02', 'Borrow'],
      ['03', 'Live anywhere'],
      ['04', 'Die'],
    ])
    expect(BEATS[0].body).toBe('Hold assets that grow. Never sell them, so the gains are never taxed.')
    expect(BEATS[3].body).toBe('Heirs inherit at a stepped-up basis. The estate repays the loan and keeps the rest.')
    for (const b of BEATS) for (const s of [b.title, b.body, b.lead, b.detail]) expect(s.trim().length).toBeGreaterThan(0)
  })

  it('puts the computed numbers into the captions', () => {
    expect(BEATS[0].detail).toContain('$2.5M')
    expect(BEATS[0].detail).toContain('$1.0M')
    expect(BEATS[0].detail).toContain('$1.5M')
    expect(BEATS[1].detail).toContain('$80K')
    expect(BEATS[2].detail).toContain('Bangkok')
    expect(BEATS[2].detail).toContain(money(DEST.spend))
    expect(BEATS[2].detail).toContain('63%')
    expect(BEATS[2].detail).toContain('93%')
    expect(BEATS[3].detail).toContain(money(DEST.atEnd.loan))
    expect(BEATS[3].detail).toContain(money(DEST.atEnd.heirs))
  })

  it('names the resting frame with every key figure', () => {
    const l = COPY.svgLabel
    for (const s of [
      'St. Louis',
      'Bangkok',
      '$2.5M',
      money(DEST.atEnd.portfolio),
      '$80K',
      money(DEST.spend),
      money(DEST.atEnd.loan),
      money(HOME.atEnd.loan),
      money(DEST.atEnd.heirs),
      '63%',
      '93%',
    ])
      expect(l).toContain(s)
  })

  it('has every label, key entry and control string', () => {
    const strings: string[] = [
      COPY.eyebrow,
      COPY.sub,
      COPY.oddsUnit(DEST),
      COPY.spendChip(HOME),
      COPY.spendChip(DEST),
      COPY.personChip,
      ...COPY.axis.yTicks.map((t) => t.label),
      ...COPY.axis.xTicks.map((t) => t.label),
      COPY.key.gains(1_500_000),
      COPY.key.gainsStepped,
      COPY.key.paid,
      COPY.key.loanBorrow,
      COPY.key.loanHome,
      COPY.key.loanDest,
      COPY.key.ghost,
      COPY.key.margin,
      ...Object.values(COPY.estate),
      ...Object.values(COPY.controls),
      COPY.keyLabel,
      COPY.note,
      COPY.stepsLabel,
      COPY.announce(0),
    ]
    for (const s of strings) expect(s.trim().length).toBeGreaterThan(0)
    expect(COPY.sub).toBe('$2.5M portfolio · 30 years, age 60 to 90')
    expect(COPY.oddsUnit(DEST)).toBe('of futures hold in Bangkok')
    expect(COPY.pin(HOME)).toEqual({ name: 'St. Louis', odds: '63%' })
    expect(COPY.pin(DEST)).toEqual({ name: 'Bangkok', odds: '93%' })
    expect(COPY.spendChip(HOME)).toBe('$80K/yr')
    expect(COPY.key.gains(1_500_000)).toBe('Gains $1.5M · taxed only if you sell')
    expect(COPY.key.paid).toBe('What you paid $1.0M')
    expect(COPY.key.margin).toBe('Margin call at 50%')
    expect(COPY.key.ghost).toBe('Same life in St. Louis')
    expect(COPY.key.loanDest).toBe('Loan, living in Bangkok')
    expect(COPY.estate.top).toBe(`At 90 · ${money(DEST.atEnd.portfolio)}`)
    expect(COPY.estate.loan).toBe(money(DEST.atEnd.loan))
    expect(COPY.estate.heirs).toBe(money(DEST.atEnd.heirs))
    expect(COPY.axis.yTicks.map((t) => t.label)).toEqual(['$5M', '$10M', '$15M', '$20M'])
    expect(COPY.announce(3)).toContain('Step 4 of 4.')
    expect(COPY.announce(0)).toBe(`Step 1 of 4. ${BEATS[0].lead} ${BEATS[0].detail}`)
    expect(COPY.controls).toEqual({
      group: 'Story playback',
      play: 'Play the four beats',
      pause: 'Pause the four beats',
      replay: 'Replay from the start',
      paused: 'Paused.',
      playing: 'Playing.',
    })
    expect(COPY.personChip).toBe('$80K')
  })
})
