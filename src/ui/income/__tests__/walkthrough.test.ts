// The walkthrough's year rows and chapter rules (docs/PLAN.md stage 2, check 1).
import { describe, expect, it } from 'vitest'
import type { IncomeInputs, IncomeResult, IncomeYearRow } from '../../../engine/incomeTypes'
import type { Bands, SimulationResult } from '../../../engine/types'
import { buildYears, capChapters, chapterOf, chapters, estateLength, type Chapter, type WalkYear } from '../walkthrough'

/** Rows from start age 60, both plans' portfolios growing 4% a year unless `growth` says otherwise. */
function rows(n: number, growth: (i: number) => number = () => 0.04, age = 60): WalkYear[] {
  let v = 1_000_000
  return Array.from({ length: n }, (_, i) => {
    const start = v
    v = start * (1 + growth(i))
    const side = { netWorthStart: start, netWorth: v, portfolioStart: start, portfolio: v }
    return {
      index: i,
      age: age + i,
      income: { ...side, dividendsInterest: 0, socialSecurity: 0, sold: 0, tax: 0, reinvested: 0, spending: 0 },
      evelo: { ...side, socialSecurity: 0, borrowed: 0, interest: 0, repaid: 0, forcedSaleSold: 0, wealthTax: 0, loan: 0, ltv: 0 },
    }
  })
}
const ss = (incomeStartAge: number, otherIncome = 30_000) => ({ age: 60, incomeStartAge, otherIncome })
const keys = (c: Chapter[]) => c.map((x) => x.key)

/** 3–6 chapters, contiguous from row 0 to the last, every row in exactly one, estate last. */
function wellFormed(c: Chapter[], n: number) {
  expect(c.length).toBeGreaterThanOrEqual(Math.min(3, n))
  expect(c.length).toBeLessThanOrEqual(6)
  expect(c[0].from).toBe(0)
  expect(c[c.length - 1].to).toBe(n - 1)
  expect(c[c.length - 1].key).toBe('estate')
  for (let i = 0; i < c.length; i++) {
    expect(c[i].to).toBeGreaterThanOrEqual(c[i].from)
    if (i > 0) expect(c[i].from).toBe(c[i - 1].to + 1)
  }
  for (let y = 0; y < n; y++) expect(c.filter((x) => y >= x.from && y <= x.to)).toHaveLength(1)
  expect(new Set(keys(c)).size).toBe(c.length)
}

