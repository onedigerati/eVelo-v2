// Which photo file the profile mosaic loads, and loading it early on intent.
//
// Mosaic tiles and the phone cover slides offer the 640px copy and the 1280px original as a
// srcset; `sizes` mirrors atlas.css so the browser picks the copy it needs for the tile at the
// current viewport and DPR. Hovering, focusing or pressing a button that opens a profile starts
// loading that city's mosaic with the same srcset/sizes, so the tiles hit the image cache.
import { photosFor, type CityPhoto } from '../../data/photos'

/**
 * The sheet (.prof-sheet) is min(100vw, 1080px) wide with 1px borders; its body pads 32px a side
 * from 700px up and 20px below. The mosaic grid is 2fr 1fr 1fr with 6px gaps, so the lead tile is
 * (W - 12) / 2 and a small tile (W - 12) / 4 for mosaic width W. Under 560px the mosaic is hidden
 * and the cover slides are full width (100vw).
 */
const LEAD_SLOTS: [string, string][] = [
  ['(max-width: 559.98px)', '100vw'],
  ['(max-width: 699.98px)', '50vw - 27px'],
  ['(max-width: 1079.98px)', '50vw - 39px'],
]
const LEAD_MAX_PX = 501 // (1080 - 2 - 64 - 12) / 2
const SMALL_SLOTS: [string, string][] = [
  ['(max-width: 699.98px)', '25vw - 13.5px'],
  ['(max-width: 1079.98px)', '25vw - 19.5px'],
]
const SMALL_MAX_PX = 251 // (1080 - 2 - 64 - 12) / 4, rounded up

/**
 * Tiles crop with object-fit: cover into boxes about 1.35:1 (1.1–1.45 across breakpoints), so a
 * wider photo is drawn wider than its tile. Photos up to COVER_ASPECT wide use the tile width as
 * is (a 1.8:1 photo then draws at most ~15% wider than the copy picked); wider ones scale `sizes`
 * up by aspect / COVER_ASPECT so a panorama doesn't stretch the 640 copy.
 */
const COVER_ASPECT = 1.6

/** Width factor for a photo under object-fit: cover (1 for most photos). */
export function coverFactor(width: number, height: number): number {
  const f = width / height / COVER_ASPECT
  return f > 1 ? Math.round(f * 100) / 100 : 1
}

function sizesFor(slots: [string, string][], maxPx: number, f: number): string {
  const len = (expr: string) => (f === 1 ? (expr.includes(' ') ? `calc(${expr})` : expr) : `calc((${expr}) * ${f})`)
  return [...slots.map(([mq, expr]) => `${mq} ${len(expr)}`), `${Math.ceil(maxPx * f)}px`].join(', ')
}

/** `sizes` for the lead tile and the phone cover slides (they share it, so the first slide reuses the lead's file). */
export function leadSizes(p: Pick<CityPhoto, 'width' | 'height'>): string {
  return sizesFor(LEAD_SLOTS, LEAD_MAX_PX, coverFactor(p.width, p.height))
}

/** `sizes` for the four small mosaic tiles. */
export function smallSizes(p: Pick<CityPhoto, 'width' | 'height'>): string {
  return sizesFor(SMALL_SLOTS, SMALL_MAX_PX, coverFactor(p.width, p.height))
}

/**
 * "<small> 640w, <full> 1280w" with the files' real widths (a portrait's 640 copy is ~427w), or
 * undefined when there is no smaller copy (then `src` alone is used).
 */
export function photoSrcSet(p: Pick<CityPhoto, 'src' | 'srcSmall' | 'smallWidth' | 'width'>): string | undefined {
  if (!p.srcSmall || p.srcSmall === p.src || p.smallWidth >= p.width) return undefined
  return `${p.srcSmall} ${p.smallWidth}w, ${p.src} ${p.width}w`
}

/** What one mosaic image loads: `src` plus the srcset/sizes the tile uses. */
export interface ImageRequest {
  src: string
  srcset?: string
  sizes?: string
}

/**
 * The images a profile's mosaic shows first: the lead tile (which the phone cover's first slide
 * shares) and, when the mosaic is shown (`phone` false), the four small tiles.
 */
export function mosaicPreloads(photos: CityPhoto[], phone: boolean): ImageRequest[] {
  const req = (p: CityPhoto, sizes: string): ImageRequest => {
    const srcset = photoSrcSet(p)
    return srcset ? { src: p.src, srcset, sizes } : { src: p.src }
  }
  const out = photos.slice(0, 1).map((p) => req(p, leadSizes(p)))
  if (!phone) out.push(...photos.slice(1, 5).map((p) => req(p, smallSizes(p))))
  return out
}

/** The mosaic is hidden below this width (atlas.css, `.pgal__cover`). */
const PHONE_QUERY = '(max-width: 559.98px)'
const started = new Set<string>()
/** Kept so the requests aren't dropped with the Image objects before they finish. */
const pending = new Set<HTMLImageElement>()

/**
 * Starts loading a city's mosaic images, once per city: `new Image()` with the tiles' own
 * srcset/sizes, so the browser picks the same file the tile will and the tile hits the cache.
 */
export function preloadCityPhotos(cityId: string): void {
  if (started.has(cityId) || typeof window === 'undefined' || typeof Image === 'undefined') return
  const photos = photosFor(cityId)
  if (!photos.length) return
  started.add(cityId)
  const phone = typeof window.matchMedia === 'function' && window.matchMedia(PHONE_QUERY).matches
  for (const r of mosaicPreloads(photos, phone)) {
    const img = new Image()
    img.decoding = 'async'
    const done = () => pending.delete(img)
    img.onload = done
    img.onerror = done
    pending.add(img)
    // sizes before srcset, srcset before src: the pick is made from all three.
    if (r.sizes) img.sizes = r.sizes
    if (r.srcset) img.srcset = r.srcset
    img.src = r.src
  }
}

/** Props for a button that opens `cityId`'s profile: hover, focus or press starts its photos. */
export function preloadOnIntent(cityId: string | undefined) {
  if (!cityId) return {}
  const go = () => preloadCityPhotos(cityId)
  return { onPointerEnter: go, onFocus: go, onPointerDown: go }
}

/** Test hook: forget which cities were preloaded. */
export function resetPreloads(): void {
  started.clear()
  pending.clear()
}
