// Fetches each city's photos from Wikimedia Commons into src/data/photos/<cityId>/.
// Usage: npm run photos [cityId ...]   (no ids = every city that has a photos.json)
//        npm run photos -- --recredit [cityId ...]   (re-clean stored authors offline)
//        npm run photos -- --small [cityId ...]   (write missing <n>-640.webp copies offline)
//        npm run photos -- --small --force [cityId ...]   (rewrite every small copy)
//
// Per city, photos.json lists 5 entries with hand-written `commons` (file title), `caption`, `alt`
// and optional `focus`. For each entry the script reads author and licence from the Commons API,
// refuses anything not CC0 / public domain / CC BY / CC BY-SA (writing nothing for that city),
// downloads a 1600px rendition, resizes it to 1280px wide (a portrait to 1280px tall; never
// upscaling), encodes WebP under 200 kB (stepping quality, then size, down) as <n>.webp, and
// writes the filled-in fields back. Each photo also gets a small copy, <n>-640.webp (640px on the
// long side, ~44 kB, under 70 kB unless quality 55 can't get there), for the profile mosaic; --small makes missing ones from the stored
// 1280px WebP with no network. Entries already filled for the same title with their .webp on disk
// are skipped without any network call (their small copy is still written if missing).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'
import {
  MAX_BYTES,
  SMALL_BOX,
  SMALL_MAX_BYTES,
  SMALL_QUALITIES,
  TARGET_WIDTH,
  authorFrom,
  checkImageUrl,
  cleanAuthor,
  checkLicense,
  checkOriginalSize,
  commonsPageUrl,
  isFilled,
  licenseUrlFor,
  orderKeys,
  smallFileName,
  validateEntry,
  validateHandFields,
} from './photos-lib.mjs'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'photos')
const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'eVelo-photos/1.0 (https://github.com/onedigerati/eVelo-v2)'
const DELAY_MS = 400
const TIMEOUT_MS = 30_000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** GET with the project User-Agent, sequential use, one retry on 429/5xx. */
export async function httpGet(url) {
  for (let attempt = 0; ; attempt++) {
    await sleep(DELAY_MS)
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (res.ok) return res
    if (attempt === 0 && (res.status === 429 || res.status >= 500)) {
      const wait = Math.min(30, Number(res.headers.get('retry-after')) || 5)
      console.log(`  ${res.status} from ${new URL(url).host}, retrying in ${wait}s`)
      await sleep(wait * 1000)
      continue
    }
    throw new Error(`${res.status} ${res.statusText} for ${url}`)
  }
}

async function commonsInfo(title, get) {
  const u = new URL(API)
  const params = {
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '1600',
    format: 'json',
    formatversion: '2',
  }
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  const j = await (await get(u)).json()
  const page = j.query?.pages?.[0]
  const ii = page?.imageinfo?.[0]
  if (!page || page.missing || !ii) throw new Error(`${title}: not found on Commons`)
  const m = ii.extmetadata ?? {}
  const license = checkLicense(m.LicenseShortName?.value ?? m.License?.value, title)
  const author = authorFrom(m, title)
  const licenseUrl = licenseUrlFor(license, m.LicenseUrl?.value)
  if (!licenseUrl) throw new Error(`${title}: no licence URL for ${license}`)
  checkOriginalSize(ii.width, ii.height, title)
  const thumb = checkImageUrl(ii.thumburl ?? ii.url, title)
  return { author, license, licenseUrl, thumb }
}

/**
 * Resize to fit TARGET_WIDTH x TARGET_WIDTH (landscape: 1280 wide; a portrait: 1280 tall; never
 * upscaled) and encode WebP under MAX_BYTES, stepping quality down, then width, until it fits.
 */
async function encode(buf, title) {
  try {
    await sharp(buf).metadata()
  } catch (err) {
    throw new Error(`${title}: downloaded file is not a readable image (${err.message})`)
  }
  for (const box of [TARGET_WIDTH, 1152, 1024, 896]) {
    for (let q = 80; q >= 55; q -= 5) {
      const { data, info } = await sharp(buf)
        .rotate()
        .resize({ width: box, height: box, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: q, effort: 6 })
        .toBuffer({ resolveWithObject: true })
      if (data.length <= MAX_BYTES) return { data, width: info.width, height: info.height, q }
    }
  }
  throw new Error(`${title}: cannot encode under 200 kB even at 896 px and quality 55`)
}

/**
 * The small copy for the profile mosaic: fit SMALL_BOX x SMALL_BOX (a portrait 640 tall; never
 * upscaled), WebP stepping quality down until it is under SMALL_MAX_BYTES (else the smallest try).
 */
export async function encodeSmall(buf) {
  let best
  for (const q of SMALL_QUALITIES) {
    const { data, info } = await sharp(buf)
      .resize({ width: SMALL_BOX, height: SMALL_BOX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, effort: 6 })
      .toBuffer({ resolveWithObject: true })
    best = { data, width: info.width, height: info.height, q }
    if (data.length <= SMALL_MAX_BYTES) break
  }
  return best
}

/**
 * Writes <n>-640.webp next to each listed <n>.webp that lacks one (all of them with `force`),
 * offline, from the stored 1280px file. Returns the number written.
 */
