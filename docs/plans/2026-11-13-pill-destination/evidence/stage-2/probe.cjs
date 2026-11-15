// Stage 2 probe: phone Outlook docked pill + regression compare vs HEAD.
const { chromium } = require('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright')
const fs = require('fs')
const path = require('path')
const NEW = process.env.NEW || 'http://localhost:5199'
const OLD = process.env.OLD || 'http://localhost:5198'
const OUT = process.env.OUT
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell'
const log = (...a) => { const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); console.log(s) }
const shot = (p, name, opts = {}) => p.screenshot({ path: path.join(OUT, name), ...opts })
const errors = []

async function open(browser, base, { width, height, mobile, theme = 'light', hash = '#outlook', reduce = false }) {
  const ctx = await browser.newContext({
    viewport: { width, height }, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: 2,
    colorScheme: theme, reducedMotion: reduce ? 'reduce' : 'no-preference',
  })
  const p = await ctx.newPage()
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`[${base} ${width}] ${m.text()}`) })
  p.on('pageerror', (e) => errors.push(`[${base} ${width}] pageerror ${e.message}`))
  await p.goto(base + '/' + hash)
  await p.waitForFunction(async () => {
    const { useStore } = await import('/src/state/store.ts')
    const s = useStore.getState()
    return s.result !== null && s.status !== 'running'
  }, null, { timeout: 60000 })
  await p.evaluate(async (t) => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setTheme(t) }, theme)
  await p.waitForTimeout(800)
  return { ctx, p }
}

async function setDest(p, id) {
  await p.evaluate(async (id) => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setDestination(id) }, id)
  await p.waitForFunction(async () => { const { useStore } = await import('/src/state/store.ts'); const s = useStore.getState(); return s.status !== 'running' && s.result !== null }, null, { timeout: 60000 })
  await p.waitForTimeout(3000) // past the delta flash
}

const geom = (p) => p.evaluate(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }
  const pill = document.querySelector('.docked-verdict__pill')
  const city = pill?.querySelector('.verdict-pill__city')
  const num = pill?.querySelector('.verdict-pill__num')
  const top = document.querySelector('.topbar').getBoundingClientRect().bottom
  const tab = document.querySelector('.tabbar')?.getBoundingClientRect().top ?? null
  const canvas = document.querySelector('.canvas')
  const cs = canvas ? getComputedStyle(canvas) : null
  const vn = document.getElementById('verdict-number').getBoundingClientRect()
  const out = {
    scrollY: Math.round(scrollY), vw: innerWidth, topbarBottom: Math.round(top), tabbarTop: tab && Math.round(tab),
    verdictNumber: { t: Math.round(vn.top), b: Math.round(vn.bottom) },
    pillPresent: !!pill, wrapperClass: document.querySelector('.docked-verdict')?.className ?? null,
  }
  if (pill) {
    const pr = pill.getBoundingClientRect()
    Object.assign(out, {
      text: pill.innerText.replace(/\s+/g, ' ').trim(), aria: pill.getAttribute('aria-label'), pillClass: pill.className,
      pill: r(pill), city: r(city), num: r(num), cityText: city?.textContent,
      cityTruncated: city ? city.scrollWidth > city.clientWidth : null,
      numInsidePill: num ? num.getBoundingClientRect().left >= pr.left && num.getBoundingClientRect().right <= pr.right : null,
      gapBelowTopbar: Math.round(pr.top - top),
      centerOffset: Math.round((pr.left + pr.right) / 2 - innerWidth / 2),
      gutters: cs ? { padL: cs.paddingLeft, padR: cs.paddingRight } : null,
      clearOfTabbar: tab === null ? null : pr.bottom < tab,
      opacity: getComputedStyle(pill.closest('.docked-verdict__slot')).opacity,
    })
  }
  return out
})

async function scrollToNumberEdge(p, deltaPx) {
  // Put the bottom of #verdict-number deltaPx below (+) or above (-) the top bar's bottom.
  await p.evaluate((d) => {
    const top = document.querySelector('.topbar').getBoundingClientRect().bottom
    const b = document.getElementById('verdict-number').getBoundingClientRect().bottom
    window.scrollTo(0, scrollY + (b - top) - d)
  }, deltaPx)
  await p.waitForTimeout(700)
}

async function phoneOutlook(browser, width, theme, dests) {
  log(`\n## Phone ${width}px, #outlook, ${theme}`)
  const { ctx, p } = await open(browser, NEW, { width, height: 844, mobile: true, theme })
  for (const [id, tag] of dests) {
    if (id !== undefined) await setDest(p, id)
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(700)
    const g0 = await geom(p)
    log(`[${tag}] at top:`, { scrollY: g0.scrollY, pillPresent: g0.pillPresent, verdictNumber: g0.verdictNumber, topbarBottom: g0.topbarBottom })
    await scrollToNumberEdge(p, 2)
    const g1 = await geom(p)
    log(`[${tag}] number bottom 2px below top bar:`, { scrollY: g1.scrollY, verdictNumber: g1.verdictNumber, pillPresent: g1.pillPresent })
    await scrollToNumberEdge(p, -2)
    const g2 = await geom(p)
    log(`[${tag}] number bottom 2px behind top bar:`, g2)
    await shot(p, `phone-${width}-${theme}-${tag}.png`)
    if (g2.pillPresent) await p.locator('.docked-verdict__pill').screenshot({ path: path.join(OUT, `phone-${width}-${theme}-${tag}-pill.png`) })
  }
  await ctx.close()
}

