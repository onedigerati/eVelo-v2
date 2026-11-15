// Stage 3 probe: Atlas docked pill (checks 1-3), compare vs HEAD (check 4), stage 1 re-run.
// Modes: atlas | compare | stage1   (OUT = evidence dir, NEW / OLD = dev server bases)
const { chromium } = require('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright')
const fs = require('fs')
const path = require('path')
const NEW = process.env.NEW || 'http://localhost:5199'
const OLD = process.env.OLD || 'http://localhost:5198'
const OUT = process.env.OUT
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell'
const log = (...a) => console.log(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '))
const shot = (p, name, opts = {}) => p.screenshot({ path: path.join(OUT, name), ...opts })
const pillShot = async (p, name) => { const l = p.locator('.docked-verdict__pill'); if (await l.count()) await l.first().screenshot({ path: path.join(OUT, name) }) }
const errors = []
const wait = (p, ms) => p.waitForTimeout(ms)

async function open(browser, base, { width, height, mobile = false, touch = mobile, theme = 'light', hash = '#atlas', reduce = false }) {
  const ctx = await browser.newContext({
    viewport: { width, height }, isMobile: mobile, hasTouch: touch, deviceScaleFactor: 2,
    colorScheme: theme, reducedMotion: reduce ? 'reduce' : 'no-preference',
  })
  await ctx.addInitScript(() => { window.__jump = (y) => window.scrollTo({ top: y, behavior: 'instant' }) })
  const p = await ctx.newPage()
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`[${base} ${width} ${hash}] ${m.text()}`) })
  p.on('pageerror', (e) => errors.push(`[${base} ${width} ${hash}] pageerror ${e.message}`))
  await p.goto(base + '/' + hash)
  await settled(p, hash === '#atlas')
  await p.evaluate(async (t) => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setTheme(t) }, theme)
  if (hash === '#atlas') await p.waitForSelector('#atlas-tiles .tile, #atlas-tiles > *', { timeout: 30000 })
  await wait(p, 2000)
  return { ctx, p }
}

async function settled(p, atlas) {
  await p.waitForFunction(async (atlas) => {
    const { useStore } = await import('/src/state/store.ts')
    const s = useStore.getState()
    return s.result !== null && s.status !== 'running' && (!atlas || (s.atlas !== null && !s.atlasRunning))
  }, atlas, { timeout: 90000 })
}

async function setDest(p, id, atlas = true) {
  await p.evaluate(async (id) => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setDestination(id) }, id)
  await wait(p, 300)
  await settled(p, atlas)
  await wait(p, 3000) // past the delta flash
}

const storeInfo = (p) => p.evaluate(async () => {
  const { useStore, selectSuccess } = await import('/src/state/store.ts')
  const s = useStore.getState()
  const d = s.inputs.destCityId
  const a = s.atlas?.find((e) => e.cityId === (d ?? s.inputs.homeCityId))
  return { dest: d, home: s.inputs.homeCityId, mainSuccess: selectSuccess(s), mainPct: Math.round(selectSuccess(s) * 100), atlasRowSuccessForCity: a ? a.successRate : null }
})

const geom = (p) => p.evaluate(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }
  const pill = document.querySelector('.docked-verdict__pill')
  const top = document.querySelector('.topbar').getBoundingClientRect().bottom
  const tab = document.querySelector('.tabbar')
  const tabTop = tab && getComputedStyle(tab).display !== 'none' ? tab.getBoundingClientRect().top : null
  const tiles = document.getElementById('atlas-tiles')?.getBoundingClientRect()
  const out = {
    scrollY: Math.round(scrollY), vw: innerWidth, topbarBottom: Math.round(top), tabbarTop: tabTop && Math.round(tabTop),
    tiles: tiles ? { t: Math.round(tiles.top), b: Math.round(tiles.bottom) } : null,
    pillPresent: !!pill, wrapperClass: document.querySelector('.docked-verdict')?.className ?? null,
    hScroll: document.documentElement.scrollWidth > innerWidth,
  }
  if (pill) {
    const pr = pill.getBoundingClientRect()
    const city = pill.querySelector('.verdict-pill__city'), num = pill.querySelector('.verdict-pill__num')
    const nr = num?.getBoundingClientRect()
    Object.assign(out, {
      text: pill.innerText.replace(/\s+/g, ' ').trim(), aria: pill.getAttribute('aria-label'), pillClass: pill.className,
      pill: r(pill), city: r(city), num: r(num), cityText: city?.textContent,
      cityTruncated: city ? city.scrollWidth > city.clientWidth : null,
      numInsidePill: nr ? nr.left >= pr.left && nr.right <= pr.right : null,
      pillInsideViewport: pr.left >= 0 && pr.right <= innerWidth,
      gapBelowTopbar: Math.round(pr.top - top),
      clearOfTabbar: tabTop === null ? null : pr.bottom < tabTop,
      yielding: pill.classList.contains('is-yielding'), inert: pill.inert,
    })
  }
  return out
})