export async function makeSmallCopies(cityId, { root = ROOT, force = false, log = console.log } = {}) {
  const dir = join(root, cityId)
  const entries = JSON.parse(readFileSync(join(dir, 'photos.json'), 'utf8'))
  let written = 0
  for (const e of entries) {
    if (typeof e.file !== 'string' || !existsSync(join(dir, e.file))) continue
    const small = join(dir, smallFileName(e.file))
    if (!force && existsSync(small)) continue
    const img = await encodeSmall(readFileSync(join(dir, e.file)))
    writeFileSync(small, img.data)
    written++
    log(`${cityId} ${smallFileName(e.file)}  ${(img.data.length / 1000).toFixed(0)} kB  ${img.width}x${img.height}  q${img.q}`)
  }
  return written
}

/**
 * Fills one city's photos. Validates every hand-written field and every licence, then downloads
 * and encodes, and only then writes the .webp files and photos.json, so a refusal writes nothing.
 * `get` and `root` are injectable for tests.
 */
export async function doCity(cityId, { root = ROOT, get = httpGet, log = console.log } = {}) {
  const dir = join(root, cityId)
  const jsonPath = join(dir, 'photos.json')
  if (!existsSync(jsonPath)) throw new Error(`${cityId}: no ${jsonPath}`)
  const entries = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const handErrs = validateHandFields(entries)
  if (handErrs.length) throw new Error(`${cityId}:\n  ${handErrs.join('\n  ')}`)

  const todo = entries
    .map((e, i) => ({ e, n: i + 1 }))
    .filter(({ e, n }) => !(isFilled(e, n) && existsSync(join(dir, `${n}.webp`))))
  if (!todo.length) {
    await makeSmallCopies(cityId, { root, log })
    log(`${cityId}: all ${entries.length} photos up to date, nothing downloaded`)
    return { downloaded: 0, skipped: entries.length }
  }

  // Validate every licence before downloading or writing anything for this city.
  const infos = []
  for (const t of todo) infos.push({ ...t, info: await commonsInfo(t.e.commons, get) })

  const images = []
  for (const { e, n, info } of infos) {
    const buf = Buffer.from(await (await get(info.thumb)).arrayBuffer())
    const img = await encode(buf, e.commons)
    const small = await encodeSmall(img.data)
    images.push({ n, info, img, small })
    log(`${cityId} ${n}.webp  ${(img.data.length / 1000).toFixed(0)} kB  ${img.width}x${img.height}  q${img.q}  ${info.license}  ${e.commons}`)
  }

  const filled = entries.map((e) => ({ ...e }))
  for (const { n, info, img } of images) {
    Object.assign(filled[n - 1], {
      file: `${n}.webp`,
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      source: commonsPageUrl(filled[n - 1].commons),
      width: img.width,
      height: img.height,
    })
  }
  const out = filled.map(orderKeys)
  const errs = out.flatMap((e, i) => validateEntry(e, i + 1))
  if (errs.length) throw new Error(`${cityId}:\n  ${errs.join('\n  ')}`)

  for (const { n, img, small } of images) {
    writeFileSync(join(dir, `${n}.webp`), img.data)
    writeFileSync(join(dir, smallFileName(`${n}.webp`)), small.data)
  }
  writeFileSync(jsonPath, `${JSON.stringify(out, null, 2)}\n`)
  await makeSmallCopies(cityId, { root, log })
  log(`${cityId}: downloaded ${images.length}, skipped ${entries.length - images.length}`)
  return { downloaded: images.length, skipped: entries.length - images.length }
}

/**
 * Re-cleans stored authors with the current cleanAuthor, offline: no network, no .webp touched.
 * An author that would become empty is kept and reported.
 */
export function recredit(cityId, { root = ROOT, log = console.log } = {}) {
  const jsonPath = join(root, cityId, 'photos.json')
  const entries = JSON.parse(readFileSync(jsonPath, 'utf8'))
  let changed = 0
  entries.forEach((e, i) => {
    if (typeof e.author !== 'string') return
    const next = cleanAuthor(e.author)
    if (!next) log(`${cityId} #${i + 1}: KEPT "${e.author}" (cleanup would leave it empty)`)
    else if (next !== e.author) {
      log(`${cityId} #${i + 1}: "${e.author}" -> "${next}"`)
      e.author = next
      changed++
    }
  })
  if (changed) writeFileSync(jsonPath, `${JSON.stringify(entries.map(orderKeys), null, 2)}\n`)
  return changed
}

async function main() {
  const args = process.argv.slice(2)
  const recreditMode = args.includes('--recredit')
  const smallMode = args.includes('--small')
  const force = args.includes('--force')
  const ids = args.filter((a) => !a.startsWith('--'))
  const cities = ids.length
    ? ids
    : readdirSync(ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'photos.json')))
        .map((d) => d.name)
        .sort()
  if (recreditMode) {
    let total = 0
    for (const id of cities) total += recredit(id)
    console.log(`recredit: ${total} author(s) changed, no network, no images touched`)
    return
  }
  if (smallMode) {
    let total = 0
    for (const id of cities) total += await makeSmallCopies(id, { force })
    console.log(`small: wrote ${total} ${SMALL_BOX}px cop${total === 1 ? 'y' : 'ies'}, no network`)
    return
  }
  let failed = 0
  for (const id of cities) {
    try {
      await doCity(id)
    } catch (err) {
      failed++
      console.error(`FAILED ${err.message}`)
    }
  }
  if (failed) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
