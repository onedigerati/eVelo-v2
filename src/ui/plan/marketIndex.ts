// Light, lazily built index over the bundled market dataset: what the ticker search and the
// holdings rows need (name, group, years of real history, trailing 10-yr CAGR, a sparkline).

import marketJson from '../../data/market.json'
import type { AssetSeries, MarketData } from '../../engine/types'

export const market = marketJson as unknown as MarketData

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

function groupOf(a: AssetSeries): AssetGroup {
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
  /** 60-point log-growth path over the real history, normalized 0..1. */
  spark: number[]
  /** Order in the dataset (used to keep groups in a sensible order). */
  order: number
  /** Lower-case search keys. */
  keySym: string
  keyName: string
}

const SPARK_N = 60

function build(): { list: AssetMeta[]; bySymbol: Record<string, AssetMeta> } {
  const list: AssetMeta[] = []
  Object.values(market.assets).forEach((a, order) => {
    const months = market.months - a.first
    // Cumulative log growth over the real window.
    const lg: number[] = [0]
    let acc = 0
    for (let i = a.first; i < market.months; i++) {
      acc += Math.log1p(a.r[i] ?? 0)
      lg.push(acc)
    }
    const spark: number[] = []
    for (let k = 0; k < SPARK_N; k++) spark.push(lg[Math.round((k / (SPARK_N - 1)) * (lg.length - 1))])
    const lo = Math.min(...spark)
    const hi = Math.max(...spark)
    const norm = spark.map((v) => (hi > lo ? (v - lo) / (hi - lo) : 0.5))
    let cagr10: number | null = null
    if (months >= 120) {
      let s = 0
      for (let i = market.months - 120; i < market.months; i++) s += Math.log1p(a.r[i] ?? 0)
      cagr10 = Math.exp(s / 10) - 1
    }
    list.push({
      symbol: a.symbol,
      name: a.name,
      group: groupOf(a),
      years: months / 12,
      cagr10,
      spark: norm,
      order,
      keySym: a.symbol.toLowerCase().replace(/[^a-z0-9]/g, ''),
      keyName: a.name.toLowerCase(),
    })
  })
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
