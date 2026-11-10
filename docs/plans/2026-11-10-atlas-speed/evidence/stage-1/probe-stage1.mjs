// Stage 1 verification probe (real headless Chromium against `vite preview`).
// Usage: node probe-stage1.mjs <baseUrl> <scenario> [shotDir]
// Scenarios: reload | tamper | landing | solve
// Logs every Worker postMessage / reply (as docs/research/atlas-perf/probe.mjs does), the first
// time an odds tile (a "View the … profile" button) appears, and whether `.atlas__status.is-running`
// was ever in the DOM.
import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const BASE = process.argv[2]
const SCEN = process.argv[3]
const SHOTS = process.argv[4] || null
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)))
await page.addInitScript(() => {
  window.__log = []
  window.__oddsAt = null
  window.__runningSeen = false
  window.__doneAt = null
  window.__firstTile = null
  // Replies are logged by a listener added when the worker is created, so it runs before the
  // app's own onmessage handler (and before any render that handler triggers).
  const W = window.Worker
  window.Worker = function (...a) {
    const w = new W(...a)
    w.__kinds = new Map()
    w.addEventListener('message', (e) => {
      const kind = w.__kinds.get(e.data?.id)
      if (kind) window.__log.push({ t: Math.round(performance.now()), ev: 'recv', kind: e.data.kind, for: kind })
    })
    return w
  }
  window.Worker.prototype = W.prototype
  const pm = W.prototype.postMessage
  W.prototype.postMessage = function (m, ...r) {
    window.__log.push({ t: Math.round(performance.now()), ev: 'post', kind: m?.kind, n: m?.cityIds?.length })
    this.__kinds?.set(m?.id, m?.kind)
    return pm.call(this, m, ...r)
  }
  const check = () => {
    if (window.__oddsAt === null && document.querySelector('button[aria-label^="View the"]')) window.__oddsAt = Math.round(performance.now())
    if (document.querySelector('.atlas__status.is-running')) window.__runningSeen = true
    if (window.__doneAt === null && document.querySelector('.atlas__status.is-done')) window.__doneAt = Math.round(performance.now())
    const n = window.__firstTile === null && document.querySelector('.atile__num')
    if (n) window.__firstTile = { t: Math.round(performance.now()), tile: n.closest('.atile')?.querySelector('.t-eyebrow, .atile__eyebrow')?.textContent ?? null }
  }
  new MutationObserver(check).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
})
const state = () =>
  page.evaluate(() => ({
    hash: location.hash,
    oddsAt: window.__oddsAt,
    runningSeen: window.__runningSeen,
    doneAt: window.__doneAt,
    firstTile: window.__firstTile,
    atlasPosts: window.__log.filter((l) => l.ev === 'post' && l.kind === 'atlas').length,
    atlasRecvs: window.__log.filter((l) => l.ev === 'recv' && l.for === 'atlas').map((l) => l.t),
    log: window.__log,
    status: document.querySelector('.atlas__status')?.textContent ?? null,
    statusClass: document.querySelector('.atlas__status')?.className ?? null,
    best: document.querySelector('.atile__num')?.textContent ?? null,
    bestCity: document.querySelector('.atile__name')?.textContent ?? null,
    saved: (() => {
      const r = localStorage.getItem('evelo:atlas')
      if (!r) return null
      try {
        const o = JSON.parse(r)
        return { bytes: r.length, keys: Object.keys(o), h: o.h, n: o.entries?.length, hasInputs: /holdings|budget/.test(r) }
      } catch {
        return { bytes: r.length, unparsable: true }
      }
    })(),
  }))
