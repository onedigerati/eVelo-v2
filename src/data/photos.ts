// City photos: ./photos/<cityId>/photos.json (5 entries) plus <n>.webp, filled by
// `npm run photos` (scripts/photos.mjs) from Wikimedia Commons. Adding a city's photos needs no
// edit here. The .webp files load as URLs, so Vite emits them as hashed files in dist/assets.

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

const BY_CITY = buildPhotoIndex(
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

/** Ids of the cities that have photos. */
export const PHOTO_CITY_IDS: string[] = Object.keys(BY_CITY).sort()

/** The city's photos in mosaic order (first = the large one); empty when it has none. */
export function photosFor(cityId: string): CityPhoto[] {
  return BY_CITY[cityId] ?? []
}