// Put the bottom of #atlas-tiles d px below (+) or above (-) the top bar's bottom.
async function tilesEdge(p, d) {
  await p.evaluate((d) => {
    const top = document.querySelector('.topbar').getBoundingClientRect().bottom
    const b = document.getElementById('atlas-tiles').getBoundingClientRect().bottom
    window.__jump(scrollY + (b - top) - d)
  }, d)
  await wait(p, 700)
}
// Scroll so the element's top sits at y (viewport px).
async function bringTo(p, sel, y) {
  await p.evaluate(([sel, y]) => { const el = document.querySelector(sel); window.__jump(scrollY + el.getBoundingClientRect().top - y) }, [sel, y])
  await wait(p, 700)
}
const hit = (p, x, y) => p.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y)
  return el ? { el: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''), inDocked: !!el.closest('.docked-verdict'), inSheet: !!el.closest('.sheet-root'), inTabbar: !!el.closest('.tabbar'), inZoom: !!el.closest('.wmap__zoom'), inCard: !!el.closest('.city-card') } : null
}, [x, y])
const pillCenter = (p) => p.evaluate(() => { const b = document.querySelector('.docked-verdict__pill')?.getBoundingClientRect(); return b ? { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2, l: b.left, r: b.right, t: b.top, b: b.bottom } : null })

async function verdictNumberOnOutlook(p) {
  await p.evaluate(() => { location.hash = '#outlook' })
  await wait(p, 2500)
  const v = await p.evaluate(() => { const n = document.getElementById('verdict-number'); return { text: n?.textContent?.replace(/\s+/g, ' ').trim(), aria: document.getElementById('verdict-h')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 120) } })
  await p.evaluate(() => { location.hash = '#atlas' })
  await wait(p, 1500)
  await settled(p, true)
  return v
}

// ---------------- Check 1: show / hide / position / odds ----------------
async function check1(browser, label, opts) {
  log(`\n## Check 1 · ${label} · ${opts.theme}`)
  const { ctx, p } = await open(browser, NEW, opts)
  const g0 = await geom(p)
  log('scrollY 0:', { pillPresent: g0.pillPresent, tiles: g0.tiles, topbarBottom: g0.topbarBottom })
  await shot(p, `c1-${label}-${opts.theme}-top.png`)
  await tilesEdge(p, 2)
  const g1 = await geom(p)
  log('tiles bottom 2px below top bar:', { scrollY: g1.scrollY, tiles: g1.tiles, pillPresent: g1.pillPresent })
  await tilesEdge(p, -2)
  const g2 = await geom(p)
  log('tiles bottom 2px behind top bar:', g2)
  const si = await storeInfo(p)
  log('store:', si, 'pill % matches main simulation:', g2.text?.includes(`${si.mainPct}%`))
  await shot(p, `c1-${label}-${opts.theme}-past.png`)
  await pillShot(p, `c1-${label}-${opts.theme}-pill.png`)
  await p.evaluate(() => window.__jump(document.documentElement.scrollHeight / 2)); await wait(p, 700)
  const gm = await geom(p)
  log('mid page:', { scrollY: gm.scrollY, pillPresent: gm.pillPresent, gapBelowTopbar: gm.gapBelowTopbar, pill: gm.pill, yielding: gm.yielding })
  await tilesEdge(p, 2)
  { const gb = await geom(p); log('scrolled back, tiles bottom 2px below top bar:', { scrollY: gb.scrollY, tiles: gb.tiles, topbarBottom: gb.topbarBottom, pillPresent: gb.pillPresent }) }
  await p.evaluate(() => window.__jump(0)); await wait(p, 700)
  log('scrolled back to top:', { pillPresent: (await geom(p)).pillPresent })
  log('Outlook verdict number (same session):', await verdictNumberOnOutlook(p), 'main pct:', si.mainPct)
  // Main vs ranking: overwrite the Atlas ranking's row for the pill's city with 11%; the pill must keep the main odds.
  await tilesEdge(p, -40)
  const fake = await p.evaluate(async () => {
    const { useStore } = await import('/src/state/store.ts'); const s = useStore.getState()
    const id = s.inputs.destCityId ?? s.inputs.homeCityId
    s.setAtlas(s.atlas.map((e) => (e.cityId === id ? { ...e, successRate: 0.11 } : e)), s.atlasAt)
    await new Promise((r) => setTimeout(r, 800))
    const pill = document.querySelector('.docked-verdict__pill')
    const tile = [...document.querySelectorAll('#atlas-tiles > *')].map((t) => t.textContent.replace(/\s+/g, ' ').trim().slice(0, 80))
    return { cityId: id, rankingRowNow: useStore.getState().atlas.find((e) => e.cityId === id).successRate, pillText: pill?.innerText.replace(/\s+/g, ' ').trim(), tiles: tile }
  })
  log('ranking row set to 11% (main stays):', fake)
  await ctx.close()
}