describe('chapters', () => {
  it('splits a 30-year plan with Social Security at 67 and a drop at 70 into the five named chapters', () => {
    const y = rows(30, (i) => (i === 10 ? -0.2 : i === 11 ? -0.03 : 0.04))
    const c = chapters(y, ss(67))
    wellFormed(c, 30)
    expect(c).toEqual([
      { key: 'before', name: 'Before Social Security', from: 0, to: 6 },
      { key: 'arrives', name: 'Social Security arrives', from: 7, to: 7 },
      { key: 'early', name: 'The early years', from: 8, to: 9 },
      { key: 'bad', name: 'The bad market', from: 10, to: 11 },
      { key: 'middle', name: 'The long middle', from: 12, to: 24 },
      { key: 'estate', name: 'The estate', from: 25, to: 29 },
    ])
  })

  it('a bad market right after Social Security arrives has no early chapter, and a one-year drop is one year', () => {
    const c = chapters(rows(30, (i) => (i === 8 ? -0.06 : 0.04)), ss(67))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['before', 'arrives', 'bad', 'middle', 'estate'])
    expect(c[2]).toMatchObject({ from: 8, to: 8 })
  })

  it('a fall in either plan counts, and under 5% does not', () => {
    const y = rows(30)
    y[12].evelo!.portfolio = y[12].evelo!.portfolioStart * 0.95
    expect(keys(chapters(y, ss(67)))).toContain('bad')
    const z = rows(30)
    z[12].income!.portfolio = z[12].income!.portfolioStart * 0.96
    expect(keys(chapters(z, ss(67)))).not.toContain('bad')
  })

  it('no Social Security in the horizon: no before or arrives chapter', () => {
    for (const s of [ss(67, 0), ss(95), ss(55)]) {
      const c = chapters(rows(30), s)
      wellFormed(c, 30)
      expect(keys(c)).not.toContain('arrives')
      expect(keys(c)).not.toContain('before')
    }
  })

  it('Social Security in the first year: an arrives chapter and no before', () => {
    const c = chapters(rows(30), ss(60))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['arrives', 'middle', 'estate'])
  })

  it('Social Security in the last year is left to the estate', () => {
    const c = chapters(rows(30), ss(89))
    wellFormed(c, 30)
    expect(keys(c)).not.toContain('arrives')
  })

  it('late Social Security shortens the estate so it stays last', () => {
    const c = chapters(rows(30), ss(87))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['before', 'arrives', 'estate'])
    expect(c[2]).toMatchObject({ from: 28, to: 29 })
  })

  it('no bad year in the medians: no bad-market chapter', () => {
    const c = chapters(rows(30), ss(67))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['before', 'arrives', 'middle', 'estate'])
  })

  it('a bad year inside before-Social-Security stays there, flagged, with no bad chapter', () => {
    const c = chapters(rows(30, (i) => (i === 3 ? -0.15 : i === 12 ? -0.2 : 0.04)), ss(67))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['before', 'arrives', 'middle', 'estate'])
    expect(c[0].badYear).toBe(3)
  })

  it('a bad year in the arrives year or the estate is kept there', () => {
    const a = chapters(rows(30, (i) => (i === 7 ? -0.1 : 0.04)), ss(67))
    expect(keys(a)).not.toContain('bad')
    expect(a.find((c) => c.key === 'arrives')!.badYear).toBe(7)
    const e = chapters(rows(30, (i) => (i === 27 ? -0.1 : 0.04)), ss(67))
    expect(keys(e)).not.toContain('bad')
    expect(e[e.length - 1].badYear).toBe(27)
  })

  it('the estate is the last five years, fewer on a short horizon', () => {
    expect(chapters(rows(30), ss(67)).at(-1)).toMatchObject({ key: 'estate', from: 25, to: 29 })
    expect(estateLength(15)).toBe(5)
    expect(estateLength(10)).toBe(3)
    expect(estateLength(2)).toBe(1)
  })

  it('a 10-year horizon still gets 3–6 chapters', () => {
    for (const s of [ss(67), ss(64), ss(60), ss(67, 0)])
      for (const g of [() => 0.04, (i: number) => (i === 2 ? -0.1 : 0.04), (i: number) => (i < 2 ? -0.1 : 0.04)]) {
        const c = chapters(rows(10, g), s)
        wellFormed(c, 10)
        // three years, or two when Social Security arrives at 67 and the estate follows it
        expect(c.at(-1)!.from).toBe(s.otherIncome > 0 && s.incomeStartAge === 67 ? 8 : 7)
      }
  })

  it('no Social Security and no bad year: the middle splits so there are still three chapters', () => {
    const c = chapters(rows(30), ss(67, 0))
    wellFormed(c, 30)
    expect(keys(c)).toEqual(['early', 'middle', 'estate'])
  })

  it('every horizon from 3 to 40 years, with and without Social Security and drops, is well formed', () => {
    for (let n = 3; n <= 40; n++)
      for (const start of [60, 61, 63, 67, 75, 60 + n - 1, 60 + n])
        for (const g of [() => 0.04, (i: number) => (i % 7 === 4 ? -0.08 : 0.04), () => -0.06]) {
          wellFormed(chapters(rows(n, g), ss(start)), n)
          wellFormed(chapters(rows(n, g), ss(start, 0)), n)
        }
  })

  it('one and two years give one chapter per year at most, estate last', () => {
    expect(keys(chapters(rows(1), ss(67)))).toEqual(['estate'])
    expect(keys(chapters(rows(2), ss(67, 0)))).toEqual(['middle', 'estate'])
    expect(chapters([], ss(67))).toEqual([])
  })

  it('capChapters merges adjacent chapters down to six, keeping the estate last and every year', () => {
    const many: Chapter[] = Array.from({ length: 9 }, (_, i) => ({ key: i === 8 ? 'estate' : 'middle', name: `c${i}`, from: i * 3, to: i * 3 + (i % 3) }))
    for (let i = 1; i < many.length; i++) many[i].from = many[i - 1].to + 1
    many[8].to = many[8].from + 4
    const out = capChapters(many)
    expect(out).toHaveLength(6)
    expect(out.at(-1)).toEqual(many[8])
    expect(out[0].from).toBe(0)
    for (let i = 1; i < out.length; i++) expect(out[i].from).toBe(out[i - 1].to + 1)
  })

  it('chapterOf finds the chapter holding a year', () => {
    const c = chapters(rows(30), ss(67))
    expect(chapterOf(c, 0)).toBe(0)
    expect(chapterOf(c, 7)).toBe(1)
    expect(chapterOf(c, 29)).toBe(c.length - 1)
    expect(chapterOf(c, 30)).toBe(-1)
  })
})

