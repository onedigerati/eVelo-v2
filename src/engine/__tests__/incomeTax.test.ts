import { describe, expect, it } from 'vitest'
import { FEDERAL_BANDS, incomeTax, type IncomeTaxOptions } from '../incomeTax'
import { bandTax } from '../localTax'
import { STATE_INCOME_TAX } from '../../data/stateIncomeTax'
import type { FilingStatus, IncomeYear, MuniRule, StateIncomeTax } from '../incomeTaxTypes'

// Figures: Rev. Proc. 2025-32 §4.01 (brackets), §4.03 (0/15/20% breakpoints), §4.14 (standard
// deduction $16,100 single / $32,200 MFJ; 65+ addition $2,050 single / $1,650 MFJ each).

const single: IncomeTaxOptions = { status: 'single', over65: 0, priceLevel: 1, year: 2026 }
const mfj: IncomeTaxOptions = { status: 'mfj', over65: 0, priceLevel: 1, year: 2026 }

describe('ordinary income against the 2026 brackets (§4.01, §4.14)', () => {
  it.each<[string, IncomeTaxOptions, number, number]>([
    // Single, deduction 16,100.
    // 30,000 -> TI 13,900: 10% x 12,400 = 1,240; 12% x 1,500 = 180 -> 1,420
    ['single 30k', single, 30_000, 1_420],
    // 80,000 -> TI 63,900: 1,240 + 12% x 38,000 = 4,560 + 22% x 13,500 = 2,970 -> 8,770
    ['single 80k', single, 80_000, 8_770],
    // 250,000 -> TI 233,900: 1,240 + 4,560 + 22% x 55,300 = 12,166 + 24% x 96,075 = 23,058
    //   + 32% x 32,125 = 10,280 -> 51,304
    ['single 250k', single, 250_000, 51_304],
    // 700,000 -> TI 683,900: 41,024 (through 24%) + 32% x 54,450 = 17,424 + 35% x 384,375 = 134,531.25
    //   + 37% x 43,300 = 16,021 -> 209,000.25
    ['single 700k', single, 700_000, 209_000.25],
    // MFJ, deduction 32,200.
    // 50,000 -> TI 17,800: 10% -> 1,780
    ['mfj 50k', mfj, 50_000, 1_780],
    // 150,000 -> TI 117,800: 2,480 + 12% x 76,000 = 9,120 + 22% x 17,000 = 3,740 -> 15,340
    ['mfj 150k', mfj, 150_000, 15_340],
    // 500,000 -> TI 467,800: 2,480 + 9,120 + 22% x 110,600 = 24,332 + 24% x 192,150 = 46,116
    //   + 32% x 64,250 = 20,560 -> 102,608
    ['mfj 500k', mfj, 500_000, 102_608],
    // 900,000 -> TI 867,800: 82,048 (through 24%) + 32% x 108,900 = 34,848 + 35% x 256,250 = 89,687.5
    //   + 37% x 99,100 = 36,667 -> 243,250.5
    ['mfj 900k', mfj, 900_000, 243_250.5],
  ])('%s', (_, opts, other, expected) => {
    const r = incomeTax({ otherOrdinary: other }, opts)
    expect(r.federal).toBeCloseTo(expected, 6)
    expect(r.niit).toBe(0)
    expect(r.state).toBe(0)
  })

  it('taxable and Treasury interest are ordinary income too', () => {
    // MFJ 150k split across the three ordinary types -> same 15,340 bracket tax, NIIT 0 (MAGI < 250k)
    const r = incomeTax({ taxableInterest: 50_000, treasuryInterest: 50_000, otherOrdinary: 50_000 }, mfj)
    expect(r.federal).toBeCloseTo(15_340, 6)
  })
})

