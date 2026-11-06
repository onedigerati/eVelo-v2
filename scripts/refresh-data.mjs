#!/usr/bin/env node
// Refresh bundled market data: Yahoo monthly adjusted closes -> monthly total returns,
// FRED CPIAUCSL -> monthly US inflation. Writes src/data/market.json (MarketData).
// Also refreshes FX spot rates (open.er-api.com, USD base) for every currency used by
// src/data/cities.ts into src/data/fx.json ({ asOf, rates }).
//
// Usage: npm run data:refresh        (market + FX)
//        npm run data:fx             (FX only: node scripts/refresh-data.mjs --fx-only)
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data')
const OUT = resolve(DATA_DIR, 'market.json')
const FX_OUT = resolve(DATA_DIR, 'fx.json')
const FX_URL = 'https://open.er-api.com/v6/latest/USD'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const CONCURRENCY = 4
const DELAY_MS = 150
const PERIOD1 = Date.UTC(1992, 11, 1) / 1000

// symbol -> asset class
const UNIVERSE = {}
const add = (cls, list) => list.split(/\s+/).filter(Boolean).forEach((s) => (UNIVERSE[s] = cls))

add('etf-equity', `SPY VOO VTI QQQ DIA IWM VXUS VEA VWO EFA EEM VT SCHD VIG DGRO VYM NOBL RSP MTUM QUAL USMV
  XLK XLF XLV XLE XLY XLP XLI XLU XLB XLRE XLC SMH SOXX VGT IBB ITA`)
add('etf-bond', 'AGG BND TLT IEF SHY TIP LQD HYG MUB BNDX VGSH SGOV')
add('etf-real-estate', 'VNQ')
add('commodity', 'GLD IAU SLV DBC')
add('crypto', 'BTC-USD ETH-USD IBIT')
add('stock', `
  AAPL MSFT NVDA AMZN GOOGL GOOG META TSLA BRK-B AVGO LLY JPM V MA UNH XOM JNJ WMT PG HD COST ORCL
  ABBV MRK KO PEP CVX BAC NFLX AMD ADBE CRM CSCO TMO ACN MCD LIN ABT WFC DHR DIS INTC VZ T CMCSA PFE
  NKE TXN QCOM IBM CAT GS MS AMGN HON UNP LOW SPGI INTU BA MMM AXP BLK SBUX GE RTX DE ISRG NOW BKNG
  LMT PLD MDT GILD MO PM CVS CL KMB ADP TGT SO DUK NEE ENB TRV SHW ITW ED O
  PLTR SHOP UBER CRWD COIN MSTR SNOW PANW ABNB PYPL ANET MU AMAT ARM NET DDOG HOOD SOFI SPOT TSM ASML
  NVO MELI RBLX DKNG`)
// XLRE is a real-estate sector ETF
UNIVERSE.XLRE = 'etf-real-estate'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
const nextYm = (s) => {
  let [y, m] = s.split('-').map(Number)
  m++
  if (m > 12) (m = 1), y++
  return `${y}-${String(m).padStart(2, '0')}`
}
const round5 = (x) => Math.round(x * 1e5) / 1e5

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function withRetry(fn) {
  try {
    return await fn()
  } catch (e) {
    await sleep(1000)
    return fn()
  }
}

