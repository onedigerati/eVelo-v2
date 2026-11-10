import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const BASE = process.argv[2] || 'http://localhost:4317/'
const profiles = [
  { name: 'desktop-fast', vw: 1440, vh: 900, cpu: 1, net: null },
  { name: 'desktop-4g-cpu4x', vw: 1440, vh: 900, cpu: 4, net: { latency: 60, down: 10e6/8, up: 3e6/8 } },
  { name: 'phone-4g-cpu4x', vw: 390, vh: 844, cpu: 4, net: { latency: 60, down: 10e6/8, up: 3e6/8 }, mobile: true },
]
// Identical to docs/research/atlas-perf/measure.mjs except: desktop-fast profile only.
profiles.splice(1)
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
for (const p of profiles) {
  const ctx = await browser.newContext({ viewport: { width: p.vw, height: p.vh }, isMobile: !!p.mobile, hasTouch: !!p.mobile, deviceScaleFactor: p.mobile ? 3 : 1 })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  if (p.net) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: p.net.latency, downloadThroughput: p.net.down, uploadThroughput: p.net.up })
  if (p.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu })
  const reqs = []
  cdp.on('Network.loadingFinished', (e) => reqs.push({ id: e.requestId, bytes: e.encodedDataLength, t: Date.now() }))
  const urls = new Map()
  cdp.on('Network.responseReceived', (e) => urls.set(e.requestId, { url: e.response.url, type: e.type }))
  await page.addInitScript(() => {
    window.__lt = []; window.__ev = []
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ s: e.startTime, d: e.duration }) }).observe({ type: 'longtask', buffered: true })
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push({ n: e.name, s: e.startTime, d: e.duration, pd: e.processingEnd - e.processingStart, delay: e.processingStart - e.startTime }) }).observe({ type: 'event', durationThreshold: 16, buffered: true })
  })
  const t0 = Date.now()
  await page.goto(BASE + '#atlas')
  await page.waitForSelector('button[aria-label^="View the"]', { timeout: 120000 })
  const tProfileBtn = Date.now() - t0
  await page.waitForSelector('.atlas__status.is-running', { timeout: 3000 }).catch(()=>{}); await page.waitForSelector('.atlas__status.is-done', { timeout: 180000 })
  const tDone = Date.now() - t0
  await page.waitForLoadState('networkidle')
  const tIdle = Date.now() - t0
  const sum = (arr) => arr.reduce((a, r) => a + r.bytes, 0)
  const loadReqs = reqs.splice(0).map((r) => ({ ...r, ...urls.get(r.id) }))
  const byType = {}
  for (const r of loadReqs) { const k = (r.url || '').split('?')[0].split('.').pop(); byType[k] = (byType[k] || 0) + r.bytes }
  const lt = await page.evaluate(() => window.__lt.splice(0))
  console.log(`\n== ${p.name}`)
  console.log(`atlas: profile buttons ${tProfileBtn}ms, fill done ${tDone}ms, network idle ${tIdle}ms; ${loadReqs.length} reqs ${(sum(loadReqs)/1024).toFixed(0)} KB`, JSON.stringify(Object.fromEntries(Object.entries(byType).map(([k,v])=>[k,Math.round(v/1024)]))))
  console.log(`  long tasks: ${lt.length}, total ${lt.reduce((a,e)=>a+e.d,0).toFixed(0)}ms, max ${Math.max(0,...lt.map(e=>e.d)).toFixed(0)}ms`)
  for (const r of loadReqs.sort((a,b)=>b.bytes-a.bytes).slice(0,6)) console.log(`    ${(r.bytes/1024).toFixed(0)} KB ${r.url?.split('/').pop()}`)
  // open 3 profiles
  const btns = page.locator('.pick__open:visible')
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => window.__ev.splice(0))
    const b = btns.nth(k)
    await b.scrollIntoViewIfNeeded()
    const label = await b.getAttribute('aria-label')
    const c0 = Date.now()
    await b.click()
    await page.waitForSelector('.prof-sheet[role="dialog"], [role="dialog"] .prof-sheet, [role="dialog"]', { timeout: 30000 })
    const tSheet = Date.now() - c0
    const lead = p.mobile ? '.pgal__slide img' : '.pgal__tile.is-lead img'
    await page.waitForFunction((sel) => { const i = document.querySelector(sel); return i && i.complete && i.naturalWidth > 0 }, lead, { timeout: 60000 }).catch(() => {})
    const tLead = Date.now() - c0
    await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((i) => i.complete), p.mobile ? '.pgal__slide img' : '.pgal__tile img', { timeout: 60000 }).catch(() => {})
    const tAll = Date.now() - c0
    await page.waitForLoadState('networkidle')
    const rr = reqs.splice(0).map((r) => ({ ...r, ...urls.get(r.id) }))
    const imgs = rr.filter((r) => /\.webp/.test(r.url || ''))
    const ev = await page.evaluate(() => window.__ev.splice(0))
    const click = ev.filter((e) => /click|pointer/.test(e.n)).sort((a,b)=>b.d-a.d)[0]
    const lts = await page.evaluate(() => window.__lt.splice(0))
    console.log(`  open "${label}": dialog ${tSheet}ms, lead img ${tLead}ms, all mosaic imgs ${tAll}ms; click INP ${click ? click.d.toFixed(0)+'ms (handler '+click.pd.toFixed(0)+')' : '<16ms'}; ${imgs.length} webp ${(sum(imgs)/1024).toFixed(0)} KB, other ${((sum(rr)-sum(imgs))/1024).toFixed(0)} KB; longtasks max ${Math.max(0,...lts.map(e=>e.d)).toFixed(0)}ms`)
    const k0 = Date.now()
    await page.keyboard.press('Escape')
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 }).catch(() => {})
    const ev2 = await page.evaluate(() => window.__ev.splice(0))
    console.log(`    close ${Date.now()-k0}ms; key INP ${Math.max(0,...ev2.map(e=>e.d)).toFixed(0)}ms`)
  }
  await ctx.close()
}
await browser.close()