const odds = async () => {
  await page.waitForSelector('button[aria-label^="View the"]', { timeout: 120000 })
  await page.waitForSelector('.atlas__status.is-done', { timeout: 120000 })
  await page.waitForTimeout(1500)
}
const print = (label, s) => {
  const { log, ...rest } = s
  console.log(`\n-- ${label}`)
  console.log(JSON.stringify(rest))
  console.log('  worker log: ' + log.map((l) => `${l.t} ${l.ev} ${l.ev === 'recv' ? l.kind + '←' + l.for : l.kind}${l.n ? '(' + l.n + ' cities)' : ''}`).join(', '))
}
const shot = async (name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` })
console.log('cores', await page.evaluate(() => navigator.hardwareConcurrency))

if (SCEN === 'reload') {
  await page.goto(BASE + '#atlas')
  await odds()
  print('fresh #atlas load (empty storage)', await state())
  for (let i = 1; i <= 2; i++) {
    const t0 = Date.now()
    await page.reload()
    await page.waitForSelector('button[aria-label^="View the"]', { timeout: 120000 })
    const tOdds = Date.now() - t0
    await page.waitForTimeout(3000)
    const s = await state()
    print(`same-plan reload ${i}: odds visible ${tOdds}ms after reload()`, s)
    await shot(`reload-same-plan-${i}`)
  }
}

if (SCEN === 'tamper') {
  await page.goto(BASE + '#atlas')
  await odds()
  const fresh = await state()
  print('fresh #atlas load (empty storage)', fresh)
  const good = await page.evaluate(() => localStorage.getItem('evelo:atlas'))
  const cases = [
    ['changed plan (saved plan in evelo:v2 set to the defaults with seed 4242 and housing 3000)', () => {
      // evelo:v2 isn't written until an input changes; sanitizeInputs merges this onto the defaults.
      const p = JSON.parse(localStorage.getItem('evelo:v2') || '{}')
      p.inputs = { ...(p.inputs || {}), seed: 4242, budget: { ...((p.inputs || {}).budget || {}), housing: 3000 } }
      localStorage.setItem('evelo:v2', JSON.stringify(p))
    }],
    ['other key hash (as a changed data version stores; h replaced)', (g) => {
      const o = JSON.parse(g); o.h = 'zzzzzz.yyyyyy'; localStorage.setItem('evelo:atlas', JSON.stringify(o))
    }],
    ['corrupt JSON', (g) => localStorage.setItem('evelo:atlas', g.slice(0, -7))],
    ['malformed entry (successRate 5)', (g) => {
      const o = JSON.parse(g); o.entries[0].successRate = 5; localStorage.setItem('evelo:atlas', JSON.stringify(o))
    }],
    ['unknown city in entries', (g) => {
      const o = JSON.parse(g); o.entries[0].cityId = 'atlantis'; localStorage.setItem('evelo:atlas', JSON.stringify(o))
    }],
  ]
  let ref = good
  for (const [label, f] of cases) {
    // Reset to a saved ranking matching the current plan, then apply the change.
    await page.evaluate(([fs, g]) => (0, eval)(`(${fs})`)(g), [f.toString(), ref])
    await page.reload()
    await odds()
    const s = await state()
    const lastRecv = Math.max(...s.atlasRecvs)
    print(`${label}: atlas posts ${s.atlasPosts}, "Ranked" (is-done) status first at ${s.doneAt}ms, last atlas reply at ${lastRecv}ms, running state seen ${s.runningSeen} -> ${s.atlasPosts > 0 && s.runningSeen && s.doneAt >= lastRecv ? 'ranking re-run; no saved ranking shown' : 'SAVED RANKING SHOWN'}`, s)
    ref = await page.evaluate(() => localStorage.getItem('evelo:atlas'))
  }
}

if (SCEN === 'landing') {
  await page.goto(BASE)
  await page.waitForTimeout(5000)
  const before = await state()
  print('landing, 5 s after goto (bare URL)', before)
  await shot('landing-5s')
  const t0 = await page.evaluate(() => { const t = performance.now(); location.hash = '#atlas'; return t })
  await page.waitForSelector('button[aria-label^="View the"]', { timeout: 120000 })
  const t1 = await page.evaluate(() => performance.now())
  await shot('landing-then-atlas-immediate')
  await page.waitForTimeout(3000)
  const after = await state()
  print(`in-page hash change to #atlas: odds visible ${Math.round(t1 - t0)}ms (odds node first seen ${after.oddsAt - Math.round(t0)}ms after the hash change); atlas posts after the change: ${after.atlasPosts - before.atlasPosts}; is-running ever seen: ${after.runningSeen}`, after)
  await shot('landing-then-atlas-3s')
}