// ---------------- Check 2: tap back + live update ----------------
async function check2(browser, label, opts) {
  log(`\n## Check 2 · ${label}`)
  const { ctx, p } = await open(browser, NEW, opts)
  const touch = !!opts.mobile
  const tapAt = async (x, y) => (touch ? p.touchscreen.tap(x, y) : p.mouse.click(x, y))
  // Tap back from the city list (70% down; mid page can put the map's zoom buttons under the pill, which steps it aside)
  await p.evaluate(() => window.__jump(document.documentElement.scrollHeight * 0.7)); await wait(p, 800)
  const before = await geom(p)
  log('before tap:', { scrollY: before.scrollY, yielding: before.yielding, text: before.text })
  const c = await pillCenter(p)
  await tapAt(c.x, c.y)
  await wait(p, 300)
  await p.waitForFunction(() => new Promise((res) => { const y = scrollY; setTimeout(() => res(scrollY === y), 250) }), null, { timeout: 10000 })
  await wait(p, 400)
  const after = await p.evaluate(() => {
    const top = document.querySelector('.topbar').getBoundingClientRect().bottom
    const t = document.getElementById('atlas-tiles').getBoundingClientRect()
    return { scrollY: Math.round(scrollY), activeId: document.activeElement?.id, tilesTop: Math.round(t.top), tilesBottom: Math.round(t.bottom), topbarBottom: Math.round(top), tilesFullyVisible: t.top >= top && t.bottom <= innerHeight, pillPresent: !!document.querySelector('.docked-verdict__pill') }
  })
  log('tap pill:', { scrollYBefore: before.scrollY, pillWas: before.text, ...after })
  await wait(p, 1000)
  log('1 s later:', await p.evaluate(() => ({ scrollY: Math.round(scrollY), pillPresent: !!document.querySelector('.docked-verdict__pill'), activeId: document.activeElement?.id })))
  await shot(p, `c2-${label}-after-tap.png`)

  // Live update from the list: filter, then tap the row
  const watch = () => p.evaluate(() => {
    window.__seen = { running: false, texts: [], delta: null }
    if (window.__mo) window.__mo.disconnect()
    const check = () => { const pl = document.querySelector('.docked-verdict__pill'); if (!pl) return; if (pl.classList.contains('is-running')) window.__seen.running = true; const t = pl.querySelector('.verdict-pill__city')?.textContent; if (t && window.__seen.texts.at(-1) !== t) window.__seen.texts.push(t); const d = pl.querySelector('.docked-verdict__delta'); if (d) window.__seen.delta = { text: d.textContent, cls: d.className } }
    window.__mo = new MutationObserver(check); window.__mo.observe(document.body, { subtree: true, attributes: true, childList: true, characterData: true })
  })
  await bringTo(p, '.atlas__listcard', 140)
  await p.fill('input[aria-label="Search cities"]', 'Lisbon'); await wait(p, 600)
  await bringTo(p, '.atlas__listcard', 140)
  const gL0 = await geom(p); log('list: pill before choose:', { present: gL0.pillPresent, text: gL0.text })
  const before2 = await storeInfo(p)
  await watch()
  const row = p.locator('.crow__main', { hasText: 'Lisbon' }).first()
  if (touch) await row.tap(); else await row.click()
  await p.waitForSelector('.docked-verdict__pill.is-running', { timeout: 10000 }).then(() => pillShot(p, `c2-${label}-list-running-pill.png`)).catch((e) => log('running ring not captured:', e.message))
  await p.waitForFunction(() => window.__seen.delta, null, { timeout: 60000 })
  await wait(p, 400)
  const gL = await geom(p); const si = await storeInfo(p)
  log('list choose Lisbon:', { seen: await p.evaluate(() => window.__seen), text: gL.text, aria: gL.aria, mainPctBefore: before2.mainPct, mainPctAfter: si.mainPct, dest: si.dest, pillMatchesMain: gL.text?.includes(`${si.mainPct}%`) })
  await pillShot(p, `c2-${label}-list-delta-pill.png`)
  await shot(p, `c2-${label}-list-delta.png`)
  await p.fill('input[aria-label="Search cities"]', ''); await wait(p, 3000)
  await settled(p, true)

  // Live update from the map: tap a marker, then the card's primary button
  const mapCity = 'porto'
  await bringTo(p, '.wmap__stage', 200)
  const g = await geom(p); log('map: pill before:', { present: g.pillPresent, text: g.text })
  const pos = await p.evaluate((id) => { const gg = document.querySelector(`.wmap__svg g[data-id="${id}"]`); if (!gg) return null; const b = gg.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, mapCity)
  log('marker', mapCity, pos)
  await watch()
  await tapAt(pos.x, pos.y); await wait(p, 700)
  const card = await p.evaluate(() => { const c = document.querySelector('.city-card'); return c ? { name: c.querySelector('.city-card__name')?.textContent, btn: c.querySelector('.btn--primary')?.textContent } : null })
  log('city card after marker tap:', card)
  // Mouse: clicking a dot chooses it outright. Touch: the first tap opens the card; tap its "Make destination".
  if (touch) await p.locator('.city-card .btn--primary').tap()
  await p.waitForFunction(() => window.__seen.delta, null, { timeout: 60000 })
  await wait(p, 400)
  if (!touch) await p.mouse.move(5, 5)
  await wait(p, 300)
  const gM = await geom(p); const sM = await storeInfo(p)
  log('map choose', mapCity, ':', { seen: await p.evaluate(() => window.__seen), text: gM.text, yielding: gM.yielding, dest: sM.dest, mainPct: sM.mainPct, pillMatchesMain: gM.text?.includes(`${sM.mainPct}%`) })
  await shot(p, `c2-${label}-map-delta.png`)
  await ctx.close()
}

// ---------------- Check 3: not covering, no tap capture, widths/themes/long name ----------------
async function check3(browser, label, opts) {
  log(`\n## Check 3 · ${label} · ${opts.theme}`)
  const { ctx, p } = await open(browser, NEW, opts)
  const touch = !!opts.mobile
  await setDest(p, 'la-paz')
  await tilesEdge(p, -40)
  const g = await geom(p)
  log('La Paz pill:', { text: g.text, aria: g.aria, pill: g.pill, city: g.city, cityText: g.cityText, cityTruncated: g.cityTruncated, numInsidePill: g.numInsidePill, pillInsideViewport: g.pillInsideViewport, gapBelowTopbar: g.gapBelowTopbar, hScroll: g.hScroll })
  await shot(p, `c3-${label}-${opts.theme}-lapaz.png`)
  await pillShot(p, `c3-${label}-${opts.theme}-lapaz-pill.png`)

  // Tab bar (phone): mid and bottom of page
  for (const where of ['mid', 'bottom']) {
    await p.evaluate((w) => window.__jump(w === 'mid' ? document.documentElement.scrollHeight / 2 : document.documentElement.scrollHeight), where); await wait(p, 800)
    const gg = await geom(p)
    const tabHit = gg.tabbarTop != null ? await p.evaluate(() => { const r = document.querySelector('.tabbar').getBoundingClientRect(); const el = document.elementFromPoint(innerWidth / 2, r.top + r.height / 2); return !!el?.closest('.tabbar') }) : null
    log(`tab bar at ${where}:`, { scrollY: gg.scrollY, pill: gg.pill, tabbarTop: gg.tabbarTop, clearOfTabbar: gg.clearOfTabbar, tabbarCentreHitsTabbar: tabHit })
  }

  // No tap capture outside the pill (list area under it)
  await bringTo(p, '.atlas__listcard', 0)
  await p.evaluate(() => window.__jump(scrollY + 300)); await wait(p, 700)
  const c = await pillCenter(p)
  const pts = { left4: [c.l - 4, c.y], right4: [c.r + 4, c.y], below4: [c.x, c.b + 4], below12: [c.x, c.b + 12], above4: [c.x, c.t - 4], inside: [c.x, c.y] }
  const hits = {}
  for (const [k, [x, y]] of Object.entries(pts)) hits[k] = { x: Math.round(x), y: Math.round(y), ...(await hit(p, x, y)) }
  log('elementFromPoint around pill:', hits)
  await p.evaluate(() => { window.__taps = []; document.addEventListener('click', (e) => window.__taps.push({ inDocked: !!e.target.closest('.docked-verdict'), t: e.target.tagName.toLowerCase() + '.' + String(e.target.className?.baseVal ?? e.target.className).split(' ').join('.') }), true) })
  const sy0 = await p.evaluate(() => scrollY)
  for (const k of ['left4', 'right4', 'below12']) { const [x, y] = pts[k]; touch ? await p.touchscreen.tap(x, y) : await p.mouse.click(x, y); await wait(p, 200) }
  log(`${touch ? 'touch taps' : 'clicks'} beside/below pill reached:`, await p.evaluate(() => window.__taps), { scrollYBefore: Math.round(sy0), scrollYAfter: await p.evaluate(() => Math.round(scrollY)) })
  // close anything a tap opened
  await p.keyboard.press('Escape'); await wait(p, 500)

  // Map zoom buttons under the pill. Mouse parked on the top bar so the map-hover rule doesn't count.
  if (!touch) await p.mouse.move(2, 2)
  const pc = await pillCenter(p) || c
  // Sweep: scroll the zoom buttons through the pill's row in 8px steps and record whether the pill steps aside.
  const sweep = []
  for (let off = -80; off <= 80; off += 8) {
    await p.evaluate(([y, off]) => { const z = document.querySelector('.wmap__zoom').getBoundingClientRect(); window.__jump(scrollY + (z.top + z.height / 2) - y - off) }, [pc.y, off])
    await wait(p, 250)
    sweep.push(await p.evaluate(() => {
      const pl = document.querySelector('.docked-verdict__pill'); const z = document.querySelector('.wmap__zoom').getBoundingClientRect(); const b = pl?.getBoundingClientRect()
      const vOverlap = b ? z.top < b.bottom + 8 && z.bottom > b.top - 8 : null
      const hOverlap = b ? z.left < b.right + 8 && z.right > b.left - 8 : null
      return { zoomTop: Math.round(z.top), zoomX: [Math.round(z.left), Math.round(z.right)], pillX: b ? [Math.round(b.left), Math.round(b.right)] : null, vOverlap, hOverlap, yielding: pl?.classList.contains('is-yielding') ?? null }
    }))
  }
  const inRow = sweep.filter((x) => x.vOverlap)
  log('zoom sweep through the pill row:', { stepsInRow: inRow.length, yieldingInRow: inRow.filter((x) => x.yielding).length, hOverlap: inRow[0]?.hOverlap, yieldingOutsideRow: sweep.filter((x) => !x.vOverlap && x.yielding).length, zoomX: sweep[0]?.zoomX, pillX: sweep[0]?.pillX })
  log('zoom sweep detail:', sweep)
  await p.evaluate((y) => { const z = document.querySelector('.wmap__zoom').getBoundingClientRect(); window.__jump(scrollY + (z.top + z.height / 2) - y) }, pc.y)
  await wait(p, 900)
  const zg = await geom(p)
  const zr = await p.evaluate(() => [...document.querySelectorAll('.wmap__zbtn')].map((b) => { const r = b.getBoundingClientRect(); return { label: b.getAttribute('aria-label'), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } }))
  const zh = []
  for (const z of zr) zh.push({ ...z, hit: await hit(p, z.x, z.y) })
  log('zoom buttons in the pill band:', { pill: zg.pill, yielding: zg.yielding, inert: zg.inert, buttons: zh })
  await shot(p, `c3-${label}-${opts.theme}-zoom.png`)
  if (touch) { const z = zr[0]; await p.touchscreen.tap(z.x, z.y); await wait(p, 600); log('tap zoom-in under pill: still zoom hit, pill yielding:', { yielding: (await geom(p)).yielding }) }
  else { const z = zr[0]; await p.mouse.click(z.x, z.y); await wait(p, 600); log('click zoom-in under pill: pill yielding:', { yielding: (await geom(p)).yielding }) }
  // reset view
  await p.evaluate(() => document.querySelector('.wmap__zbtn:last-child')?.click()); await wait(p, 900)

  // Map city card: open it, then put it under the pill
  await bringTo(p, '.wmap__stage', 250)
  const mpos = await p.evaluate(() => { const gg = document.querySelector('.wmap__svg g[data-id="bangkok"]'); const b = gg.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  touch ? await p.touchscreen.tap(mpos.x, mpos.y) : await p.mouse.click(mpos.x, mpos.y)
  await wait(p, 700)
  const cr = await p.evaluate(() => { const c = document.querySelector('.city-card'); if (!c) return null; const r = c.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), docked: c.classList.contains('is-docked') } })
  log('city card open:', cr)
  if (cr) {
    const pc2 = (await pillCenter(p)) || pc
    // scroll so the card's top region sits in the pill band
    await p.evaluate(([ct, py]) => window.__jump(scrollY + ct + 20 - py), [cr.t, pc2.y]); await wait(p, 900)
    const cg = await geom(p)
    const card = await p.evaluate(() => { const r = document.querySelector('.city-card')?.getBoundingClientRect(); return r ? { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } : null })
    const probeX = card ? Math.max(card.l + 10, Math.min(card.r - 10, cg.pill ? (cg.pill.l + cg.pill.r) / 2 : innerWidth / 2)) : 0
    const probeY = cg.pill ? (cg.pill.t + cg.pill.b) / 2 : 90
    log('city card under the pill band (after scroll):', { card, pill: cg.pill, yielding: cg.yielding, inert: cg.inert, hitAtPillCentreRow: await hit(p, probeX, probeY) })
    await shot(p, `c3-${label}-${opts.theme}-citycard.png`)
    // card opened by a tap with no scroll afterwards: close it, re-tap the marker where it now is
    await p.evaluate(() => document.querySelector('.city-card__close')?.click()); await wait(p, 600)
    const gClosed = await geom(p)
    const m2 = await p.evaluate(() => { const b = document.querySelector('.wmap__svg g[data-id="bangkok"]').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
    let reopened = null
    if (m2.y > gClosed.topbarBottom + 4 && m2.y < 840) {
      touch ? await p.touchscreen.tap(m2.x, m2.y) : await p.mouse.click(m2.x, m2.y)
      await wait(p, 700)
      if (!touch) await p.mouse.move(m2.x, m2.y) // pointer stays on the map
      const gR = await geom(p)
      const cardR = await p.evaluate(() => { const r = document.querySelector('.city-card')?.getBoundingClientRect(); return r ? { t: Math.round(r.top), b: Math.round(r.bottom) } : null })
      reopened = { afterCloseYielding: gClosed.yielding, marker: { x: Math.round(m2.x), y: Math.round(m2.y) }, card: cardR, pill: gR.pill, yielding: gR.yielding }
    } else reopened = { skipped: 'marker not on screen after close', marker: m2 }
    log('card reopened by tap, no scroll:', reopened)
    await p.evaluate(() => document.querySelector('.city-card__close')?.click()); await wait(p, 600)
  }

  // Profile sheet
  await bringTo(p, '.atlas__listcard', 140)
  await p.fill('input[aria-label="Search cities"]', 'Lisbon'); await wait(p, 600)
  const prof = p.locator('button[aria-label*="Lisbon profile"]').first()
  const pc3 = await pillCenter(p)
  log('pill before opening profile:', pc3 && { present: true, y: Math.round(pc3.y) })
  touch ? await prof.tap() : await prof.click()
  await wait(p, 1200)
  const sh = await p.evaluate(() => { const s = document.querySelector('.sheet'); const r = s?.getBoundingClientRect(); return r ? { cls: s.className, t: Math.round(r.top), l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.bottom) } : null })
  const sheetHits = {}
  if (pc3) { sheetHits.pillCentre = await hit(p, pc3.x, pc3.y); sheetHits.pillLeft = await hit(p, pc3.l + 6, pc3.y); sheetHits.pillRight = await hit(p, pc3.r - 6, pc3.y) }
  if (sh) sheetHits.sheetTopRow = await hit(p, (sh.l + sh.r) / 2, sh.t + 20)
  log('profile sheet open:', { sheet: sh, hits: sheetHits })
  await shot(p, `c3-${label}-${opts.theme}-profile.png`)
  await p.keyboard.press('Escape'); await wait(p, 900)
  await p.fill('input[aria-label="Search cities"]', ''); await wait(p, 800)

  // Compare sheet: tick two cities, open it
  for (const name of ['Lisbon', 'Porto']) {
    await p.fill('input[aria-label="Search cities"]', name); await wait(p, 500)
    const cb = p.locator(`input[aria-label="Compare ${name}"]`).first()
    await cb.evaluate((el) => el.closest('label').scrollIntoView({ block: 'center' })); await wait(p, 400)
    touch ? await p.locator(`label.crow__cmp:has(input[aria-label="Compare ${name}"])`).first().tap() : await cb.check({ force: true })
    await wait(p, 300)
  }
  await p.fill('input[aria-label="Search cities"]', ''); await wait(p, 800)
  const pc4 = await pillCenter(p)
  const cbtn = p.locator('.cmp-dock button', { hasText: 'Compare' })
  log('compare dock:', { count: await cbtn.count(), text: await cbtn.first().textContent().catch(() => null), pillPresent: !!pc4 })
  touch ? await cbtn.first().tap() : await cbtn.first().click()
  await wait(p, 1200)
  const sh2 = await p.evaluate(() => { const s = document.querySelector('.sheet'); const r = s?.getBoundingClientRect(); return r ? { cls: s.className, t: Math.round(r.top), l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.bottom) } : null })
  const cHits = {}
  if (pc4) { cHits.pillCentre = await hit(p, pc4.x, pc4.y); cHits.pillLeft = await hit(p, pc4.l + 6, pc4.y); cHits.pillRight = await hit(p, pc4.r - 6, pc4.y) }
  if (sh2) cHits.sheetTopRow = await hit(p, (sh2.l + sh2.r) / 2, sh2.t + 20)
  log('compare sheet open:', { sheet: sh2, hits: cHits })
  await shot(p, `c3-${label}-${opts.theme}-compare.png`)
  await p.keyboard.press('Escape'); await wait(p, 600)
  await ctx.close()
}

// ---------------- Compare vs HEAD (check 4, re-run of stage 2 compare) ----------------
async function scrollNumber(p, d) {
  await p.evaluate((d) => { const top = document.querySelector('.topbar').getBoundingClientRect().bottom; const b = document.getElementById('verdict-number').getBoundingClientRect().bottom; window.__jump(scrollY + (b - top) - d) }, d)
  await wait(p, 700)
}
async function compareShot(browser, label, opts, prep, target) {
  const res = {}
  for (const [k, base] of [['head', OLD], ['new', NEW]]) {
    const { ctx, p } = await open(browser, base, { ...opts, reduce: true })
    if (prep) await prep(p)
    await wait(p, 1200)
    const loc = p.locator(target)
    const n = await loc.count()
    const info = n ? await loc.first().evaluate((el) => { const b = el.getBoundingClientRect(); return { cls: el.className, text: el.innerText.replace(/\s+/g, ' ').trim(), aria: el.getAttribute('aria-label'), rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], parentCls: el.parentElement?.parentElement?.className } }) : null
    const buf = n ? await loc.first().screenshot() : null
    if (buf) fs.writeFileSync(path.join(OUT, `compare-${label}-${k}.png`), buf)
    res[k] = { info, dockedCount: await p.locator('.docked-verdict__pill').count(), buf }
    await ctx.close()
  }
  const same = !!res.head.buf && !!res.new.buf && res.head.buf.equals(res.new.buf)
  log(`compare ${label}: identical pill pixels=${same}`, { head: res.head.info, new: res.new.info, dockedPillsHead: res.head.dockedCount, dockedPillsNew: res.new.dockedCount })
}