describe('qualified dividends stack on ordinary income (§4.03)', () => {
  it('single: crosses 0% -> 15%', () => {
    // Deduction used up by 16,100 ordinary; QD 60,000 fills TI 0..60,000.
    // 0% to 49,450, 15% x 10,550 = 1,582.50
    expect(incomeTax({ otherOrdinary: 16_100, qualifiedDividends: 60_000 }, single).federal).toBeCloseTo(1_582.5, 6)
  })
  it('mfj: crosses 0% -> 15%', () => {
    // QD 120,000 over 0 ordinary TI: 15% x (120,000 - 98,900) = 3,165
    expect(incomeTax({ otherOrdinary: 32_200, qualifiedDividends: 120_000 }, mfj).federal).toBeCloseTo(3_165, 6)
  })
  it('single: crosses 15% -> 20%, plus NIIT', () => {
    // Ordinary TI 500,000: 58,448 + 35% x 243,775 = 85,321.25 -> 143,769.25
    // QD 100,000 on 500,000..600,000: 15% x 45,500 = 6,825; 20% x 54,500 = 10,900 -> 17,725
    // NIIT: min(100,000, 616,100 - 200,000) x 3.8% = 3,800
    const r = incomeTax({ otherOrdinary: 516_100, qualifiedDividends: 100_000 }, single)
    expect(r.niit).toBeCloseTo(3_800, 6)
    expect(r.federal).toBeCloseTo(143_769.25 + 17_725 + 3_800, 6)
  })
  it('long-term gains use the same schedule as qualified dividends', () => {
    const a = incomeTax({ otherOrdinary: 516_100, qualifiedDividends: 100_000 }, single)
    const b = incomeTax({ otherOrdinary: 516_100, longTermGains: 100_000 }, single)
    expect(b.federal).toBeCloseTo(a.federal, 6)
  })
})

describe('NIIT', () => {
  it('below the threshold: none', () => {
    // MAGI 180,000 < 200,000
    expect(incomeTax({ otherOrdinary: 150_000, qualifiedDividends: 30_000 }, single).niit).toBe(0)
  })
  it('above the threshold: 3.8% of the excess when smaller than NII', () => {
    // MAGI 220,000: min(30,000, 20,000) x 3.8% = 760
    expect(incomeTax({ otherOrdinary: 190_000, qualifiedDividends: 30_000 }, single).niit).toBeCloseTo(760, 6)
  })
  it('the threshold shrinks in real terms at priceLevel 1.5', () => {
    // Real threshold 200,000 / 1.5 = 133,333; MAGI 180,000 -> excess 46,667 > NII 30,000 -> 1,140
    const r = incomeTax({ otherOrdinary: 150_000, qualifiedDividends: 30_000 }, { ...single, priceLevel: 1.5 })
    expect(r.niit).toBeCloseTo(1_140, 6)
  })
  it('muni interest and pensions are not NII', () => {
    // MFJ: pension 300,000, muni 100,000 -> NII 0
    expect(incomeTax({ otherOrdinary: 300_000, muniInterest: 100_000 }, mfj).niit).toBe(0)
  })
})

describe('Social Security (Pub 915 worksheet)', () => {
  it('0% below the first base', () => {
    // PI = 10,000 + 10,000 = 20,000 < 25,000
    expect(incomeTax({ socialSecurity: 20_000, otherOrdinary: 10_000 }, single).taxableSocialSecurity).toBe(0)
  })
  it('50% between the bases', () => {
    // PI = 20,000 + 10,000 = 30,000; 50% x 5,000 = 2,500
    expect(incomeTax({ socialSecurity: 20_000, otherOrdinary: 20_000 }, single).taxableSocialSecurity).toBeCloseTo(2_500, 6)
  })
  it('85% above the second base', () => {
    // PI = 40,000 + 15,000 = 55,000; min(4,500, 15,000) + 85% x 21,000 = 17,850 -> 22,350 (< cap 25,500)
    expect(incomeTax({ socialSecurity: 30_000, otherOrdinary: 40_000 }, single).taxableSocialSecurity).toBeCloseTo(22_350, 6)
  })
  it('capped at 85% of benefits', () => {
    expect(incomeTax({ socialSecurity: 30_000, otherOrdinary: 100_000 }, single).taxableSocialSecurity).toBeCloseTo(25_500, 6)
  })
  it('mfj bases 32k/44k', () => {
    // PI = 30,000 + 20,000 = 50,000; min(6,000, 20,000) + 85% x 6,000 = 5,100 -> 11,100
    expect(incomeTax({ socialSecurity: 40_000, otherOrdinary: 30_000 }, mfj).taxableSocialSecurity).toBeCloseTo(11_100, 6)
  })
  it('muni interest pushes benefits into taxable', () => {
    // Without muni: PI 20,000 -> 0. With 15,000 muni: PI 35,000; 4,500 + 85% x 1,000 = 5,350
    const opts = single
    expect(incomeTax({ socialSecurity: 20_000, otherOrdinary: 10_000 }, opts).taxableSocialSecurity).toBe(0)
    const r = incomeTax({ socialSecurity: 20_000, otherOrdinary: 10_000, muniInterest: 15_000 }, opts)
    expect(r.taxableSocialSecurity).toBeCloseTo(5_350, 6)
  })
  it('the bases shrink in real terms', () => {
    // priceLevel 1.25: real bases 20,000 / 27,200. PI = 15,000 + 10,000 = 25,000 (0 taxable at
    // priceLevel 1) -> 50% x 5,000 = 2,500
    const r = incomeTax({ socialSecurity: 20_000, otherOrdinary: 15_000 }, { ...single, priceLevel: 1.25 })
    expect(r.taxableSocialSecurity).toBeCloseTo(2_500, 6)
  })
})

