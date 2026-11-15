import { describe, expect, it } from 'vitest'
import { AIRPORTS, CITY_AIRPORT, NODES } from '../../../data/airports'
import { CITIES, CITY_BY_ID } from '../../../data/cities'
import { greatCircleKm, routeBetween, type RoutePlace } from '../gettingThere'

const place = (id: string): RoutePlace => {
  const c = CITY_BY_ID[id]
  return { name: c.name, lat: c.lat, lon: c.lon, airport: CITY_AIRPORT[id] }
}

describe('airport data', () => {
  it('maps every city to a gateway airport in the graph, near the city', () => {
    for (const c of CITIES) {
      const code = CITY_AIRPORT[c.id]
      expect(code, c.id).toBeDefined()
      const a = AIRPORTS.find((x) => x.code === code)
      expect(a, `${c.id} → ${code}`).toBeDefined()
      expect(greatCircleKm(c, a!), `${c.id} → ${code}`).toBeLessThan(250)
    }
    expect(Object.keys(CITY_AIRPORT).sort()).toEqual(CITIES.map((c) => c.id).sort())
  })

  it('has exactly one well-formed, sourced entry per node', () => {
    expect(AIRPORTS.map((a) => a.code).sort()).toEqual(Object.keys(NODES).sort())
    for (const a of AIRPORTS) {
      expect(a.city, a.code).toBe(NODES[a.code].city)
      expect(Math.abs(a.lat) <= 90 && Math.abs(a.lon) <= 180, a.code).toBe(true)
      expect(a.source?.url, a.code).toMatch(/^https:\/\//)
      const all = [...a.nonstops, ...(a.seasonal ?? [])]
      expect(new Set(all).size, `${a.code} lists a code twice`).toBe(all.length)
      for (const b of all) {
        expect(NODES[b], `${a.code} → ${b} is not a node`).toBeDefined()
        expect(b, `${a.code} lists itself`).not.toBe(a.code)
      }
    }
  })

  it('gives every home–destination pair a route', () => {
    const missing: string[] = []
    for (const h of CITIES) {
      for (const d of CITIES) {
        if (h.id === d.id) continue
        if (routeBetween(place(h.id), place(d.id)).kind === 'unknown') missing.push(`${h.id} → ${d.id}`)
      }
    }
    expect(missing.slice(0, 20)).toEqual([])
  })

  it('gets known pairs right', () => {
    expect(routeBetween(place('new-york'), place('london'))).toMatchObject({ kind: 'nonstop' })
    expect(routeBetween(place('london'), place('lisbon'))).toMatchObject({ kind: 'nonstop' })
    expect(routeBetween(place('san-diego'), place('bangkok'))).toMatchObject({ kind: 'one-stop' })
    expect(routeBetween(place('torrevieja'), place('alicante'))).toMatchObject({ kind: 'ground' })
  })
})
