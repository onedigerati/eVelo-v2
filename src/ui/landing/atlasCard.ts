// The landing's map card (study G, "The Atlas is the chart"): one illustrative plan's odds city
// by city, Lisbon highlighted with a small fan chart. The numbers are illustrative, as drawn on
// the boards (AtlasHero / AtlasHeroDark) — not engine output. Everything here is pure and computed
// once at module load; the view only renders it. Colours are not decided here: a city carries its
// band (0..4) and the CSS maps that to the app's outcome ramp tokens (--ramp-0..4).

/* ---------- Map ---------- */

/** The map's viewBox (equirectangular, 4 units per degree, cropped to the cities). */
export const MAP_VIEWBOX = { x: 200, y: 50, width: 1160, height: 400 } as const

/** Longitude → x (4 units per degree, -180° at 0). */
export const projectX = (lon: number) => (lon + 180) * 4
/** Latitude → y (4 units per degree, 72°N at 0). */
export const projectY = (lat: number) => (72 - lat) * 4

/** Outcome band for a success percentage: 0 breaks … 4 holds (thresholds 80 / 65 / 45 / 35). */
export type Band = 0 | 1 | 2 | 3 | 4
export function bandFor(pct: number): Band {
  return pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 45 ? 2 : pct >= 35 ? 1 : 0
}

/** [name, latitude, longitude, illustrative % of futures that hold]. */
const RAW: readonly (readonly [string, number, number, number])[] = [
  ['Lisbon', 38.7, -9.1, 88], ['Porto', 41.1, -8.6, 90], ['Valencia', 39.5, -0.4, 85], ['Madrid', 40.4, -3.7, 80],
  ['Athens', 38.0, 23.7, 86], ['Budapest', 47.5, 19.0, 87], ['Prague', 50.1, 14.4, 82], ['Tbilisi', 41.7, 44.8, 92],
  ['Istanbul', 41.0, 29.0, 84], ['Zürich', 47.4, 8.5, 41], ['London', 51.5, -0.1, 52], ['Dubai', 25.2, 55.3, 60],
  ['Bangkok', 13.75, 100.5, 93], ['Chiang Mai', 18.8, 99.0, 95], ['Kuala Lumpur', 3.1, 101.7, 92], ['Bali', -8.65, 115.2, 91],
  ['Taipei', 25.0, 121.5, 80], ['Tokyo', 35.7, 139.7, 72], ['Da Nang', 16.0, 108.2, 95], ['Sydney', -33.9, 151.2, 55],
  ['Mexico City', 19.4, -99.1, 86], ['Playa del Carmen', 20.6, -87.1, 85], ['Medellín', 6.2, -75.6, 92], ['Cartagena', 10.4, -75.5, 89],
  ['Lima', -12.0, -77.0, 88], ['Santiago', -33.4, -70.6, 81], ['Panama City', 9.0, -79.5, 86], ['San José', 9.9, -84.1, 84],
  ['New York', 40.7, -74.0, 38], ['Austin', 30.3, -97.7, 63], ['San Francisco', 37.8, -122.4, 30], ['Miami', 25.8, -80.2, 55],
  ['Cape Town', -33.9, 18.4, 87],
]

export const HIGHLIGHT = 'Lisbon'
export const HOME = 'Austin'

export interface MapCity {
  name: string
  lat: number
  lon: number
  pct: number
  band: Band
  x: number
  y: number
  r: number
  highlighted: boolean
}

/** Label offsets from the dot: [dx, dy, text-anchor]. Only these six cities are labelled. */
const LABELS: Record<string, readonly [number, number, 'start' | 'end']> = {
  Lisbon: [-16, 30, 'end'],
  Bangkok: [-16, 8, 'end'],
  Medellín: [16, 8, 'start'],
  'New York': [16, -6, 'start'],
  Austin: [16, 2, 'start'],
  Tbilisi: [16, 8, 'start'],
}

export interface MapLabel {
  name: string
  pct: number
  band: Band
  x: number
  y: number
  anchor: 'start' | 'end'
}

const r1 = (v: number) => Math.round(v * 10) / 10

