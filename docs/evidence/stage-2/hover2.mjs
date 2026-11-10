// Hover 300 ms before click; in-page timing from dialog insertion to the lead image loaded.
import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const BASE = process.argv[2]
const RUNS = +(process.argv[3] || 2)
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
const profiles = [
  { name: 'desktop-10Mbps-cpu4x', vw: 1440, vh: 900, dpr: 1 },
  { name: 'phone-10Mbps-cpu4x', vw: 390, vh: 844, dpr: 3, mobile: true },
]
for (const p of profiles) for (let run = 1; run <= RUNS; run++) {
  const ctx = await browser.newContext({ viewport: { width: p.vw, height: p.vh }, deviceScaleFactor: p.dpr, isMobile: !!p.mobile, hasTouch: !!p.mobile })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 10e6 / 8, uploadThroughput: 3e6 / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const webp = []
  cdp.on('Network.requestWillBeSent', (e) => { if (/\.webp/.test(e.request.url)) webp.push(e.request.url.split('/').pop()) })
  await page.addInitScript(() => {
    window.__dlg = null
    new MutationObserver(() => {
      if (window.__dlg == null && document.querySelector('[role="dialog"]')) window.__dlg = performance.now()
    }).observe(document, { childList: true, subtree: true })
  })
  page.on('console', (m) => { if (m.type() === 'error') console.log('  console error:', m.text()) })
  await page.goto(BASE + '#atlas')
  await page.waitForSelector('.atlas__status.is-done', { timeout: 180000 })
  await page.waitForLoadState('networkidle')
  const btns = page.locator('.pick__open:visible')
  for (let k = 0; k < 3; k++) {
    const b = btns.nth(k)
    await b.scrollIntoViewIfNeeded()
    const city = (await b.getAttribute('aria-label')).split(':')[1].split('.')[0].trim()
    webp.length = 0
    await page.evaluate(() => { window.__dlg = null })
    await b.hover()
    await page.waitForTimeout(300)
    const atHover = webp.length
    await b.click()
    const lead = p.mobile ? '.pgal__slide img' : '.pgal__tile.is-lead img'
    const r = await page.waitForFunction((sel) => {
      const i = document.querySelector(sel)
      if (!(window.__dlg != null && i && i.complete && i.naturalWidth > 0)) return null
      return { dlg: window.__dlg, ready: performance.now(), src: i.currentSrc.split('/').pop(), nw: i.naturalWidth, cw: i.clientWidth }
    }, lead, { timeout: 60000, polling: 'raf' }).then((h) => h.jsonValue())
    await page.waitForLoadState('networkidle')
    console.log(`${p.name} run${run} ${city}: lead ready ${(r.ready - r.dlg).toFixed(0)} ms after dialog; lead ${r.src} natural ${r.nw}px in ${r.cw} CSS px tile; webp requested by hover+300ms: ${atHover}, total after open: ${webp.length} [${webp.join(' ')}]`)
    await page.keyboard.press('Escape')
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 }).catch(() => {})
  }
  await ctx.close()
}
await browser.close()
