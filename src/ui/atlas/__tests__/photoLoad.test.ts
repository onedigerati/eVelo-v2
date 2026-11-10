import { afterEach, describe, expect, it, vi } from 'vitest'
import { PHOTO_CITY_IDS, photosFor, type CityPhoto } from '../../../data/photos'
import { coverFactor, leadSizes, mosaicPreloads, photoSrcSet, preloadCityPhotos, preloadOnIntent, resetPreloads, smallSizes } from '../photoLoad'

const photo = (n: number, width = 1280, height = 853, small = true): CityPhoto => ({
  commons: `File:P${n}.jpg`,
  file: `${n}.webp`,
  caption: 'A place',
  alt: 'A view',
  author: 'Ann',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  source: `https://commons.wikimedia.org/wiki/File:P${n}.jpg`,
  width,
  height,
  src: `/a/${n}.webp`,
  srcSmall: small ? `/a/${n}-640.webp` : `/a/${n}.webp`,
  smallWidth: small ? Math.round((width * 640) / Math.max(width, height)) : width,
  smallHeight: small ? Math.round((height * 640) / Math.max(width, height)) : height,
})

describe('mosaic srcset and sizes', () => {
  it('offers the 640 copy and the original at their real widths', () => {
    expect(photoSrcSet(photo(1))).toBe('/a/1-640.webp 640w, /a/1.webp 1280w')
    // A portrait's 640 copy is 427 wide, its original 854.
    expect(photoSrcSet(photo(2, 854, 1280))).toBe('/a/2-640.webp 427w, /a/2.webp 854w')
  })

  it('falls back to the original alone when the small copy is missing', () => {
    expect(photoSrcSet(photo(3, 1280, 853, false))).toBeUndefined()
  })

  it('mirrors the CSS: lead (W-12)/2 and small (W-12)/4 of the sheet, 100vw on phones', () => {
    expect(leadSizes(photo(1))).toBe(
      '(max-width: 559.98px) 100vw, (max-width: 699.98px) calc(50vw - 27px), (max-width: 1079.98px) calc(50vw - 39px), 501px',
    )
    expect(smallSizes(photo(1))).toBe('(max-width: 699.98px) calc(25vw - 13.5px), (max-width: 1079.98px) calc(25vw - 19.5px), 251px')
  })

  it('widens sizes only for photos much wider than the tiles (object-fit: cover)', () => {
    expect(coverFactor(1280, 853)).toBe(1)
    expect(coverFactor(1280, 720)).toBe(1.11)
    expect(coverFactor(1280, 427)).toBe(1.87)
    expect(coverFactor(854, 1280)).toBe(1)
    expect(leadSizes(photo(4, 1280, 427))).toBe(
      '(max-width: 559.98px) calc((100vw) * 1.87), (max-width: 699.98px) calc((50vw - 27px) * 1.87), (max-width: 1079.98px) calc((50vw - 39px) * 1.87), 937px',
    )
  })

  it('preloads the lead and four small tiles on desktop, only the lead (the first cover slide) on phones', () => {
    const ps = [1, 2, 3, 4, 5].map((n) => photo(n))
    const desk = mosaicPreloads(ps, false)
    expect(desk).toHaveLength(5)
    expect(desk[0]).toEqual({ src: '/a/1.webp', srcset: photoSrcSet(ps[0]), sizes: leadSizes(ps[0]) })
    expect(desk[1]).toEqual({ src: '/a/2.webp', srcset: photoSrcSet(ps[1]), sizes: smallSizes(ps[1]) })
    expect(mosaicPreloads(ps, true)).toEqual([desk[0]])
    expect(mosaicPreloads([photo(1, 1280, 853, false)], false)).toEqual([{ src: '/a/1.webp' }])
  })
})

describe('preloadCityPhotos', () => {
  const made: Record<string, string>[] = []
  class FakeImage {
    sizes = ''
    srcset = ''
    decoding = ''
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(v: string) {
      made.push({ src: v, srcset: this.srcset, sizes: this.sizes })
    }
  }
  const setup = (phone: boolean) => {
    made.length = 0
    resetPreloads()
    vi.stubGlobal('Image', FakeImage)
    vi.stubGlobal('window', { matchMedia: (q: string) => ({ matches: phone && q.includes('max-width: 559.98px') }) })
  }
  afterEach(() => {
    vi.unstubAllGlobals()
    resetPreloads()
  })

  it('loads a city once, with the tiles own srcset and sizes (set before src)', () => {
    setup(false)
    const id = PHOTO_CITY_IDS[0]
    preloadCityPhotos(id)
    preloadCityPhotos(id)
    const ps = photosFor(id)
    expect(made).toEqual(mosaicPreloads(ps, false))
    expect(made).toHaveLength(5)
    expect(made[0].srcset).toContain(ps[0].srcSmall)
  })

  it('loads only the lead on a phone, and nothing for a city without photos', () => {
    setup(true)
    preloadCityPhotos('no-such-city')
    expect(made).toEqual([])
    preloadCityPhotos(PHOTO_CITY_IDS[1])
    expect(made).toHaveLength(1)
  })

  it('starts on hover, focus or press of a profile button', () => {
    setup(false)
    const props = preloadOnIntent(PHOTO_CITY_IDS[2])
    expect(Object.keys(props).sort()).toEqual(['onFocus', 'onPointerDown', 'onPointerEnter'])
    props.onPointerEnter?.()
    props.onPointerDown?.()
    expect(made).toHaveLength(5)
    expect(preloadOnIntent(undefined)).toEqual({})
  })
})
