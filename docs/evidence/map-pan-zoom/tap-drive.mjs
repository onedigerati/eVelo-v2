import { createRequire } from 'module'
const require = createRequire('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const [URL, OUT] = process.argv.slice(2)
const browser = await chromium.launch()
const out = []
const check = (n, ok, d) => out.push(`${ok ? 'PASS' : 'FAIL'} ${n} — ${d}`)
const errs = []
for (const [label, opts] of [
  ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['tablet', { viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const page = await (await browser.newContext(opts)).newPage()
  page.on('pageerror', (e) => errs.push(String(e)))
  await page.goto(URL + '#atlas', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelector('.wmap') && !document.querySelector('.wmap.is-loading'), null, { timeout: 60000 })
  await page.locator('.wmap__stage').evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(1500)
  const st = await page.locator('.wmap__stage').boundingBox()
  const dots = await page.evaluate(() => [...document.querySelectorAll('.wmap__stage svg g[data-id]')].map((g) => { const m = g.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/); return [g.dataset.id, +m[1], +m[2]] }))
  const pick = (f) => dots.filter(f).sort((a, b) => Math.abs(a[1] - st.width / 2) - Math.abs(b[1] - st.width / 2))[0]
  for (const [where, d] of [['top half', pick((d) => d[2] > 25 && d[2] < st.height * 0.4)], ['bottom half', pick((d) => d[2] > st.height * 0.6 && d[2] < st.height - 15)]]) {
    if (!d) { out.push(`SKIP ${label} ${where}: no dot`); continue }
    await page.touchscreen.tap(st.x + d[1], st.y + d[2])
    await page.waitForTimeout(500)
    const c = page.locator('.city-card')
    const n = await c.count()
    const box = n ? await c.boundingBox() : null
    const name = n ? await c.locator('b').first().textContent() : null
    const dx = st.x + d[1], dy = st.y + d[2]
    const covers = box && dx > box.x - 6 && dx < box.x + box.width + 6 && dy > box.y - 6 && dy < box.y + box.height + 6
    const posn = n ? await c.evaluate((e) => getComputedStyle(e).position) : null
    const inView = box && box.x >= 0 && box.x + box.width <= opts.viewport.width
    if (label === 'phone') {
      const belowMap = box && box.y >= st.y + st.height
      check(`phone: tap a ${where} dot opens the card docked below the map`, n === 1 && posn === 'relative' && belowMap && inView, `tapped ${d[0]}, card "${name}", position ${posn}, card top ${box?.y.toFixed(0)} vs map bottom ${(st.y + st.height).toFixed(0)}`)
    } else {
      check(`${label}: tap a ${where} dot opens a floating bubble beside it`, n === 1 && posn === 'absolute' && !covers && inView, `tapped ${d[0]}, card "${name}", position ${posn}, covers dot ${!!covers}, card x ${box?.x.toFixed(0)}–${(box?.x + box?.width).toFixed(0)} y ${box?.y.toFixed(0)}–${(box?.y + box?.height).toFixed(0)}, dot ${dx.toFixed(0)},${dy.toFixed(0)}`)
    }
    await page.screenshot({ path: `${OUT}/tap-${label}-${where.replace(' ', '-')}.png`, clip: { x: 0, y: Math.max(0, st.y - 300), width: opts.viewport.width, height: Math.min(opts.viewport.height, st.height + 600) } })
    // close button
    await page.getByRole('button', { name: 'Close' }).tap()
    await page.waitForTimeout(400)
    check(`${label}: close button closes it (${where})`, (await page.locator('.city-card').count()) === 0, '')
  }
  // second tap chooses
  const d = pick((d) => d[2] > 25 && d[2] < st.height - 15)
  await page.touchscreen.tap(st.x + d[1], st.y + d[2]); await page.waitForTimeout(400)
  const hint = await page.locator('.city-card__hint').textContent().catch(() => null)
  await page.touchscreen.tap(st.x + d[1], st.y + d[2]); await page.waitForTimeout(800)
  const dest = await page.evaluate(() => document.querySelector('.wmap__dest-ring')?.closest('g[data-id]')?.dataset.id)
  check(`${label}: second tap on the same dot chooses it`, dest === d[0], `hint "${hint}", dest now ${dest} (tapped ${d[0]})`)
  // tap empty map closes
  const d2 = pick((x) => x[0] !== d[0] && x[2] > 25 && x[2] < st.height - 15)
  await page.touchscreen.tap(st.x + d2[1], st.y + d2[2]); await page.waitForTimeout(400)
  await page.touchscreen.tap(st.x + 6, st.y + st.height - 6); await page.waitForTimeout(400)
  check(`${label}: tap on empty map closes the bubble`, (await page.locator('.city-card').count()) === 0, '')
}
check('no page errors', errs.length === 0, errs.join(' | ') || 'none')
console.log(out.join('\n'))
await browser.close()
