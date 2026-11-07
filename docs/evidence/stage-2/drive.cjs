// Stage 2 verification driver. Run against `vite preview --port 4181` of the current build:
//   node docs/evidence/stage-2/drive.cjs > docs/evidence/stage-2/browser-run.txt
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = 'http://localhost:4181/'
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/'
const BODY =
  'A portfolio that grows faster than the loan against it never has to be sold. Spend the loan, keep the shares, leave them to your heirs. eVelo runs your plan through thousands of real market histories and counts how many actually reach escape velocity.'
const VP = {
  d1280: { width: 1280, height: 800 },
  d1440: { width: 1440, height: 900 },
  p390: { width: 390, height: 844 },
  p360: { width: 360, height: 780 },
}
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
let fails = 0
const expect = (cond, msg) => { if (!cond) fails++; log(`  ${cond ? 'OK  ' : 'FAIL'} ${msg}`) }
const consoleErrors = []
let loads = 0

async function ctx(browser, vp, opts = {}) {
  const phone = vp.startsWith('p')
  const c = await browser.newContext({
    viewport: VP[vp], deviceScaleFactor: 1, isMobile: phone, hasTouch: phone,
    colorScheme: opts.scheme || 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  })
  const p = await c.newPage()
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${vp}] ${p.url()} ${m.text()}`) })
  p.on('pageerror', (e) => consoleErrors.push(`[${vp}] pageerror ${p.url()} ${e.message}`))
  return { c, p }
}
async function open(browser, vp, opts) {
  const r = await ctx(browser, vp, opts)
  await r.p.goto(BASE)
  await r.p.waitForSelector('.landing')
  loads++
  return r
}
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()

// ---------- contrast helpers ----------
function lum([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }

/** Text colour + glyph boxes (page coords) for each sampled element. */
async function textTargets(p) {
  return p.evaluate(() => {
    const T = {
      headline: '.landing__headline', accent: '.landing__headline em', body: '.landing__body',
      ctaPrimary: '.landing__cta--primary', ctaLink: '.landing__cta--link', open: '.landing__open',
      wordmark: '.landing__header a, .landing__header .wordmark', legend: '.landing__legend',
      thresholdLabel: '.landing__threshold-label',
    }
    const out = {}
    for (const [k, sel] of Object.entries(T)) {
      const el = document.querySelector(sel)
      if (!el) { out[k] = null; continue }
      const boxes = []
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let n
      while ((n = walker.nextNode())) {
        if (k === 'headline' && n.parentElement.closest('em')) continue // accent sampled separately
        if (!n.textContent.trim()) continue
        const r = document.createRange(); r.selectNodeContents(n)
        for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) boxes.push({ x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height })
      }
      const cs = getComputedStyle(k === 'headline' ? el : (n = el, el))
      const color = k === 'thresholdLabel' ? cs.fill : cs.color
      out[k] = { color, opacity: k === 'thresholdLabel' ? cs.fillOpacity : '1', boxes }
    }
    return out
  })
}
/** Sample every pixel inside each box of a PNG (base64) using a canvas in the page. */
async function samplePixels(p, b64, targets) {
  return p.evaluate(async ({ b64, targets }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0)
    const res = {}
    for (const [k, t] of Object.entries(targets)) {
      if (!t) continue
      const px = []
      for (const b of t.boxes) {
        const x0 = Math.max(0, Math.floor(b.x)), y0 = Math.max(0, Math.floor(b.y))
        const w = Math.min(cv.width - x0, Math.ceil(b.w)), h = Math.min(cv.height - y0, Math.ceil(b.h))
        if (w <= 0 || h <= 0) continue
        const d = g.getImageData(x0, y0, w, h).data
        for (let i = 0; i < d.length; i += 4) px.push(d[i] << 16 | d[i + 1] << 8 | d[i + 2])
      }
      res[k] = px
    }
    return res
  }, { b64, targets })
}
const parseRgb = (s) => s.match(/[\d.]+/g).slice(0, 4).map(Number)

async function contrast(p, label) {
  await p.evaluate(() => scrollTo(0, 0))
  const targets = await textTargets(p)
  // Hide text only (keep chips, buttons, scrim, field), then screenshot the real background.
  await p.addStyleTag({ content: `.landing__frame, .landing__frame * { color: transparent !important; text-decoration-color: transparent !important; } .landing__threshold-label { fill-opacity: 0 !important; }`.trim() })
  await p.waitForTimeout(300)
  const png = await p.screenshot({ fullPage: true })
  await p.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('color: transparent !important')) s.remove() }))
  const px = await samplePixels(p, png.toString('base64'), targets)
  const rows = []
  let min = Infinity
  for (const [k, t] of Object.entries(targets)) {
    if (!t || !px[k] || !px[k].length) { rows.push(`    ${k}: not found`); continue }
    const [r, g, b, a = 1] = parseRgb(t.color)
    const op = a * Number(t.opacity)
    const counts = new Map()
    let worst = Infinity, worstBg = null
    const ratios = []
    for (const v of px[k]) {
      const bg = [v >> 16 & 255, v >> 8 & 255, v & 255]
      const fg = [r, g, b].map((c, i) => c * op + bg[i] * (1 - op))
      const cr = ratio(fg, bg)
      ratios.push(cr)
      if (cr < worst) { worst = cr; worstBg = bg }
    }
    ratios.sort((m, n) => m - n)
    const p01 = ratios[Math.floor(ratios.length * 0.01)]
    const med = ratios[Math.floor(ratios.length / 2)]
    if (k !== 'thresholdLabel') min = Math.min(min, worst)
    rows.push(`    ${k.padEnd(14)} text ${t.color} op ${op}  worst ${worst.toFixed(2)} (bg rgb(${worstBg})) · p1 ${p01.toFixed(2)} · median ${med.toFixed(2)} · ${ratios.length} px${k === 'thresholdLabel' ? '  [decorative SVG label, not counted]' : ''}`)
  }
  log(`  contrast ${label}:`)
  rows.forEach(log)
  log(`  -> minimum over text: ${min.toFixed(2)}`)
  return min
}

;(async () => {
  const browser = await chromium.launch()
  const contrastMins = {}

  // ================= Check 1: content, header, CTAs =================
  log('\n================ CHECK 1 · content, header, CTA routes ================')
  for (const vp of ['d1280', 'd1440', 'p390']) {
    log(`\n[${vp}] fresh context, bare URL`)
    const { c, p } = await open(browser, vp)
    const s = await p.evaluate(() => ({
      hash: location.hash,
      logo: !!document.querySelector('.landing__mark') && document.querySelector('.landing__mark').getBoundingClientRect().width,
      h1: document.querySelector('.landing h1')?.textContent,
      em: document.querySelector('.landing h1 em')?.textContent,
      body: document.querySelector('.landing__body')?.textContent,
      ctas: [...document.querySelectorAll('.landing__cta')].map((a) => [a.textContent, a.getAttribute('href')]),
      legend: [...document.querySelectorAll('.landing__key')].map((k) => k.textContent),
      wordmark: document.querySelector('.landing__header')?.firstElementChild?.textContent,
      toggle: [...document.querySelectorAll('.landing__actions [aria-label]')].map((e) => e.getAttribute('aria-label')),
      open: [document.querySelector('.landing__open')?.textContent, document.querySelector('.landing__open')?.getAttribute('href')],
      topbar: !!document.querySelector('.topbar'), tabbar: !!document.querySelector('.tabbar'),
    }))
    log('  ' + JSON.stringify(s))
    expect(s.logo > 0, `logo rendered (${s.logo}px wide)`)
    expect(norm(s.h1) === 'Reach escape velocity.' && norm(s.em) === 'escape velocity.', 'headline "Reach *escape velocity.*" with em on "escape velocity."')
    expect(norm(s.body) === BODY, 'body copy equals the plan Decisions copy exactly (whitespace-normalised)')
    expect(norm(s.ctas[0]?.[0]) === 'Launch my plan' && norm(s.ctas[1]?.[0]) === 'What is Buy-Borrow-Die?', 'CTA labels')
    expect(s.legend.length === 3 && /^Holds/.test(norm(s.legend[0])) && /^Bruised/.test(norm(s.legend[1])) && /^Broken/.test(norm(s.legend[2])), 'legend holds / bruised / broken')
    expect(norm(s.wordmark).includes('eVelo'), 'header wordmark')
    expect(s.toggle.some((t) => /theme/i.test(t)), `theme toggle present (${s.toggle.join(' | ')})`)
    expect(norm(s.open[0]) === 'Open the planner', 'header "Open the planner"')
    expect(!s.topbar && !s.tabbar, 'app top bar / tab bar hidden')
    await p.screenshot({ path: `${OUT}landing-${vp}-light.png`, fullPage: true })
    await c.close()

    for (const [label, sel, want] of [['Launch my plan', '.landing__cta--primary', '#plan'], ['What is Buy-Borrow-Die?', '.landing__cta--link', '#method'], ['Open the planner', '.landing__open', '#plan']]) {
      const { c, p } = await open(browser, vp)
      await p.click(sel)
      await p.waitForTimeout(800)
      const r = await p.evaluate(() => ({ hash: location.hash, landing: !!document.querySelector('.landing'), topbar: !!document.querySelector('.topbar'), method: !!document.querySelector('.method, [class*="method"]'), h1: document.querySelector('h1, h2')?.textContent?.slice(0, 60) }))
      log(`  click "${label}" -> ${JSON.stringify(r)}`)
      expect(r.hash === want && !r.landing, `"${label}" routes to ${want} and leaves the landing`)
      if (want === '#method') { expect(r.method, 'Method view rendered'); if (vp === 'd1280') await p.screenshot({ path: `${OUT}cta-method-${vp}.png` }) }
      if (label === 'Launch my plan' && vp === 'd1280') await p.screenshot({ path: `${OUT}cta-plan-${vp}.png` })
      await c.close()
    }
  }

  // ================= Check 2: paths =================
  log('\n================ CHECK 2 · seeded paths draw in ================')
  {
    const grab = async (vp, opts) => {
      const { c, p } = await open(browser, vp, opts)
      const info = await p.evaluate(() => {
        const paths = [...document.querySelectorAll('.landing__path')]
        const count = {}
        const strokes = {}
        for (const el of paths) {
          const k = el.getAttribute('class').match(/landing__path--(\w+)/)[1]
          count[k] = (count[k] || 0) + 1
          const cs = getComputedStyle(el)
          strokes[k] = `${cs.stroke} @${cs.strokeOpacity} w${cs.strokeWidth}`
        }
        const th = document.querySelector('.landing__threshold')
        const thY = +th.getAttribute('y1')
        const ends = [...document.querySelectorAll('.landing__end')].map((e) => ({ x: +e.getAttribute('cx'), y: +e.getAttribute('cy'), fill: getComputedStyle(e).fill }))
        const brokenLast = [...document.querySelectorAll('.landing__path--broken')].map((e) => e.getAttribute('d').split('L').pop())
        const anim = getComputedStyle(paths[0])
        return {
          n: paths.length, count, strokes, thY, thDash: getComputedStyle(th).strokeDasharray, thStroke: getComputedStyle(th).stroke,
          label: document.querySelector('.landing__threshold-label')?.textContent, ends, brokenLast,
          animName: anim.animationName, animDur: anim.animationDuration, dash: anim.strokeDasharray, pathLength: paths[0].getAttribute('pathLength'),
          ds: paths.map((e) => e.getAttribute('d')),
        }
      })
      return { c, p, info }
    }
    const a = await grab('d1280')
    // mid-animation screenshot ~0.9s after load
    await a.p.waitForTimeout(500)
    const mid = await a.p.evaluate(() => [...document.querySelectorAll('.landing__path')].slice(0, 64).map((e) => parseFloat(getComputedStyle(e).strokeDashoffset)))
    await a.p.screenshot({ path: `${OUT}paths-mid-animation-d1280.png` })
    await a.p.waitForTimeout(5000)
    const done = await a.p.evaluate(() => [...document.querySelectorAll('.landing__path')].map((e) => parseFloat(getComputedStyle(e).strokeDashoffset)))
    await a.p.screenshot({ path: `${OUT}paths-finished-d1280.png` })
    const i = a.info
    log(`  paths ${i.n} · by class ${JSON.stringify(i.count)}`)
    log(`  computed strokes ${JSON.stringify(i.strokes)}`)
    log(`  threshold y=${i.thY} stroke ${i.thStroke} dasharray "${i.thDash}" label "${i.label}"`)
    log(`  coral end dots ${JSON.stringify(i.ends)}`)
    log(`  broken paths' last points ${JSON.stringify(i.brokenLast)}`)
    log(`  animation ${i.animName} ${i.animDur} dasharray "${i.dash}" pathLength=${i.pathLength}`)
    log(`  dashoffset mid-animation (first 64): min ${Math.min(...mid).toFixed(3)} max ${Math.max(...mid).toFixed(3)}; finished: max ${Math.max(...done).toFixed(3)}`)
    expect(i.n === 64, '64 path strokes')
    expect(i.count.holds > (i.count.bruised || 0) + (i.count.broken || 0), `most hold (${i.count.holds})`)
    expect((i.count.bruised || 0) >= 3, `some bruised (${i.count.bruised})`)
    expect((i.count.broken || 0) >= 2 && i.count.broken <= 6, `a few broken (${i.count.broken})`)
    expect(i.ends.length === i.count.broken, 'one coral end dot per broken path')
    expect(i.ends.every((e) => e.y > i.thY), 'every end dot lies past (below) the margin-call line')
    expect(i.brokenLast.every((pt, k) => pt.trim() === `${i.ends[k].x.toFixed(1)} ${i.ends[k].y.toFixed(1)}`), 'each broken path ends exactly on its dot')
    expect(i.thDash !== 'none' && i.thDash !== '', 'margin-call line is dashed')
    expect(i.animName === 'landing-draw', 'draw-in animation applied')
    expect(Math.max(...mid) > 0.05, 'paths still drawing ~0.9 s after load (mid-animation)')
    expect(Math.max(...done) < 0.001, 'all paths fully drawn after ~6 s')
    const b = await grab('d1280')
    expect(JSON.stringify(b.info.ds) === JSON.stringify(i.ds), 'second fresh load: all 64 d attributes identical')
    const cp = await grab('p390')
    expect(JSON.stringify(cp.info.ds) === JSON.stringify(i.ds), 'phone load: d attributes identical')
    // pixel-identical finished pictures across two loads (reduced motion so there's no timing)
    const r1 = await open(browser, 'd1440', { reduced: true }); const s1 = await r1.p.screenshot()
    const r2 = await open(browser, 'd1440', { reduced: true }); const s2 = await r2.p.screenshot()
    expect(s1.equals(s2), 'two loads at 1440x900 give byte-identical screenshots')
    for (const x of [a, b, cp, r1, r2]) await x.c.close()
  }

  // ================= Check 3: theme =================
  log('\n================ CHECK 3 · follows the theme, live toggle, contrast ================')
  for (const vp of ['d1280', 'd1440', 'p390']) {
    for (const scheme of ['light', 'dark']) {
      const { c, p } = await open(browser, vp, { scheme })
      await p.waitForTimeout(5000) // paths finished
      const t = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, holds: getComputedStyle(document.querySelector('.landing__path--holds')).stroke, ink: getComputedStyle(document.querySelector('.landing h1')).color }))
      log(`\n[${vp}] system theme, OS ${scheme}: ${JSON.stringify(t)}`)
      expect(t.theme === 'system', 'theme preference is system on first visit')
      expect(scheme === 'light' ? t.bg === 'rgb(245, 242, 234)' : t.bg === 'rgb(10, 13, 12)', `body is ${scheme === 'light' ? 'paper #f5f2ea' : 'ink #0a0d0c'}`)
      expect(scheme === 'light' ? t.holds === 'rgb(11, 122, 86)' : t.holds === 'rgb(91, 227, 176)', `holds paths ${scheme === 'light' ? 'deeper green #0b7a56' : 'glowing #5be3b0'}`)
      await p.screenshot({ path: `${OUT}theme-system-${scheme}-${vp}.png`, fullPage: true })
      contrastMins[`${vp} ${scheme}`] = await contrast(p, `${vp} system→${scheme}`)
      await c.close()
    }
  }
  // live toggle on the landing
  for (const vp of ['d1280', 'p390']) {
    const { c, p } = await open(browser, vp, { scheme: 'light' })
    await p.evaluate(() => { window.__noReload = 1 })
    const read = () => p.evaluate(() => ({ marker: window.__noReload, theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, holds: getComputedStyle(document.querySelector('.landing__path--holds')).stroke, broken: getComputedStyle(document.querySelector('.landing__path--broken')).stroke, bruised: getComputedStyle(document.querySelector('.landing__path--bruised')).stroke, h1: getComputedStyle(document.querySelector('.landing h1')).color, landing: !!document.querySelector('.landing') }))
    log(`\n[${vp}] live toggle on the landing`)
    log('  start  ' + JSON.stringify(await read()))
    const seq = vp === 'd1280' ? ['Dark theme', 'Light theme', 'System theme'] : ['cycle', 'cycle', 'cycle']
    for (const step of seq) {
      if (step === 'cycle') await p.click('.landing__actions .icon-btn')
      else await p.click(`.landing__actions [aria-label="${step}"]`)
      await p.waitForTimeout(400)
      const r = await read()
      log(`  ${step.padEnd(12)} ${JSON.stringify(r)}`)
      expect(r.marker === 1 && r.landing, 'no reload, still on the landing')
      if (r.theme === 'dark') { expect(r.bg === 'rgb(10, 13, 12)' && r.holds === 'rgb(91, 227, 176)' && r.broken === 'rgb(255, 107, 90)' && r.bruised === 'rgb(227, 178, 98)', 'dark: ink bg, glowing green/brass/coral'); await p.screenshot({ path: `${OUT}toggle-dark-${vp}.png` }) }
      if (r.theme === 'light') { expect(r.bg === 'rgb(245, 242, 234)' && r.holds === 'rgb(11, 122, 86)' && r.broken === 'rgb(210, 69, 47)' && r.bruised === 'rgb(168, 122, 31)', 'light: paper bg, deeper green/brass/coral'); await p.screenshot({ path: `${OUT}toggle-light-${vp}.png` }) }
    }
    const flag = await p.evaluate(() => localStorage.getItem('evelo:v2:entered'))
    expect(flag !== '1', `toggling on the landing does not count as entering (flag=${flag})`)
    await c.close()
  }
  // explicit light/dark chosen in the toggle, then contrast (explicit data-theme selectors)
  for (const theme of ['Light theme', 'Dark theme']) {
    const { c, p } = await open(browser, 'd1280', { scheme: theme === 'Light theme' ? 'dark' : 'light' })
    await p.click(`.landing__actions [aria-label="${theme}"]`)
    await p.waitForTimeout(5000)
    await p.screenshot({ path: `${OUT}theme-explicit-${theme.split(' ')[0].toLowerCase()}-d1280.png` })
    contrastMins[`d1280 explicit ${theme}`] = await contrast(p, `d1280 explicit ${theme} (OS opposite)`)
    await c.close()
  }

  // ================= Check 4: phone =================
  log('\n================ CHECK 4 · phone width ================')
  for (const vp of ['p390', 'p360']) {
    for (const scheme of ['light', 'dark']) {
      const { c, p } = await open(browser, vp, { scheme })
      await p.waitForTimeout(4500)
      const m = await p.evaluate(() => {
        const box = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right) } }
        const pts = ['.landing__headline', '.landing__body', '.landing__cta--primary', '.landing__cta--link', '.landing__legend .landing__key'].map((s) => {
          const r = document.querySelector(s).getBoundingClientRect()
          const el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 10))
          return [s, el ? (el.closest('svg.landing__field') ? 'FIELD' : el.className.baseVal ?? el.className) : null]
        })
        const field = getComputedStyle(document.querySelector('.landing__field'))
        let wide = []
        for (const el of document.querySelectorAll('.landing__frame *')) { const r = el.getBoundingClientRect(); if (r.right > innerWidth + 0.5 || r.left < -0.5) wide.push(el.className?.baseVal ?? el.className) }
        return {
          innerWidth, scrollWidth: document.documentElement.scrollWidth, bodySW: document.body.scrollWidth,
          primary: box('.landing__cta--primary'), link: box('.landing__cta--link'), open: box('.landing__open'), toggle: box('.landing__actions .icon-btn'),
          hitTest: pts, fieldPointer: field.pointerEvents, fieldZ: field.zIndex, overflowing: wide.slice(0, 5),
        }
      })
      log(`\n[${vp} ${scheme}] ${JSON.stringify(m)}`)
      expect(m.scrollWidth <= m.innerWidth && m.bodySW <= m.innerWidth, `no horizontal scroll (scrollWidth ${m.scrollWidth} <= ${m.innerWidth})`)
      expect(m.overflowing.length === 0, 'no landing element extends past the viewport edges')
      expect(m.primary.h >= 44 && m.link.h >= 44, `CTAs >= 44px tall (${m.primary.h}, ${m.link.h})`)
      expect(m.primary.w >= m.innerWidth - 40 - 1, `primary CTA spans the column (${m.primary.w}px)`)
      expect(m.open.h >= 44 && m.toggle.h >= 44, `header targets >= 44px (open ${m.open.h}, toggle ${m.toggle.w}x${m.toggle.h})`)
      expect(m.hitTest.every(([, v]) => v !== 'FIELD') && m.fieldPointer === 'none', 'text and CTAs sit above the field (hit-test never lands on the SVG)')
      await p.screenshot({ path: `${OUT}phone-${vp}-${scheme}.png`, fullPage: true })
      if (vp === 'p390') contrastMins[`${vp} ${scheme} (phone)`] = contrastMins[`${vp} ${scheme}`] ?? (await contrast(p, `${vp} ${scheme}`))
      await c.close()
    }
  }

  // ================= Check 5: reduced motion =================
  log('\n================ CHECK 5 · reduced motion ================')
  for (const [vp, scheme] of [['d1280', 'light'], ['d1280', 'dark'], ['p390', 'light']]) {
    const { c, p } = await ctx(browser, vp, { scheme, reduced: true })
    await p.goto(BASE, { waitUntil: 'domcontentloaded' })
    await p.waitForSelector('.landing__path')
    loads++
    const shot = await p.screenshot({ path: `${OUT}reduced-motion-at-load-${vp}-${scheme}.png` })
    const r = await p.evaluate(() => {
      const ps = [...document.querySelectorAll('.landing__path')]
      const cs = ps.map((e) => getComputedStyle(e))
      return { names: [...new Set(cs.map((s) => s.animationName))], dash: [...new Set(cs.map((s) => s.strokeDasharray))], offs: [...new Set(cs.map((s) => s.strokeDashoffset))], running: document.getAnimations().filter((a) => a.animationName === 'landing-draw').length }
    })
    log(`  [${vp} ${scheme}] ${JSON.stringify(r)}`)
    expect(r.names.length === 1 && r.names[0] === 'none', 'animation-name none on every path')
    expect(r.dash.length === 1 && r.dash[0] === 'none', 'stroke-dasharray none (fully drawn)')
    expect(r.running === 0, 'no landing-draw animations running')
    // compare with a no-preference load after its animation finished
    const n = await open(browser, vp, { scheme })
    await n.p.waitForTimeout(6000)
    const finished = await n.p.screenshot()
    const diff = await p.evaluate(async ({ a, b }) => {
      const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const g = cv.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data }
      const [x, y] = [await load(a), await load(b)]
      let n = 0, max = 0
      for (let k = 0; k < x.length; k += 4) { const d = Math.max(Math.abs(x[k] - y[k]), Math.abs(x[k + 1] - y[k + 1]), Math.abs(x[k + 2] - y[k + 2])); if (d > 8) n++; max = Math.max(max, d) }
      return { differing: n, total: x.length / 4, max }
    }, { a: shot.toString('base64'), b: finished.toString('base64') })
    log(`    reduced-at-load vs animated-after-6s: ${diff.differing}/${diff.total} px differ by >8 (max channel diff ${diff.max})`)
    expect(diff.differing / diff.total < 0.002, 'reduced-motion picture at load matches the finished animated picture')
    await n.c.close(); await c.close()
  }

  // ================= Stage 1 routing regression =================
  log('\n================ Stage 1 routing regression ================')
  for (const vp of ['d1280', 'p390']) {
    const { c, p } = await open(browser, vp)
    const st = () => p.evaluate(() => ({ hash: location.hash, landing: !!document.querySelector('.landing'), topbar: !!document.querySelector('.topbar'), tabbar: !!document.querySelector('.tabbar'), flag: localStorage.getItem('evelo:v2:entered') }))
    let s = await st(); log(`  [${vp}] first visit bare: ${JSON.stringify(s)}`)
    expect(s.landing && !s.topbar && s.flag !== '1', 'first visit to bare URL shows the landing')
    await p.click('.landing__cta--primary'); await p.waitForTimeout(700)
    s = await st(); log(`  [${vp}] after CTA: ${JSON.stringify(s)}`)
    expect(s.hash === '#plan' && !s.landing && s.topbar && s.flag === '1', 'CTA enters the app (#plan, top bar, flag set)')
    if (vp === 'p390') expect(s.tabbar, 'phone tab bar present')
    await p.goto(BASE); await p.reload(); await p.waitForTimeout(800)
    s = await st(); log(`  [${vp}] reload bare: ${JSON.stringify(s)}`)
    expect(!s.landing && s.topbar, 'bare URL after entering opens the planner')
    await p.goto(BASE + '#home'); await p.waitForTimeout(700)
    s = await st(); log(`  [${vp}] #home: ${JSON.stringify(s)}`)
    expect(s.landing, '#home brings the landing back')
    const fresh = await open(browser, vp); await fresh.p.goto(BASE + '#atlas'); await fresh.p.waitForTimeout(800)
    const f = await fresh.p.evaluate(() => ({ landing: !!document.querySelector('.landing'), hash: location.hash }))
    log(`  [${vp}] first visit #atlas: ${JSON.stringify(f)}`)
    expect(!f.landing, 'route hash on first visit goes straight to the app')
    await fresh.c.close(); await c.close()
  }

  // ================= Check 6: console =================
  log('\n================ CHECK 6 · console ================')
  log(`  landing loads: ${loads}; console errors / page errors: ${consoleErrors.length}`)
  consoleErrors.forEach((e) => log('   ' + e))
  expect(consoleErrors.length === 0, 'no console errors')

  log('\n================ contrast minima ================')
  for (const [k, v] of Object.entries(contrastMins)) log(`  ${k.padEnd(32)} ${v.toFixed(2)}`)
  log(`  overall minimum: ${Math.min(...Object.values(contrastMins)).toFixed(2)}`)
  log(`\nFAILS: ${fails}`)
  await browser.close()
  process.exit(fails ? 1 : 0)
})()
