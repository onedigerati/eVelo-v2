import { describe, expect, it } from 'vitest'
import { pickSampleFutures, realStockMonthly } from '../sampleFutures'
import type { MarketData } from '../types'

// Calendar months used by the hand-built paths: month 0 is flat, month 1 is a −10% real month
// (three in a row = −27.1%, two = −19%), months 2+ are steady growth months (rate per month below).
const RATES = [0.001, 0.002, 0.003, 0.004, 0.0005, 0.0015, 0.0025, 0.0035, 0.0045, 0.005]
const realStock = [0, -0.1, ...RATES]
const growth = (a: number) => 2 + RATES.indexOf(a)

/** A path of T months growing at `a`, with `crashLen` −10% months starting at `crashAt`. */
function path(T: number, a: number, crashAt = -1, crashLen = 3): number[] {
  const p = new Array<number>(T).fill(growth(a))
  for (let k = 0; k < crashLen && crashAt >= 0; k++) p[crashAt + k] = 1
  return p
}
const pack = (paths: number[][]) => Int32Array.from(paths.flat())

// T = 200: early = start in [0, 60), late = start in [80, 200).
const T = 200
const TEN = [
  path(T, 0.001), //               p0 no crash
  path(T, 0.002), //               p1 no crash
  path(T, 0.003, 10), //           p2 early crash
  path(T, 0.004, 20), //           p3 early crash
  path(T, 0.0005, 30), //          p4 early crash
  path(T, 0.0015, 150), //         p5 late crash
  path(T, 0.0025, 190), //         p6 late crash
  path(T, 0.0035, 70), //          p7 crash in the middle (neither)
  path(T, 0.0045, 5, 2), //        p8 −19%: not a crash
  path(T, 0.005), //               p9 no crash
]
// Cumulative real return order (log values worked by hand):
// p4 −.22, p5 −.02, p6 .18, p0 .20, p2 .27, p7 .37, p1 .40, p3 .47, p8 .68, p9 1.00

