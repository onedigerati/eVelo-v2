#!/usr/bin/env node
// Derive src/data/market-index.json from src/data/market.json: the small summary the plan UI
// needs (ticker search, holdings rows, Method page) so the full return series can stay in the
// simulation worker's chunk. Run by refresh-data.mjs; also runnable on its own:
//   node scripts/build-market-index.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data')
export const SPARK_N = 40
/** Sparkline levels are packed one character each (64 levels is plenty for a 22px-tall line). */
export const SPARK_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'

const r4 = (x) => Math.round(x * 1e4) / 1e4
const r3 = (x) => Math.round(x * 1e3) / 1e3

/** Pure: MarketData -> MarketIndex. */
export function buildIndex(market) {
  const assets = Object.values(market.assets).map((a) => {
    const months = market.months - a.first
    const lg = [0]
    let acc = 0
    for (let i = a.first; i < market.months; i++) {
      acc += Math.log1p(a.r[i] ?? 0)
      lg.push(acc)
    }
    const spark = []
    for (let k = 0; k < SPARK_N; k++) spark.push(lg[Math.round((k / (SPARK_N - 1)) * (lg.length - 1))])
    const lo = Math.min(...spark)
    const hi = Math.max(...spark)
    let cagr10 = null
    if (months >= 120) {
      let s = 0
      for (let i = market.months - 120; i < market.months; i++) s += Math.log1p(a.r[i] ?? 0)
      cagr10 = r4(Math.exp(s / 10) - 1)
    }
    return {
      symbol: a.symbol,
      name: a.name,
      cls: a.cls,
      first: a.first,
      years: r3(months / 12),
      cagr10,
      spark: spark.map((v) => SPARK_ALPHABET[Math.round((hi > lo ? (v - lo) / (hi - lo) : 0.5) * 63)]).join(''),
    }
  })
  return { asOf: market.asOf, start: market.start, months: market.months, assets }
}

export async function writeIndex() {
  const market = JSON.parse(await readFile(resolve(DATA_DIR, 'market.json'), 'utf8'))
  const out = resolve(DATA_DIR, 'market-index.json')
  const text = JSON.stringify(buildIndex(market))
  await writeFile(out, text + '\n')
  console.log(`Wrote ${out}\n  ${Object.keys(market.assets).length} assets, ${(text.length / 1024).toFixed(0)} KB`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeIndex().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
