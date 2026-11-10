// Stage 1 probe: hero-tile glow geometry, colour, hit-testing, clipping, states, picks.
import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')

const NEW = 'http://localhost:4318/'
const BASE = 'http://localhost:4319/'
const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1/'
const out = { runs: [], console: [] }
const log = (...a) => { console.log(...a) }

// Holds worker -> page messages while window.__hold is true, so loading / re-ranking states can be captured.
const HOLD = `(() => {
  window.__hold = !!window.__holdAtStart; const q = [];
  const W = window.Worker;
  window.Worker = class extends W {
    constructor(...a) { super(...a); this.addEventListener('message', (e) => {
      if (window.__hold && !e.__replay) { e.stopImmediatePropagation(); q.push([this, e.data]) } }) }
  };
  window.__release = () => { window.__hold = false; for (const [w, d] of q.splice(0)) { const ev = new MessageEvent('message', { data: d }); ev.__replay = true; w.dispatchEvent(ev) } };
})()`

const MEASURE = () => {
  const desc = (el) => el ? `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''}` : null
  const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2]
  const visible = (el) => el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0
  return [...document.querySelectorAll('.atile')].map((tile) => {
    const tr = tile.getBoundingClientRect()
    const tcs = getComputedStyle(tile)
    const after = getComputedStyle(tile, '::after'), before = getComputedStyle(tile, '::before')
    const res = {
      eyebrow: tile.querySelector('.t-eyebrow')?.textContent,
      city: tile.querySelector('.atile__name')?.textContent ?? null,
      tile: { x: tr.left, y: tr.top, w: tr.width, h: tr.height, overflow: tcs.overflow, radius: tcs.borderRadius, tone: tcs.getPropertyValue('--tone').trim() },
      tileAfterContent: after.content, tileAfterBg: after.backgroundImage, tileBeforeContent: before.content,
      empty: !!tile.querySelector('.atile__empty'), skeleton: !!tile.querySelector('.atile__skel'),
    }
    const fig = tile.querySelector('.atile__fig')
    if (!fig) return res
    const fr = fig.getBoundingClientRect()
    const g = getComputedStyle(fig, '::before')
    const w = parseFloat(g.width), h = parseFloat(g.height)
    const [tx, ty] = (g.translate === 'none' ? '0 0' : g.translate).split(' ').map((v, i) => v.endsWith('%') ? parseFloat(v) / 100 * (i ? h : w) : parseFloat(v))
    const gx = fr.left + parseFloat(g.left) + tx, gy = fr.top + parseFloat(g.top) + ty
    const gc = [gx + w / 2, gy + h / 2]
    const [fx, fy] = centre(fr)
    res.figText = fig.innerText.replace(/\n/g, '')
    res.figColor = getComputedStyle(fig).color
    res.figOpacity = getComputedStyle(fig).opacity
    res.fig = { x: fr.left, y: fr.top, w: fr.width, h: fr.height, isolation: getComputedStyle(fig).isolation, position: getComputedStyle(fig).position }
    res.glow = { content: g.content, w, h, x: gx, y: gy, zIndex: g.zIndex, pointerEvents: g.pointerEvents, bg: g.backgroundImage,
      centre: gc, centreInFig: gc[0] >= fr.left && gc[0] <= fr.right && gc[1] >= fr.top && gc[1] <= fr.bottom,
      offsetFromFigCentre: [+(gc[0] - fx).toFixed(2), +(gc[1] - fy).toFixed(2)],
      extendsPastTile: { left: gx < tr.left, right: gx + w > tr.right, top: gy < tr.top, bottom: gy + h > tr.bottom } }
    // Hit tests: what a click at each point lands on.
    const open = tile.querySelector('.atile__open')
    const hit = (label, el, pt) => {
      if (!el) return
      const [x, y] = pt ?? centre(el.getBoundingClientRect())
      const at = document.elementFromPoint(x, y)
      const want = label === 'action' ? el : (open ?? el)
      res.hits ??= []
      res.hits.push({ label, at: desc(at), ok: !!(at && (at === want || want.contains(at))), expect: desc(want) })
    }
    hit('figure', fig)
    hit('glow-centre', fig, gc)
    hit('name', tile.querySelector('.atile__name'))
    for (const go of tile.querySelectorAll('.atile__go')) if (visible(go)) hit('profile-go(' + go.className.split('--')[1] + ')', go)
    const act = tile.querySelector('.atile__action'); if (visible(act)) hit('action', act)
    return res
  })
}