if (SCEN === 'fresh') {
  // Fresh #atlas loads (new context = empty storage each time): when the ranking is posted and
  // answered, and when odds first show.
  for (let i = 1; i <= 5; i++) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await c.newPage()
    await p.addInitScript(() => {
      window.__log = []
      window.__oddsAt = null
      window.__oddsEl = null
      const pm = Worker.prototype.postMessage
      Worker.prototype.postMessage = function (m, ...r) {
        window.__log.push({ t: Math.round(performance.now()), ev: 'post', kind: m?.kind })
        this.addEventListener('message', (e) => { if (e.data?.id === m?.id) window.__log.push({ t: Math.round(performance.now()), ev: 'recv', kind: e.data.kind, for: m?.kind }) })
        return pm.call(this, m, ...r)
      }
      new MutationObserver(() => {
        const b = window.__oddsAt === null && document.querySelector('button[aria-label^="View the"]')
        if (b) { window.__oddsAt = Math.round(performance.now()); window.__oddsEl = b.className }
      }).observe(document, { subtree: true, childList: true })
    })
    const t0 = Date.now()
    await p.goto(BASE + '#atlas')
    await p.waitForSelector('button[aria-label^="View the"]', { timeout: 120000 })
    const wall = Date.now() - t0
    await p.waitForTimeout(4000)
    const r = await p.evaluate(() => ({ log: window.__log, oddsAt: window.__oddsAt, oddsEl: window.__oddsEl, nav: Math.round(performance.getEntriesByType('navigation')[0].responseEnd) }))
    const atl = r.log.filter((l) => (l.for ?? l.kind) === 'atlas')
    console.log(`run ${i}: wall (goto→buttons, as measure.mjs) ${wall}ms; atlas posts ${atl.filter((l) => l.ev === 'post').map((l) => l.t).join('/')}ms, replies ${atl.filter((l) => l.ev === 'recv').map((l) => l.t).join('/')}ms; odds button first at ${r.oddsAt}ms (${r.oddsEl})`)
    console.log('  worker log: ' + r.log.map((l) => `${l.t} ${l.ev} ${l.ev === 'recv' ? l.kind + '←' + l.for : l.kind}`).join(', '))
    await c.close()
  }
}

if (SCEN === 'solve') {
  for (let i = 1; i <= 3; i++) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await c.newPage()
    await p.addInitScript(() => {
      window.__log = []
      const pm = Worker.prototype.postMessage
      Worker.prototype.postMessage = function (m, ...r) {
        window.__log.push({ t: Math.round(performance.now()), ev: 'post', kind: m?.kind })
        this.addEventListener('message', (e) => { if (e.data?.id === m?.id) window.__log.push({ t: Math.round(performance.now()), ev: 'recv', kind: e.data.kind, for: m?.kind }) })
        return pm.call(this, m, ...r)
      }
    })
    await p.goto(BASE + '#outlook')
    await p.waitForSelector('.verdict__pct', { timeout: 60000 })
    const verdictAt = await p.evaluate(() => Math.round(performance.now()))
    await p.waitForTimeout(6000)
    const r = await p.evaluate(() => ({
      log: window.__log,
      verdict: document.querySelector('.verdict__headline')?.textContent?.replace(/\s+/g, ' ').trim(),
    }))
    const first = (ev, kind) => r.log.find((l) => l.ev === ev && (l.for ?? l.kind) === kind)?.t
    console.log(`run ${i}: first simulate reply ${first('recv', 'simulate')}ms, first solve reply ${first('recv', 'solve')}ms, verdict % visible by ${verdictAt}ms; verdict "${r.verdict}"`)
    console.log('  worker log: ' + r.log.map((l) => `${l.t} ${l.ev} ${l.ev === 'recv' ? l.kind + '←' + l.for : l.kind}`).join(', '))
    await c.close()
  }
}
console.log('\npage errors:', errors.length ? errors : 'none')
await browser.close()