/** Returns { name, closes: Map<"YYYY-MM", adjclose> } of COMPLETE months only. */
async function fetchYahoo(sym) {
  // range=max silently downgrades long histories to 3-month bars, so ask for an explicit
  // window starting just before SPY's inception (the calendar never goes earlier).
  const p2 = Math.floor(Date.now() / 1000)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${PERIOD1}&period2=${p2}&interval=1mo&events=div,split`
  const json = JSON.parse(await fetchText(url))
  const res = json?.chart?.result?.[0]
  if (!res) throw new Error(json?.chart?.error?.description || 'no result')
  if (res.meta?.dataGranularity && res.meta.dataGranularity !== '1mo')
    throw new Error(`granularity ${res.meta.dataGranularity}`)
  const ts = res.timestamp || []
  const adj = res.indicators?.adjclose?.[0]?.adjclose || []
  const current = ym(new Date())
  const closes = new Map()
  for (let i = 0; i < ts.length; i++) {
    // Monthly bars are stamped at local midnight on the 1st (04:00/05:00 UTC for New York,
    // 00:00 UTC for crypto). Key by the UTC month of timestamp + 12h, which is the bar's month for
    // any exchange timezone. (Applying gmtoffset here shifted DST months into the previous month.)
    const key = ym(new Date((ts[i] + 43200) * 1000))
    if (key >= current) continue // drop current partial month
    const v = adj[i]
    if (v == null || !(v > 0)) continue
    if (closes.has(key)) throw new Error(`duplicate bar for ${key}`)
    closes.set(key, v)
  }
  return { name: res.meta?.longName || res.meta?.shortName || sym, closes }
}

async function fetchCpi() {
  const csv = await fetchText('https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL')
  const rows = []
  for (const line of csv.trim().split('\n').slice(1)) {
    const [d, v] = line.split(',')
    const x = v === '' ? NaN : Number(v)
    rows.push([d.slice(0, 7), Number.isFinite(x) && x > 0 ? x : null])
  }
  while (rows.length && rows[rows.length - 1][1] == null) rows.pop()
  // Interior gaps (e.g. the Oct-2025 shutdown) -> geometric interpolation of the level.
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] != null) continue
    let j = i
    while (rows[j][1] == null) j++
    const a = rows[i - 1][1]
    const b = rows[j][1]
    for (let k = i; k < j; k++) rows[k][1] = a * Math.pow(b / a, (k - i + 1) / (j - i + 1))
    i = j
  }
  return new Map(rows)
}

async function main() {
  const symbols = Object.keys(UNIVERSE)
  console.log(`Fetching ${symbols.length} symbols from Yahoo...`)
  const results = new Map()
  const failures = []
  let next = 0
  async function worker() {
    while (next < symbols.length) {
      const sym = symbols[next++]
      try {
        const r = await withRetry(() => fetchYahoo(sym))
        if (r.closes.size < 13) throw new Error(`only ${r.closes.size} months`)
        results.set(sym, r)
      } catch (e) {
        failures.push(sym)
        console.warn(`  ! ${sym}: ${e.message} (skipped)`)
      }
      await sleep(DELAY_MS)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const spy = results.get('SPY')
  if (!spy) throw new Error('SPY failed; cannot build calendar')

  // Calendar: first month with a SPY return (needs prior close) .. last complete month of SPY.
  const spyMonths = [...spy.closes.keys()].sort()
  const start = nextYm(spyMonths[0])
  const end = spyMonths[spyMonths.length - 1]
  const now = new Date()
  const lastComplete = ym(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)))
  if (end !== lastComplete) throw new Error(`SPY last month ${end} != last complete month ${lastComplete}`)
  const cal = []
  for (let m = start; m <= end; m = nextYm(m)) cal.push(m)
  const spyMissing = cal.filter((m) => !spy.closes.has(m))
  if (spyMissing.length) throw new Error(`SPY is missing months: ${spyMissing.join(', ')}`)
  const months = cal.length

  // CPI inflation
  const cpiLevels = await withRetry(fetchCpi)
  const cpi = []
  let filled = 0
  for (let i = 0; i < months; i++) {
    const m = cal[i]
    const prev = i === 0 ? null : cal[i - 1]
    const prevKey = prev ?? [...cpiLevels.keys()].filter((k) => k < m).pop()
    const a = cpiLevels.get(prevKey)
    const b = cpiLevels.get(m)
    if (a && b) cpi.push(round5(b / a - 1))
    else {
      const tail = cpi.slice(-12)
      cpi.push(round5(tail.reduce((s, x) => s + x, 0) / tail.length))
      filled++
    }
  }

  const assets = {}
  for (const sym of symbols) {
    const r0 = results.get(sym)
    if (!r0) continue
    const r = new Array(months).fill(null)
    let first = -1
    for (let i = 0; i < months; i++) {
      const prevKey = i === 0 ? spyMonths[0] : cal[i - 1]
      const a = r0.closes.get(prevKey)
      const b = r0.closes.get(cal[i])
      if (a && b) {
        r[i] = round5(b / a - 1)
        if (first < 0) first = i
      }
    }
    if (first < 0) {
      failures.push(sym)
      console.warn(`  ! ${sym}: no returns inside calendar (skipped)`)
      continue
    }
    // Returns are only computed between consecutive calendar months, so a missing bar yields
    // null (never a combined multi-month return). The contract allows null only before `first`,
    // so interior gaps become 0 — reported loudly.
    const gaps = []
    for (let i = first; i < months; i++) if (r[i] == null) (r[i] = 0), gaps.push(cal[i])
    if (gaps.length) console.warn(`  ! ${sym}: ${gaps.length} interior gap month(s) set to 0: ${gaps.join(', ')}`)
    assets[sym] = { symbol: sym, name: r0.name, cls: UNIVERSE[sym], first, r }
  }

  const data = { asOf: new Date().toISOString().slice(0, 10), start, months, cpi, assets }
  await mkdir(dirname(OUT), { recursive: true })
  const text = JSON.stringify(data)
  await writeFile(OUT, text)
  console.log(
    `Wrote ${OUT}\n  ${Object.keys(assets).length} assets, ${failures.length} failed${failures.length ? ` (${failures.join(', ')})` : ''}` +
      `\n  calendar ${start}..${end} (${months} months), CPI tail-filled ${filled} month(s)\n  ${(text.length / 1024).toFixed(0)} KB`,
  )
}

/** FX: units of each city currency per 1 USD. Fails loudly if any city currency is missing. */
async function refreshFx() {
  const src = await readFile(resolve(DATA_DIR, 'cities.ts'), 'utf8')
  const codes = [...new Set([...src.matchAll(/currency: '([A-Z]{3})'/g)].map((m) => m[1]))].sort()
  if (!codes.length) throw new Error('No currencies found in cities.ts')
  const json = JSON.parse(await withRetry(() => fetchText(FX_URL)))
  if (json.result !== 'success' || !json.rates) throw new Error(`FX API: ${json['error-type'] ?? 'bad response'}`)
  const rates = {}
  const missing = []
  for (const c of codes) {
    const v = json.rates[c]
    if (typeof v === 'number' && v > 0) rates[c] = v
    else missing.push(c)
  }
  if (missing.length) throw new Error(`FX API is missing ${missing.join(', ')}`)
  const asOf = json.time_last_update_unix
    ? new Date(json.time_last_update_unix * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  await writeFile(FX_OUT, JSON.stringify({ asOf, source: 'open.er-api.com', rates }, null, 2) + '\n')
  console.log(`Wrote ${FX_OUT}\n  ${codes.length} currencies, as of ${asOf}`)
}

const fxOnly = process.argv.includes('--fx-only')
;(fxOnly ? refreshFx() : main().then(refreshFx)).catch((e) => {
  console.error(e)
  process.exit(1)
})