async function phoneBehaviour(browser, width) {
  log(`\n## Phone ${width}px, #outlook, behaviour (real taps)`)
  const { ctx, p } = await open(browser, NEW, { width, height: 844, mobile: true, theme: 'light' })
  // Scroll up/down: shows, hides
  await scrollToNumberEdge(p, -40)
  log('scrolled past:', (await geom(p)).pillPresent)
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800)
  log('scrolled back to top:', (await geom(p)).pillPresent)
  // Mid page and bottom: still under top bar, clear of tab bar
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2)); await p.waitForTimeout(800)
  const mid = await geom(p); log('mid page:', { scrollY: mid.scrollY, pill: mid.pill, gapBelowTopbar: mid.gapBelowTopbar, tabbarTop: mid.tabbarTop, clearOfTabbar: mid.clearOfTabbar })
  await shot(p, `phone-${width}-mid-page.png`)
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800)
  const bot = await geom(p); log('page bottom:', { scrollY: bot.scrollY, pill: bot.pill, gapBelowTopbar: bot.gapBelowTopbar, tabbarTop: bot.tabbarTop, clearOfTabbar: bot.clearOfTabbar })
  await shot(p, `phone-${width}-page-bottom.png`)

  // Hit testing beside / below the pill
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 3)); await p.waitForTimeout(800)
  const hits = await p.evaluate(() => {
    const pr = document.querySelector('.docked-verdict__pill').getBoundingClientRect()
    const slot = document.querySelector('.docked-verdict__slot').getBoundingClientRect()
    const cy = (pr.top + pr.bottom) / 2, cx = (pr.left + pr.right) / 2
    const pts = { leftOfPill: [pr.left - 4, cy], rightOfPill: [pr.right + 4, cy], below: [cx, pr.bottom + 4], below12: [cx, pr.bottom + 12], aboveInGap: [cx, pr.top - 4], insidePill: [cx, cy] }
    const out = { slot: { l: Math.round(slot.left), r: Math.round(slot.right), t: Math.round(slot.top), b: Math.round(slot.bottom) } }
    for (const [k, [x, y]] of Object.entries(pts)) {
      const el = document.elementFromPoint(x, y)
      out[k] = { x: Math.round(x), y: Math.round(y), el: el ? el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '') : null, inDocked: !!el?.closest('.docked-verdict') }
    }
    return out
  })
  log('elementFromPoint:', hits)
  // Real taps beside and below: the click lands on content, not on the docked layer
  await p.evaluate(() => { window.__taps = []; document.addEventListener('click', (e) => window.__taps.push({ inDocked: !!e.target.closest('.docked-verdict'), t: e.target.tagName.toLowerCase() + '.' + String(e.target.className).split(' ').join('.') }), true) })
  for (const k of ['leftOfPill', 'rightOfPill', 'below12']) await p.touchscreen.tap(hits[k].x, hits[k].y), await p.waitForTimeout(150)
  log('taps beside/below pill reached:', await p.evaluate(() => window.__taps), 'scrollY after:', await p.evaluate(() => Math.round(scrollY)))
  // Tab bar tap still works (Atlas), then come back
  const tabHit = await p.evaluate(() => { const r = document.querySelector('.tabbar').getBoundingClientRect(); const el = document.elementFromPoint(innerWidth / 2, r.top + r.height / 2); return el.closest('.tabbar') ? 'tabbar' : el.className })
  log('elementFromPoint at tab bar centre:', tabHit)

  log('after taps: focus + pill state:', await p.evaluate(() => { const pl = document.querySelector('.docked-verdict__pill'); const a = document.activeElement; return { active: a?.tagName.toLowerCase() + '.' + String(a?.className?.baseVal ?? a?.className), activeInPlot: !!a?.closest?.('.chart-frame__plot'), pillYielding: pl?.classList.contains('is-yielding'), pillInert: pl?.inert } }))
  await shot(p, `phone-${width}-after-content-taps.png`)
  await p.evaluate(() => window.scrollBy(0, 400)); await p.waitForTimeout(800)
  log('after scrolling 400px on:', await p.evaluate(() => { const pl = document.querySelector('.docked-verdict__pill'); return { pillYielding: pl?.classList.contains('is-yielding'), pillInert: pl?.inert, activeInPlot: !!document.activeElement?.closest?.('.chart-frame__plot') } }))
  // Tap the pill: scroll back and focus the headline
  const before = await p.evaluate(() => Math.round(scrollY))
  await p.locator('.docked-verdict__pill').tap()
  await p.waitForTimeout(1500)
  const after = await p.evaluate(() => {
    const top = document.querySelector('.topbar').getBoundingClientRect().bottom
    const h = document.getElementById('verdict-h').getBoundingClientRect()
    const n = document.getElementById('verdict-number').getBoundingClientRect()
    return { scrollY: Math.round(scrollY), active: document.activeElement?.id, headlineTop: Math.round(h.top), topbarBottom: Math.round(top), numberVisible: n.top >= top && n.bottom <= innerHeight, pillPresent: !!document.querySelector('.docked-verdict__pill') }
  })
  log('tap pill:', { scrollYBefore: before, ...after })
  await shot(p, `phone-${width}-after-tap.png`)

  // Live changes: running ring and delta
  await scrollToNumberEdge(p, -60)
  await p.evaluate(() => {
    window.__seen = { running: false, delta: null }
    const check = () => { const pl = document.querySelector('.docked-verdict__pill'); if (!pl) return; if (pl.classList.contains('is-running')) window.__seen.running = true; const d = pl.querySelector('.docked-verdict__delta'); if (d) window.__seen.delta = { text: d.textContent, cls: d.className } }
    new MutationObserver(check).observe(document.body, { subtree: true, attributes: true, childList: true, characterData: true })
  })
  await p.evaluate(async () => { const { useStore } = await import('/src/state/store.ts'); useStore.getState().setDestination(null) })
  await p.waitForFunction(() => window.__seen.delta, null, { timeout: 60000 })
  await p.waitForTimeout(400)
  log('live change (setDestination(null)) on phone pill:', await p.evaluate(() => window.__seen), await geom(p).then((g) => ({ text: g.text, pill: g.pill })))
  await p.locator('.docked-verdict__pill').screenshot({ path: path.join(OUT, `phone-${width}-delta-pill.png`) })
  await shot(p, `phone-${width}-delta.png`)
  // Running ring captured mid-run
  await p.waitForTimeout(3000)
  await p.evaluate(async () => { window.__seen = { running: false, delta: null }; const { useStore } = await import('/src/state/store.ts'); useStore.getState().setDestination('bangkok') })
  await p.waitForSelector('.docked-verdict__pill.is-running', { timeout: 10000 }).then(() => p.locator('.docked-verdict__pill').screenshot({ path: path.join(OUT, `phone-${width}-running-pill.png`) })).catch((e) => log('running ring not captured:', e.message))
  await p.waitForFunction(() => window.__seen.delta, null, { timeout: 60000 })
  log('live change (setDestination(bangkok)):', await p.evaluate(() => window.__seen))
  await ctx.close()
}

