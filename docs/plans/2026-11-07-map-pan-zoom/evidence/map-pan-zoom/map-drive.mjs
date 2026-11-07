import { createRequire } from 'module'
const require = createRequire('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const OUT = process.argv[2] || '.'
const browser = await chromium.launch()
const out = []
const check = (name, ok, detail) => out.push(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`)
const errors = []

async function open(ctxOpts) {
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://localhost:4317/#atlas', { waitUntil: 'networkidle' })
  await page.waitForSelector('.wmap__stage svg g[data-id]')
  await page.waitForFunction(() => !document.querySelector('.wmap.is-loading'), null, { timeout: 30000 })
  await page.locator('.wmap__stage').evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(1200)
  return { ctx, page }
}
// Screen position of a city's marker relative to the stage.
const pos = (page, id) =>
  page.evaluate((id) => {
    const g = document.querySelector(`.wmap__stage svg g[data-id="${id}"]`)
    if (!g) return null
    const m = g.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/)
    return [Number(m[1]), Number(m[2])]
  }, id)
const pair = async (page) => {
  // Two visible cities to measure scale by their distance.
  return page.evaluate(() => [...document.querySelectorAll('.wmap__stage svg g[data-id]')].map((g) => g.dataset.id))
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const neighbour = async (page, id) => {
  const ids = await pair(page)
  const p = await pos(page, id)
  let best = null, bd = Infinity
  for (const j of ids) { if (j === id) continue; const q = await pos(page, j); const d = dist(p, q); if (d > 15 && d < bd) ((bd = d), (best = j)) }
  return best
}
const destOf = (page) => page.evaluate(() => document.querySelector('.wmap__dest-ring')?.closest('g[data-id]')?.dataset.id ?? null)

/* ------------------------------------------------ Desktop mouse */
{
  const { ctx, page } = await open({ viewport: { width: 1400, height: 900 } })
  const stage = await page.locator('.wmap__stage').boundingBox()
  const ids = await pair(page)
  const A = ids.find((i) => i === 'lisbon') ?? ids[0]
  const B = ids.find((i) => i === 'bangkok') ?? ids[ids.length - 1]
  const dest0 = await destOf(page)
  const start = await pos(page, A)
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.waitForTimeout(600)
  const a0 = await pos(page, A)
  // Drag across open ocean (mid-Pacific-ish: left 8% of stage, mid height).
  const sx = stage.x + stage.width * 0.08
  const sy = stage.y + stage.height * 0.55
  await page.mouse.move(sx, sy)
  await page.mouse.down()
  for (let k = 1; k <= 10; k++) await page.mouse.move(sx + 15 * k, sy + 5 * k)
  await page.mouse.up()
  await page.waitForTimeout(300)
  const a1 = await pos(page, A)
  check('mouse drag pans', Math.abs(a1[0] - a0[0] - 150) < 2 && Math.abs(a1[1] - a0[1] - 50) < 2, `${A} moved by ${(a1[0] - a0[0]).toFixed(1)},${(a1[1] - a0[1]).toFixed(1)} for a 150,50 drag`)
  // Drag that starts on a city must not choose it.
  const c0 = await pos(page, A)
  await page.mouse.move(stage.x + c0[0], stage.y + c0[1])
  await page.mouse.down()
  for (let k = 1; k <= 8; k++) await page.mouse.move(stage.x + c0[0] - 10 * k, stage.y + c0[1])
  await page.mouse.up()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Reset map view' }).click()
  await page.waitForTimeout(900)
  check('drag starting on a city does not choose it', (await destOf(page)) === dest0, `dest before ${dest0}, after ${await destOf(page)}`)

  // Ctrl+wheel zoom at cursor.
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.waitForTimeout(600)
  const NB = await neighbour(page, A)
  const pa = await pos(page, A), pb = await pos(page, NB)
  const d0 = dist(pa, pb)
  const cx = stage.x + pa[0], cy = stage.y + pa[1]
  await page.mouse.move(cx, cy)
  const y0 = await page.evaluate(() => scrollY)
  await page.keyboard.down('Control')
  for (let k = 0; k < 3; k++) await page.mouse.wheel(0, -100)
  await page.keyboard.up('Control')
  await page.waitForTimeout(300)
  const pa2 = await pos(page, A), pb2 = await pos(page, NB)
  const d1 = pb2 ? dist(pa2, pb2) : NaN
  check('ctrl+wheel zooms at the cursor', (pb2 ? d1 / d0 > 1.5 : true) && dist(pa2, pa) < 2.5 && // cursor is whole-pixel; marker sub-pixel
     (await page.evaluate(() => scrollY)) === y0,
    `scale ×${(d1 / d0).toFixed(2)}, ${A} drift ${dist(pa2, pa).toFixed(2)}px, page scroll ${y0}→${await page.evaluate(() => scrollY)}`)
  await page.screenshot({ path: `${OUT}/desktop-zoomed.png`, clip: { x: stage.x, y: stage.y - 10, width: stage.width, height: stage.height + 20 } })

  // Plain wheel scrolls the page and shows the hint.
  const y1 = await page.evaluate(() => scrollY)
  await page.mouse.wheel(0, 120)
  await page.waitForTimeout(250)
  const hint = await page.locator('.wmap__hint').textContent().catch(() => null)
  const y2 = await page.evaluate(() => scrollY)
  check('plain wheel scrolls the page with a hint', y2 > y1 && /scroll to zoom/.test(hint ?? ''), `scrollY ${y1}→${y2}, hint "${hint}"`)
  await page.locator('.wmap__stage').evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)

  // Buttons.
  const z0 = await pos(page, A)
  const zb0 = await pos(page, NB)
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await page.waitForTimeout(600)
  const z1 = await pos(page, A), zb1 = await pos(page, NB)
  check('zoom out button', zb0 && zb1 ? dist(z1, zb1) / dist(z0, zb0) < 0.6 : true, `scale ×${zb0 && zb1 ? (dist(z1, zb1) / dist(z0, zb0)).toFixed(2) : '?'}`)
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.waitForTimeout(600)
  const reset = page.getByRole('button', { name: 'Reset map view' })
  const enabledBefore = await reset.isEnabled()
  await reset.click()
  await page.waitForTimeout(900)
  const r1 = await pos(page, A)
  check('reset returns to the start view', enabledBefore && dist(r1, start) < 1.5 && !(await reset.isEnabled()), `${A} at ${r1} vs start ${start}; reset disabled after: ${!(await reset.isEnabled())}`)

  // Plain click on a city still chooses it.
  const tgt = (await pair(page)).find((i) => i !== dest0 && i !== 'lisbon' && i !== 'bangkok')
  const tp = await pos(page, 'lisbon')
  await page.mouse.click(stage.x + tp[0], stage.y + tp[1])
  await page.waitForTimeout(600)
  check('click on a city still chooses it', (await destOf(page)) === 'lisbon', `dest now ${await destOf(page)}`)

  // Region chip still flies, and a pan clamps at the world edge.
  await page.getByRole('button', { name: /^Europe/ }).first().click()
  await page.waitForTimeout(1300)
  const e0 = await pos(page, 'lisbon')
  check('region chip flies to its region', e0 && e0[0] > 0 && e0[0] < stage.width, `Lisbon at ${e0}`)
  await page.screenshot({ path: `${OUT}/desktop-europe.png`, clip: { x: stage.x, y: stage.y - 10, width: stage.width, height: stage.height + 20 } })
  await page.mouse.move(stage.x + stage.width * 0.1, stage.y + 20)
  await page.mouse.down()
  for (let k = 1; k <= 30; k++) await page.mouse.move(stage.x + stage.width * 0.1 + 200 * k, stage.y + 20 + 200 * k)
  await page.mouse.up()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/desktop-clamped.png`, clip: { x: stage.x, y: stage.y - 10, width: stage.width, height: stage.height + 20 } })
  const shot1 = await page.locator('.wmap__canvas').screenshot()
  await page.mouse.move(stage.x + 50, stage.y + 20)
  await page.mouse.down()
  for (let k = 1; k <= 10; k++) await page.mouse.move(stage.x + 50 + 100 * k, stage.y + 20 + 100 * k)
  await page.mouse.up()
  await page.waitForTimeout(300)
  const shot2 = await page.locator('.wmap__canvas').screenshot()
  const land = await page.evaluate(() => {
    const c = document.querySelector('.wmap__canvas')
    const d = c.getContext('2d').getImageData(c.width / 2, c.height / 2, c.width / 2, c.height / 2).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++
    return n
  })
  check('pan is clamped to the world', shot1.equals(shot2) && land > 1000, `second huge drag changed nothing: ${shot1.equals(shot2)}; painted px in lower-right quadrant ${land}`)
  await page.screenshot({ path: `${OUT}/desktop-clamped.png`, clip: { x: stage.x, y: stage.y - 10, width: stage.width, height: stage.height + 20 } })
  await ctx.close()
}

