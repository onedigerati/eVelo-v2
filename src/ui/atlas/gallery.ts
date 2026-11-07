// Display models for the profile's photo gallery: the odds badge on the cover photo (and the
// pill in the full-size view) and the one-line photo credit. Pure, so the numbers are testable
// and match the "Your plan here" card, which reads the same row and home.

import type { CityPhoto } from '../../data/photos'
import { percent } from '../format'
import { outcomeColor as successColor, outcomeTextColor as successTextColor } from '../outcomeScale'
import { oddsVsHome } from './picks'

interface OddsRow {
  cityId: string
  successRate: number
}

export type OddsBadgeModel =
  | {
      /** The Atlas is still ranking: show a skeleton, never a stale number. */
      ready: false
      label: string
    }
  | {
      ready: true
      /** Whole percent, as the card shows it ("82"). */
      pct: number
      /** 0..1, for the bar width. */
      rate: number
      /** Text colour on the outcome scale (theme-aware CSS). */
      tone: string
      /** Bar fill colour on the outcome scale. */
      fill: string
      /** Home comparison; absent when there is no home row or this city is home. */
      home?: {
        /** 0..1, for the tick on the bar. */
        rate: number
        /** "+6 pts", "−4 pts", "same". */
        delta: string
        /** Same classes as the card: is-down = better than home (holds colour), is-up = worse. */
        deltaClass?: 'is-down' | 'is-up'
        /** "vs 76% in Austin". */
        text: string
      }
      /** Accessible summary of the whole badge. */
      label: string
    }

/** The odds badge for `cityName`, from the same ranking row and home row as the card. */
export function oddsBadge(row: OddsRow | undefined, home: (OddsRow & { name: string }) | undefined, cityName: string): OddsBadgeModel {
  if (!row) return { ready: false, label: `Your plan’s odds in ${cityName}: ranking…` }
  const pct = Math.round(row.successRate * 100)
  const base = {
    ready: true as const,
    pct,
    rate: clamp01(row.successRate),
    tone: successTextColor(row.successRate),
    fill: successColor(row.successRate),
  }
  if (!home || home.cityId === row.cityId) {
    return {
      ...base,
      label: `Your plan in ${cityName} holds in ${pct}% of simulated futures`,
    }
  }
  const d = row.successRate - home.successRate
  const homePct = percent(home.successRate)
  const delta = oddsVsHome(row.successRate, home.successRate)
  return {
    ...base,
    home: {
      rate: clamp01(home.successRate),
      delta,
      deltaClass: d > 0.005 ? 'is-down' : d < -0.005 ? 'is-up' : undefined,
      text: `vs ${homePct} in ${home.name}`,
    },
    label: `Your plan in ${cityName} holds in ${pct}% of simulated futures, ${delta === 'same' ? 'the same as' : `${delta} vs`} ${homePct} in ${home.name}`,
  }
}

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0)

/** Licence family without the version: "CC BY 4.0" → "CC BY", "CC BY-SA 3.0 IGO" → "CC BY-SA". */
export function licenseFamily(license: string): string {
  const m = /^(CC (?:BY(?:-SA)?|0))\b/i.exec(license.trim())
  return m ? m[1].toUpperCase().replace('CC 0', 'CC0') : license.trim()
}

/**
 * The credit line under the mosaic: "Photos: A, B, C · CC BY / CC BY-SA · Wikimedia Commons".
 * Authors, licence families and sources are deduplicated in photo order. Empty for no photos.
 */
export function photoCredit(photos: Pick<CityPhoto, 'author' | 'license' | 'source'>[]): string {
  if (!photos.length) return ''
  const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))]
  const authors = uniq(photos.map((p) => p.author))
  const licences = uniq(photos.map((p) => licenseFamily(p.license)))
  const sources = uniq(photos.map((p) => sourceLabel(p.source)))
  const parts = [`Photos: ${authors.join(', ')}`, licences.join(' / '), ...sources]
  return parts.join(' · ')
}

/** Where a photo comes from, named by its source URL's host: "Wikimedia Commons", "Unsplash", else the hostname. */
export function sourceLabel(source: string): string {
  let host: string
  try {
    host = new URL(source).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return 'Source'
  }
  if (host === 'commons.wikimedia.org') return 'Wikimedia Commons'
  if (host === 'unsplash.com' || host.endsWith('.unsplash.com')) return 'Unsplash'
  return host
}
