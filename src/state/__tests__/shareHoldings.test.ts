import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { backfillSeries, prepare } from '../../engine/prepare'
import type { MarketData } from '../../engine/types'
import { assetMeta } from '../../ui/plan/marketIndex'
import { parsePersisted } from '../persisted'
import { sanitizeSaved } from '../portfolios'
import { decodeInputs, sanitizeInputs } from '../share'

const market = marketJson as unknown as MarketData
const HOSTILE = ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf', 'isPrototypeOf']
/** JSON text, so `__proto__` arrives as an own key/value exactly as from a real link or storage. */
const holdingsJson = JSON.stringify([...HOSTILE.map((symbol) => ({ symbol, weight: 1 })), { symbol: 'SPY', weight: 0.5 }])

function link(json: string): string {
  const bytes = new TextEncoder().encode(`{"v":1,"d":${json}}`)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('holdings with prototype-name symbols are dropped', () => {
  it('assetMeta only knows bundled tickers', () => {
    for (const s of HOSTILE) expect(assetMeta(s)).toBeUndefined()
    expect(assetMeta('SPY')?.symbol).toBe('SPY')
  })

  it('from a share link', () => {
    expect(decodeInputs(link(`{"holdings":[{"symbol":"constructor","weight":1}]}`))!.holdings).toEqual([])
    expect(decodeInputs(link(`{"holdings":${holdingsJson}}`))!.holdings).toEqual([{ symbol: 'SPY', weight: 0.5 }])
  })

  it('from a stored plan', () => {
    const stored = parsePersisted(`{"inputs":{"holdings":${holdingsJson}},"theme":"dark"}`)
    expect(sanitizeInputs(stored.inputs).holdings).toEqual([{ symbol: 'SPY', weight: 0.5 }])
  })

  it('from saved portfolios', () => {
    const raw = JSON.parse(`[{"id":"a","name":"Hostile","holdings":${holdingsJson}},{"id":"b","name":"Only bad","holdings":[{"symbol":"constructor","weight":1}]}]`)
    const list = sanitizeSaved(raw)
    expect(list.map((p) => p.name)).toEqual(['Hostile'])
    expect(list[0].holdings).toEqual([{ symbol: 'SPY', weight: 0.5 }])
  })

  it('the engine refuses them rather than treating them as assets', () => {
    for (const s of HOSTILE) {
      expect(() => backfillSeries(market, s)).toThrow(/Unknown symbol/)
      expect(() => prepare(market, [{ symbol: s, weight: 1 }], 'historical')).toThrow(/Unknown symbol/)
    }
  })
})
