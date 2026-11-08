// Builds dist/artifact.html: the body-only page the claude.ai Artifact preview wraps in its own skeleton,
// and dist/artifact-files.json, the files map to publish with it.
//
// Plain mode (every built file, photos included):
//   npm run build && node scripts/artifact-page.mjs
//
// Asset-photo mode, for the preview once photos outgrow a published version's 511-file limit.
// The page is built with `--mode artifact`, so at runtime it fetches a published photo-assets.json
// (photo key -> asset-store URL) and shows each photo from the artifact's asset store. The .webp
// files are left out of the files map; each photo is uploaded once and only new or changed photos
// (a new content hash, so a new key) are uploaded again. The live GitHub Pages build is unchanged:
// it never fetches the map and serves the bundled WebP files.
//
//   1. npm run build:preview
//        = tsc -b && vite build --mode artifact && node scripts/artifact-page.mjs --asset-photos
//      Writes dist/artifact.html, dist/artifact-files.json (app files + photo-assets.json, no .webp),
//      dist/preview-photos.json (every photo: { key, path }), dist/photo-assets.json (the cache
//      entries this build uses) and dist/preview-photos-pending.json (photos with no uploaded copy
//      in the local cache .preview/photo-assets.json, as batches of up to 25 local paths).
//   2. For each batch in dist/preview-photos-pending.json, upload with the Artifact tool:
//      { action: 'publish', url: <preview url>, asset: true, file_paths: <batch> }. The page must
//      declare the `assets` capability (see the artifact-capabilities skill).
//   3. Save the returned urls as JSON, either { "<local path>": "<url>" } or
//      [{ "path": "<local path>", "url": "<url>" }], and record them:
//        node scripts/artifact-page.mjs --record <results.json>
//      This merges them into .preview/photo-assets.json (keyed by photo key) and rewrites the dist
//      files above, so dist/photo-assets.json now has them. No rebuild needed.
//   4. Publish dist/artifact.html with every entry of dist/artifact-files.json as `files`
//      (photo-assets.json included). A city whose photos aren't all uploaded shows no gallery.
//
// `--pending` alone (after a build) just reprints what still needs uploading.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { artifactFiles, mergeUploadResults, pendingUploads, planPreviewPhotos, publishedMap } from './artifact-lib.mjs'

const CACHE = '.preview/photo-assets.json'
const PHOTOS_DIR = 'src/data/photos'
const args = process.argv.slice(2)
const record = args.includes('--record') ? args[args.indexOf('--record') + 1] : null
const assetPhotos = args.includes('--asset-photos') || args.includes('--pending') || !!record

const html = readFileSync('dist/index.html', 'utf8')
const js = html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1]
// Every stylesheet and preloaded chunk index.html links (Vite may split shared CSS/JS).
const css = [...html.matchAll(/rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/g)].map((m) => m[1])
const preload = [...html.matchAll(/rel="modulepreload"[^>]*href="\.\/(assets\/[^"]+\.js)"/g)].map((m) => m[1])
const page = `<title>eVelo</title>
<meta name="description" content="Stress-test a Buy-Borrow-Die retirement across thousands of market futures, at home or abroad.">
<script>try{var t=JSON.parse(localStorage.getItem('evelo:v2')||'{}').theme;if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
${css.map((c) => `<link rel="stylesheet" href="${c}">`).join('\n')}
${preload.map((j) => `<link rel="modulepreload" href="${j}">`).join('\n')}
<div id="root"></div>
<script type="module" src="${js}"></script>
`
writeFileSync('dist/artifact.html', page)
const distAssets = readdirSync('dist/assets')

if (assetPhotos) {
  // Only a `--mode artifact` build fetches photo-assets.json; the live build has no such string.
  const isArtifactBuild = distAssets.some((f) => f.endsWith('.js') && readFileSync(`dist/assets/${f}`, 'utf8').includes('photo-assets.json'))
  if (!isArtifactBuild) {
    console.error('dist/ is not an artifact-mode build: run `npm run build:preview` (vite build --mode artifact) first.')
    process.exit(1)
  }
  const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
  const sources = readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      readdirSync(`${PHOTOS_DIR}/${d.name}`)
        .filter((f) => f.endsWith('.webp'))
        .map((f) => ({ path: `${PHOTOS_DIR}/${d.name}/${f}`, cityId: d.name, hash: sha(`${PHOTOS_DIR}/${d.name}/${f}`) })),
    )
  const dist = distAssets.filter((f) => f.endsWith('.webp')).map((name) => ({ name, hash: sha(`dist/assets/${name}`) }))
  const { photos, unmatched } = planPreviewPhotos(sources, dist)
  if (unmatched.length) console.warn(`No built copy of ${unmatched.length} photo(s), left out: ${unmatched.join(', ')}`)

  let cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
  if (record) {
    const { cache: next, added, skipped } = mergeUploadResults(cache, photos, JSON.parse(readFileSync(record, 'utf8')))
    mkdirSync('.preview', { recursive: true })
    writeFileSync(CACHE, `${JSON.stringify(next, null, 1)}\n`)
    cache = next
    console.log(`Recorded ${added.length} uploaded photo(s) in ${CACHE}`)
    if (skipped.length) console.warn(`Could not place ${skipped.length} result(s) (unknown path/key or bad url): ${skipped.join(', ')}`)
  }
  const published = publishedMap(photos, cache)
  const pending = pendingUploads(photos, cache)
  writeFileSync('dist/preview-photos.json', JSON.stringify(photos, null, 1))
  writeFileSync('dist/photo-assets.json', JSON.stringify(published, null, 1))
  writeFileSync('dist/preview-photos-pending.json', JSON.stringify(pending, null, 1))
  const files = artifactFiles(distAssets, { assetPhotos: true })
  writeFileSync('dist/artifact-files.json', JSON.stringify(files, null, 1))
  console.log(`${Object.keys(files).length} files (photos served from the asset store)`)
  console.log(`${photos.length} photos: ${Object.keys(published).length} uploaded, ${pending.count} to upload in ${pending.batches.length} batch(es) (dist/preview-photos-pending.json)`)
} else {
  const files = artifactFiles(distAssets, { assetPhotos: false })
  writeFileSync('dist/artifact-files.json', JSON.stringify(files, null, 1))
  console.log(Object.keys(files).length, 'files')
}
