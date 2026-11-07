import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it, vi } from 'vitest'
import { doCity } from '../../../scripts/photos.mjs'
import {
  MAX_BYTES,
  PHOTOS_PER_CITY,
  allowedLicense,
  authorFrom,
  checkImageUrl,
  checkLicense,
  checkOriginalSize,
  cleanAuthor,
  commonsPageUrl,
  isPlaceholderAuthor,
  licenseUrlFor,
  normalizeTitle,
  validateEntry,
  validateHandFields,
} from '../../../scripts/photos-lib.mjs'
import { EXPAT_PICKS } from '../expatPicks'
import { PHOTO_CITY_IDS, buildPhotoIndex, photosFor, type CityPhotoEntry } from '../photos'

const PHOTOS_DIR = fileURLToPath(new URL('../photos/', import.meta.url))
const PILOTS = ['lisbon', 'algarve', 'panama-city', 'boquete', 'kuala-lumpur']
const PICK_IDS = new Set(EXPAT_PICKS.map((p) => p.cityId))

describe('city photos data', () => {
  it('loads every city folder that has a photos.json', () => {
    const dirs = readdirSync(PHOTOS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(`${PHOTOS_DIR}${d.name}/photos.json`))
      .map((d) => d.name)
      .sort()
    expect(PHOTO_CITY_IDS).toEqual(dirs)
  })

  it('only has photos for profiled picks', () => {
    for (const id of PHOTO_CITY_IDS) expect(PICK_IDS.has(id), id).toBe(true)
  })

  it('has the five pilot cities', () => {
    for (const id of PILOTS) expect(photosFor(id), id).toHaveLength(PHOTOS_PER_CITY)
  })

  it('returns an empty list for a city without photos', () => {
    expect(photosFor('no-such-city')).toEqual([])
  })

  it('gives every city exactly 5 complete, credited photos under 200 kB', () => {
    for (const id of PHOTO_CITY_IDS) {
      const list = photosFor(id)
      expect(list, id).toHaveLength(PHOTOS_PER_CITY)
      expect(validateHandFields(list), id).toEqual([])
      list.forEach((p, i) => {
        const at = `${id} #${i + 1}`
        expect(p.file, at).toBe(`${i + 1}.webp`)
        const path = `${PHOTOS_DIR}${id}/${p.file}`
        expect(existsSync(path), `${at} file on disk`).toBe(true)
        expect(statSync(path).size, `${at} size`).toBeLessThanOrEqual(MAX_BYTES)
        expect(p.src, at).toMatch(/\.webp/)
        expect(p.alt.trim(), `${at} alt`).not.toBe('')
        expect(p.caption, `${at} caption`).not.toMatch(/[\r\n]/)
        expect(p.caption, `${at} caption`).not.toMatch(/\.\s*$/)
        expect(p.author.trim(), `${at} author`).not.toBe('')
        expect(p.author, `${at} author plain text`).not.toMatch(/[<>\n]/)
        expect(allowedLicense(p.license), `${at} licence ${p.license}`).toBe(p.license)
        expect(p.licenseUrl, `${at} licenseUrl`).toMatch(/^https:\/\/\S+$/)
        expect(p.source, `${at} source`).toBe(commonsPageUrl(p.commons))
        expect(p.source, `${at} source`).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
        expect(Number.isInteger(p.width) && p.width > 0, `${at} width`).toBe(true)
        expect(Number.isInteger(p.height) && p.height > 0, `${at} height`).toBe(true)
        expect(Math.max(p.width, p.height), `${at} longest side`).toBeLessThanOrEqual(1280)
      })
    }
  })

  it('stores entries that pass the full entry check (no placeholder authors)', () => {
    for (const id of PHOTO_CITY_IDS) {
      photosFor(id).forEach((p, i) => expect(validateEntry(p as unknown as Record<string, unknown>, i + 1), id).toEqual([]))
    }
  })

  it('never uses a Commons file twice', () => {
    const titles = PHOTO_CITY_IDS.flatMap((id) => photosFor(id).map((p) => normalizeTitle(p.commons)))
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('has no stray image files', () => {
    for (const id of PHOTO_CITY_IDS) {
      const webps = readdirSync(`${PHOTOS_DIR}${id}`).filter((f) => f.endsWith('.webp')).sort()
      expect(webps, id).toEqual(photosFor(id).map((p) => p.file).sort())
    }
  })
})

describe('photo index (buildPhotoIndex)', () => {
  const entry = (file: string): CityPhotoEntry => ({
    commons: `File:${file}.jpg`,
    file,
    caption: 'A place',
    alt: 'A view',
    author: 'Ann',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    source: `https://commons.wikimedia.org/wiki/File:${file}.jpg`,
    width: 1280,
    height: 720,
  })
  const files = ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp']
  const lists = {
    './photos/okville/photos.json': files.map(entry),
    './photos/brokenville/photos.json': files.map(entry),
  }
  const urlsFor = (city: string, skip?: string) =>
    Object.fromEntries(files.filter((f) => f !== skip).map((f) => [`./photos/${city}/${f}`, `/assets/${city}-${f}`]))

  it('drops only the city whose listed file is missing, with one warning', () => {
    const warnings: string[] = []
    const index = buildPhotoIndex(lists, { ...urlsFor('okville'), ...urlsFor('brokenville', '3.webp') }, (m) => warnings.push(m))
    expect(Object.keys(index)).toEqual(['okville'])
    expect(index.okville.map((p) => p.src)).toEqual(files.map((f) => `/assets/okville-${f}`))
    expect(index.brokenville).toBeUndefined()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/brokenville/)
    expect(warnings[0]).toMatch(/3\.webp/)
  })

  it('does not throw and warns nothing when every file is there', () => {
    const warn = vi.fn()
    const index = buildPhotoIndex(lists, { ...urlsFor('okville'), ...urlsFor('brokenville') }, warn)
    expect(Object.keys(index).sort()).toEqual(['brokenville', 'okville'])
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns through console.warn by default', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(() => buildPhotoIndex(lists, {})).not.toThrow()
      expect(spy).toHaveBeenCalledTimes(2)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('photo licence check', () => {
  const title = 'File:Example photo.jpg'

  it.each([
    ['CC0', 'CC0'],
    ['CC0 1.0', 'CC0'],
    ['Public domain', 'Public domain'],
    ['PD-self', 'Public domain'],
    ['CC BY 2.0', 'CC BY 2.0'],
    ['CC BY 4.0', 'CC BY 4.0'],
    ['CC BY-SA 3.0', 'CC BY-SA 3.0'],
    ['CC BY-SA 4.0', 'CC BY-SA 4.0'],
    ['CC BY-SA 3.0 at', 'CC BY-SA 3.0 at'],
    ['CC BY-SA 3.0 IGO', 'CC BY-SA 3.0 IGO'],
    ['CC BY-SA 3.0 igo', 'CC BY-SA 3.0 IGO'],
    ['PD-old-70', 'Public domain'],
    ['CC BY 2.5', 'CC BY 2.5'],
  ])('allows %s', (name, normalised) => {
    expect(checkLicense(name, title)).toBe(normalised)
  })

  it.each(['CC BY-NC 2.0', 'CC BY-ND 4.0', 'CC BY-NC-SA 4.0', 'CC BY-SA 2.5,2.0,1.0', 'Attribution', 'Fair use', 'GFDL', ''])('refuses "%s" naming the file', (name) => {
    expect(() => checkLicense(name, title)).toThrow(title)
    expect(allowedLicense(name)).toBeNull()
  })

  it('refuses a missing licence', () => {
    expect(() => checkLicense(undefined, title)).toThrow(title)
  })
})

describe('npm run photos (doCity, network stubbed)', () => {
  const titles = [1, 2, 3, 4, 5].map((n) => `File:Test photo ${n}.jpg`)
  const hand = titles.map((commons, i) => ({ commons, caption: `Test place ${i + 1}`, alt: `A test view ${i + 1}` }))
  type Meta = Record<string, { value: string }>
  type Info = { width?: number; height?: number; thumburl?: string; meta?: Meta; missing?: boolean; bytes?: 'bad' }

  /** A temp city "testville" and a stub `get`; `over[i]` overrides photo i+1's Commons answer. */
  async function setup(over: Record<number, Info> = {}) {
    const root = mkdtempSync(join(tmpdir(), 'evelo-photos-'))
    mkdirSync(join(root, 'testville'))
    const json = `${JSON.stringify(hand, null, 2)}\n`
    writeFileSync(join(root, 'testville', 'photos.json'), json)
    const jpeg = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#3a7' } }).jpeg().toBuffer()
    const calls: string[] = []
    const get = async (url: string | URL) => {
      const u = new URL(String(url))
      calls.push(u.href)
      if (u.host === 'commons.wikimedia.org') {
        const title = u.searchParams.get('titles') ?? ''
        const o = over[titles.indexOf(title)] ?? {}
        const meta: Meta = o.meta ?? {
          LicenseShortName: { value: 'CC BY 4.0' },
          LicenseUrl: { value: 'https://creativecommons.org/licenses/by/4.0' },
          Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:T">Tester</a>' },
        }
        const thumburl = o.thumburl ?? `https://upload.wikimedia.org/${encodeURIComponent(title)}`
        const page = o.missing
          ? { title, missing: true }
          : { title, imageinfo: [{ width: o.width ?? 4000, height: o.height ?? 3000, thumburl, extmetadata: meta }] }
        return { json: async () => ({ query: { pages: [page] } }), arrayBuffer: async () => new ArrayBuffer(0) }
      }
      const bad = Object.values(over).some((o) => o.bytes === 'bad' && u.href.includes(encodeURIComponent('photo 3')))
      const buf = bad ? Buffer.from('not an image') : jpeg
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      return { json: async () => ({}), arrayBuffer: async () => ab }
    }
    return { root, json, calls, get }
  }

  /** Runs doCity expecting a refusal naming `title`, and checks that nothing was written. */
  async function expectRefused(over: Record<number, Info>, message: string | RegExp, title = titles[2]) {
    const { root, json, calls, get } = await setup(over)
    try {
      const run = doCity('testville', { root, get, log: () => {} })
      await expect(run).rejects.toThrow(title)
      await expect(doCity('testville', { root, get, log: () => {} })).rejects.toThrow(message)
      expect(readdirSync(join(root, 'testville'))).toEqual(['photos.json'])
      expect(readFileSync(join(root, 'testville', 'photos.json'), 'utf8')).toBe(json)
      return calls
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }

  const meta = (m: Record<string, string>): Meta =>
    Object.fromEntries(Object.entries({ LicenseShortName: 'CC BY 4.0', ...m }).map(([k, v]) => [k, { value: v }]))

  it('refuses a non-free licence with the file title, before downloading, and writes nothing', async () => {
    const calls = await expectRefused({ 2: { meta: meta({ LicenseShortName: 'CC BY-NC 2.0', Artist: 'X' }) } }, /not allowed/)
    expect(calls.some((c) => c.includes('upload.wikimedia.org')), 'no image downloaded').toBe(false)
  })

  it('refuses a file that is not on Commons', async () => {
    await expectRefused({ 2: { missing: true } }, /not found on Commons/)
  })

  it('refuses a placeholder author', async () => {
    await expectRefused({ 2: { meta: meta({ Artist: 'Own work' }) } }, /no usable author/)
  })

  it('refuses a missing author', async () => {
    await expectRefused({ 2: { meta: meta({}) } }, /no usable author/)
  })

  it('refuses an author that decodes to markup', async () => {
    await expectRefused({ 2: { meta: meta({ Artist: '&lt;script&gt;x&lt;/script&gt;' }) } }, /not plain text/)
  })

  it('refuses a too-small original before downloading', async () => {
    const calls = await expectRefused({ 2: { meta: meta({ Artist: 'X' }), width: 800, height: 600 } }, /under 1000 px/)
    expect(calls.some((c) => c.includes('upload.wikimedia.org'))).toBe(false)
  })

  it('refuses an image URL that is not https on upload.wikimedia.org', async () => {
    const calls = await expectRefused({ 2: { meta: meta({ Artist: 'X' }), thumburl: 'https://evil.example/x.jpg' } }, /upload\.wikimedia\.org/)
    expect(calls.some((c) => c.includes('evil.example'))).toBe(false)
  })

  it('writes nothing when an image fails to encode after every licence passed', async () => {
    await expectRefused({ 2: { meta: meta({ Artist: 'X' }), bytes: 'bad' } }, /not a readable image/)
  })

  it('fills the entries, then skips them on a second run without any network call', async () => {
    const { root, calls, get } = await setup({
      0: { meta: meta({ Attribution: 'Licensor Credit', Artist: 'Someone Else' }) },
      1: { meta: meta({ LicenseShortName: 'CC0', Credit: 'Credit Person' }) },
      2: { meta: meta({ LicenseShortName: 'Public domain', Artist: 'Tester' }) },
    })
    try {
      expect(await doCity('testville', { root, get, log: () => {} })).toEqual({ downloaded: 5, skipped: 0 })
      const list = JSON.parse(readFileSync(join(root, 'testville', 'photos.json'), 'utf8'))
      expect(list.map((p: { file: string }) => p.file)).toEqual(['1.webp', '2.webp', '3.webp', '4.webp', '5.webp'])
      expect(list[0]).toMatchObject({ author: 'Licensor Credit', license: 'CC BY 4.0', width: 1280, height: 800 })
      expect(list[1]).toMatchObject({ author: 'Credit Person', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' })
      expect(list[2]).toMatchObject({ license: 'Public domain', licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/' })
      expect(Object.keys(list[0])).toEqual(['commons', 'file', 'caption', 'alt', 'author', 'license', 'licenseUrl', 'source', 'width', 'height'])
      const n = calls.length
      expect(await doCity('testville', { root, get, log: () => {} })).toEqual({ downloaded: 0, skipped: 5 })
      expect(calls.length).toBe(n)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('photo metadata helpers', () => {
  it('cleans Commons author HTML to short plain text', () => {
    expect(cleanAuthor('<a href="//commons.wikimedia.org/wiki/User:X">Jakub Ha&#322;un</a>')).toBe('Jakub Hałun')
    expect(cleanAuthor('<span>Paul Arps</span> from The Netherlands')).toBe('Paul Arps')
    expect(cleanAuthor('Photo by A &amp; B')).toBe('A & B')
    expect(cleanAuthor('Dale Cruse - 10M views from San Francisco, CA, USA')).toBe('Dale Cruse')
    expect(cleanAuthor('Some One - 250K views')).toBe('Some One')
    expect(cleanAuthor('Some One – 1.2M Views')).toBe('Some One')
    expect(cleanAuthor('  first line <br> second ')).toBe('first line')
    expect(cleanAuthor('x'.repeat(200)).length).toBeLessThanOrEqual(80)
  })

  it('drops out-of-range entities and invisible/bidi controls', () => {
    expect(cleanAuthor('A&#99999999;B')).toBe('AB')
    expect(cleanAuthor('&#xD800;Ann')).toBe('Ann')
    expect(cleanAuthor('\u202EAnn\u200B Lee\uFEFF\u2066')).toBe('Ann Lee')
    expect(cleanAuthor('© Jane Doe')).toBe('Jane Doe')
  })

  it('treats placeholder authors as missing', () => {
    for (const s of ['Own work', 'own work.', 'Unknown', 'Unknown author', 'Flickr', 'Anonymous', 'See below', '', '  ', '?']) {
      expect(isPlaceholderAuthor(s), s).toBe(true)
      expect(cleanAuthor(s), s).toBe('')
    }
    expect(isPlaceholderAuthor('Jakub Hałun')).toBe(false)
  })

  it('prefers Attribution, then Artist, then Credit, and refuses none or markup', () => {
    const v = (x: string) => ({ value: x })
    expect(authorFrom({ Attribution: v('Photo: Ann'), Artist: v('Bob'), Credit: v('Cy') }, 'File:T.jpg')).toBe('Ann')
    expect(authorFrom({ Attribution: v('Own work'), Artist: v('Bob'), Credit: v('Cy') }, 'File:T.jpg')).toBe('Bob')
    expect(authorFrom({ Artist: v('Unknown author'), Credit: v('<a href="x">Cy</a>') }, 'File:T.jpg')).toBe('Cy')
    expect(() => authorFrom({ Artist: v('Own work') }, 'File:T.jpg')).toThrow('File:T.jpg')
    expect(() => authorFrom({}, 'File:T.jpg')).toThrow('File:T.jpg')
    expect(() => authorFrom({ Artist: v('&lt;b&gt;x') }, 'File:T.jpg')).toThrow(/not plain text/)
  })

  it('builds https licence URLs', () => {
    expect(licenseUrlFor('CC BY 4.0', 'http://creativecommons.org/licenses/by/4.0')).toBe('https://creativecommons.org/licenses/by/4.0')
    expect(licenseUrlFor('CC0', '')).toBe('https://creativecommons.org/publicdomain/zero/1.0/')
    expect(licenseUrlFor('Public domain', undefined)).toBe('https://creativecommons.org/publicdomain/mark/1.0/')
    expect(licenseUrlFor('CC BY-SA 3.0', '')).toBe('https://creativecommons.org/licenses/by-sa/3.0/')
    expect(licenseUrlFor('CC BY 2.0', 'ftp://x')).toBe('https://creativecommons.org/licenses/by/2.0/')
  })

  it('checks original size and image host', () => {
    expect(() => checkOriginalSize(999, 700, 'File:S.jpg')).toThrow('File:S.jpg')
    expect(() => checkOriginalSize(700, 1000, 'File:S.jpg')).not.toThrow()
    expect(checkImageUrl('https://upload.wikimedia.org/a.jpg', 'File:S.jpg')).toBe('https://upload.wikimedia.org/a.jpg')
    for (const u of ['http://upload.wikimedia.org/a.jpg', 'https://upload.wikimedia.org.evil.com/a.jpg', 'https://example.com/a.jpg', 'nope']) {
      expect(() => checkImageUrl(u, 'File:S.jpg'), u).toThrow('File:S.jpg')
    }
  })

  it('normalises Commons titles and catches duplicates that differ only in form', () => {
    expect(normalizeTitle('file:praia_da   Marinha.jpg')).toBe('File:Praia da Marinha.jpg')
    const base = { caption: 'A place', alt: 'A view' }
    const errs = validateHandFields([
      { ...base, commons: 'File:Praia da Marinha.jpg' },
      { ...base, commons: 'File:praia_da_Marinha.jpg' },
      { ...base, commons: 'File:B.jpg' },
      { ...base, commons: 'File:C.jpg' },
      { ...base, commons: 'File:D.jpg' },
    ])
    expect(errs).toEqual(['#2 (File:praia_da_Marinha.jpg): used twice'])
  })

  it('builds the Commons file page URL from the title', () => {
    expect(commonsPageUrl('File:Loulé Mercado Municipal R02.jpg')).toBe(
      'https://commons.wikimedia.org/wiki/File:Loul%C3%A9_Mercado_Municipal_R02.jpg',
    )
  })

  it('flags bad hand-written fields', () => {
    const ok = { commons: 'File:A.jpg', caption: 'A place', alt: 'A view' }
    expect(validateHandFields([ok])).toEqual([`expected ${PHOTOS_PER_CITY} photos, found 1`])
    const errs = validateHandFields([
      { ...ok, caption: 'Ends with a period.' },
      { ...ok, commons: 'File:B.jpg', caption: 'Two\nlines' },
      { ...ok, commons: 'A.jpg' },
      { ...ok },
      { ...ok, commons: 'File:C.jpg', alt: '' },
    ])
    expect(errs.join('\n')).toMatch(/period/)
    expect(errs.join('\n')).toMatch(/one line/)
    expect(errs.join('\n')).toMatch(/"File:\.\.\." title/)
    expect(errs.join('\n')).toMatch(/used twice/)
    expect(errs.join('\n')).toMatch(/alt missing/)
  })
})
