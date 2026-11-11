// Dot-matrix land: the Natural Earth land shape sampled onto a nested grid in projected "world"
// space (1000 units wide). Computed once per session (rasterize land → sample alpha) and cached.
//
// Grid nesting: a point on the finest grid (spacing S0) belongs to level L when both of its grid
// indices are multiples of 2^L, so every coarse level is a subset of the finer ones. The map fades
// finer levels in as you zoom, so density stays roughly constant on screen with no popping.

import { geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { feature } from 'topojson-client'
import type { FeatureCollection } from 'geojson'

export const WORLD_W = 1000
export const S0 = 1.25
export const LEVELS = 6 // spacings 1.25, 2.5, 5, 10, 20, 40

export const projection: GeoProjection = geoNaturalEarth1().fitWidth(WORLD_W, { type: 'Sphere' })
const sphereBounds = geoPath(projection).bounds({ type: 'Sphere' })
export const WORLD_H = sphereBounds[1][1] - sphereBounds[0][1]

export interface LandDots {
  n: number
  x: Float32Array
  y: Float32Array
  /** Coarsest level the point belongs to (0 = finest only … LEVELS-1 = every level). */
  lvl: Uint8Array
  land: FeatureCollection
}

let cache: Promise<LandDots> | null = null

export function loadLandDots(): Promise<LandDots> {
  cache ??= import('world-atlas/land-110m.json')
    .then((mod) => {
      const topo = (mod.default ?? mod) as unknown as Topology<{ land: GeometryCollection }>
      const land = feature(topo, topo.objects.land) as unknown as FeatureCollection
      return sample(land)
    })
    .catch((e: unknown) => {
      // Don't keep a failure (network blip, chunk 404): the next map mount tries again.
      cache = null
      throw e
    })
  return cache
}

function sample(land: FeatureCollection): LandDots {
  const RES = 2 // raster px per world unit
  const RW = Math.ceil(WORLD_W * RES)
  const RH = Math.ceil(WORLD_H * RES)
  const cv = document.createElement('canvas')
  cv.width = RW
  cv.height = RH
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  ctx.scale(RES, RES)
  ctx.beginPath()
  geoPath(projection, ctx)(land)
  ctx.fillStyle = '#000'
  ctx.fill()
  const alpha = ctx.getImageData(0, 0, RW, RH).data

  const cols = Math.floor(WORLD_W / S0)
  const rows = Math.floor(WORLD_H / S0)
  const xs: number[] = []
  const ys: number[] = []
  const lv: number[] = []
  const ox = (WORLD_W - (cols - 1) * S0) / 2
  const oy = (WORLD_H - (rows - 1) * S0) / 2
  const yCut = (projection([0, -60]) as [number, number])[1] // drop Antarctica
  for (let j = 0; j < rows; j++) {
    const y = oy + j * S0
    if (y > yCut) break
    const py = Math.min(RH - 1, Math.round(y * RES))
    for (let i = 0; i < cols; i++) {
      const x = ox + i * S0
      const px = Math.min(RW - 1, Math.round(x * RES))
      if (alpha[(py * RW + px) * 4 + 3] < 128) continue
      let l = 0
      while (l < LEVELS - 1 && i % (1 << (l + 1)) === 0 && j % (1 << (l + 1)) === 0) l++
      xs.push(x)
      ys.push(y)
      lv.push(l)
    }
  }
  return { n: xs.length, x: Float32Array.from(xs), y: Float32Array.from(ys), lvl: Uint8Array.from(lv), land }
}

/** Project lon/lat to world space. */
export function toWorld(lon: number, lat: number): [number, number] {
  return (projection([lon, lat]) as [number, number]) ?? [0, 0]
}