describe('deductions for 65+', () => {
  const s65: IncomeTaxOptions = { ...single, over65: 1 }
  it('aged addition and OBBBA senior deduction in 2026', () => {
    // 16,100 + 2,050 + 6,000 = 24,150; TI 25,850: 1,240 + 12% x 13,450 = 1,614 -> 2,854
    expect(incomeTax({ otherOrdinary: 50_000 }, s65).federal).toBeCloseTo(2_854, 6)
  })
  it('senior deduction gone from 2029', () => {
    // 18,150; TI 31,850: 1,240 + 12% x 19,450 = 2,334 -> 3,574
    expect(incomeTax({ otherOrdinary: 50_000 }, { ...s65, year: 2029 }).federal).toBeCloseTo(3_574, 6)
  })
  it('senior deduction phases out at 6% above 75k MAGI', () => {
    // 6,000 - 6% x 25,000 = 4,500; deduction 22,650; TI 77,350: 5,800 + 22% x 26,950 = 5,929 -> 11,729
    expect(incomeTax({ otherOrdinary: 100_000 }, s65).federal).toBeCloseTo(11_729, 6)
  })
  it('mfj both 65+', () => {
    // 32,200 + 2 x 1,650 + 2 x 6,000 = 47,500; 0% QD band reaches 98,900 + 47,500 = 146,400 of QD
    expect(incomeTax({ qualifiedDividends: 146_400 }, { ...mfj, over65: 2 }).federal).toBeCloseTo(0, 6)
    // 6,000 each phase out by 6% of (160,000 - 150,000) = 600 -> 2 x 5,400; deduction 46,300;
    // TI 113,700: QD 0% to 98,900, 15% x 14,800 = 2,220
    expect(incomeTax({ qualifiedDividends: 160_000 }, { ...mfj, over65: 2 }).federal).toBeCloseTo(2_220, 6)
  })
})

describe('muni interest', () => {
  it('is federally exempt', () => {
    const r = incomeTax({ muniInterest: 1_000_000 }, mfj)
    expect(r.federal).toBe(0)
    expect(r.total).toBe(0)
  })
})

function synthState(muni: MuniRule, extra: Partial<StateIncomeTax> = {}): StateIncomeTax {
  return {
    state: 'ZZ',
    taxesInvestmentIncome: true,
    muni,
    bands: { single: [{ from: 0, rate: 0.05 }], mfj: [{ from: 0, rate: 0.05 }] },
    deduction: { single: 10_000, mfj: 20_000 },
    taxesSocialSecurity: false,
    taxesPensions: true,
    sources: ['synthetic'],
    ...extra,
  }
}