async function compareShot(browser, label, opts, prep, target) {
  const res = {}
  for (const [k, base] of [['head', OLD], ['new', NEW]]) {
    const { ctx, p } = await open(browser, base, { ...opts, reduce: true })
    if (prep) await prep(p)
    await p.waitForTimeout(1200)
    const loc = p.locator(target)
    const n = await loc.count()
    const info = n ? await loc.first().evaluate((el) => { const b = el.getBoundingClientRect(); return { cls: el.className, text: el.innerText.replace(/\s+/g, ' ').trim(), rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], parentCls: el.parentElement?.parentElement?.className } }) : null
    const buf = n ? await loc.first().screenshot() : null
    if (buf) fs.writeFileSync(path.join(OUT, `compare-${label}-${k}.png`), buf)
    await shot(p, `compare-${label}-${k}-page.png`)
    const dockedCount = await p.locator('.docked-verdict__pill').count()
    res[k] = { info, dockedCount, buf }
    await ctx.close()
  }
  const same = !!res.head.buf && !!res.new.buf && res.head.buf.equals(res.new.buf)
  log(`compare ${label}: identical pill pixels=${same}`, { head: res.head.info, new: res.new.info, dockedPillsHead: res.head.dockedCount, dockedPillsNew: res.new.dockedCount })
}

;(async () => {
  const browser = await chromium.launch({ executablePath: EXE })
  const mode = process.argv[2]
  if (mode === 'phone') {
    for (const w of [390, 320]) for (const t of ['light', 'dark'])
      await phoneOutlook(browser, w, t, [[undefined, 'bangkok'], ['la-paz', 'lapaz'], [null, 'home']])
    for (const w of [390, 320]) await phoneBehaviour(browser, w)
  } else if (mode === 'compare') {
    const past = async (p) => { await scrollToNumberEdge(p, -80) }
    const drawer = async (p) => { await p.evaluate(() => { location.hash = '#plan' }); await p.waitForTimeout(1500) }
    for (const t of ['light', 'dark']) {
      for (const w of [390, 320]) await compareShot(browser, `phone-plan-${w}-${t}`, { width: w, height: 844, mobile: true, theme: t, hash: '#plan' }, null, '.verdict-pill')
      await compareShot(browser, `desktop-1280-${t}`, { width: 1280, height: 900, theme: t }, past, '.docked-verdict__pill')
      await compareShot(browser, `tablet-800-${t}`, { width: 800, height: 1000, theme: t }, past, '.docked-verdict__pill')
      await compareShot(browser, `tablet-800-drawer-${t}`, { width: 800, height: 1000, theme: t }, drawer, '.docked-verdict__pill')
    }
    // Phone Plan tab: the docked pill must not render there in the new build either
  }
  log('\nconsole errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