describe('pickSampleFutures', () => {
  it('picks each sample from a hand-built set (even count)', () => {
    expect(pickSampleFutures(pack(TEN), T, realStock)).toEqual({
      earlyCrash: 2, // early {p4, p2, p3} by cum → median p2
      typical: 2, // 10 paths: lower middle (5th smallest) = p2
      lateCrash: 5, // late {p5, p6} → lower middle p5
      lucky: 8, // nearest rank ⌈0.9·10⌉ = 9th smallest = p8
    })
  })

  it('odd count', () => {
    const nine = TEN.slice(1) // drop p0; indices shift down by one
    // order: p4 p5 p6 p2 p7 p1 p3 p8 p9 (original numbering)
    expect(pickSampleFutures(pack(nine), T, realStock)).toEqual({
      earlyCrash: 1, // p2
      typical: 6, // 5th smallest = p7
      lateCrash: 4, // p5
      lucky: 8, // ⌈8.1⌉ = 9th = p9
    })
  })

  it('is deterministic and reads only its inputs', () => {
    const idx = pack(TEN)
    const copy = idx.slice()
    const a = pickSampleFutures(idx, T, realStock)
    const b = pickSampleFutures(idx, T, realStock)
    expect(a).toEqual(b)
    expect(idx).toEqual(copy)
  })

  it('ties go to the lowest path index', () => {
    const A = path(T, 0.001)
    const B = path(T, 0.002)
    // sorted: A0 A3 B1 B2. Median position 1 (A3) → p0; 90th position 3 (B2) → p1.
    const picks = pickSampleFutures(pack([A, B, B, A]), T, realStock)
    expect(picks.typical).toBe(0)
    expect(picks.lucky).toBe(1)
    const same = pickSampleFutures(pack([path(T, 0.001, 10), path(T, 0.001, 10)]), T, realStock)
    expect(same).toEqual({ earlyCrash: 0, typical: 0, lateCrash: null, lucky: 0 })
  })

  it('null when no path qualifies', () => {
    const picks = pickSampleFutures(pack([path(T, 0.001), path(T, 0.002, 5, 2), path(T, 0.003, 70)]), T, realStock)
    expect(picks).toEqual({ earlyCrash: null, typical: 0, lateCrash: null, lucky: 2 })
    expect(pickSampleFutures(new Int32Array(0), T, realStock)).toEqual({
      earlyCrash: null,
      typical: null,
      lateCrash: null,
      lucky: null,
    })
  })

  it('window boundaries: early is [0, 60), late is [T − 120, T)', () => {
    const at = (s: number) => pickSampleFutures(pack([path(T, 0.001, s)]), T, realStock)
    expect(at(0).earlyCrash).toBe(0)
    expect(at(59).earlyCrash).toBe(0)
    expect(at(60)).toMatchObject({ earlyCrash: null, lateCrash: null })
    expect(at(79).lateCrash).toBe(null)
    expect(at(80).lateCrash).toBe(0)
    expect(at(197).lateCrash).toBe(0) // the fall ends on the horizon's last month
  })

  it('the decline is measured over at most 24 months', () => {
    // −1%/month for 30 months: worst 24-month fall 21.4% → crash, starting where the fall starts.
    // −0.8%/month for 30 months: 21.4% in total but only 17.5% over any 24 months → no crash.
    const rs = [0, -0.01, -0.008, 0.001]
    const slow = (m: number) => Array.from({ length: T }, (_, t) => (t >= 40 && t < 70 ? m : 3))
    expect(pickSampleFutures(Int32Array.from(slow(1)), T, rs).earlyCrash).toBe(0)
    expect(pickSampleFutures(Int32Array.from(slow(2)), T, rs).earlyCrash).toBe(null)
  })

  it('T < 120: late is the second half and early stops at the first half', () => {
    const t = 100 // half = 50
    const at = (s: number) => pickSampleFutures(pack([path(t, 0.001, s)]), t, realStock)
    expect(at(10)).toMatchObject({ earlyCrash: 0, lateCrash: null })
    expect(at(49)).toMatchObject({ earlyCrash: 0, lateCrash: null })
    expect(at(50)).toMatchObject({ earlyCrash: null, lateCrash: 0 }) // would be early under [0, 60)
    expect(at(97)).toMatchObject({ earlyCrash: null, lateCrash: 0 })
  })

  it('T = 120: late is [60, 120), not the whole horizon', () => {
    const t = 120
    const at = (s: number) => pickSampleFutures(pack([path(t, 0.001, s)]), t, realStock)
    expect(at(10)).toMatchObject({ earlyCrash: 0, lateCrash: null })
    expect(at(59)).toMatchObject({ earlyCrash: 0, lateCrash: null })
    expect(at(60)).toMatchObject({ earlyCrash: null, lateCrash: 0 })
    expect(at(117)).toMatchObject({ earlyCrash: null, lateCrash: 0 })
  })

  it('T = 150: late is [60, 150)', () => {
    const t = 150
    const at = (s: number) => pickSampleFutures(pack([path(t, 0.001, s)]), t, realStock)
    expect(at(59)).toMatchObject({ earlyCrash: 0, lateCrash: null })
    expect(at(60)).toMatchObject({ earlyCrash: null, lateCrash: 0 }) // T − 120 = 30 would overlap
    expect(at(147)).toMatchObject({ earlyCrash: null, lateCrash: 0 })
  })

  it('matches a direct O(T·24) scan on random paths', () => {
    // Reference: the rule written out plainly.
    function reference(idx: Int32Array, H: number, rs: ArrayLike<number>) {
      const n = idx.length / H
      const lateStart = Math.max(H - 120, 60)
      const cum: number[] = []
      const early: number[] = []
      const late: number[] = []
      for (let p = 0; p < n; p++) {
        const I = [1]
        for (let t = 0; t < H; t++) I.push(I[t] * (1 + rs[idx[p * H + t]]))
        cum.push(I[H] - 1)
        let worst = 0
        let start = -1
        for (let s = 0; s < H; s++)
          for (let k = 1; k <= 24 && s + k <= H; k++) {
            const d = I[s + k] / I[s] - 1
            if (d < worst || (d === worst && d < 0 && s < start)) [worst, start] = [d, s]
          }
        if (worst <= -0.2) {
          if (start < 60) early.push(p)
          if (start >= lateStart) late.push(p)
        }
      }
      const rank = (ps: number[], q: (m: number) => number) => {
        if (!ps.length) return null
        const o = [...ps].sort((a, b) => cum[a] - cum[b] || a - b)
        const v = cum[o[q(o.length)]]
        return o.find((x) => cum[x] === v)!
      }
      const all = Array.from({ length: n }, (_, p) => p)
      const med = (m: number) => Math.floor((m - 1) / 2)
      return {
        earlyCrash: rank(early, med),
        typical: rank(all, med),
        lateCrash: rank(late, med),
        lucky: rank(all, (m) => Math.ceil(0.9 * m) - 1),
      }
    }
    let seed = 777
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32)
    const rs = Float64Array.from({ length: 50 }, () => 0.004 + 0.06 * (rand() + rand() + rand() - 1.5))
    for (const H of [120, 150, 360]) {
      for (let trial = 0; trial < 5; trial++) {
        const idx = Int32Array.from({ length: 101 * H }, () => Math.floor(rand() * 50))
        expect(pickSampleFutures(idx, H, rs)).toEqual(reference(idx, H, rs))
      }
    }
  })

  function timed(n: number, H: number) {
    const M = 405
    let seed = 12345
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32)
    const rs = Float64Array.from({ length: M }, () => 0.006 + 0.045 * (rand() + rand() + rand() - 1.5))
    const idx = new Int32Array(n * H)
    for (let i = 0; i < idx.length; i++) idx[i] = Math.floor(rand() * M)
    pickSampleFutures(idx.subarray(0, 100 * H), H, rs) // warm up
    const t0 = performance.now()
    const picks = pickSampleFutures(idx, H, rs)
    const ms = performance.now() - t0
    console.log(`pickSampleFutures ${n} × ${H}: ${ms.toFixed(1)} ms`)
    expect(picks.typical).not.toBeNull()
    expect(picks.earlyCrash).not.toBeNull()
    expect(picks.lateCrash).not.toBeNull()
    expect(ms).toBeLessThan(1000) // generous for CI; target well under 100 ms
  }
  it('10,000 × 480 is fast', () => timed(10_000, 480))
  it('4,000 × 360 is fast', () => timed(4_000, 360))
})

describe('realStockMonthly', () => {
  it('SPY less CPI, (1 + r) / (1 + cpi) − 1', () => {
    const market = {
      asOf: '2026-01-01',
      start: '2000-01',
      months: 3,
      cpi: [0.01, 0, 0.02],
      assets: { SPY: { symbol: 'SPY', name: 'SPY', cls: 'etf-equity', first: 1, r: [null, 0.05, -0.1] } },
    } as MarketData
    const r = realStockMonthly(market)
    expect(r.length).toBe(3)
    expect(r[0]).toBeCloseTo(1 / 1.01 - 1, 12)
    expect(r[1]).toBeCloseTo(0.05, 12)
    expect(r[2]).toBeCloseTo(0.9 / 1.02 - 1, 12)
  })

  it('throws without SPY', () => {
    expect(() => realStockMonthly({ asOf: '', start: '2000-01', months: 0, cpi: [], assets: {} })).toThrow(/SPY/)
  })
})
