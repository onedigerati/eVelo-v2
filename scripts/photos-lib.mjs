// Pure helpers for scripts/photos.mjs (no network, no file system), shared with the tests in
// src/data/__tests__/photos.test.ts. Types: photos-lib.d.mts.

export const PHOTOS_PER_CITY = 5
/** "Under 200 kB", counting a kB as 1000 bytes so the limit holds either way. */
export const MAX_BYTES = 200_000
export const TARGET_WIDTH = 1280
/** Smallest allowed long side of the Commons original, in px. */
export const MIN_ORIGINAL_SIDE = 1000

/** Script-filled fields, in the order they are written after the hand-written ones. */
export const FILLED_KEYS = ['file', 'author', 'license', 'licenseUrl', 'source', 'width', 'height']
/** Key order of an entry in photos.json. */
export const KEY_ORDER = ['commons', 'file', 'caption', 'alt', 'focus', ...FILLED_KEYS.slice(1)]

const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/'
const PD_URL = 'https://creativecommons.org/publicdomain/mark/1.0/'

/**
 * Normalises a Commons licence name and returns it if it is on the allowlist (CC0, public domain,
 * CC BY x.y, CC BY-SA x.y, including national ports such as "CC BY-SA 3.0 at"); otherwise null.
 */
export function allowedLicense(name) {
  const n = String(name ?? '').replace(/\s+/g, ' ').trim()
  if (/^CC0( 1\.0)?$/i.test(n)) return 'CC0'
  if (/^(public domain|PD)([ -].*)?$/i.test(n) && !/\b(NC|ND)\b/i.test(n)) return 'Public domain'
  const cc = n.match(/^CC[ -]BY(-SA)?[ -](\d\.\d)( [a-z]{2,3})?$/i)
  if (cc) {
    const port = cc[3] ? (cc[3].trim().toLowerCase() === 'igo' ? ' IGO' : cc[3].toLowerCase()) : ''
    return `CC BY${cc[1] ? '-SA' : ''} ${cc[2]}${port}`
  }
  return null
}

/** Throws (naming the file) unless the licence is allowed; returns the normalised name. */
export function checkLicense(name, title) {
  const ok = allowedLicense(name)
  if (!ok) {
    throw new Error(
      `${title}: licence "${name ?? ''}" is not allowed (only CC0, public domain, CC BY or CC BY-SA)`,
    )
  }
  return ok
}

/** https licence URL: the one Commons gives, or the CC0 / public-domain mark for those. */
export function licenseUrlFor(license, url) {
  const u = String(url ?? '').trim().replace(/^http:\/\//i, 'https://')
  if (/^https:\/\//.test(u)) return u
  if (license === 'CC0') return CC0_URL
  if (license === 'Public domain') return PD_URL
  const m = license.match(/^CC (BY(?:-SA)?) (\d\.\d)/)
  if (m) return `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/`
  return ''
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
// Bidi and zero-width controls, BOM, and C0/C1 control characters (newlines are handled first).
const INVISIBLE = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g
/** Values that are not a credit: "Own work", "Unknown author", "Flickr", … */
const PLACEHOLDER_AUTHOR =
  /^(own work|own|unknown|unknown (author|photographer|artist)|anonymous|anon|flickr|see below|see above|author|photographer|n\/?a|none|not specified|unidentified|-+|\?+)$/i

function decodeEntity(m, e) {
  if (e[0] === '#') {
    const cp = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))
    return Number.isInteger(cp) && cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : ''
  }
  return ENTITIES[e.toLowerCase()] ?? m
}

/** True when an author value is empty or a placeholder such as "Own work". */
export function isPlaceholderAuthor(name) {
  const s = String(name ?? '').replace(/[.\s]+$/, '').trim()
  return !s || PLACEHOLDER_AUTHOR.test(s)
}

/**
 * Plain-text, one-line, short author from Commons' Attribution / Artist / Credit HTML.
 * Returns '' for an empty or placeholder value. May still contain "<" or ">" if the source
 * encoded markup as entities; authorFrom() refuses that.
 */
export function cleanAuthor(html) {
  let s = String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, decodeEntity)
    .replace(INVISIBLE, '')
  s = s.split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  s = s.replace(/\s+/g, ' ').replace(/^(©|\(c\)|copyright)\s*/i, '')
  s = s.replace(/^(photo(graph)?|picture)\s*(by|from|:)\s*/i, '').trim()
  // Flickr imports read "<user> from <place>"; keep the user.
  s = s.replace(/^(.+?\S)\s+from\s+[A-Z][^]*$/, '$1').trim()
  // Flickr display names sometimes carry a view-count boast: "Name - 10M views".
  s = s.replace(/\s*[-–—|,]\s*[\d.,]+\s*[KkMm]?\+?\s*views?$/i, '').trim()
  if (s.length > 80) s = `${s.slice(0, 79).trimEnd()}…`
  return isPlaceholderAuthor(s) ? '' : s
}

/**
 * The credit for a file from its extmetadata: Attribution (the licensor's requested credit) if
 * present, else Artist, else Credit. Throws, naming the file, if none is usable or one decodes to
 * markup.
 */
