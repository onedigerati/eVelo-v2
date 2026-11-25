import { describe, expect, it } from 'vitest'
import { bandFor, BEATS, COPY, DEST, HOME, YEARS } from '../story'
import { chartGeometry, frameCopy, frameGeometry, NARROW, REST_FRAME, sliceLabelLines, staticGeometry, VMAX, WIDE, WIDE_UP_TO, wideFor } from '../storyLayout'
import { BEAT_IDS, beatFinish, beatIndex, beatStart, frameAt, TOTAL } from '../storyTimeline'

/** Times across the whole story, every 1/20 s, plus each beat's start and finished frame. */
const TIMES = [
  ...Array.from({ length: TOTAL * 20 + 1 }, (_, i) => i / 20),
  ...BEAT_IDS.flatMap((id) => [beatStart(id), beatFinish(id)]),
]

/** Widened wide layouts: the plot widths at 1920 and 2560px (and the largest the frame allows). */
const WIDENED = [965, 1322, 1500].map((px) => wideFor(px))

describe('story card geometry', () => {
  for (const L of [WIDE, NARROW, ...WIDENED]) {
    it(`${L.id} ${L.width}: the resting frame draws the Die state inside the viewBox`, () => {
      const g = chartGeometry(L)
      const y = (v: number) => L.YB - (v / VMAX) * (L.YB - L.YT)
      expect(g.bars).toHaveLength(YEARS + 1)
      // Every bar fully grown; the last one reaches the end portfolio.
      expect(g.bars[YEARS].gains.y).toBeCloseTo(y(DEST.atEnd.portfolio), 6)
      // The loan ends at Bangkok's loan; the heirs' column tops out at what heirs keep.
      expect(g.loanHead?.y).toBeCloseTo(y(DEST.atEnd.loan), 1)
      expect(g.estate.heirs.y).toBeCloseTo(y(DEST.atEnd.heirs), 6)
      expect(g.slice.height).toBeCloseTo(y(DEST.atEnd.heirs) - y(DEST.atEnd.portfolio), 6)
      // The slice has lifted clear of the heirs' column and stays inside the viewBox.
      expect(g.slice.x).toBeGreaterThanOrEqual(L.EX + L.EW)
      expect(g.slice.x + g.slice.width).toBeLessThanOrEqual(L.width)
      expect(g.baselineX[1]).toBeLessThanOrEqual(L.width)
      expect(g.yTicks.map((t) => t.label)).toEqual(COPY.axis.yTicks.map((t) => t.label))
      // Nothing in flight at rest.
      expect(g.coins).toEqual([])
      expect(g.travel).toBeNull()
    })

    it(`${L.id} ${L.width}: static parts are computed once per layout`, () => {
      expect(staticGeometry(L)).toBe(staticGeometry(L))
      const a = chartGeometry(L, frameAt(1))
      const b = chartGeometry(L, frameAt(13))
      expect(a.ghost).toBe(b.ghost)
      expect(a.margin).toBe(b.margin)
    })

    it(`${L.id} ${L.width}: every frame stays inside the viewBox`, () => {
      for (const t of TIMES) {
        const g = frameGeometry(L, frameAt(t))
        for (const b of g.bars) {
          expect(b.gains.y).toBeGreaterThanOrEqual(L.YT - 1)
          expect(b.paid.y + b.paid.height).toBeCloseTo(L.YB, 6)
        }
        for (const c of g.coins) {
          expect(c.y).toBeGreaterThanOrEqual(L.YT - 1)
          expect(c.y).toBeLessThanOrEqual(L.personY + 2)
        }
        if (g.travel) {
          expect(g.travel.y - g.travel.r).toBeGreaterThanOrEqual(0)
          expect(g.travel.x).toBeLessThanOrEqual(L.width)
        }
        expect(g.personX).toBeGreaterThanOrEqual(L.X0)
        expect(g.personX).toBeLessThanOrEqual(L.X1 + 1e-6)
      }
    })

    it(`${L.id} ${L.width}: the person walks between the baseline and the x-tick labels`, () => {
      // Person: head r 3.8 at personY, body to personY + 17; tick labels ~13 units tall above xTickY.
      expect(L.personY - 3.8).toBeGreaterThan(L.YB)
      expect(L.personY + 17).toBeLessThan(L.xTickY - 13)
      expect(L.xTickY).toBeLessThan(L.height)
    })
  }

  it('the loan bends flatter during Live anywhere: from the St. Louis loan to the Bangkok loan', () => {
    const y = (v: number) => WIDE.YB - (v / VMAX) * (WIDE.YB - WIDE.YT)
    const before = frameGeometry(WIDE, frameAt(beatFinish('borrow')))
    const after = frameGeometry(WIDE, frameAt(beatFinish('live')))
    expect(before.loanHead!.y).toBeCloseTo(y(HOME.atEnd.loan), 1)
    expect(after.loanHead!.y).toBeCloseTo(y(DEST.atEnd.loan), 1)
    expect(after.loanHead!.y).toBeGreaterThan(before.loanHead!.y)
  })

  it('narrow: "Loan repaid" clears the heirs bar (split over two lines, text kept inside the viewBox)', () => {
    const L = NARROW
    const lines = sliceLabelLines(L)
    expect(lines).toEqual(['Loan', 'repaid', COPY.estate.loan])
    const g = chartGeometry(L)
    const heirsRight = L.EX + L.EW
    // A generous width estimate: 0.62 em a character at 13 units (UI and mono text).
    for (const [i, s] of lines.entries()) {
      const half = (s.length * 0.62 * 13) / 2
      expect(g.sliceLabel[i].x - half, s).toBeGreaterThanOrEqual(heirsRight + 8)
      expect(g.sliceLabel[i].x + half, s).toBeLessThanOrEqual(L.width)
    }
    // Lines don't collide: 13-unit text, at least 15 units apart.
    for (let i = 1; i < lines.length; i++) expect(g.sliceLabel[i].y - g.sliceLabel[i - 1].y).toBeGreaterThanOrEqual(15)
    expect(sliceLabelLines(WIDE)).toEqual([COPY.estate.loanLabel, COPY.estate.loan])
  })
})