describe('state income tax', () => {
  const inc: IncomeYear = { taxableInterest: 10_000, qualifiedDividends: 10_000, muniInterest: 20_000 }
  it.each<[MuniRule, number]>([
    // base 10,000 + 10,000 + 20,000 muni - 10,000 = 30,000 x 5% = 1,500
    ['in-state-exempt', 1_500],
    ['all-taxed', 1_500],
    ['reciprocal', 1_500],
    // muni excluded: 20,000 - 10,000 = 10,000 x 5% = 500
    ['all-exempt', 500],
  ])('muni rule %s', (rule, expected) => {
    expect(incomeTax(inc, { ...single, state: synthState(rule) }).state).toBeCloseTo(expected, 6)
  })
  it('Treasury interest is excluded from state tax', () => {
    const st = synthState('all-taxed')
    const a = incomeTax(inc, { ...single, state: st })
    const b = incomeTax({ ...inc, treasuryInterest: 50_000 }, { ...single, state: st })
    expect(b.state).toBeCloseTo(a.state, 9)
    expect(b.federal).toBeGreaterThan(a.federal)
  })
  it('local rate on the same base', () => {
    // 30,000 x (5% + 3%) = 2,400
    expect(incomeTax(inc, { ...single, state: synthState('all-taxed', { localRate: 0.03 }) }).state).toBeCloseTo(2_400, 6)
  })
  it('a state without investment-income tax charges nothing', () => {
    expect(incomeTax(inc, { ...single, state: synthState('all-taxed', { taxesInvestmentIncome: false }) }).state).toBe(0)
  })
  it('federally taxable Social Security only where the state taxes it', () => {
    // Taxable SS 22,350 (see the 85% case); base 40,000 + 22,350 - 10,000 = 52,350 x 5% = 2,617.50
    const ssInc: IncomeYear = { socialSecurity: 30_000, otherOrdinary: 40_000 }
    expect(incomeTax(ssInc, { ...single, state: synthState('all-taxed') }).state).toBeCloseTo(1_500, 6)
    expect(
      incomeTax(ssInc, { ...single, state: synthState('all-taxed', { taxesSocialSecurity: true }) }).state,
    ).toBeCloseTo(2_617.5, 6)
  })
  it('gains exclusion takes a share of long-term gains off the state base', () => {
    const g: IncomeYear = { taxableInterest: 10_000, longTermGains: 40_000 }
    // no exclusion: 50,000 - 10,000 = 40,000 x 5% = 2,000
    expect(incomeTax(g, { ...single, state: synthState('all-taxed') }).state).toBeCloseTo(2_000, 6)
    // half: 10,000 + 20,000 - 10,000 = 20,000 x 5% = 1,000
    expect(incomeTax(g, { ...single, state: synthState('all-taxed', { gainsExclusion: 0.5 }) }).state).toBeCloseTo(1_000, 6)
    // all: 10,000 - 10,000 = 0
    expect(incomeTax(g, { ...single, state: synthState('all-taxed', { gainsExclusion: 1 }) }).state).toBe(0)
    // local rate on the same base: 20,000 x (5% + 3%) = 1,600
    expect(
      incomeTax(g, { ...single, state: synthState('all-taxed', { gainsExclusion: 0.5, localRate: 0.03 }) }).state,
    ).toBeCloseTo(1_600, 6)
    // federal is untouched
    expect(incomeTax(g, { ...single, state: synthState('all-taxed', { gainsExclusion: 1 }) }).federal).toBeCloseTo(
      incomeTax(g, single).federal,
      9,
    )
  })
  it('retirement exclusion per filer 65+, before the deduction', () => {
    const st = synthState('all-taxed', { retirementExclusionPer65: 30_000 })
    const r: IncomeYear = { taxableInterest: 50_000, qualifiedDividends: 30_000 }
    // nobody 65+: 80,000 - 10,000 = 70,000 x 5% = 3,500
    expect(incomeTax(r, { ...single, state: st }).state).toBeCloseTo(3_500, 6)
    // single 65+: 80,000 - 30,000 - 10,000 = 40,000 x 5% = 2,000; over65 capped at 1 for single
    expect(incomeTax(r, { ...single, over65: 1, state: st }).state).toBeCloseTo(2_000, 6)
    expect(incomeTax(r, { ...single, over65: 2, state: st }).state).toBeCloseTo(2_000, 6)
    // mfj one 65+: 80,000 - 30,000 - 20,000 = 30,000 x 5% = 1,500; both: 80,000 - 60,000 - 20,000 = 0
    expect(incomeTax(r, { ...mfj, over65: 1, state: st }).state).toBeCloseTo(1_500, 6)
    expect(incomeTax(r, { ...mfj, over65: 2, state: st }).state).toBe(0)
    // local rate on the same base: 40,000 x (5% + 2%) = 2,800
    expect(
      incomeTax(r, { ...single, over65: 1, state: { ...st, localRate: 0.02 } }).state,
    ).toBeCloseTo(2_800, 6)
    // exclusion larger than the base: no tax, never negative
    expect(incomeTax({ taxableInterest: 10_000 }, { ...single, over65: 1, state: st }).state).toBe(0)
  })
  it('no state means federal only', () => {
    const r = incomeTax(inc, single)
    expect(r.state).toBe(0)
    expect(r.total).toBe(r.federal)
  })
})