// ---------------- Stage 1 re-run: city on the pills ----------------
const pillInfo = (sel) => (el) => {
  const b = el.getBoundingClientRect(); const city = el.querySelector('.verdict-pill__city'); const num = el.querySelector('.verdict-pill__num'); const n = num?.getBoundingClientRect()
  return { text: el.innerText.replace(/\s+/g, ' ').trim(), aria: el.getAttribute('aria-label'), pill: [Math.round(b.left), Math.round(b.right)], cityText: city?.textContent, cityW: city ? Math.round(city.getBoundingClientRect().width) : null, cityTruncated: city ? city.scrollWidth > city.clientWidth : null, numInsidePill: n ? n.left >= b.left && n.right <= b.right : null, pillInsideViewport: b.left >= 0 && b.right <= innerWidth, numBeforeCity: n && city ? n.right <= city.getBoundingClientRect().left : null, cls: el.className }
}
async function stage1(browser) {
  const seq = [[undefined, 'default (bangkok)'], [null, 'staying home'], ['bangkok', 'back to bangkok'], ['la-paz', 'la-paz (longest)']]
  for (const w of [390, 320]) {
    log(`\n## Stage 1 re-run · phone ${w} #plan`)
    const { ctx, p } = await open(browser, NEW, { width: w, height: 844, mobile: true, hash: '#plan' })
    for (const [id, tag] of seq) {
      if (id !== undefined) await setDest(p, id, false)
      log(`${tag}:`, await p.locator('.phone-plan .verdict-pill').first().evaluate(pillInfo()))
    }
    await shot(p, `s1-phone-${w}-lapaz.png`)
    await p.locator('.phone-plan .verdict-pill').first().screenshot({ path: path.join(OUT, `s1-phone-${w}-lapaz-pill.png`) })
    await p.evaluate(async () => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setTheme('dark') }); await wait(p, 600)
    await p.locator('.phone-plan .verdict-pill').first().screenshot({ path: path.join(OUT, `s1-phone-${w}-lapaz-dark-pill.png`) })
    // running ring on the phone Plan pill
    await p.evaluate(() => { window.__r = []; new MutationObserver(() => { const pl = document.querySelector('.phone-plan .verdict-pill'); const v = pl?.classList.contains('is-running'); if (window.__r.at(-1) !== v) window.__r.push(v) }).observe(document.body, { subtree: true, attributes: true, childList: true }) })
    await setDest(p, 'lisbon', false)
    log('phone Plan running ring transitions (setDestination lisbon):', await p.evaluate(() => window.__r), await p.locator('.phone-plan .verdict-pill').first().evaluate(pillInfo()))
    // empty holdings
    await p.evaluate(async () => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().patchInputs({ holdings: [] }) }); await wait(p, 1500)
    log('empty holdings pill:', await p.evaluate(() => { const el = document.querySelector('.phone-plan .verdict-pill'); const b = el?.getBoundingClientRect(); return el ? { html: el.outerHTML, rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], hasCity: !!el.querySelector('.verdict-pill__city') } : null }))
    await ctx.close()
  }
  for (const [w, h, hash, prep, tag] of [
    [1280, 900, '#outlook', (p) => scrollNumber(p, -80), 'desktop 1280 docked'],
    [768, 1000, '#plan', null, 'tablet 768 drawer'],
    [900, 1000, '#plan', null, 'tablet 900 drawer'],
    [1024, 1000, '#plan', null, 'tablet 1024 drawer'],
  ]) {
    log(`\n## Stage 1 re-run · ${tag}`)
    const { ctx, p } = await open(browser, NEW, { width: w, height: h, hash: hash === '#plan' ? '#outlook' : hash })
    if (hash === '#plan') { await p.evaluate(() => { location.hash = '#plan' }); await wait(p, 1500) }
    if (prep) await prep(p)
    for (const [id, t] of seq) {
      if (id !== undefined) await setDest(p, id, false)
      const l = p.locator('.docked-verdict__pill')
      log(`${t}:`, (await l.count()) ? await l.first().evaluate(pillInfo()) : 'no docked pill')
    }
    await shot(p, `s1-${w}-lapaz.png`)
    // delta + ring
    await p.evaluate(() => { window.__s = { running: false, delta: null }; new MutationObserver(() => { const pl = document.querySelector('.docked-verdict__pill'); if (!pl) return; if (pl.classList.contains('is-running')) window.__s.running = true; const d = pl.querySelector('.docked-verdict__delta'); if (d) window.__s.delta = d.textContent }).observe(document.body, { subtree: true, attributes: true, childList: true, characterData: true }) })
    await p.evaluate(async () => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setDestination(null) })
    await p.waitForFunction(() => window.__s.delta, null, { timeout: 60000 }).catch(() => {})
    log('setDestination(null): ring + delta seen:', await p.evaluate(() => window.__s))
    const l = p.locator('.docked-verdict__pill'); if (await l.count()) await l.first().screenshot({ path: path.join(OUT, `s1-${w}-home-delta-pill.png`) })
    await ctx.close()
  }
}

