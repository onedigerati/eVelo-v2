import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const BASE = process.argv[2], OUT = process.argv[3]
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
const log = []
const inputs = { homeCityId: 'st-louis', destCityId: 'bangkok', amountOverrides: { bangkok: { housing: 9000 } }, ratioOverrides: { dining: 0.6 } }
for (const theme of ['dark', 'light']) for (const [vw, vh, tag] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: tag === 'phone', hasTouch: tag === 'phone' })
  await ctx.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2', s); sessionStorage.setItem('seeded', '1') } }, JSON.stringify({ inputs, theme, themeV: 2 }))
  const page = await ctx.newPage()
  const errs = []
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('pageerror', (e) => errs.push(String(e)))
  await page.goto(BASE + '#atlas')
  for (const city of ['Bangkok', 'Chiang Rai']) {
    const btn = page.locator(`button[aria-label="View the ${city} profile"]`)
    await btn.first().waitFor({ state: 'attached', timeout: 120000 })
    let clicked = false
    for (const b of await btn.all()) { if (await b.isVisible()) { await b.scrollIntoViewIfNeeded(); await b.click(); clicked = true; break } }
    if (!clicked) { await btn.first().evaluate((b) => b.click()) }
    const list = page.locator('[role="dialog"] .pcats__list')
    await list.waitFor({ timeout: 30000 })
    await page.waitForTimeout(1500) // bar animations
    const info = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')
      const rows = [...d.querySelectorAll('.pcats__row')].map((r) => {
        const v = r.querySelector('.pcats__v').getBoundingClientRect(), b = r.getBoundingClientRect()
        return { cls: r.className, h: Math.round(b.height), vRight: Math.round(v.right), sr: r.querySelector('.sr-only').textContent }
      })
      const sheet = d.querySelector('.pcats__list')
      const overflowEls = [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' && e.closest('.pcats, .pcats__list, .pplan__note')).length
      return { rows, note: [...d.querySelectorAll('.pplan__note')].find((p) => /budget at/.test(p.textContent))?.textContent, docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, listScroll: sheet.scrollWidth - sheet.clientWidth, overflowEls }
    })
    const name = `${city.toLowerCase().replace(/[^a-z]/g, '')}-${tag}-${theme}.png`
    const lb = await list.boundingBox()
    const nb = await page.locator('[role="dialog"] .pplan__note', { hasText: 'budget at' }).boundingBox()
    await list.scrollIntoViewIfNeeded()
    const lb2 = await list.boundingBox(), nb2 = await page.locator('[role="dialog"] .pplan__note', { hasText: 'budget at' }).boundingBox()
    const top = Math.max(0, lb2.y - 40), bottom = nb2.y + nb2.height + 12
    await page.screenshot({ path: `${OUT}/${name}`, clip: { x: Math.max(0, lb2.x - 16), y: top, width: Math.min(vw, lb2.width + 32), height: Math.min(bottom - top, vh - top) } })
    log.push({ shot: name, ...info })
    await page.keyboard.press('Escape')
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 }).catch(() => {})
  }
  // zoomed crop of a marked row in Bangkok for legibility (desktop only)
  log.push({ ctx: `${tag}-${theme}`, consoleErrors: errs })
  await ctx.close()
}
console.log(JSON.stringify(log, null, 1))
await browser.close()
