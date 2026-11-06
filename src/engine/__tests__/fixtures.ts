import { createRng } from '../rng'
import type { City, MarketData } from '../types'

const r5 = (x: number) => Math.round(x * 1e5) / 1e5

/** Synthetic market: SPY plus extra assets built from SPY + noise. */
export function syntheticMarket(
  months: number,
  extra: { symbol: string; alpha: number; beta: number; noise: number; first?: number; cls?: 'stock' | 'etf-equity' }[] = [],
  seed = 1,
): MarketData {
  const rng = createRng(seed)
  const spy: number[] = []
  const cpi: number[] = []
  for (let m = 0; m < months; m++) {
    spy.push(r5(0.008 + 0.045 * rng.normal()))
    cpi.push(r5(0.0022 + 0.002 * rng.normal()))
  }
  const assets: MarketData['assets'] = {
    SPY: { symbol: 'SPY', name: 'SPY', cls: 'etf-equity', first: 0, r: spy },
  }
  for (const e of extra) {
    const first = e.first ?? 0
    assets[e.symbol] = {
      symbol: e.symbol,
      name: e.symbol,
      cls: e.cls ?? 'stock',
      first,
      r: spy.map((s, m) => (m < first ? null : r5(e.alpha + e.beta * s + e.noise * rng.normal()))),
    }
  }
  return { asOf: '2026-11-01', start: '1993-02', months, cpi, assets }
}

const base = { region: 'North America' as const, lat: 0, lon: 0, notes: [] }
export const STL: City = {
  ...base, id: 'st-louis', name: 'St. Louis', country: 'United States', countryCode: 'US',
  currency: 'USD', fxVol: 0, idx: { col: 70, rent: 35, groceries: 70, restaurants: 65 }, healthcare: 1,
}
export const BKK: City = {
  ...base, id: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', region: 'Asia',
  currency: 'THB', fxVol: 0.07, idx: { col: 40, rent: 20, groceries: 45, restaurants: 25 }, healthcare: 0.3,
}
export const ZRH: City = {
  ...base, id: 'zurich', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', region: 'Europe',
  currency: 'CHF', fxVol: 0.08, idx: { col: 125, rent: 70, groceries: 125, restaurants: 120 }, healthcare: 1.1,
}
export const CITIES_FIX: City[] = [STL, BKK, ZRH]
