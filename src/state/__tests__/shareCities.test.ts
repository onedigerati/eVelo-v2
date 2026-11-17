import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES, CITY_BY_ID } from '../../data/cities'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { simulate } from '../../engine/simulate'
import type { MarketData, PlanInputs } from '../../engine/types'
import { decodeInputs, encodeInputs, sanitizeInputs } from '../share'

const market = marketJson as unknown as MarketData
const isCity = (id: unknown) => typeof id === 'string' && Object.hasOwn(CITY_BY_ID, id)

/** A share-link payload built by hand (JSON text, so `__proto__` arrives as an own key, as from a real link). */
function link(json: string): string {
  const bytes = new TextEncoder().encode(`{"v":1,"d":${json}}`)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
/** The localStorage load path: store.ts parses the stored JSON and runs sanitizeInputs on `inputs`. */
const fromStorage = (inputs: unknown) => sanitizeInputs((JSON.parse(JSON.stringify({ inputs })) as { inputs: unknown }).inputs)
const storedText = (json: string) => sanitizeInputs((JSON.parse(`{"inputs":${json}}`) as { inputs: unknown }).inputs)

const HOSTILE = ['constructor', '__proto__', 'toString', 'nowhere', 'hasOwnProperty', 'valueOf', '', 'BANGKOK']

describe('stay home survives save/reload and share links', () => {
  const stayHome: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: null }

  it('keeps destCityId null through localStorage and a share link', () => {
    expect(fromStorage(stayHome).destCityId).toBeNull()
    const decoded = decodeInputs(encodeInputs(stayHome))
    expect(decoded).not.toBeNull()
    expect(decoded!.destCityId).toBeNull()
    expect(decoded).toEqual(stayHome)
    expect(fromStorage(stayHome)).toEqual(stayHome)
  })

  it('decoded stay-home plans get the stay-home odds, not the default destination', () => {
    const small: PlanInputs = { ...stayHome, paths: 1000, seed: 4242 }
    const viaLink = decodeInputs(encodeInputs(small))!
    const viaStore = fromStorage(small)
    const original = simulate(market, CITIES, small).successRate
    expect(simulate(market, CITIES, viaLink).successRate).toBe(original)
    expect(simulate(market, CITIES, viaStore).successRate).toBe(original)
    // Sanity: the default destination gives different odds, so the check above can tell them apart.
    expect(simulate(market, CITIES, { ...small, destCityId: DEFAULT_INPUTS.destCityId }).successRate).not.toBe(original)
  })

  it('keeps a known destination and a known home', () => {
    const p = { ...structuredClone(DEFAULT_INPUTS), homeCityId: 'lisbon', destCityId: 'st-louis' }
    expect(isCity('lisbon') && isCity('st-louis')).toBe(true)
    expect(decodeInputs(encodeInputs(p))).toEqual(p)
    expect(fromStorage(p)).toEqual(p)
  })

  it('a destination equal to home means stay home', () => {
    const p = { ...structuredClone(DEFAULT_INPUTS), homeCityId: 'lisbon', destCityId: 'lisbon' }
    expect(decodeInputs(encodeInputs(p))!.destCityId).toBeNull()
    expect(fromStorage(p).destCityId).toBeNull()
  })
})

describe('hostile or unknown city ids', () => {
  for (const id of HOSTILE) {
    const j = JSON.stringify(id)
    it(`home ${j} -> default home; destination ${j} -> stay home`, () => {
      for (const d of [decodeInputs(link(`{"homeCityId":${j}}`))!, storedText(`{"homeCityId":${j}}`)]) {
        expect(d.homeCityId).toBe(DEFAULT_INPUTS.homeCityId)
        expect(d.destCityId).toBe(DEFAULT_INPUTS.destCityId)
      }
      for (const d of [decodeInputs(link(`{"destCityId":${j}}`))!, storedText(`{"destCityId":${j}}`)]) {
        expect(d.homeCityId).toBe(DEFAULT_INPUTS.homeCityId)
        expect(d.destCityId).toBeNull()
      }
      for (const d of [decodeInputs(link(`{"homeCityId":${j},"destCityId":"lisbon"}`))!, storedText(`{"homeCityId":${j},"destCityId":"lisbon"}`)]) {
        expect(d.homeCityId).toBe(DEFAULT_INPUTS.homeCityId)
        expect(d.destCityId).toBe('lisbon')
      }
    })
  }

  it('after sanitizing, home is always a known city and the destination is null or a known city', () => {
    const values: unknown[] = [...HOSTILE, null, undefined, 0, 42, true, {}, [], ['bangkok'], { id: 'bangkok' }, 'x'.repeat(500), 'lisbon', 'st-louis', 'bangkok']
    let n = 0
    for (const h of values)
      for (const d of values) {
        const raw: Record<string, unknown> = {}
        if (h !== undefined) raw.homeCityId = h
        if (d !== undefined) raw.destCityId = d
        const text = JSON.stringify(raw)
        for (const out of [sanitizeInputs(raw), storedText(text), decodeInputs(link(text))!]) {
          expect(isCity(out.homeCityId)).toBe(true)
          expect(out.destCityId === null || isCity(out.destCityId)).toBe(true)
          expect(out.destCityId).not.toBe(out.homeCityId)
          // The engine resolves both: a named destination is what it runs.
          const home = CITY_BY_ID[out.homeCityId]
          expect(home.id).toBe(out.homeCityId)
          n++
        }
      }
    expect(n).toBe(values.length ** 2 * 3)
  })

  it('a hostile plan simulates without throwing', () => {
    const p = storedText('{"homeCityId":"__proto__","destCityId":"constructor","paths":1000}')
    expect(() => simulate(market, CITIES, p)).not.toThrow()
  })
})