;(async () => {
  const browser = await chromium.launch({ executablePath: EXE })
  const mode = process.argv[2]
  const sizes = { d1280: { width: 1280, height: 900 }, t800: { width: 800, height: 1000 }, p390: { width: 390, height: 844, mobile: true }, p320: { width: 320, height: 640, mobile: true } }
  if (mode === 'atlas') {
    for (const [k, s] of Object.entries(sizes)) for (const theme of ['light', 'dark']) await check1(browser, k, { ...s, theme })
    for (const [k, s] of Object.entries(sizes)) await check2(browser, k, { ...s, theme: 'light' })
  } else if (mode === 'check3') {
    for (const [k, s] of Object.entries(sizes)) for (const theme of ['light', 'dark']) await check3(browser, k, { ...s, theme })
  } else if (mode === 'compare') {
    const past = (p) => scrollNumber(p, -80)
    const drawer = async (p) => { await p.evaluate(() => { location.hash = '#plan' }); await wait(p, 1500) }
    for (const t of ['light', 'dark']) {
      for (const w of [390, 320]) await compareShot(browser, `phone-plan-${w}-${t}`, { width: w, height: 844, mobile: true, theme: t, hash: '#plan' }, null, '.verdict-pill')
      for (const w of [390, 320]) await compareShot(browser, `phone-outlook-${w}-${t}`, { width: w, height: 844, mobile: true, theme: t, hash: '#outlook' }, past, '.docked-verdict__pill')
      const empty = async (p) => { await p.evaluate(async () => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().patchInputs({ holdings: [] }) }) }
      for (const w of [390, 320]) await compareShot(browser, `phone-plan-empty-${w}-${t}`, { width: w, height: 844, mobile: true, theme: t, hash: '#plan' }, empty, '.verdict-pill')
      await compareShot(browser, `desktop-1280-${t}`, { width: 1280, height: 900, theme: t, hash: '#outlook' }, past, '.docked-verdict__pill')
      await compareShot(browser, `tablet-800-${t}`, { width: 800, height: 1000, theme: t, hash: '#outlook' }, past, '.docked-verdict__pill')
      await compareShot(browser, `tablet-800-drawer-${t}`, { width: 800, height: 1000, theme: t, hash: '#outlook' }, drawer, '.docked-verdict__pill')
    }
  } else if (mode === 'stage1') {
    await stage1(browser)
  }
  log('\nconsole errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
