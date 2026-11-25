// Stage 3 banner: open Lisbon's profile and (1) at 1920x1080 and 2560x1440 sample the banner
// (.pgal__mosaic) height every 50ms while wheel-scrolling down, then back to the top; count shrinks and
// grows. (2) Size the viewport so the profile only just overflows (by ~30, ~70, ~150px), then scroll
// slowly by wheel and by setting scrollTop, counting `.pgal.is-compact` flips with a MutationObserver.
// (3) Strip: screenshot, badge state, "All N photos" opens the viewer; a city with no banner.
// usage: node banner.mjs <baseUrl> <outDir>
import { chromium } from 'playwright'
import fs from 'node:fs'

const [base, outDir] = process.argv.slice(2)
const browser = await chromium.launch()
const result = { sweeps: [], barely: [], strip: [] }
const log = (o) => console.log(JSON.stringify(o))

async function open(w, h, theme = 'light') {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme })
  await ctx.addInitScript((t) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#atlas'); await page.waitForLoadState('networkidle')
  await page.locator('.pick').nth(1).click()
  await page.locator('.prof-sheet .prof').waitFor()
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200)
  return { ctx, page, errors }
}
const state = (page) => page.evaluate(() => {
  const b = document.querySelector('.prof-sheet .sheet__body'), m = document.querySelector('.prof-sheet .pgal__mosaic')
  return { top: Math.round(b.scrollTop), max: b.scrollHeight - b.clientHeight, mosaic: Math.round(m.getBoundingClientRect().height), compact: !!document.querySelector('.pgal.is-compact'), pgalTop: Math.round(document.querySelector('.prof-sheet .pgal').getBoundingClientRect().top - b.getBoundingClientRect().top) }
})
const watchFlips = (page) => page.evaluate(() => {
  window.__flips = []
  window.__flipObs?.disconnect()
  const el = document.querySelector('.prof-sheet .pgal')
  let was = el.classList.contains('is-compact')
  window.__flipObs = new MutationObserver(() => { const now = el.classList.contains('is-compact'); if (now !== was) { window.__flips.push({ t: Math.round(performance.now()), to: now, top: Math.round(el.closest('.sheet__body').scrollTop) }); was = now } })
  window.__flipObs.observe(el, { attributes: true, attributeFilter: ['class'] })
})
const flips = (page) => page.evaluate(() => window.__flips)

// (1) Full sweeps.
for (const [w, h] of [[1920, 1080], [2560, 1440]]) {
  const { ctx, page, errors } = await open(w, h)
  await watchFlips(page)
  const box = await page.locator('.prof-sheet .sheet__body').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.75)
  const samples = []
  const t0 = Date.now()
  const sample = async (phase) => samples.push({ ms: Date.now() - t0, phase, ...(await state(page)) })
  await sample('start')
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(50); await sample('down') }
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(50); await sample('rest') }
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(50); await sample('up') }
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(50); await sample('rest') }
  const heights = samples.map((s) => s.mosaic)
  // Count direction changes in banner height (a shrink run, then a grow run = 2 monotone runs).
  let runs = 0, dir = 0
  for (let i = 1; i < heights.length; i++) { const d = Math.sign(heights[i] - heights[i - 1]); if (d && d !== dir) { runs++; dir = d } }
  const f = await flips(page)
  const r = { w, h, full: Math.max(...heights), strip: Math.min(...heights), heightRuns: runs, flips: f, pgalTopRange: [Math.min(...samples.map((s) => s.pgalTop)), Math.max(...samples.map((s) => s.pgalTop))], errors, samples }
  result.sweeps.push(r)
  log({ sweep: `${w}x${h}`, full: r.full, strip: r.strip, heightRuns: runs, flips: f, pgalTopRange: r.pgalTopRange, heights: heights.join(','), errors })
  await ctx.close()
}

