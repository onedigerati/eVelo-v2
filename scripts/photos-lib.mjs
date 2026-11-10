// Pure helpers for scripts/photos.mjs (no network, no file system), shared with the tests in
// src/data/__tests__/photos.test.ts. Types: photos-lib.d.mts.

export const PHOTOS_PER_CITY = 5
/** "Under 200 kB", counting a kB as 1000 bytes so the limit holds either way. */
export const MAX_BYTES = 200_000
export const TARGET_WIDTH = 1280
/**
 * The small copy beside each photo, for the profile mosaic: <n>-640.webp, boxed like the 1280
 * (640 on the long side, a portrait 640 tall, never upscaled), WebP under SMALL_MAX_BYTES.
 */
export const SMALL_BOX = 640
export const SMALL_MAX_BYTES = 70_000
/** WebP qualities tried for the small copy, best first, until it fits SMALL_MAX_BYTES. */
export const SMALL_QUALITIES = [75, 70, 65, 60, 55]

/** "3.webp" -> "3-640.webp". Same rule as smallFileOf in src/data/photos.ts. */
export function smallFileName(file) {
  return String(file).replace(/\.webp$/, `-${SMALL_BOX}.webp`)
}

/** True for a small copy's file name ("3-640.webp"), not a photo in its own right. */
export function isSmallFile(file) {
  return new RegExp(`-${SMALL_BOX}\\.webp$`).test(String(file))
}

/** Round to nearest, ties to even (426.5 -> 426, 377.5 -> 378), as libvips sizes a resize. */
function roundHalfEven(x) {
  const f = Math.floor(x)
  const d = x - f
  if (Math.abs(d - 0.5) > 1e-9) return Math.round(x)
  return f % 2 === 0 ? f : f + 1
}

/**
 * Size of the small copy of a width x height photo: fit inside SMALL_BOX x SMALL_BOX, never
 * upscaled, the short side rounded half to even, as libvips (sharp) rounds it. Same rule as smallSizeOf in src/data/photos.ts.
 */
export function smallSize(width, height) {
  const scale = Math.min(1, SMALL_BOX / Math.max(width, height))
  if (scale === 1) return { width, height }
  return width >= height
    ? { width: SMALL_BOX, height: Math.max(1, roundHalfEven(height * scale)) }
    : { width: Math.max(1, roundHalfEven(width * scale)), height: SMALL_BOX }
}
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
  s = s.replace(/\s+/g, ' ').trim()
  s = stripCreditNoise(s)
  // Flickr imports read "<user> from <place>"; keep the user.
  s = s.replace(/^(.+?\S)\s+from\s+\S.*$/, '$1').trim()
  // Flickr display names sometimes carry a view-count boast: "Name - 10M views".
  s = s.replace(/\s*[-–—|,]\s*[\d.,]+\s*[KkMm]?\+?\s*views?$/i, '').trim()
  if (s.length > 80) s = `${s.slice(0, 79).trimEnd()}…`
  return isPlaceholderAuthor(s) ? '' : s
}

const SEP = '[\\/,\\-–—|@•·:;]'
/** Bare domain such as "www.foto-tw.de" or "studiolemontree.com" (lower-case, known TLD). */
const BARE_DOMAIN =
  /(?<![\w.@-])(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|info|biz|io|co|me|eu|de|at|ch|nl|be|fr|es|it|pt|pl|cz|sk|hu|ro|bg|hr|si|rs|gr|cy|mt|tr|ge|al|uk|ie|dk|se|no|fi|ru|ua|ar|br|mx|cl|pa|us|ca|au|nz|jp|my|th|vn|id|photo|photos|photography|art|studio)(?![\w-])(?:\/\S*)?/g
const URL_RE = /\bhttps?:\/\/\S+/gi
/** Commons/MediaWiki link labels left behind when the link markup is stripped: "Julian Herzog (Website)". */
const LINK_LABEL = '(?:web\\s?site|home\\s?page|talk|contribs|contributions|blog|e-?mail|contact|portfolio)'
const LINK_LABELS_RE = new RegExp(`\\s*\\(\\s*${LINK_LABEL}(?:\\s*[|·•,/]\\s*${LINK_LABEL})*\\s*\\)`, 'gi')
const PLATFORM = '(?:wikimedia commons|wikimedia|commons|wikipedia|wikivoyage|flickr|flikr|panoramio|instagram)'

