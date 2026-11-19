#!/usr/bin/env node
// Read-only check: calendar-year total returns for VFITX from Yahoo's monthly adjclose
// (Dec close to Dec close), next to the year's distribution events. Same request shape and
// User-Agent as fetchYahoo in scripts/refresh-data.mjs. Usage: node scripts/check-vfitx.mjs [SYM]
const SYM = process.argv[2] || 'VFITX'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const PERIOD1 = Date.UTC(1991, 0, 1) / 1000

const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`

const p2 = Math.floor(Date.now() / 1000)
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(SYM)}?period1=${PERIOD1}&period2=${p2}&interval=1mo&events=div,split`
const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' } })
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const r = (await res.json())?.chart?.result?.[0]
if (!r) throw new Error('no result')
if (r.meta?.dataGranularity !== '1mo') throw new Error(`granularity ${r.meta?.dataGranularity}`)

const current = ym(new Date())
const bars = new Map() // ym -> { adj, close }
const ts = r.timestamp || []
const adj = r.indicators.adjclose[0].adjclose
const close = r.indicators.quote[0].close
for (let i = 0; i < ts.length; i++) {
  const key = ym(new Date((ts[i] + 43200) * 1000))
  if (key >= current || !(adj[i] > 0) || !(close[i] > 0)) continue
  bars.set(key, { adj: adj[i], close: close[i] })
}
const divs = new Map() // ym -> [amount...]
for (const d of Object.values(r.events?.dividends || {})) {
  // Keyed by the event's UTC date, as monthlyDistributions in income-yield.mjs does (events are
  // stamped during the US trading day). +12h here would file month-end payments under the next month.
  const key = ym(new Date(d.date * 1000))
  if (!divs.has(key)) divs.set(key, [])
  divs.get(key).push(d.amount)
}

const pct = (x) => (x * 100).toFixed(2).padStart(7)
console.log(`${SYM} (${r.meta.longName || r.meta.shortName}), Yahoo monthly, ${[...bars.keys()][0]} .. ${[...bars.keys()].at(-1)}`)
console.log('adjTR  = adjclose Dec->Dec; price = close Dec->Dec;')
console.log('evTR   = monthly (close + that month\'s events) / prev close, chained over the year;')
console.log('events = sum of distribution events in the year; median/max = per-month event sums;')
console.log('lumps  = months whose events exceed 3x the year\'s median month (likely capital gains).')
console.log('\nyear    adjTR   price    evTR  events  median     max  lumps')
const years = [...new Set([...bars.keys()].map((k) => +k.slice(0, 4)))].sort()
for (const y of years) {
  const a = bars.get(`${y - 1}-12`), b = bars.get(`${y}-12`)
  if (!a || !b) continue
  let ev = 1, prev = a.close
  const monthly = []
  const lumps = []
  for (let m = 1; m <= 12; m++) {
    const k = `${y}-${String(m).padStart(2, '0')}`
    const bar = bars.get(k)
    const s = (divs.get(k) || []).reduce((x, z) => x + z, 0)
    if (s > 0) monthly.push([k, s])
    ev *= (bar.close + s) / prev
    prev = bar.close
  }
  const sums = monthly.map(([, s]) => s).sort((x, z) => x - z)
  const med = sums.length ? sums[Math.floor(sums.length / 2)] : 0
  for (const [k, s] of monthly) if (s > 3 * med) lumps.push(`${k.slice(5)}:${s.toFixed(3)}`)
  const tot = sums.reduce((x, z) => x + z, 0)
  console.log(
    `${y} ${pct(b.adj / a.adj - 1)} ${pct(b.close / a.close - 1)} ${pct(ev - 1)} ${tot.toFixed(3).padStart(7)} ${med.toFixed(3).padStart(7)} ${(sums.at(-1) || 0).toFixed(3).padStart(7)}  ${lumps.join(' ')}`,
  )
}