// (2) Barely-overflowing profiles: find the viewport height where overflow is ~N px.
for (const w of [1920, 2560]) for (const target of [30, 70, 150]) {
  // Overflow grows as the viewport shrinks; the sheet's height follows the viewport, so measure once
  // at a tall viewport and solve, then nudge.
  let h = 1440, got = null, ctx, page, errors
  for (let tries = 0; tries < 6; tries++) {
    ;({ ctx, page, errors } = await open(w, h))
    got = (await state(page)).max
    if (Math.abs(got - target) <= 3) break
    h = h + (got - target)
    await ctx.close()
  }
  await watchFlips(page)
  const box = await page.locator('.prof-sheet .sheet__body').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.75)
  const run = {}
  // Slow wheel: 10px ticks down to the bottom, a pause, then back up.
  const tops = []
  for (let i = 0; i < Math.ceil(got / 10) + 4; i++) { await page.mouse.wheel(0, 10); await page.waitForTimeout(40); tops.push(await state(page)) }
  await page.waitForTimeout(600); const atBottomWheel = await state(page)
  for (let i = 0; i < Math.ceil(got / 10) + 4; i++) { await page.mouse.wheel(0, -10); await page.waitForTimeout(40); tops.push(await state(page)) }
  await page.waitForTimeout(600)
  run.wheel = { flips: await flips(page), atBottom: atBottomWheel, end: await state(page) }
  // scrollTop: step by 1px to the bottom (or 200px), hold 2s at each of a few points, then back.
  await watchFlips(page)
  const holdAt = [Math.min(61, got), got]
  for (let t = 0; t <= got + 5; t++) { await page.evaluate((v) => { document.querySelector('.prof-sheet .sheet__body').scrollTop = v }, t); if (t % 5 === 0) await page.waitForTimeout(16) }
  await page.waitForTimeout(2000); const heldBottom = await state(page)
  await page.evaluate((v) => { document.querySelector('.prof-sheet .sheet__body').scrollTop = v }, holdAt[0])
  await page.waitForTimeout(2000); const held61 = await state(page)
  for (let t = got; t >= 0; t--) { await page.evaluate((v) => { document.querySelector('.prof-sheet .sheet__body').scrollTop = v }, t); if (t % 5 === 0) await page.waitForTimeout(16) }
  await page.waitForTimeout(2000)
  run.scrollTop = { flips: await flips(page), heldBottom, held61, end: await state(page) }
  const r = { w, h, overflow: got, target, ...run, errors }
  result.barely.push(r)
  log({ barely: `${w}x${h}`, overflow: got, wheelFlips: run.wheel.flips.length, wheelAtBottom: run.wheel.atBottom, wheelEnd: run.wheel.end, setFlips: run.scrollTop.flips.length, heldBottom, held61, setEnd: run.scrollTop.end, errors })
  await ctx.close()
}

// (3) The strip, both themes at 2560 and 1920: screenshot, badge, "All N photos".
for (const [w, h] of [[2560, 1440], [1920, 1080]]) for (const theme of ['light', 'dark']) {
  const { ctx, page, errors } = await open(w, h, theme)
  await page.evaluate(() => { document.querySelector('.prof-sheet .sheet__body').scrollTop = 400 })
  await page.waitForTimeout(800)
  const s = await state(page)
  const badge = await page.evaluate(() => { const b = document.querySelector('.prof-sheet .pgal__mosaic .podds'); if (!b) return null; const cs = getComputedStyle(b), r = b.getBoundingClientRect(); return { visibility: cs.visibility, opacity: cs.opacity, w: Math.round(r.width), h: Math.round(r.height) } })
  await page.screenshot({ path: `${outDir}/strip-${w}-${theme}.png` })
  const all = page.locator('.prof-sheet .pgal__mosaic').getByRole('button', { name: /All \d+ photos/ })
  const allText = (await all.count()) ? await all.first().innerText() : null
  let viewer = null
  if (allText) {
    await all.first().click(); await page.waitForTimeout(800)
    viewer = await page.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-modal="true"]:not(.prof-sheet), .pview, .pgal-view'); const dialogs = [...document.querySelectorAll('[role="dialog"]')].map((e) => e.getAttribute('aria-label') || e.className); return { dialogs, img: !!document.querySelector('[role="dialog"] img') } })
    await page.screenshot({ path: `${outDir}/strip-viewer-${w}-${theme}.png` })
    await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  }
  const after = await state(page)
  const r = { w, theme, state: s, badge, allText, viewer, afterEscape: after, errors }
  result.strip.push(r); log(r)
  await ctx.close()
}

// (4) No banner: remove .pgal (no profiled city lacks photos) and check the layout at 2560.
{
  const { ctx, page, errors } = await open(2560, 1440)
  const m = await page.evaluate(async () => {
    document.querySelector('.prof-sheet .pgal').remove()
    await new Promise((r) => setTimeout(r, 300))
    const b = document.querySelector('.prof-sheet .sheet__body'), plan = document.querySelector('.prof__plan')
    const box = (e) => { const r = e.getBoundingClientRect(); return { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width) } }
    b.scrollTop = 300
    await new Promise((r) => setTimeout(r, 300))
    return { profCols: getComputedStyle(document.querySelector('.prof')).gridTemplateColumns, sections: [...document.querySelectorAll('.prof__lead, .prof__sec, .prof__plan')].map((e) => ({ cls: e.className, ...box(e) })), planStickyTop: getComputedStyle(plan).top, bodySW: [b.scrollWidth, b.clientWidth], docSW: [document.documentElement.scrollWidth, document.documentElement.clientWidth] }
  })
  await page.evaluate(() => { document.querySelector('.prof-sheet .sheet__body').scrollTop = 0 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/nobanner-2560-light.png` })
  result.noBanner = { ...m, errors }; log({ noBanner: result.noBanner })
  await ctx.close()
}
await browser.close()
fs.writeFileSync(`${outDir}/banner.json`, JSON.stringify(result, null, 1))
