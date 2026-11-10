import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { smallFileName } from '../../../scripts/photos-lib.mjs'
import {
  UPLOAD_BATCH,
  artifactFiles,
  mergeUploadResults,
  pendingUploads,
  photoKey as scriptKey,
  photoSources,
  planPreviewPhotos,
  publishedMap,
} from '../../../scripts/artifact-lib.mjs'
import { PHOTO_CITY_IDS, photoKey, photosFor } from '../photos'

const PHOTOS_DIR = fileURLToPath(new URL('../photos', import.meta.url))

describe('preview photo mode (scripts/artifact-lib.mjs)', () => {
  const sources = [
    { path: 'src/data/photos/tokyo/1.webp', cityId: 'tokyo', hash: 'aa' },
    { path: 'src/data/photos/tokyo/2.webp', cityId: 'tokyo', hash: 'bb' },
    { path: 'src/data/photos/austin/1.webp', cityId: 'austin', hash: 'cc' },
    { path: 'src/data/photos/austin/2.webp', cityId: 'austin', hash: 'zz' },
  ]
  const dist = [
    { name: '1-Aaaa1111.webp', hash: 'aa' },
    { name: '2-Bbbb2222.webp', hash: 'bb' },
    { name: '1-Cccc3333.webp', hash: 'cc' },
  ]
  const { photos, unmatched } = planPreviewPhotos(sources, dist)

  it('builds the same keys as the app does from a built URL', () => {
    expect(scriptKey('tokyo', '1-Aaaa1111.webp')).toBe(photoKey('tokyo', './assets/1-Aaaa1111.webp'))
  })

  it('matches each source photo to its built file by content, keyed city/built-name', () => {
    expect(photos).toEqual([
      { key: 'austin/1-Cccc3333.webp', path: 'src/data/photos/austin/1.webp' },
      { key: 'tokyo/1-Aaaa1111.webp', path: 'src/data/photos/tokyo/1.webp' },
      { key: 'tokyo/2-Bbbb2222.webp', path: 'src/data/photos/tokyo/2.webp' },
    ])
    expect(unmatched).toEqual(['src/data/photos/austin/2.webp'])
  })

  it('lists only photos missing from the cache, in batches of 25', () => {
    const cache = { 'tokyo/1-Aaaa1111.webp': 'https://a/1', 'tokyo/2-OLDHASH.webp': 'https://a/old' }
    expect(pendingUploads(photos, cache)).toEqual({
      count: 2,
      batches: [['src/data/photos/austin/1.webp', 'src/data/photos/tokyo/2.webp']],
    })
    expect(UPLOAD_BATCH).toBe(25)
    const many = Array.from({ length: 60 }, (_, i) => ({ key: `c/${i}.webp`, path: `p/${i}.webp` }))
    expect(pendingUploads(many, {}).batches.map((b) => b.length)).toEqual([25, 25, 10])
    // A changed photo (new hash) is pending again; the stale key is not published.
    expect(publishedMap(photos, cache)).toEqual({ 'tokyo/1-Aaaa1111.webp': 'https://a/1' })
  })

  it('merges upload results given by local path or key, and skips unknown or unsafe ones', () => {
    const { cache, added, skipped } = mergeUploadResults({ 'tokyo/1-Aaaa1111.webp': 'https://a/1' }, photos, [
      { path: './src/data/photos/tokyo/2.webp', url: 'https://a/2' },
      { key: 'austin/1-Cccc3333.webp', url: 'https://a/3' },
      { path: 'src/data/photos/nowhere/1.webp', url: 'https://a/4' },
      { path: 'src/data/photos/austin/1.webp', url: 'javascript:alert(1)' },
    ])
    expect(cache).toEqual({
      'austin/1-Cccc3333.webp': 'https://a/3',
      'tokyo/1-Aaaa1111.webp': 'https://a/1',
      'tokyo/2-Bbbb2222.webp': 'https://a/2',
    })
    expect(added).toEqual(['tokyo/2-Bbbb2222.webp', 'austin/1-Cccc3333.webp'])
    expect(skipped).toEqual(['src/data/photos/nowhere/1.webp', 'src/data/photos/austin/1.webp'])
    expect(mergeUploadResults({}, photos, { 'src/data/photos/tokyo/1.webp': 'https://a/x' }).cache).toEqual({ 'tokyo/1-Aaaa1111.webp': 'https://a/x' })
  })

  it('leaves photos out of the files map in asset mode, and adds photo-assets.json', () => {
    const assets = ['index-X.js', 'index-Y.css', '1-Aaaa1111.webp']
    expect(artifactFiles(assets, { assetPhotos: true })).toEqual({
      'assets/index-X.js': 'dist/assets/index-X.js',
      'assets/index-Y.css': 'dist/assets/index-Y.css',
      'photo-assets.json': 'dist/photo-assets.json',
    })
    expect(Object.keys(artifactFiles(assets, { assetPhotos: false }))).toEqual(['assets/index-X.js', 'assets/index-Y.css', 'assets/1-Aaaa1111.webp'])
  })

  it('maps the 640px copies as well as the originals (the real photo folder)', () => {
    const sources = photoSources(PHOTOS_DIR)
    const paths = new Set(sources.map((s) => s.path))
    const missing = PHOTO_CITY_IDS.flatMap((id) =>
      photosFor(id)
        .flatMap((p) => [p.file, smallFileName(p.file)])
        .map((f) => `${PHOTOS_DIR}/${id}/${f}`)
        .filter((path) => !paths.has(path)),
    )
    expect(missing).toEqual([])
    expect(sources.every((s) => /^[0-9a-f]{64}$/.test(s.hash) && s.path.startsWith(`${PHOTOS_DIR}/${s.cityId}/`))).toBe(true)
    // Built names keep the source name before the hash, so each copy gets its own key.
    const dist = sources.map((s, i) => ({ name: `${s.path.split('/').pop()!.replace('.webp', '')}-H${i}.webp`, hash: s.hash }))
    const plan = planPreviewPhotos(sources, dist)
    expect(plan.unmatched).toEqual([])
    const keys = plan.photos.map((p) => p.key)
    expect(new Set(keys).size).toBe(sources.length)
    expect(keys.filter((k) => /\/\d+-640-H\d+\.webp$/.test(k))).toHaveLength(PHOTO_CITY_IDS.length * 5)
  })
})
