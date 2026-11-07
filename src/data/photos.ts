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

const LISTS = import.meta.glob<CityPhotoEntry[]>('./photos/*/photos.json', {
  eager: true,
  import: 'default',
})
const URLS = import.meta.glob<string>('./photos/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const BY_CITY: Record<string, CityPhoto[]> = {}
for (const [path, list] of Object.entries(LISTS)) {
  const cityId = path.split('/')[2]
  BY_CITY[cityId] = list.map((p) => {
    const src = URLS[`./photos/${cityId}/${p.file}`]
    if (!src) throw new Error(`photos: ${cityId}/${p.file} is listed but missing`)
    return { ...p, src }
  })
}

/** Ids of the cities that have photos. */
export const PHOTO_CITY_IDS: string[] = Object.keys(BY_CITY).sort()

/** The city's photos in mosaic order (first = the large one); empty when it has none. */
export function photosFor(cityId: string): CityPhoto[] {
  return BY_CITY[cityId] ?? []
}