// ---------- buildYears ----------

const band = (a: number[]): Bands => ({ p5: a, p25: a, p50: a, p75: a, p95: a })
const median = (i: number): IncomeYearRow => ({
  year: i + 1, age: 0, dividends: 10, muniInterest: 1, taxableInterest: 2, treasuryInterest: 3, otherIncome: 5, tax: 7, spending: 100, gapSold: 40, reinvested: 0, value: 0,
})
function income(n: number): IncomeResult {
  return { value: band(Array.from({ length: n + 1 }, (_, i) => 1000 + i)), median: Array.from({ length: n }, (_, i) => median(i)) } as unknown as IncomeResult
}
function evelo(age: number, n: number, o: Partial<SimulationResult['inputs']> = {}): SimulationResult {
  const seq = (base: number) => Array.from({ length: n + 1 }, (_, i) => base + i)
  const tally = (base: number) => Array.from({ length: n }, (_, i) => base + i)
  return {
    inputs: { age, horizonYears: n, otherIncome: 24, incomeStartAge: 62, retireInYears: 0, ...o },
    netWorth: band(seq(2000)), portfolioValue: band(seq(3000)), loan: band(seq(4000)), ltv: band(seq(0)),
    yearly: { borrowed: tally(100), interest: tally(200), forcedSaleSold: tally(300), repaid: tally(400), wealthTax: tally(500) },
  } as unknown as SimulationResult
}
const inc = (age: number, n: number) => ({ age, horizonYears: n }) as IncomeInputs

describe('buildYears', () => {
  it('lines both plans up by age, year-end bands at index y and tallies at y − 1', () => {
    const y = buildYears(income(5), inc(60, 5), evelo(60, 5))
    expect(y).toHaveLength(5)
    expect(y.map((r) => r.age)).toEqual([60, 61, 62, 63, 64])
    expect(y[0].income).toMatchObject({ netWorthStart: 1000, netWorth: 1001, dividendsInterest: 16, socialSecurity: 5, sold: 40, tax: 7, portfolio: 1001 })
    expect(y[0].evelo).toMatchObject({ netWorthStart: 2000, netWorth: 2001, borrowed: 100, interest: 200, forcedSaleSold: 300, repaid: 400, wealthTax: 500, loan: 4001, portfolioStart: 3000, portfolio: 3001, ltv: 1, socialSecurity: 0 })
    expect(y[2].evelo!.socialSecurity).toBe(24)
    expect(y[4].evelo).toMatchObject({ netWorth: 2005, borrowed: 104 })
  })

  it('covers every age either plan lives, null outside a plan’s own years', () => {
    const y = buildYears(income(5), inc(60, 5), evelo(62, 6))
    expect(y.map((r) => r.age)).toEqual([60, 61, 62, 63, 64, 65, 66, 67])
    expect(y.map((r) => r.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(y[1].evelo).toBeNull()
    expect(y[2].evelo).toMatchObject({ netWorthStart: 2000, borrowed: 100 })
    expect(y[5].income).toBeNull()
    expect(y[4].income).toMatchObject({ netWorth: 1005 })
  })

  it('eVelo’s Social Security waits for retirement', () => {
    const y = buildYears(income(5), inc(60, 5), evelo(60, 5, { incomeStartAge: 60, retireInYears: 3 }))
    expect(y.map((r) => r.evelo!.socialSecurity)).toEqual([0, 0, 0, 24, 24])
  })
})
