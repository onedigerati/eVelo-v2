// City photos: ./photos/<cityId>/photos.json (5 entries) plus <n>.webp, filled by
// `npm run photos` (scripts/photos.mjs) from Wikimedia Commons. Adding a city's photos needs no
// edit here. The .webp files load as URLs, so Vite emits them as hashed files in dist/assets.
// The claude.ai preview build (--mode artifact) swaps those URLs for asset-store copies listed in
// a published photo-assets.json; see loadPhotoAssets and scripts/artifact-page.mjs.

/** One entry of a city's photos.json. */
export interface CityPhotoEntry {
  /** Wikimedia Commons file title, e.g. "File:Praia da Marinha 2017.jpg". */
  commons: string
  /** File name next to photos.json, "1.webp" … "5.webp". */
  file: string
  /** One line, no final period: what and where. */
  caption: string
  /** Plain description of what is visible. */
  alt: string
  /** Optional CSS object-position for cropping, e.g. "50% 60%". */
  focus?: string
  /** Plain-text author credit. */
  author: string
  /** Short licence name, e.g. "CC BY-SA 4.0", "CC0", "Public domain". */
  license: string
  licenseUrl: string
  /** https Commons file page. */
  source: string
  width: number
  height: number
}

export interface CityPhoto extends CityPhotoEntry {
  /** URL of the WebP image (hashed asset in a build). */
  src: string
}

/**
 * Builds the per-city photo index from Vite glob results: `lists` maps
 * "./photos/<cityId>/photos.json" to its entries, `urls` maps "./photos/<cityId>/<n>.webp" to the
 * image URL. A city with a listed file missing from `urls` gets no gallery (and one warning)
 * rather than taking the whole Atlas down; the other cities still load.
 */
export function buildPhotoIndex(
  lists: Record<string, CityPhotoEntry[]>,
  urls: Record<string, string>,
  warn: (message: string) => void = (m) => console.warn(m),
): Record<string, CityPhoto[]> {
  const out: Record<string, CityPhoto[]> = {}
  for (const [path, list] of Object.entries(lists)) {
    const cityId = path.split('/')[2]
    const missing = list.filter((p) => !urls[`./photos/${cityId}/${p.file}`]).map((p) => p.file)
    if (missing.length) {
      warn(`photos: ${cityId} lists ${missing.join(', ')} but the file is missing; showing no photos for ${cityId}`)
      continue
    }
    out[cityId] = list.map((p) => ({
      ...p,
      src: urls[`./photos/${cityId}/${p.file}`],
    }))
  }
  return out
}

/**
 * The preview's asset-store key for a photo: "<cityId>/<built file name>", e.g.
 * "tokyo/1-B2xQ9aZk.webp". Vite names built assets by content hash, so a changed photo gets a
 * new key and is uploaded again. scripts/artifact-lib.mjs builds the same keys from dist/.
 */
export function photoKey(cityId: string, src: string): string {
  const file = src.split(/[?#]/)[0].split('/').pop() ?? ''
  return `${cityId}/${file}`
}

/** A usable asset URL: https, or a relative path (no other scheme, no protocol-relative). */
const ASSET_URL = /^(?:https:\/\/[^\s"'<>]+|(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^\s"'<>]+)$/i

/** Validates a parsed photo-assets.json: keeps string → usable-URL pairs, drops the rest. */
export function parsePhotoAssets(json: unknown): Record<string, string> {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) if (typeof v === 'string' && ASSET_URL.test(v)) out[k] = v
  return out
}

/**
 * Points each city's photos at their uploaded copies (preview build). A city gets the uploaded
 * URLs only when every one of its photos has one; a city with some missing gets no gallery (one
 * summary warning for all such cities), since the preview doesn't publish the bundled files. A null map (none published, or
 * it failed to load) keeps the bundled URLs.
 */
export function remapPhotoIndex(
  index: Record<string, CityPhoto[]>,
  assets: Record<string, string> | null,
  warn: (message: string) => void = (m) => console.warn(m),
): Record<string, CityPhoto[]> {
  if (!assets) return index
  const out: Record<string, CityPhoto[]> = {}
  const skipped: string[] = []
  for (const [cityId, list] of Object.entries(index)) {
    const missing = list.filter((p) => !Object.hasOwn(assets, photoKey(cityId, p.src)))
    if (missing.length) {
      skipped.push(`${cityId} (${missing.length} of ${list.length})`)
      continue
    }
    out[cityId] = list.map((p) => ({ ...p, src: assets[photoKey(cityId, p.src)] }))
  }
  // One summary line, not one per city (a fresh preview may have none uploaded yet).
  if (skipped.length) {
    const shown = skipped.slice(0, 12).join(', ') + (skipped.length > 12 ? `, and ${skipped.length - 12} more` : '')
    warn(`photos: ${skipped.length} ${skipped.length === 1 ? 'city has' : 'cities have'} photos with no uploaded copy, so no gallery: ${shown}`)
  }
  return out
}

const BUNDLED = buildPhotoIndex(
  import.meta.glob<CityPhotoEntry[]>('./photos/*/photos.json', {
    eager: true,
    import: 'default',
  }),
  import.meta.glob<string>('./photos/*/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

let byCity = BUNDLED
const listeners = new Set<() => void>()

/** Ids of the cities that have photos. */
export const PHOTO_CITY_IDS: string[] = Object.keys(BUNDLED).sort()

const NONE: CityPhoto[] = []

/**
 * The city's photos in mosaic order (first = the large one); empty when it has none. Returns the
 * same array each call until the URLs change (a useSyncExternalStore snapshot must be stable).
 */
export function photosFor(cityId: string): CityPhoto[] {
  return byCity[cityId] ?? NONE
}

/** Re-render hook for photo URLs that change once (the preview's asset map); returns unsubscribe. */
export function subscribePhotos(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Preview build only (`vite build --mode artifact`, see scripts/artifact-page.mjs): fetch the
 * published photo-assets.json next to the page and swap photo URLs for their asset-store copies.
 * If the file is missing or unreadable, the bundled URLs stay. The live build never fetches:
 * the mode check is a build-time constant, so this whole block is dropped from it.
 */
export async function loadPhotoAssets(
  fetchJson: () => Promise<unknown> = async () => {
    const res = await fetch(new URL('photo-assets.json', document.baseURI), { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
): Promise<void> {
  let next = BUNDLED
  try {
    next = remapPhotoIndex(BUNDLED, parsePhotoAssets(await fetchJson()))
  } catch (e) {
    console.info('photos: no photo-assets.json, using bundled photo URLs', e)
  }
  if (next === byCity) return
  byCity = next
  for (const l of listeners) l()
}

if (import.meta.env.MODE === 'artifact' && typeof window !== 'undefined') void loadPhotoAssets()