/** True when a credit still carries a link, a domain, or a platform name. */
export function hasCreditNoise(s) {
  const t = String(s ?? '')
  const count = (re) => (t.match(re) ?? []).length
  return (
    /https?:\/\/|\bwww\./i.test(t) ||
    new RegExp(BARE_DOMAIN.source).test(t) ||
    /wikimedia commons|\bflickr\b|\bflikr\b|wikivoyage|\bWT-\w+/i.test(t) ||
    /thank(s| you)\b|\bviews?\b|no machine-readable|\bassumed\b/i.test(t) ||
    /\(\(|\)\)|\[\[|\]\]/.test(t) ||
    new RegExp(LINK_LABELS_RE.source, 'i').test(t) ||
    count(/\(/g) !== count(/\)/g) ||
    count(/\[/g) !== count(/\]/g) ||
    /^["“”'‘’«].*["“”'‘’»]$/.test(t)
  )
}

/** Strips credit prefixes ("This photo was taken by", "By:", "I,", "User:"), links and platform names. */
function stripCreditNoise(input) {
  let s = input
  // "A or alternatively © A": keep the first form. A bare "or"/"alternatively" only when it repeats.
  const alt = s.split(/\s+or\s+alternatively\s+/i)
  if (alt.length > 1 && alt[0].trim()) s = alt[0]
  else {
    const m = s.match(/^(.+?)\s+(?:or|alternatively)\s+(.+)$/i)
    const norm = (x) => x.replace(/^(©|\(c\)|copyright)\s*/i, '').replace(/\s+/g, ' ').trim().toLowerCase()
    if (m && norm(m[1]) === norm(m[2])) s = m[1]
  }
  s = s.trim().replace(/^(©|\(c\)|copyright)\s*/i, '')
  // Link labels: "Julian Herzog (Website)", "Ann (talk | contribs)".
  s = s.replace(LINK_LABELS_RE, '').trim()
  // Commons boilerplate: "No machine-readable author provided. X assumed (based on …)".
  s = s.replace(/^no machine-readable author provided\.?\s*(.+?)\s+assumed\b.*$/i, '$1')
  // Wikivoyage imports: "(WT-shared) X at wts wikivoyage".
  s = s.replace(/^\(\s*WT-[\w-]+\s*\)\s*/i, '').replace(/\s+at\s+(?:wts\s+|\w{2,3}\s+)?wikivoyage\b.*$/i, '')
  // Flickr thank-you text: "X / Thank you for (12 millions +) view".
  s = s.replace(new RegExp(`^(.*?\\S)(?:\\s*${SEP})?\\s+thank(?:s| you)\\b.*$`, 'i'), '$1')
  // Doubled brackets and wrapping quotes.
  s = s.replace(/\(\(+/g, '(').replace(/\)\)+/g, ')').replace(/\[\[+/g, '[').replace(/\]\]+/g, ']')
  s = s.trim().replace(/^["“”'‘’«]+(.+?)["“”'‘’»]+$/, '$1').trim()
  // "Flickr user X", "Flickr-user X", "Flickr: X" → "X".
  s = s.replace(/^(?:flickr|flikr)(?:[\s-]*user\b)?\s*:?\s*(?=\S)/i, '')
  s = s.replace(/^(this\s+)?(photo(graph)?|picture|image)(\s+was)?(\s+taken)?\s*(by|from|:)\s*:?\s*/i, '')
  s = s.replace(/^by\s*:\s*/i, '').replace(/^I,\s+/, '').replace(/^user:\s*/i, '')
  s = s.replace(URL_RE, ' ').replace(BARE_DOMAIN, ' ')
  s = s.replace(new RegExp(`\\s*${SEP}\\s*@?${PLATFORM}\\b.*$`, 'i'), '')
  s = s.replace(new RegExp(`^@?${PLATFORM}\\s*${SEP}\\s*`, 'i'), '')
  s = s.replace(/\(\s*\)/g, ' ').replace(/\s+\(?talk\)?$/i, '')
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(new RegExp(`(\\s*${SEP})+$`), '').replace(new RegExp(`^(${SEP}\\s*)+`), '').trim()
  // A trailing period left behind once noise is removed ("Mike Peel (www.mikepeel.net).").
  if (s !== input.trim()) s = s.replace(/\s*\.+$/, '').trim()
  return s
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
/** Hosts Wikimedia serves Commons originals and thumbnails from. */
const IMAGE_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org']

export function checkImageUrl(url, title) {
  let u
  try {
    u = new URL(String(url))
  } catch {
    throw new Error(`${title}: bad image URL "${url}"`)
  }
  if (u.protocol !== 'https:' || !IMAGE_HOSTS.includes(u.hostname)) {
    throw new Error(`${title}: image URL must be https on ${IMAGE_HOSTS.join(' or ')}, got "${url}"`)
  }
  // Commons appends tracking parameters (utm_*) to thumbnail URLs; they aren't needed.
  for (const k of [...u.searchParams.keys()]) if (k.startsWith('utm_')) u.searchParams.delete(k)
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
  } else if (hasCreditNoise(e.author)) {
    errs.push(`${at}: author "${e.author}" carries a link, domain or platform name`)
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