async function pixels(page, sel, pts) {
  // Screenshot an element, read pixel RGB at tile-local points in the browser.
  const el = page.locator(sel)
  const buf = await el.screenshot({ animations: 'disabled' })
  return page.evaluate(async ({ b64, pts }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const s = img.width / (pts.__w || img.width)
    const r = {}
    for (const [k, v] of Object.entries(pts)) { if (k === "__w") continue; const [px, py] = v; r[k] = [...x.getImageData(Math.round(px * s), Math.round(py * s), 1, 1).data].slice(0, 3) }
    return r
  }, { b64: buf.toString('base64'), pts })
}

async function settle(page) {
  await page.waitForSelector('.atlas__status.is-done', { timeout: 90000 })
  await page.waitForTimeout(1800) // count-up + entrance animations
}

async function glowPixels(page, tag, m) {
  // Hide the digits so the glow itself is sampled; compare glow centre to the tile's top-right corner and a clean bottom-left spot.
  const style = await page.addStyleTag({ content: '.atile__fig > *{visibility:hidden!important}' })
  const res = []
  const tiles = await page.$$('.atile')
  for (let i = 0; i < m.length; i++) {
    const t = m[i]; if (!t.glow) { res.push({ eyebrow: t.eyebrow, glow: false }); continue }
    await tiles[i].evaluate((el, i) => el.setAttribute('data-probe', i), i)
    const lx = t.glow.centre[0] - t.tile.x, ly = t.glow.centre[1] - t.tile.y
    const px = await pixels(page, `[data-probe="${i}"]`, { __w: t.tile.w, glowCentre: [lx, ly], glowEdge90: [lx + t.glow.w * 0.45, ly], topRightCorner: [t.tile.w - 22, 22], topRightCorner2: [t.tile.w - 50, 40] })
    res.push({ eyebrow: t.eyebrow, tone: t.tile.tone, ...px })
  }
  await style.evaluate((s) => s.remove())
  return res
}

const b = await chromium.launch()
async function newPage({ url = NEW, theme, width, holdAtStart = false, dest }) {
  const ctx = await b.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, colorScheme: theme })
  await ctx.addInitScript(`window.__holdAtStart=${holdAtStart};` + HOLD)
  await ctx.addInitScript(({ theme }) => { if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ theme, themeV: 2 })) }, { theme })
  const page = await ctx.newPage()
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') out.console.push(`[${theme} ${width}] ${msg.type()}: ${msg.text()}`) })
  page.on('pageerror', (e) => out.console.push(`[${theme} ${width}] pageerror: ${e.message}`))
  await page.goto(url + '#atlas')
  return page
}
async function setDest(page, name) {
  // Click the city's row (rows in collapsed tiers are clicked through the DOM).
  await page.evaluate((name) => {
    const b = [...document.querySelectorAll('.crow__main')].find((x) => x.getAttribute('aria-label').includes(` ${name},`) || x.getAttribute('aria-label').startsWith(name + ','))
    b.click()
  }, name)
  await page.waitForTimeout(1500)
}