export function authorFrom(meta, title) {
  for (const key of ['Attribution', 'Artist', 'Credit']) {
    const author = cleanAuthor(meta?.[key]?.value)
    if (!author) continue
    if (/[<>]/.test(author)) throw new Error(`${title}: ${key} "${author}" is not plain text`)
    return author
  }
  throw new Error(`${title}: no usable author in Commons metadata (Attribution, Artist, Credit)`)
}

/** Throws, naming the file, if the Commons original's long side is under MIN_ORIGINAL_SIDE. */
export function checkOriginalSize(width, height, title) {
  const side = Math.max(Number(width) || 0, Number(height) || 0)
  if (side < MIN_ORIGINAL_SIDE) {
    throw new Error(`${title}: original is ${width}x${height}, under ${MIN_ORIGINAL_SIDE} px on its long side`)
  }
}

/** Throws, naming the file, unless the image URL is https on upload.wikimedia.org. */
export function checkImageUrl(url, title) {
  let u
  try {
    u = new URL(String(url))
  } catch {
    throw new Error(`${title}: bad image URL "${url}"`)
  }
  if (u.protocol !== 'https:' || u.hostname !== 'upload.wikimedia.org') {
    throw new Error(`${title}: image URL must be https on upload.wikimedia.org, got "${url}"`)
  }
  return u.href
}

/** Canonical Commons title: underscores as spaces, single spaces, "File:" + upper-case first letter. */
export function normalizeTitle(title) {
  const s = String(title ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  const m = s.match(/^file:\s*(.*)$/i)
  if (!m) return s
  return `File:${m[1].charAt(0).toUpperCase()}${m[1].slice(1)}`
}

/** https URL of a Commons file page, built from its title. */
export function commonsPageUrl(title) {
  const path = encodeURIComponent(normalizeTitle(title).replace(/ /g, '_')).replace(/%3A/g, ':').replace(/%2C/g, ',')
  return `https://commons.wikimedia.org/wiki/${path}`
}

/** Problems with the hand-written part of a city's list (empty array = fine). */
export function validateHandFields(entries) {
  const errs = []
  if (!Array.isArray(entries)) return ['photos.json must be an array']
  if (entries.length !== PHOTOS_PER_CITY) errs.push(`expected ${PHOTOS_PER_CITY} photos, found ${entries.length}`)
  const seen = new Set()
  entries.forEach((e, i) => {
    const at = `#${i + 1}${e?.commons ? ` (${e.commons})` : ''}`
    if (typeof e?.commons !== 'string' || !/^File:.+\.\w+$/.test(e.commons)) errs.push(`${at}: commons must be a "File:..." title`)
    else if (seen.has(normalizeTitle(e.commons))) errs.push(`${at}: used twice`)
    else seen.add(normalizeTitle(e.commons))
    if (typeof e?.caption !== 'string' || !e.caption.trim()) errs.push(`${at}: caption missing`)
    else {
      if (/[\r\n]/.test(e.caption)) errs.push(`${at}: caption must be one line`)
      if (/\.\s*$/.test(e.caption)) errs.push(`${at}: caption must not end with a period`)
    }
    if (typeof e?.alt !== 'string' || !e.alt.trim()) errs.push(`${at}: alt missing`)
    if (e?.focus !== undefined && !/^\d{1,3}% \d{1,3}%$/.test(e.focus)) errs.push(`${at}: focus must look like "50% 60%"`)
  })
  return errs
}

/** Problems with a finished entry (hand-written and script-filled fields). */
export function validateEntry(e, n) {
  const errs = validateHandFields([e]).filter((x) => !x.startsWith('expected'))
  const at = `#${n} (${e?.commons})`
  if (e?.file !== `${n}.webp`) errs.push(`${at}: file must be ${n}.webp`)
  if (typeof e?.author !== 'string' || isPlaceholderAuthor(e.author) || /[<>\n]/.test(e.author)) {
    errs.push(`${at}: author missing, a placeholder, or not plain text`)
  }
  if (!allowedLicense(e?.license)) errs.push(`${at}: licence "${e?.license}" not allowed`)
  if (!/^https:\/\/\S+$/.test(e?.licenseUrl ?? '')) errs.push(`${at}: licenseUrl must be https`)
  if (!String(e?.source ?? '').startsWith('https://commons.wikimedia.org/wiki/File:')) errs.push(`${at}: source must be a Commons file page`)
  for (const k of ['width', 'height']) if (!Number.isInteger(e?.[k]) || e[k] <= 0) errs.push(`${at}: ${k} must be a positive integer`)
  return errs
}

/** True when the entry already has its script-filled fields for its current Commons title. */
export function isFilled(e, n) {
  return (
    e.file === `${n}.webp` &&
    e.source === commonsPageUrl(e.commons) &&
    FILLED_KEYS.every((k) => e[k] !== undefined && e[k] !== '')
  )
}

/** Entry with keys in a stable order (unknown keys last, alphabetically). */
export function orderKeys(e) {
  const out = {}
  for (const k of KEY_ORDER) if (e[k] !== undefined) out[k] = e[k]
  for (const k of Object.keys(e).filter((k) => !KEY_ORDER.includes(k)).sort()) out[k] = e[k]
  return out
}
