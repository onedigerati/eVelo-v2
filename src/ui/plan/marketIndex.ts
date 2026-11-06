// What the ticker search and the holdings rows need (name, group, years of real history,
// trailing 10-yr CAGR, a sparkline). Reads the small prebuilt src/data/market-index.json
// (scripts/build-market-index.mjs) so the full return series stay in the worker chunk.

import indexJson from '../../data/market-index.json'
import type { AssetClass } from '../../engine/types'

export interface MarketIndexAsset {
  symbol: string
  name: string
  cls: AssetClass
  /** Calendar index of the first real return. */
  first: number
  years: number
  cagr10: number | null
  /** 40-point log-growth path over the real history, one SPARK_ALPHABET character per point (0..63). */
  spark: string
}
export interface MarketIndex {
  asOf: string
  start: string
  months: number
  assets: MarketIndexAsset[]
}

export const marketIndex = indexJson as unknown as MarketIndex
const index = marketIndex
const SPARK_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
const decodeSpark = (s: string) => Array.from(s, (ch) => SPARK_ALPHABET.indexOf(ch) / 63)

export type AssetGroup = 'broad' | 'dividend' | 'bonds' | 'sectors' | 'stocks' | 'real' | 'crypto'

export const GROUPS: { id: AssetGroup; label: string; short: string }[] = [
  { id: 'broad', label: 'Broad market', short: 'Broad' },
  { id: 'dividend', label: 'Dividend', short: 'Dividend' },
  { id: 'bonds', label: 'Bonds', short: 'Bond' },
  { id: 'sectors', label: 'Sectors', short: 'Sector' },
  { id: 'stocks', label: 'Stocks', short: 'Stock' },
  { id: 'real', label: 'Real assets', short: 'Real asset' },
  { id: 'crypto', label: 'Crypto', short: 'Crypto' },
]
export const GROUP_LABEL = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<AssetGroup, (typeof GROUPS)[number]>

const DIVIDEND = new Set(['SCHD', 'VIG', 'DGRO', 'VYM', 'NOBL'])
const SECTOR = new Set(['SMH', 'SOXX', 'VGT', 'IBB', 'ITA'])

function groupOf(a: { symbol: string; cls: AssetClass }): AssetGroup {
  switch (a.cls) {
    case 'stock':
      return 'stocks'
    case 'etf-bond':
      return 'bonds'
    case 'etf-real-estate':
    case 'commodity':
      return 'real'
    case 'crypto':
      return 'crypto'
    default:
      if (DIVIDEND.has(a.symbol)) return 'dividend'
      if (SECTOR.has(a.symbol) || /^XL[A-Z]$/.test(a.symbol)) return 'sectors'
      return 'broad'
  }
}

export interface AssetMeta {
  symbol: string
  name: string
  group: AssetGroup
  /** Years of real (non-backfilled) monthly history. */
  years: number
  /** Trailing 10-year CAGR, or null with less than 10 years of history. */
  cagr10: number | null
  /** 40-point log-growth path over the real history, normalized 0..1. */
  spark: number[]
  /** Order in the dataset (used to keep groups in a sensible order). */
  order: number
  /** Lower-case search keys. */
  keySym: string
  keyName: string
}

function build(): { list: AssetMeta[]; bySymbol: Record<string, AssetMeta> } {
  const list: AssetMeta[] = index.assets.map((a, order) => ({
    symbol: a.symbol,
    name: a.name,
    group: groupOf(a),
    years: a.years,
    cagr10: a.cagr10,
    spark: decodeSpark(a.spark),
    order,
    keySym: a.symbol.toLowerCase().replace(/[^a-z0-9]/g, ''),
    keyName: a.name.toLowerCase(),
  }))
  return { list, bySymbol: Object.fromEntries(list.map((m) => [m.symbol, m])) }
}

let cached: ReturnType<typeof build> | null = null
const idx = () => (cached ??= build())

export const allAssets = (): AssetMeta[] => idx().list
export const assetMeta = (symbol: string): AssetMeta | undefined => idx().bySymbol[symbol]

/** Subsequence score: higher when characters are close together and early. -1 if no match. */
function subseq(q: string, s: string): number {
  let si = 0
  let score = 0
  let last = -1
  for (const ch of q) {
    const at = s.indexOf(ch, si)
    if (at < 0) return -1
    score += at === last + 1 ? 3 : 1
    if (at === 0) score += 2
    last = at
    si = at + 1
  }
  return score - s.length * 0.02
}

/** Fuzzy score of one asset for a query; -Infinity if it does not match. */
export function scoreAsset(m: AssetMeta, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return 0
  const qs = q.replace(/[^a-z0-9]/g, '')
  if (qs && m.keySym === qs) return 1000
  if (qs && m.keySym.startsWith(qs)) return 800 - m.keySym.length
  const words = m.keyName.split(/[^a-z0-9&]+/)
  if (words.some((w) => w.startsWith(q))) return 600 - m.keyName.indexOf(q) * 0.5
  if (q.length > 2 && m.keyName.includes(q)) return 500 - m.keyName.indexOf(q) * 0.5
  if (qs && m.keySym.includes(qs)) return 400
  const ss = qs ? subseq(qs, m.keySym) : -1
  if (ss >= 0) return 200 + ss
  const sn = q.length > 2 ? subseq(q.replace(/\s+/g, ''), m.keyName.replace(/\s+/g, '')) : -1
  if (sn >= q.length * 2) return 100 + sn
  return -Infinity
}

export function searchAssets(query: string, limit = 40): AssetMeta[] {
  return allAssets()
    .map((m) => ({ m, s: scoreAsset(m, query) }))
    .filter((x) => x.s > -Infinity)
    .sort((a, b) => b.s - a.s || a.m.order - b.m.order)
    .slice(0, limit)
    .map((x) => x.m)
}