export const CITIES: readonly MapCity[] = RAW.map(([name, lat, lon, pct]) => ({
  name,
  lat,
  lon,
  pct,
  band: bandFor(pct),
  x: r1(projectX(lon)),
  y: r1(projectY(lat)),
  r: name === HIGHLIGHT ? 11 : 8,
  highlighted: name === HIGHLIGHT,
}))

type Offsets = Record<string, readonly [number, number, 'start' | 'end']>

function labelsFor(offsets: Offsets): MapLabel[] {
  return CITIES.filter((c) => offsets[c.name]).map((c) => {
    const [dx, dy, anchor] = offsets[c.name]
    return { name: c.name, pct: c.pct, band: c.band, x: r1(projectX(c.lon) + dx), y: r1(projectY(c.lat) + dy), anchor }
  })
}

/** The six labels as drawn (24-unit type), for cards wide enough to read them (> 520px viewport). */
export const MAP_LABELS: readonly MapLabel[] = labelsFor(LABELS)

/**
 * Narrow cards (<= 520px viewport): the map shrinks to ~0.25px per unit, so labels are set at
 * PHONE_LABEL_SIZE units (~11–12.5px rendered at 360–390px). At that size New York collides with
 * the Iberian cluster, so it is dropped; Lisbon moves just below its dot, running right (left would run into
 * Austin's label) and Austin sits just right of its dot, clear of Miami and New York.
 */
export const PHONE_LABEL_SIZE = 46
const PHONE_OFFSETS: Offsets = {
  Lisbon: [-11.6, 54.8, 'start'],
  Bangkok: [-16, 20, 'end'],
  Medellín: [16, 8, 'start'],
  Austin: [16, 9, 'start'],
  Tbilisi: [16, 8, 'start'],
}
export const PHONE_LABELS: readonly MapLabel[] = labelsFor(PHONE_OFFSETS)

/** Faint graticule: meridians every 30° (120°W–150°E), parallels every 15° (45°N–30°S). */
export const MERIDIANS: readonly number[] = Array.from({ length: 10 }, (_, i) => projectX(-120 + i * 30))
export const PARALLELS: readonly number[] = Array.from({ length: 6 }, (_, i) => projectY(45 - i * 15))

const byName = (n: string) => CITIES.find((c) => c.name === n)!
export const LISBON = byName(HIGHLIGHT)
export const AUSTIN = byName(HOME)

/* ---------- Fan chart (Lisbon) ---------- */

export const FAN_W = 560
export const FAN_H = 300
const T = 30 // years
const YMAX = 40 // $M at the top of the chart
const STEP = 0.5

const sx = (t: number) => (t / T) * FAN_W
const sy = (v: number) => FAN_H - (v / YMAX) * FAN_H

/** Illustrative median portfolio ($M): $2.5M growing 7.5% a year. */
export const fanMedian = (t: number) => 2.5 * Math.pow(1.075, t)
/** Quantile `z` standard deviations from the median (log-normal spread widening with √t). */
export const fanQuantile = (t: number, z: number) => fanMedian(t) * Math.exp(z * 0.16 * Math.sqrt(t))
/** Loan ($M): $50k drawn a year at 6%. */
export const fanLoan = (t: number) => 0.05 * ((Math.pow(1.06, t) - 1) / 0.06)
/** Margin-call line: the portfolio value at which the loan is 70% of it. */
export const fanMargin = (t: number) => fanLoan(t) / 0.7

const times = Array.from({ length: T / STEP + 1 }, (_, i) => i * STEP)
const pt = (t: number, v: number) => `${sx(t).toFixed(1)} ${sy(v).toFixed(1)}`

export function fanLine(f: (t: number) => number): string {
  return times.map((t, i) => (i === 0 ? 'M' : 'L') + pt(t, f(t))).join('')
}

export function fanBand(lo: number, hi: number): string {
  const top = times.map((t, i) => (i === 0 ? 'M' : 'L') + pt(t, fanQuantile(t, hi))).join('')
  const bottom = [...times].reverse().map((t) => 'L' + pt(t, fanQuantile(t, lo))).join('')
  return top + bottom + 'Z'
}

export const FAN = {
  /** p10–p90 */
  band1: fanBand(-1.28, 1.28),
  /** p25–p75 */
  band2: fanBand(-0.67, 0.67),
  median: fanLine(fanMedian),
  loan: fanLine(fanLoan),
  margin: fanLine(fanMargin),
} as const