describe('properties', () => {
  it('all-zero income gives 0', () => {
    for (const status of ['single', 'mfj'] as FilingStatus[]) {
      const r = incomeTax({}, { status, over65: 2, priceLevel: 1.3, year: 2026, state: synthState('all-taxed', { localRate: 0.02 }) })
      expect(r).toEqual({ federal: 0, niit: 0, state: 0, total: 0, taxableSocialSecurity: 0 })
    }
  })

  it('non-negative and monotonic in each income type', () => {
    const fields: (keyof IncomeYear)[] = [
      'qualifiedDividends', 'taxableInterest', 'treasuryInterest', 'muniInterest',
      'longTermGains', 'socialSecurity', 'otherOrdinary',
    ]
    const steps = [0, 5_000, 20_000, 45_000, 90_000, 180_000, 400_000, 1_000_000]
    const backgrounds: IncomeYear[] = [
      {},
      { socialSecurity: 30_000, otherOrdinary: 20_000 },
      { qualifiedDividends: 60_000, taxableInterest: 20_000, muniInterest: 30_000 },
      { otherOrdinary: 250_000, longTermGains: 100_000, socialSecurity: 40_000 },
    ]
    const optsList: IncomeTaxOptions[] = []
    for (const status of ['single', 'mfj'] as FilingStatus[])
      for (const over65 of [0, 2] as const)
        for (const priceLevel of [1, 1.6])
          optsList.push({
            status,
            over65,
            priceLevel,
            year: 2026,
            state: synthState('all-taxed', {
              taxesSocialSecurity: true,
              localRate: 0.01,
              gainsExclusion: 0.5,
              retirementExclusionPer65: 15_000,
            }),
          })
    let checks = 0
    for (const opts of optsList)
      for (const bg of backgrounds)
        for (const f of fields) {
          let prev = -Infinity
          let prevFed = -Infinity
          for (const v of steps) {
            const r = incomeTax({ ...bg, [f]: v }, opts)
            for (const k of ['federal', 'niit', 'state', 'total', 'taxableSocialSecurity'] as const)
              expect(r[k]).toBeGreaterThanOrEqual(0)
            expect(r.total).toBeGreaterThanOrEqual(prev - 1e-9)
            expect(r.federal).toBeGreaterThanOrEqual(prevFed - 1e-9)
            prev = r.total
            prevFed = r.federal
            checks++
          }
        }
    expect(checks).toBe(8 * 4 * 7 * 8)
  })
})

describe('packed bands (speed fix)', () => {
  it('matches the unpacked band tax for every state record, cached across calls', () => {
    const inc: IncomeYear = { taxableInterest: 40_000, qualifiedDividends: 90_000, otherOrdinary: 60_000, muniInterest: 30_000 }
    for (const st of Object.values(STATE_INCOME_TAX)) {
      if (!st.taxesInvestmentIncome) continue
      for (const status of ['single', 'mfj'] as FilingStatus[]) {
        const opts: IncomeTaxOptions = { status, over65: 0, priceLevel: 1, year: 2026, state: { ...st, localRate: undefined } }
        const r1 = incomeTax(inc, opts)
        const r2 = incomeTax(inc, opts)
        expect(r2.state).toBe(r1.state)
        const base = 40_000 + 90_000 + (st.taxesPensions ? 60_000 : 0) + 30_000
        expect(r1.state, `${st.state} ${status}`).toBeCloseTo(bandTax(Math.max(0, base - st.deduction[status]), st.bands[status]), 6)
      }
    }
  })
  it('federal tax matches the unpacked bands', () => {
    // single 250k -> TI 233,900
    expect(incomeTax({ otherOrdinary: 250_000 }, single).federal).toBeCloseTo(bandTax(233_900, FEDERAL_BANDS.single), 6)
  })
  it('sorts unsorted state bands once', () => {
    const st = synthState('all-taxed', { bands: { single: [{ from: 20_000, rate: 0.1 }, { from: 0, rate: 0.05 }], mfj: [{ from: 0, rate: 0.05 }] } })
    // base 30,000 - 10,000 = 20,000: all at 5% = 1,000; 40,000 -> 30,000: 1,000 + 10% x 10,000 = 2,000
    expect(incomeTax({ taxableInterest: 30_000 }, { ...single, state: st }).state).toBeCloseTo(1_000, 6)
    expect(incomeTax({ taxableInterest: 40_000 }, { ...single, state: st }).state).toBeCloseTo(2_000, 6)
  })
})