describe('wide layout on big screens', () => {
  it('is WIDE itself up to WIDE_UP_TO (so laptops look as before)', () => {
    for (const px of [490, 548, WIDE_UP_TO]) expect(wideFor(px)).toBe(WIDE)
  })

  it('widens with the plot so text keeps its on-screen size (within 1px of WIDE at WIDE_UP_TO)', () => {
    const unitPx = WIDE_UP_TO / WIDE.width
    for (const px of [700, 965, 1322, 2000]) {
      const L = wideFor(px)
      // 13.5-unit text, rendered at px / L.width per unit.
      expect(Math.abs(13.5 * (px / L.width) - 13.5 * unitPx)).toBeLessThan(0.25)
      expect(L.width).toBeGreaterThan(WIDE.width)
    }
  })

  it('grows only a little taller, so the chart widens rather than going tall and empty', () => {
    for (const px of [700, 1322, 3000]) {
      const L = wideFor(px)
      expect(L.height).toBeGreaterThanOrEqual(WIDE.height)
      expect(L.height).toBeLessThanOrEqual(WIDE.height + 120)
      expect(L.width / L.height).toBeGreaterThan(WIDE.width / WIDE.height)
    }
  })

  it('keeps the estate column, map and labels in the same places relative to the right edge', () => {
    const L = wideFor(1322)
    const dx = L.width - WIDE.width
    expect(L.EX - WIDE.EX).toBe(dx)
    expect(L.X1 - WIDE.X1).toBe(dx)
    expect(L.map.x + L.map.w).toBe(WIDE.map.x + WIDE.map.w + dx)
    expect(L.map.home.x).toBeLessThan(L.map.dest.x)
    expect(L.id).toBe('wide')
  })

  it('reuses one layout per rounded width (its static geometry stays cached)', () => {
    expect(wideFor(1322)).toBe(wideFor(1323))
    expect(staticGeometry(wideFor(1322))).toBe(staticGeometry(wideFor(1323)))
  })
})

describe('story card copy at a frame', () => {
  it('the resting frame copy is the Die beat in Bangkok, after the step-up', () => {
    const c = frameCopy(REST_FRAME)
    expect(REST_FRAME.beat).toBe(BEATS[3].id)
    expect(c.odds).toBe(DEST.odds)
    expect(c.oddsCity).toBe(DEST)
    expect(c.oddsBand).toBe(4)
    expect(c.gains).toBe(COPY.key.gainsStepped)
    expect(c.loan).toBe(COPY.key.loanDest)
  })

  it('the odds badge only ever shows an endpoint city with its own figure and band', () => {
    const seen = new Set<string>()
    for (const t of TIMES) {
      const c = frameCopy(frameAt(t))
      expect([HOME, DEST]).toContain(c.oddsCity)
      expect(c.odds).toBe(c.oddsCity.odds)
      expect(c.oddsBand).toBe(bandFor(c.odds))
      seen.add(`${c.oddsCity.name} ${c.odds} ${c.oddsBand}`)
    }
    expect([...seen]).toEqual(['St. Louis 63 2', 'Bangkok 93 4'])
  })

  it('the beat on show is the one whose time it is', () => {
    for (const t of TIMES) expect(BEATS[beatIndex(frameAt(t).beat)].id).toBe(BEAT_IDS[Math.min(3, Math.floor(t / 4))])
  })

  it('the key follows the story: gains grow in Buy, the credit line in Borrow, St. Louis then Bangkok in Live anywhere', () => {
    expect(frameCopy(frameAt(0)).gains).toBe(COPY.key.gains(DEST.series.gains[0]))
    expect(frameCopy(frameAt(beatFinish('buy'))).gains).toBe(COPY.key.gains(DEST.atEnd.gains))
    expect(frameCopy(frameAt(beatFinish('borrow'))).loan).toBe(COPY.key.loanBorrow)
    expect(frameCopy(frameAt(beatStart('live'))).loan).toBe(COPY.key.loanHome)
    expect(frameCopy(frameAt(beatFinish('live'))).loan).toBe(COPY.key.loanDest)
    expect(frameCopy(frameAt(beatFinish('live'))).gains).toBe(COPY.key.gains(DEST.atEnd.gains))
  })
})