for (const theme of ['dark', 'light']) for (const width of [1280, 390]) {
  const tag = `${theme}-${width}`
  log('==', tag)
  const page = await newPage({ theme, width })
  await settle(page)
  const html = await page.evaluate(() => document.documentElement.dataset.theme)
  // Three tones: default dest Bangkok (80%); then Bogotá (75%) and London (42%) as destination.
  for (const [label, dest] of [['default', null], ['dest-75', 'Bogotá'], ['dest-42', 'London']]) {
    if (dest) await setDest(page, dest)
    const m = await page.evaluate(MEASURE)
    const px = await glowPixels(page, tag, m)
    await page.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${tag}-${label}.png`, animations: 'disabled' })
    out.runs.push({ build: 'new', tag, htmlTheme: html, state: label, tiles: m, pixels: px })
  }
  // Click-through: the figure opens the profile; "Make destination" acts.
  const figBox = await page.locator('.atile').first().locator('.atile__fig').boundingBox()
  await page.mouse.click(figBox.x + figBox.width / 2, figBox.y + figBox.height / 2)
  await page.waitForTimeout(800)
  const profileOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
  const dialogLabel = await page.evaluate(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-label') ?? document.querySelector('[role="dialog"] h2, [role="dialog"] h1')?.textContent)
  await page.keyboard.press('Escape'); await page.waitForTimeout(600)
  let actionResult = null
  const act = page.locator('.atile').first().locator('.atile__action')
  if (await act.isVisible()) {
    const bb = await act.boundingBox()
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await page.waitForTimeout(1200)
    actionResult = await page.evaluate(() => document.querySelectorAll('.atile')[2].querySelector('.atile__name')?.textContent)
  }
  out.runs.push({ build: 'new', tag, state: 'clicks', clickFigureOpensProfile: profileOpen, dialog: dialogLabel, makeDestinationThenDestTile: actionResult })
  // Empty: clear destination by choosing home.
  await page.evaluate(() => [...document.querySelectorAll('.crow__main')].find((x) => x.getAttribute('aria-label').includes('your home'))?.click())
  await page.waitForTimeout(1200)
  {
    const m = await page.evaluate(MEASURE)
    const px = await glowPixels(page, tag, m)
    await page.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${tag}-empty.png`, animations: 'disabled' })
    out.runs.push({ build: 'new', tag, state: 'empty', tiles: m, pixels: px })
  }
  // Re-ranking (dimmed): hold worker replies, change the budget on the Plan page, come back.
  await setDest(page, 'Bogotá')
  await page.evaluate(() => { window.__hold = true; location.hash = '#plan' })
  await page.waitForSelector('#budget-total')
  await page.fill('#budget-total', '$118,000'); await page.press('#budget-total', 'Tab')
  await page.waitForTimeout(300)
  await page.evaluate(() => { location.hash = '#atlas' })
  await page.waitForSelector('.atlas.is-running', { timeout: 10000 })
  await page.waitForTimeout(1500)
  {
    const m = await page.evaluate(MEASURE)
    await page.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${tag}-reranking.png` })
    out.runs.push({ build: 'new', tag, state: 'reranking', isRunning: await page.evaluate(() => document.querySelector('.atlas').classList.contains('is-running')), tiles: m })
  }
  await page.evaluate(() => window.__release())
  await page.close()
  // Loading (skeleton): hold worker replies from the start.
  const lp = await newPage({ theme, width, holdAtStart: true })
  await lp.waitForSelector('.atile__skel'); await lp.waitForTimeout(1500)
  {
    const m = await lp.evaluate(MEASURE)
    await lp.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${tag}-loading.png` })
    out.runs.push({ build: 'new', tag, state: 'loading', status: await lp.locator('.atlas__status').innerText(), tiles: m })
  }
  await lp.close()
  // Picks: new vs HEAD build, same state (default inputs, Bangkok destination).
  for (const [build, url] of [['new', NEW], ['head', BASE]]) {
    const pp = await newPage({ url, theme, width })
    await settle(pp)
    await pp.mouse.move(0, 0)
    const shot = await pp.locator('.picks').screenshot({ path: `${EV}picks-${tag}-${build}.png`, animations: 'disabled' })
    if (build === 'head') await pp.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${tag}-default-HEAD.png`, animations: 'disabled' })
    out.runs.push({ build, tag, state: 'picks', bytes: shot.length })
    await pp.close()
  }
}
await b.close()
fs.writeFileSync(EV + 'probe.json', JSON.stringify(out, null, 2))
log('console:', out.console)