/* ------------------------------------------------ Phone touch */
{
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const cdp = await ctx.newCDPSession(page)
  const stage = await page.locator('.wmap__stage').boundingBox()
  const touch = async (frames, gap = 16) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: frames[0].map(([x, y], id) => ({ x, y, id })) })
    for (const f of frames.slice(1)) {
      await page.waitForTimeout(gap)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: f.map(([x, y], id) => ({ x, y, id })) })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(500)
  }
  const ids = await pair(page)
  const A = ids.includes('lisbon') ? 'lisbon' : ids[0]
  const B = ids.includes('bangkok') ? 'bangkok' : ids[ids.length - 1]
  const ox = stage.x + stage.width * 0.5, oy = stage.y + stage.height * 0.85
  // Horizontal drag pans; page doesn't scroll.
  let y0 = await page.evaluate(() => scrollY)
  let a0 = await pos(page, A)
  await touch(Array.from({ length: 7 }, (_, k) => [[ox - 60 + 5 * k, oy]]))
  let a1 = await pos(page, A)
  check('touch: horizontal drag pans the map', Math.abs(a1[0] - a0[0] - 30) < 1 && (await page.evaluate(() => scrollY)) === y0, `${A} dx ${(a1[0] - a0[0]).toFixed(1)}, scrollY ${y0}→${await page.evaluate(() => scrollY)}`)
  // Vertical swipe scrolls the page; map unchanged.
  y0 = await page.evaluate(() => scrollY)
  a0 = await pos(page, A)
  await touch(Array.from({ length: 13 }, (_, k) => [[ox, oy - 12 * k]]))
  a1 = await pos(page, A)
  const y1 = await page.evaluate(() => scrollY)
  check('touch: vertical swipe scrolls the page, map stays', y1 > y0 + 40 && dist(a0, a1) < 0.5, `scrollY ${y0}→${y1}, ${A} moved ${dist(a0, a1).toFixed(2)}px`)
  await page.locator('.wmap__stage').evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  const st = await page.locator('.wmap__stage').boundingBox()
  // Pinch out.
  let C = null, cd = Infinity
  for (const id of await pair(page)) { const q = await pos(page, id); const d = dist(q, [st.width / 2, st.height / 2]); if (d < cd) ((cd = d), (C = id)) }
  const PB = await neighbour(page, C)
  const pa = await pos(page, C), pb = await pos(page, PB)
  const cx = st.x + st.width / 2, cy = st.y + st.height / 2
  y0 = await page.evaluate(() => scrollY)
  await touch(Array.from({ length: 13 }, (_, k) => [[cx - 30 - 5 * k, cy], [cx + 30 + 5 * k, cy]]))
  const pa2 = await pos(page, C), pb2 = await pos(page, PB)
  const ratio = pa2 && pb2 ? dist(pa2, pb2) / dist(pa, pb) : NaN
  check('touch: two-finger pinch zooms', ratio > 1.6 && (await page.evaluate(() => scrollY)) === y0, `${C}–${PB} distance ×${ratio.toFixed(2)} (finger spread 60→180 px, ×3.0), scrollY ${y0}→${await page.evaluate(() => scrollY)}`)
  await page.screenshot({ path: `${OUT}/phone-pinched.png`, clip: { x: 0, y: st.y - 10, width: 390, height: st.height + 20 } })
  // Tap a city opens the card.
  const ids2 = await pair(page)
  let tapped = null
  for (const id of ids2) {
    const p = await pos(page, id)
    if (p[0] > 30 && p[0] < st.width - 60 && p[1] > 20 && p[1] < st.height - 20) { tapped = [id, p]; break }
  }
  await page.touchscreen.tap(st.x + tapped[1][0], st.y + tapped[1][1])
  await page.waitForTimeout(500)
  const card = await page.locator('.city-card').count()
  check('touch: tap on a city opens its card', card === 1, `tapped ${tapped[0]}, cards ${card}`)
  await page.screenshot({ path: `${OUT}/phone-card.png`, fullPage: false })
  await ctx.close()
}
check('no page errors', errors.length === 0, errors.join(' | ') || 'none')
console.log(out.join('\n'))
await browser.close()
