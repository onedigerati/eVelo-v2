// Helpers (pure, apart from photoSources reading the photo folder) for scripts/artifact-page.mjs's preview photo mode (tested in
// src/data/__tests__/artifactPhotos.test.ts). Keys match photoKey() in src/data/photos.ts:
// "<cityId>/<built file name>", where Vite's built name carries the photo's content hash.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'

/** Max files per Artifact asset upload call. */
export const UPLOAD_BATCH = 25

/** Photo key for a city and a built asset file name ("1-B2xQ9aZk.webp"). */
export const photoKey = (cityId, distName) => `${cityId}/${distName}`

/**
 * Every photo file to map in the preview: each city folder's .webp files, the 1280px originals
 * and their 640px copies (<n>-640.webp) alike, as [{ path, cityId, hash }] (sha256 of the bytes).
 */
export function photoSources(dir) {
  const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      readdirSync(`${dir}/${d.name}`)
        .filter((f) => f.endsWith('.webp'))
        .sort()
        .map((f) => ({ path: `${dir}/${d.name}/${f}`, cityId: d.name, hash: sha(`${dir}/${d.name}/${f}`) })),
    )
}

/**
 * Matches each source photo to the built file with the same bytes.
 * sources: [{ path, cityId, hash }], dist: [{ name, hash }] -> { photos: [{ key, path }], unmatched: [path] }.
 */
export function planPreviewPhotos(sources, dist) {
  const byHash = new Map(dist.map((d) => [d.hash, d.name]))
  const photos = []
  const unmatched = []
  for (const s of sources) {
    const name = byHash.get(s.hash)
    if (name) photos.push({ key: photoKey(s.cityId, name), path: s.path })
    else unmatched.push(s.path)
  }
  photos.sort((a, b) => a.key.localeCompare(b.key))
  return { photos, unmatched }
}

/** Photos with no uploaded copy in the cache yet, as upload batches of local paths. */
export function pendingUploads(photos, cache, size = UPLOAD_BATCH) {
  const todo = photos.filter((p) => !Object.hasOwn(cache, p.key)).map((p) => p.path)
  const batches = []
  for (let i = 0; i < todo.length; i += size) batches.push(todo.slice(i, i + size))
  return { count: todo.length, batches }
}

/** The cache entries this build uses: the published photo-assets.json. */
export function publishedMap(photos, cache) {
  const out = {}
  for (const p of photos) if (Object.hasOwn(cache, p.key)) out[p.key] = cache[p.key]
  return out
}

// Same rule as parsePhotoAssets in src/data/photos.ts: https, or relative with no scheme.
const URL_OK = /^(?:https:\/\/[^\s"'<>]+|(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^\s"'<>]+)$/i

/**
 * Merges upload results into the cache. `results` is either { "<local path or key>": url } or an
 * array of { path | file | key, url }. Paths are resolved to keys through `photos`. Returns the new
 * cache and the entries it could not place.
 */
export function mergeUploadResults(cache, photos, results) {
  const keyByPath = new Map(photos.map((p) => [normPath(p.path), p.key]))
  const keys = new Set(photos.map((p) => p.key))
  const pairs = Array.isArray(results)
    ? results.map((r) => [r?.key ?? r?.path ?? r?.file, r?.url])
    : Object.entries(results ?? {})
  const next = { ...cache }
  const added = []
  const skipped = []
  for (const [ref, url] of pairs) {
    const key = typeof ref === 'string' ? (keys.has(ref) ? ref : keyByPath.get(normPath(ref))) : undefined
    if (!key || typeof url !== 'string' || !URL_OK.test(url)) {
      skipped.push(String(ref))
      continue
    }
    next[key] = url
    added.push(key)
  }
  return { cache: sortKeys(next), added, skipped }
}

const normPath = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '')
const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))

/**
 * The published files map for the preview: every built asset except photos (served from the
 * asset store), plus photo-assets.json.
 */
export function artifactFiles(distAssets, { assetPhotos }) {
  const files = {}
  for (const f of distAssets) if (!(assetPhotos && f.endsWith('.webp'))) files[`assets/${f}`] = `dist/assets/${f}`
  if (assetPhotos) files['photo-assets.json'] = 'dist/photo-assets.json'
  return files
}