describe('input validation', () => {
  it.each([0, -1, NaN, Infinity, -Infinity])('rejects priceLevel %s', (priceLevel) => {
    expect(() => incomeTax({ otherOrdinary: 1_000 }, { ...single, priceLevel })).toThrow(RangeError)
  })
  it.each([2026.5, NaN, Infinity])('rejects year %s', (year) => {
    expect(() => incomeTax({}, { ...single, year })).toThrow(RangeError)
  })
  it('treats non-finite or negative income fields as 0, and stays finite', () => {
    const fields: (keyof IncomeYear)[] = [
      'qualifiedDividends', 'taxableInterest', 'treasuryInterest', 'muniInterest',
      'longTermGains', 'socialSecurity', 'otherOrdinary',
    ]
    const bg: IncomeYear = { qualifiedDividends: 50_000, otherOrdinary: 40_000, socialSecurity: 30_000 }
    const opts: IncomeTaxOptions = { ...mfj, over65: 2, state: synthState('all-taxed', { localRate: 0.02, taxesSocialSecurity: true }) }
    const ref = incomeTax(bg, opts)
    for (const f of fields)
      for (const bad of [NaN, Infinity, -Infinity, -5_000]) {
        const r = incomeTax({ ...bg, [f]: bad }, opts)
        for (const k of ['federal', 'niit', 'state', 'total', 'taxableSocialSecurity'] as const) {
          expect(Number.isFinite(r[k]), `${f}=${bad} ${k}`).toBe(true)
        }
        // bg has no value for most fields, so the bad value must act as 0 (as if absent)
        expect(r, `${f}=${bad}`).toEqual(incomeTax({ ...bg, [f]: 0 }, opts))
      }
    expect(incomeTax({ ...bg, longTermGains: 0 }, opts)).toEqual(ref)
  })
  it('a net long-term loss counts as 0 (net realised gains, netted by the caller)', () => {
    const opts: IncomeTaxOptions = { ...single, state: synthState('all-taxed') }
    expect(incomeTax({ otherOrdinary: 80_000, longTermGains: -20_000 }, opts)).toEqual(incomeTax({ otherOrdinary: 80_000 }, opts))
  })
})

describe('state pension exclusion', () => {
  it('leaves otherOrdinary out of the state and local base when taxesPensions is false', () => {
    const inc: IncomeYear = { otherOrdinary: 50_000, taxableInterest: 20_000 }
    // taxed: 70,000 - 10,000 = 60,000 x (5% + 2%) = 4,200; excluded: 20,000 - 10,000 = 10,000 x 7% = 700
    expect(incomeTax(inc, { ...single, state: synthState('all-taxed', { localRate: 0.02 }) }).state).toBeCloseTo(4_200, 6)
    const ex = synthState('all-taxed', { localRate: 0.02, taxesPensions: false })
    expect(incomeTax(inc, { ...single, state: ex }).state).toBeCloseTo(700, 6)
    // federal is unchanged
    expect(incomeTax(inc, { ...single, state: ex }).federal).toBeCloseTo(incomeTax(inc, single).federal, 9)
  })
})

describe('local tax that skips long-term gains', () => {
  it('state taxes the gains, the local rate does not', () => {
    const st = synthState('all-taxed', { localRate: 0.02, localExcludesLongTermGains: true })
    // state: 30,000 + 20,000 - 10,000 = 40,000 x 5% = 2,000; local: 30,000 - 10,000 = 20,000 x 2% = 400
    expect(incomeTax({ taxableInterest: 30_000, longTermGains: 20_000 }, { ...single, state: st }).state).toBeCloseTo(2_400, 6)
    // with the flag off the local rate reaches the gains: 40,000 x 7% = 2,800
    expect(
      incomeTax({ taxableInterest: 30_000, longTermGains: 20_000 }, { ...single, state: { ...st, localExcludesLongTermGains: false } }).state,
    ).toBeCloseTo(2_800, 6)
  })
})
