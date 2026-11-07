// Stage 2 (study G landing) verification driver. Run against `vite preview --port 4191` of the current build:
//   node docs/evidence/stage-2/drive.cjs > docs/evidence/stage-2/browser-run.txt
// Expected strings and map data are copied from the design boards (AtlasHero.dc.html / AtlasHeroDark.dc.html),
// not from the product code.
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = 'http://localhost:4191/'
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/'

/* ---------- From the boards ---------- */
const BOARD = {
  nav: ['How it works', 'Atlas', 'Method'],
  open: 'Open the planner',
  eyebrow: 'Buy · Borrow · Die — anywhere in the world',
  h1: 'Live off your portfolio without ever selling it.',
  em: 'without ever selling it.',
  body: 'Borrow against your shares for living money, let them keep compounding, and pass them on with the gains never taxed. eVelo replays your plan through thousands of real market histories, then re-prices it city by city to show where in the world it holds best.',
  ctas: ['Stress-test my plan', 'Explore the Atlas'],
  fine: 'Free · No sign-up · Runs in your browser, nothing leaves your device',
  cardEyebrow: 'One plan · every city',
  cardPlan: '$2.5M · $80k/yr in Austin',
  readEyebrow: 'Lisbon, Portugal',
  readPct: '88% of futures hold',
  readNote: 'vs 63% staying in Austin. The same life costs about 38% less, so you borrow less.',
  foot: ['Breaks Holds', 'Illustrative numbers'],
  steps: [
    ['01', 'Buy', 'Hold assets that grow. Never sell them, so the gains are never taxed.'],
    ['02', 'Borrow', 'Live on a line of credit secured by the portfolio. The loan grows; so, usually, do the shares.'],
    ['03', 'Live anywhere', 'Spend the loan where life costs less. A smaller loan gives the portfolio an easier race to win.'],
    ['04', 'Die', 'Heirs inherit at a stepped-up basis. The estate repays the loan and keeps the rest.'],
  ],
}
const RAW = [
  ['Lisbon', 38.7, -9.1, 88], ['Porto', 41.1, -8.6, 90], ['Valencia', 39.5, -0.4, 85], ['Madrid', 40.4, -3.7, 80],
  ['Athens', 38.0, 23.7, 86], ['Budapest', 47.5, 19.0, 87], ['Prague', 50.1, 14.4, 82], ['Tbilisi', 41.7, 44.8, 92],
  ['Istanbul', 41.0, 29.0, 84], ['Zürich', 47.4, 8.5, 41], ['London', 51.5, -0.1, 52], ['Dubai', 25.2, 55.3, 60],
  ['Bangkok', 13.75, 100.5, 93], ['Chiang Mai', 18.8, 99.0, 95], ['Kuala Lumpur', 3.1, 101.7, 92], ['Bali', -8.65, 115.2, 91],
  ['Taipei', 25.0, 121.5, 80], ['Tokyo', 35.7, 139.7, 72], ['Da Nang', 16.0, 108.2, 95], ['Sydney', -33.9, 151.2, 55],
  ['Mexico City', 19.4, -99.1, 86], ['Playa del Carmen', 20.6, -87.1, 85], ['Medellín', 6.2, -75.6, 92], ['Cartagena', 10.4, -75.5, 89],
  ['Lima', -12.0, -77.0, 88], ['Santiago', -33.4, -70.6, 81], ['Panama City', 9.0, -79.5, 86], ['San José', 9.9, -84.1, 84],
  ['New York', 40.7, -74.0, 38], ['Austin', 30.3, -97.7, 63], ['San Francisco', 37.8, -122.4, 30], ['Miami', 25.8, -80.2, 55],
  ['Cape Town', -33.9, 18.4, 87],
]
const X = (lon) => (lon + 180) * 4
const Y = (lat) => (72 - lat) * 4
const boardBand = (p) => (p >= 80 ? 4 : p >= 65 ? 3 : p >= 45 ? 2 : p >= 35 ? 1 : 0)
const BOARD_LABELS = { Lisbon: 88, Bangkok: 93, 'Medellín': 92, 'New York': 38, Austin: 63, Tbilisi: 92 }
// The app's own outcome scale (src/ui/outcomeScale.ts STOPS), to compare the landing's banding with it.
const STOPS = [[0.3, 0], [0.45, 1], [0.6, 2], [0.65, 2], [0.65, 3], [0.8, 4]]
function appColor(s) {
  if (s <= STOPS[0][0]) return `var(--ramp-0)`
  for (let i = 1; i < STOPS.length; i++) {
    const [s1, b] = STOPS[i], [s0, a] = STOPS[i - 1]
    if (s < s1) { const f = s1 > s0 ? (s - s0) / (s1 - s0) : 1; if (a === b || f <= 0) return `var(--ramp-${a})`; if (f >= 1) return `var(--ramp-${b})`; return `color-mix(in oklch, var(--ramp-${b}) ${(f * 100).toFixed(1)}%, var(--ramp-${a}))` }
  }
  return 'var(--ramp-4)'
}

const VP = {
  1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 800 }, 1000: { width: 1000, height: 800 },
  820: { width: 820, height: 1180 }, 390: { width: 390, height: 844 }, 360: { width: 360, height: 780 },
}
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
let fails = 0
const expect = (cond, msg) => { if (!cond) fails++; log(`  ${cond ? 'OK  ' : 'FAIL'} ${msg}`); return cond }
const consoleErrors = []
let loads = 0
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()

async function ctx(browser, w, opts = {}) {
  const phone = w <= 520
  const c = await browser.newContext({
    viewport: VP[w], deviceScaleFactor: 1, isMobile: phone, hasTouch: phone,
    colorScheme: opts.scheme || 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  })
  const p = await c.newPage()
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${w}] ${p.url()} ${m.text()}`) })
  p.on('pageerror', (e) => consoleErrors.push(`[${w}] pageerror ${p.url()} ${e.message}`))
  return { c, p }
}
async function open(browser, w, opts) {
  const r = await ctx(browser, w, opts)
  await r.p.goto(BASE + (opts && opts.hash ? opts.hash : ''))
  await r.p.waitForSelector('.landing')
  await r.p.evaluate(() => document.fonts.ready)
  await r.p.waitForTimeout(300)
  loads++
  return r
}

/* ---------- Check 1: content ---------- */
async function check1(browser, w) {
  log(`\n[check 1] content as drawn @${w} light`)
  const { c, p } = await open(browser, w)
  const d = await p.evaluate(() => {
    const t = (sel) => document.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim()
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' }
    const wm = document.querySelector('.landing__header .wordmark')
    return {
      wordmark: wm && { href: wm.getAttribute('href'), text: wm.textContent.trim(), label: wm.getAttribute('aria-label') },
      nav: [...document.querySelectorAll('.landing__nav a')].map((a) => ({ t: a.textContent.trim(), href: a.getAttribute('href'), vis: vis(a) })),
      toggle: [...document.querySelectorAll('.landing__actions button')].map((b) => b.getAttribute('aria-label')),
      open: (() => { const a = document.querySelector('.landing__open'); return a && { t: a.textContent.trim(), href: a.getAttribute('href') } })(),
      eyebrow: t('.landing__copy .landing__eyebrow'),
      h1: t('h1'), em: t('h1 em'), h1Count: document.querySelectorAll('h1').length,
      body: t('.landing__body'),
      ctas: [...document.querySelectorAll('.landing__cta')].map((a) => ({ t: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') })),
      fine: t('.landing__fine'),
      cardEyebrow: t('.landing__card-head .landing__eyebrow'), cardPlan: t('.landing__card-plan'),
      readEyebrow: t('.landing__read-text .landing__eyebrow'), readPct: t('.landing__read-pct'), readNote: t('.landing__read-note'),
      foot: [...document.querySelectorAll('.landing__card-foot > span')].map((s) => s.textContent.replace(/\s+/g, ' ').trim()),
      steps: [...document.querySelectorAll('.landing__step')].map((s) => [...s.children].map((x) => x.textContent.trim())),
      stepsId: document.querySelector('.landing__steps')?.id,
      appTopBar: !!document.querySelector('.topbar, .tabbar'),
    }
  })
  expect(d.wordmark && d.wordmark.href === '#home' && d.wordmark.text === 'eVelo', `wordmark "${d.wordmark?.text}" → ${d.wordmark?.href}`)
  expect(JSON.stringify(d.nav.map((n) => n.t)) === JSON.stringify(BOARD.nav), `nav texts ${JSON.stringify(d.nav.map((n) => n.t))}`)
  expect(d.nav[0]?.href === '#how' && d.nav[1]?.href === '#atlas' && d.nav[2]?.href === '#method', `nav hrefs ${d.nav.map((n) => n.href).join(' ')}`)
  log(`  info nav visible: ${d.nav.map((n) => n.vis).join(',')} (expected ${w > 900})`)
  if (w > 900) expect(d.nav.every((n) => n.vis), 'nav visible > 900px')
  else expect(d.nav.every((n) => !n.vis), 'nav folded away ≤ 900px')
  expect(d.toggle.length > 0, `theme toggle present: ${JSON.stringify(d.toggle)}`)
  expect(d.open && d.open.t === BOARD.open && d.open.href === '#plan', `"${d.open?.t}" → ${d.open?.href}`)
  expect(d.eyebrow === BOARD.eyebrow, `eyebrow "${d.eyebrow}"`)
  expect(d.h1 === BOARD.h1 && d.em === BOARD.em && d.h1Count === 1, `h1 "${d.h1}" em "${d.em}"`)
  expect(d.body === BOARD.body, `body paragraph exact (${d.body.length} chars)`)
  expect(d.ctas[0]?.t === BOARD.ctas[0] && d.ctas[0]?.href === '#plan', `CTA1 "${d.ctas[0]?.t}" → ${d.ctas[0]?.href}`)
  expect(d.ctas[1]?.t === BOARD.ctas[1] && d.ctas[1]?.href === '#atlas', `CTA2 "${d.ctas[1]?.t}" → ${d.ctas[1]?.href}`)
  expect(d.fine === BOARD.fine, `fine "${d.fine}"`)
  expect(d.cardEyebrow === BOARD.cardEyebrow && d.cardPlan === BOARD.cardPlan, `card head "${d.cardEyebrow}" / "${d.cardPlan}"`)
  expect(d.readEyebrow === BOARD.readEyebrow && d.readPct === BOARD.readPct && d.readNote === BOARD.readNote, `readout "${d.readEyebrow}" / "${d.readPct}" / "${d.readNote}"`)
  expect(JSON.stringify(d.foot) === JSON.stringify(BOARD.foot), `foot ${JSON.stringify(d.foot)}`)
  expect(JSON.stringify(d.steps) === JSON.stringify(BOARD.steps), `steps ${JSON.stringify(d.steps.map((s) => s[1]))} with blurbs exact`)
  expect(d.stepsId === 'how', `steps section id ${d.stepsId}`)
  expect(!d.appTopBar, 'app top bar / tab bar hidden on landing')
  await p.screenshot({ path: `${OUT}landing-${w}-light.png`, fullPage: true })
  await c.close()
}

async function ctaNav(browser) {
  log('\n[check 1] CTA / header link destinations (click)')
  for (const [w, sel, want] of [[1440, '.landing__cta--primary', '#plan'], [1440, '.landing__cta--ghost', '#atlas'], [1440, '.landing__open', '#plan'], [390, '.landing__cta--primary', '#plan'], [390, '.landing__cta--ghost', '#atlas']]) {
    const { c, p } = await open(browser, w)
    await p.click(sel)
    await p.waitForFunction(() => !document.querySelector('.landing'), null, { timeout: 5000 }).catch(() => {})
    await p.waitForTimeout(800)
    const r = await p.evaluate(() => ({ hash: location.hash, landing: !!document.querySelector('.landing') }))
    expect(r.hash === want && !r.landing, `@${w} click ${sel} → hash ${r.hash}, landing gone=${!r.landing}`)
    if (w === 1440 && sel !== '.landing__open') await p.screenshot({ path: `${OUT}cta-${want.slice(1)}-1440.png` })
    await c.close()
  }
  // Wordmark from the landing stays on #home
  const { c, p } = await open(browser, 1440)
  await p.click('.landing__header .wordmark')
  await p.waitForTimeout(400)
  const r = await p.evaluate(() => ({ hash: location.hash, landing: !!document.querySelector('.landing') }))
  expect(r.hash === '#home' && r.landing, `wordmark click → ${r.hash}, landing shown=${r.landing}`)
  await c.close()
}

/* ---------- Check 2: map card ---------- */
async function check2(browser, w, scheme) {
  log(`\n[check 2] map card @${w} ${scheme}`)
  const { c, p } = await open(browser, w, { scheme })
  const appColors = Object.fromEntries(RAW.map(([n, , , pct]) => [n, appColor(pct / 100)]))
  const d = await p.evaluate((appColors) => {
    const probes = []
    const resolve = (v) => { const probe = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); probe.setAttribute('style', `fill: ${v}`); document.querySelector('.landing__map').appendChild(probe); probes.push(probe); return getComputedStyle(probe).fill }
    const ramp = [0, 1, 2, 3, 4].map((i) => resolve(`var(--ramp-${i})`))
    const rampText = [0, 1, 2, 3, 4].map((i) => resolve(`var(--ramp-${i}-text)`))
    const svg = document.querySelector('.landing__map')
    const scale = svg.getScreenCTM().a
    const dots = [...document.querySelectorAll('.landing__dot')].map((el) => ({ cx: +el.getAttribute('cx'), cy: +el.getAttribute('cy'), r: +el.getAttribute('r'), fill: getComputedStyle(el).fill }))
    const app = Object.fromEntries(Object.entries(appColors).map(([k, v]) => [k, resolve(v)]))
    const labels = [...document.querySelectorAll('.landing__labels')].filter((g) => getComputedStyle(g).display !== 'none').flatMap((g) => [...g.querySelectorAll('text')]).map((t) => {
      const r = t.getBoundingClientRect(); const ts = t.querySelector('tspan')
      return { text: t.textContent.replace(/\s+/g, ' ').trim(), px: +(parseFloat(getComputedStyle(t).fontSize) * scale).toFixed(1), units: parseFloat(getComputedStyle(t).fontSize), pctFill: getComputedStyle(ts).fill, nameFill: getComputedStyle(t).fill, box: [r.left, r.top, r.right, r.bottom].map((v) => +v.toFixed(1)) }
    })
    const svgBox = svg.getBoundingClientRect()
    const dotBoxes = [...document.querySelectorAll('.landing__dot')].map((el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom] })
    const pulse = document.querySelector('.landing__pulse')
    const fan = {}
    for (const k of ['band1', 'band2', 'median', 'loan', 'margin']) {
      const el = document.querySelector(`.landing__fan-${k}`)
      fan[k] = el && { len: (el.getAttribute('d') || '').length, fill: getComputedStyle(el).fill, stroke: getComputedStyle(el).stroke, dash: getComputedStyle(el).strokeDasharray, w: el.getBoundingClientRect().width }
    }
    const rampBar = document.querySelector('.landing__ramp')
    probes.forEach((x) => x.remove())
    return { ramp, rampText, dots, app, labels, scale: +scale.toFixed(4), svgBox: [svgBox.left, svgBox.right].map((v) => +v.toFixed(1)), dotBoxes,
      pulse: pulse && { cx: +pulse.getAttribute('cx'), cy: +pulse.getAttribute('cy'), stroke: getComputedStyle(pulse).stroke },
      holds: (() => { const e = document.createElement('i'); e.style.color = 'var(--holds)'; document.body.appendChild(e); const v = getComputedStyle(e).color; e.remove(); return v })(),
      fan, rampBg: rampBar && getComputedStyle(rampBar).backgroundImage, rampW: rampBar && rampBar.getBoundingClientRect().width,
      foot: [...document.querySelectorAll('.landing__card-foot > span')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | ') }
  }, appColors)
  expect(d.dots.length === 33, `dots: ${d.dots.length}`)
  let posBad = [], colBad = [], appDiff = []
  RAW.forEach(([n, lat, lon, pct], i) => {
    const dot = d.dots[i]
    if (!dot || Math.abs(dot.cx - X(lon)) > 0.06 || Math.abs(dot.cy - Y(lat)) > 0.06 || dot.r !== (n === 'Lisbon' ? 11 : 8)) posBad.push(`${n} ${JSON.stringify(dot)}`)
    if (!dot || dot.fill !== d.ramp[boardBand(pct)]) colBad.push(`${n} ${dot && dot.fill} want ramp-${boardBand(pct)} ${d.ramp[boardBand(pct)]}`)
    if (dot && dot.fill !== d.app[n]) appDiff.push(`${n} ${pct}%: landing ${dot.fill} vs app outcomeColor ${d.app[n]}`)
  })
  expect(posBad.length === 0, `33 dots at board positions (x=(lon+180)*4, y=(72-lat)*4), r 8 / Lisbon 11 ${posBad.join('; ')}`)
  expect(colBad.length === 0, `dot fills = var(--ramp-N) for the board's band (80/65/45/35) ${colBad.join('; ')}`)
  log(`  info ramp tokens (${scheme}): ${d.ramp.join(' | ')}`)
  log(`  info dots whose fill differs from the app's interpolated outcomeColor(pct): ${appDiff.length}${appDiff.length ? '\n    ' + appDiff.join('\n    ') : ''}`)
  const phone = w <= 520
  const want = Object.entries(BOARD_LABELS).filter(([n]) => !(phone && n === 'New York')).map(([n, v]) => `${n} ${v}%`).sort()
  const got = d.labels.map((l) => l.text).sort()
  expect(JSON.stringify(got) === JSON.stringify(want), `visible labels ${JSON.stringify(got)}${phone ? ' (phone set: New York dropped)' : ''}`)
  log(`  info label size: ${d.labels[0]?.units} units × ${d.scale} = ${d.labels.map((l) => l.px)} px`)
  let pctBad = d.labels.filter((l) => { const n = l.text.replace(/ \d+%$/, ''); return l.pctFill !== d.rampText[boardBand(BOARD_LABELS[n])] })
  expect(pctBad.length === 0, `label % fills = var(--ramp-N-text) ${pctBad.map((l) => l.text + ' ' + l.pctFill).join('; ')}`)
  // overlaps: label vs label, label vs svg edge, label vs dots
  const ov = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]
  const overlaps = []
  for (let i = 0; i < d.labels.length; i++) for (let j = i + 1; j < d.labels.length; j++) if (ov(d.labels[i].box, d.labels[j].box)) overlaps.push(`${d.labels[i].text} × ${d.labels[j].text}`)
  expect(overlaps.length === 0, `labels don't overlap each other ${overlaps.join('; ')}`)
  const clipped = d.labels.filter((l) => l.box[0] < d.svgBox[0] - 0.5 || l.box[2] > d.svgBox[1] + 0.5)
  expect(clipped.length === 0, `labels inside the map's width ${clipped.map((l) => l.text + ' ' + l.box).join('; ')}`)
  const onDots = []
  d.labels.forEach((l) => d.dotBoxes.forEach((b, i) => { if (ov(l.box, b)) onDots.push(`${l.text} × ${RAW[i][0]}`) }))
  log(`  info label boxes touching dot boxes: ${onDots.length ? onDots.join('; ') : 'none'}`)
  expect(d.pulse && Math.abs(d.pulse.cx - X(-9.1)) < 0.06 && Math.abs(d.pulse.cy - Y(38.7)) < 0.06 && d.pulse.stroke === d.holds, `Lisbon ring at (${d.pulse?.cx}, ${d.pulse?.cy}) stroke ${d.pulse?.stroke} (= --holds ${d.holds})`)
  const f = d.fan
  expect(['band1', 'band2', 'median', 'loan', 'margin'].every((k) => f[k] && f[k].len > 100 && f[k].w > 20), `fan paths present: ${Object.entries(f).map(([k, v]) => `${k} d=${v?.len} w=${v?.w?.toFixed(0)}`).join(', ')}`)
  expect(f.margin && f.margin.dash !== 'none' && /8/.test(f.margin.dash), `margin-call line dashed (${f.margin?.dash}, stroke ${f.margin?.stroke})`)
  expect(f.band1.fill !== 'none' && f.band2.fill !== 'none' && f.median.stroke === d.holds, `bands filled (${f.band1.fill} / ${f.band2.fill}), median stroke ${f.median.stroke}, loan ${f.loan.stroke}`)
  expect(d.foot === 'Breaks Holds | Illustrative numbers' && d.rampW > 100, `key "${d.foot}", ramp bar ${d.rampW}px: ${d.rampBg}`)
  await c.close()
}

/* ---------- Check 3: in-page nav ---------- */
async function check3(browser, w, reduced) {
  log(`\n[check 3] "How it works" @${w}${reduced ? ' reduced motion' : ''}`)
  let { c, p } = await open(browser, w, { reduced })
  const before = await p.evaluate(() => ({ hash: location.hash, url: location.href, y: scrollY }))
  await p.evaluate(() => { window.__marker = 1 })
  await p.click('.landing__nav a:has-text("How it works")')
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => { const s = document.getElementById('how').getBoundingClientRect(); return { hash: location.hash, url: location.href, y: Math.round(scrollY), top: Math.round(s.top), bottom: Math.round(s.bottom), ih: innerHeight, landing: !!document.querySelector('.landing'), marker: window.__marker, focus: document.activeElement?.id } })
  expect(r.hash === before.hash && r.url === before.url, `hash unchanged ("${before.hash}" → "${r.hash}"), url ${r.url}`)
  expect(r.landing && r.marker === 1, `landing still shown, no reload`)
  expect(r.y > before.y && r.top >= 0 && r.top < r.ih, `scrolled ${before.y} → ${r.y}, steps top at ${r.top}px of ${r.ih} (bottom ${r.bottom}); focus on #${r.focus}`)
  if (!reduced) await p.screenshot({ path: `${OUT}how-it-works-${w}.png` })
  await c.close()
  for (const [name, want, sel] of [['Atlas', '#atlas', '.atlas, [class*="atlas"]'], ['Method', '#method', '[class*="method"]']]) {
    ;({ c, p } = await open(browser, w, { reduced }))
    await p.click(`.landing__nav a:has-text("${name}")`)
    await p.waitForFunction(() => !document.querySelector('.landing'), null, { timeout: 5000 }).catch(() => {})
    await p.waitForSelector(sel, { timeout: 8000 }).catch(() => {})
    await p.waitForTimeout(800)
    const q = await p.evaluate((sel) => ({ hash: location.hash, landing: !!document.querySelector('.landing'), view: !!document.querySelector(sel), active: document.querySelector('[aria-current="page"]')?.textContent.trim() }), sel)
    expect(q.hash === want && !q.landing && q.view, `nav "${name}" → ${q.hash}, landing gone=${!q.landing}, view rendered=${q.view}, current tab "${q.active}"`)
    if (!reduced && w === 1440) await p.screenshot({ path: `${OUT}nav-${name.toLowerCase()}-1440.png` })
    await c.close()
  }
}

/* ---------- Check 4: theme + contrast ---------- */
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }

async function contrast(p, tag) {
  // 1. text boxes and colours
  const items = await p.evaluate(() => {
    const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1] }
    const out = []
    const walker = document.createTreeWalker(document.querySelector('.landing'), NodeFilter.SHOW_TEXT)
    let n
    while ((n = walker.nextNode())) {
      const text = n.textContent.replace(/\s+/g, ' ').trim()
      if (!text) continue
      const el = n.parentElement
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden') continue
      const svg = el instanceof SVGElement
      let rects
      if (svg) { rects = [el.getBoundingClientRect()] } else { const rg = document.createRange(); rg.selectNodeContents(n); rects = [...rg.getClientRects()] }
      rects = rects.filter((r) => r.width > 1 && r.height > 1)
      if (!rects.length) continue
      let op = 1
      for (let a = el; a; a = a.parentElement) op *= parseFloat(getComputedStyle(a).opacity)
      const col = parse(svg ? cs.fill : cs.color)
      out.push({ text: text.slice(0, 40), cls: (el.getAttribute('class') || el.tagName).toString().split(' ')[0], col, op, size: parseFloat(cs.fontSize),
        rects: rects.map((r) => [r.left + scrollX, r.top + scrollY, r.width, r.height].map(Math.round)) })
    }
    return out
  })
  // 2. screenshot with text, then with text hidden; glyph pixels = pixels that differ between the two
  await p.addStyleTag({ content: `.landing__pulse { display: none !important }` })
  await p.waitForTimeout(150)
  const bufText = await p.screenshot({ fullPage: true })
  await p.addStyleTag({ content: `.landing, .landing * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important } .landing text, .landing tspan { fill: transparent !important } .landing__pulse { display: none !important }`, })
  await p.waitForTimeout(150)
  const buf = await p.screenshot({ fullPage: true })
  await p.screenshot({ path: `${OUT}contrast-bg-${tag}.png`, fullPage: true })
  // 3. sample in the page (canvas)
  const samples = await p.evaluate(async ({ b64, b64t, items }) => {
    const load = async (b) => { const img = new Image(); img.src = 'data:image/png;base64,' + b; await img.decode()
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); return { g, cv } }
    const { g, cv } = await load(b64)
    const T = await load(b64t)
    return items.map((it) => {
      const px = [], glyph = []
      for (const [x, y, w, h] of it.rects) {
        const x0 = Math.max(0, x), y0 = Math.max(0, y), ww = Math.min(w, cv.width - x0), hh = Math.min(h, cv.height - y0)
        if (ww <= 0 || hh <= 0) continue
        const d = g.getImageData(x0, y0, ww, hh).data
        const dt = T.g.getImageData(x0, y0, ww, hh).data
        for (let i = 0; i < ww * hh; i++) {
          const bg = [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]
          px.push(bg)
          const diff = Math.abs(dt[i * 4] - bg[0]) + Math.abs(dt[i * 4 + 1] - bg[1]) + Math.abs(dt[i * 4 + 2] - bg[2])
          if (diff > 24) glyph.push(bg)
        }
      }
      return { px, glyph }
    })
  }, { b64: buf.toString('base64'), b64t: bufText.toString('base64'), items })
  const res = items.map((it, i) => {
    const { px, glyph } = samples[i]
    const a = (it.col ? it.col[3] : 1) * it.op
    const f = (bg) => { const fg = [0, 1, 2].map((k) => it.col[k] * a + bg[k] * (1 - a)); return cr(fg, bg) }
    const crs = px.map(f).sort((m, n) => m - n)
    const gl = glyph.map(f).sort((m, n) => m - n)
    return { ...it, min: crs[0], p05: crs[Math.floor(crs.length * 0.05)], med: crs[Math.floor(crs.length / 2)], n: px.length,
      gmin: gl.length ? gl[0] : NaN, gp01: gl.length ? gl[Math.floor(gl.length * 0.01)] : NaN, gn: gl.length }
  })
  return res
}

async function check4(browser) {
  log('\n[check 4] theme + contrast')
  const all = []
  for (const w of [1440, 1280, 1000, 820, 390, 360]) for (const scheme of ['light', 'dark']) {
    const { c, p } = await open(browser, w, { scheme, reduced: true })
    const t = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.querySelector('.landing')).color, card: getComputedStyle(document.querySelector('.landing__card')).backgroundColor }))
    const want = scheme === 'light' ? 'rgb(245, 242, 234)' : 'rgb(10, 13, 12)'
    expect(t.bg === want, `@${w} system ${scheme}: data-theme=${t.theme}, body bg ${t.bg} (${scheme === 'light' ? 'paper #f5f2ea' : 'ink #0a0d0c'}), text ${t.ink}, card ${t.card}`)
    await p.screenshot({ path: `${OUT}theme-system-${scheme}-${w}.png`, fullPage: w <= 1000 })
    const res = await contrast(p, `system-${scheme}-${w}`)
    res.forEach((r) => all.push({ ...r, ctxt: `${w} system-${scheme}` }))
    await c.close()
  }
  // explicit themes via the landing's own toggle (live switch, no reload), then contrast in that state
  for (const [w, scheme, target] of [[1440, 'light', 'dark'], [1440, 'dark', 'light'], [390, 'light', 'dark'], [390, 'dark', 'light']]) {
    const { c, p } = await open(browser, w, { scheme, reduced: true })
    await p.evaluate(() => { window.__marker = 42 })
    const before = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }))
    if (w > 1099) {
      await p.click(`.landing__actions [aria-label="${target === 'dark' ? 'Dark' : 'Light'} theme"]`)
    } else {
      // cycle button: system → light → dark
      for (let i = 0; i < 3; i++) {
        const cur = await p.evaluate(() => document.documentElement.dataset.theme)
        if (cur === target) break
        await p.click('.landing__actions button.icon-btn')
        await p.waitForTimeout(250)
      }
    }
    await p.waitForTimeout(400)
    const after = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, marker: window.__marker, landing: !!document.querySelector('.landing'), hash: location.hash, nav: performance.getEntriesByType('navigation').length }))
    expect(after.theme === target && after.bg !== before.bg && after.marker === 42 && after.landing && after.hash === '', `@${w} system ${scheme} → toggle to ${target}: data-theme ${before.theme} → ${after.theme}, body bg ${before.bg} → ${after.bg}, no reload (marker kept), still on landing, hash "${after.hash}"`)
    await p.screenshot({ path: `${OUT}toggle-${scheme}-to-${target}-${w}.png`, fullPage: w <= 520 })
    const res = await contrast(p, `explicit-${target}-${w}`)
    res.forEach((r) => all.push({ ...r, ctxt: `${w} explicit-${target} (on ${scheme} system)` }))
    await c.close()
  }
  const rows = all.slice().sort((a, b) => a.gmin - b.gmin)
  const fmt = (r) => `glyph-min ${r.gmin.toFixed(2)} (glyph p01 ${r.gp01.toFixed(2)}, ${r.gn} glyph px) · box: worst ${r.min.toFixed(2)}, p05 ${r.p05.toFixed(2)}, median ${r.med.toFixed(2)} · ${r.ctxt} .${r.cls} ${r.size}px "${r.text}" rgba(${r.col}) op ${r.op}`
  const noGlyph = all.filter((r) => !r.gn)
  log(`  info measured ${all.length} text runs (${noGlyph.length} with no glyph pixels found: ${noGlyph.map((r) => r.text).slice(0, 5).join(' | ')}); 15 lowest glyph-pixel contrasts:`)
  rows.slice(0, 15).forEach((r) => log('    ' + fmt(r)))
  const mapRows = all.filter((r) => r.cls.startsWith('landing__label')).sort((a, b) => a.gmin - b.gmin)
  log(`  info map labels: lowest ${fmt(mapRows[0])}`)
  const minMed = all.slice().sort((a, b) => a.med - b.med)[0]
  log(`  info lowest median contrast: ${fmt(minMed)}`)
  const byP01 = all.filter((r) => r.gn).sort((a, b) => a.gp01 - b.gp01)[0]
  expect(rows[0].gmin >= 4.5, `every text run ≥ 4.5:1 against the background under every one of its glyph pixels (min ${rows[0].gmin.toFixed(2)}; lowest glyph p01 ${byP01.gp01.toFixed(2)} "${byP01.text}" ${byP01.ctxt})`)
  const byBox = all.slice().sort((a, b) => a.p05 - b.p05)[0]
  log(`  info box-based (whole line box, not just glyphs): lowest p05 ${byBox.p05.toFixed(2)} "${byBox.text}" ${byBox.ctxt}; lowest worst-pixel ${all.slice().sort((a, b) => a.min - b.min)[0].min.toFixed(2)}`)
  require('fs').writeFileSync(`${OUT}contrast.txt`, `node docs/evidence/stage-2/drive.cjs (contrast section): every visible text run on the landing; foreground = computed color/fill × opacity,\nbackground = full-page screenshot with all landing text made transparent (and the Lisbon pulse ring removed; reduced motion),\nsampled across each text run's client rects. Columns: lowest ratio over glyph pixels (pixels that change when the text is hidden), then over the whole line box context class font-size text colour opacity\n\n` + rows.map(fmt).join('\n') + '\n')
}

/* ---------- Check 5: phone / tablet layout ---------- */
async function check5(browser, w) {
  log(`\n[check 5] layout @${w}`)
  const { c, p } = await open(browser, w)
  const d = await p.evaluate(() => {
    const box = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) } }
    const ctrls = [...document.querySelectorAll('.landing a, .landing button')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map((el) => { const r = el.getBoundingClientRect(); return { t: (el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } })
    const wide = [...document.querySelectorAll('.landing *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5).map((el) => el.className?.baseVal ?? el.className)
    return { sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: innerWidth, copy: box('.landing__copy'), card: box('.landing__card'), steps: getComputedStyle(document.querySelector('.landing__steps')).gridTemplateColumns.split(' ').length,
      read: getComputedStyle(document.querySelector('.landing__read')).gridTemplateColumns.split(' ').length, nav: getComputedStyle(document.querySelector('.landing__nav')).display,
      ctas: [...document.querySelectorAll('.landing__cta')].map((a) => Math.round(a.getBoundingClientRect().width)), ctaCol: getComputedStyle(document.querySelector('.landing__ctas')).flexDirection, ctrls, wide: wide.slice(0, 5),
      header: box('.landing__header') }
  })
  expect(d.sw <= d.iw && d.bw <= d.iw && d.wide.length === 0, `no horizontal scroll: scrollWidth ${d.sw} / body ${d.bw} vs innerWidth ${d.iw}; elements past right edge: ${JSON.stringify(d.wide)}`)
  const stacked = d.card.top >= d.copy.bottom
  if (w <= 900) {
    expect(stacked, `hero stacks: copy ${d.copy.top}–${d.copy.bottom}, card ${d.card.top}–${d.card.bottom} (card ${d.card.left}–${d.card.right})`)
    expect(d.nav === 'none', `nav folded away (display ${d.nav})`)
  } else {
    expect(!stacked && d.card.left > d.copy.right, `two columns: copy ${d.copy.left}–${d.copy.right}, card ${d.card.left}–${d.card.right}`)
  }
  const wantSteps = w <= 520 ? 1 : w <= 900 ? 2 : 4
  expect(d.steps === wantSteps, `steps in ${d.steps} column(s) (want ${wantSteps}); readout grid ${d.read} col`)
  if (w <= 520) expect(d.ctaCol === 'column' && d.ctas.every((x) => x === d.copy.right - d.copy.left), `CTAs stacked full width: ${d.ctas} px (copy ${d.copy.right - d.copy.left}px, ${d.ctaCol})`)
  const small = d.ctrls.filter((x) => x.w < 44 || x.h < 44)
  const msg = `controls ≥ 44×44: ${d.ctrls.map((x) => `${x.t} ${x.w}×${x.h}`).join(' · ')}`
  if (w <= 900) expect(small.length === 0, msg)
  else log(`  info ${msg}${small.length ? ` — under 44: ${small.map((x) => x.t).join(', ')}` : ''}`)
  await p.screenshot({ path: `${OUT}layout-${w}.png`, fullPage: true })
  await c.close()
}

/* ---------- Check 6: reduced motion ---------- */
async function check6(browser, w) {
  log(`\n[check 6] Lisbon ring @${w}`)
  for (const reduced of [false, true]) {
    const { c, p } = await open(browser, w, { reduced })
    const s = []
    for (let i = 0; i < 4; i++) { s.push(await p.evaluate(() => { const e = document.querySelector('.landing__pulse'); const cs = getComputedStyle(e); return { anim: cs.animationName, dur: cs.animationDuration, r: cs.r, op: cs.opacity, vis: cs.visibility } })); await p.waitForTimeout(450) }
    const rs = new Set(s.map((x) => x.r))
    if (!reduced) expect(s[0].anim === 'landing-pulse' && rs.size > 1, `no-preference: animation ${s[0].anim} ${s[0].dur}, r over 1.4s ${s.map((x) => x.r).join(' → ')}, opacity ${s.map((x) => x.op).join(' → ')}`)
    else expect(s[0].anim === 'none' && rs.size === 1 && s.every((x) => x.vis === 'hidden' || x.op === '0'), `reduce: animation ${s[0].anim}, r ${[...rs].join(',')}, opacity ${s[0].op}, visibility ${s[0].vis}`)
    await p.screenshot({ path: `${OUT}motion-${reduced ? 'reduce' : 'full'}-${w}.png`, clip: await p.evaluate(() => { const r = document.querySelector('.landing__card').getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 500) } }), fullPage: true })
    await c.close()
  }
}

/* ---------- Stage 1 routing, quickly ---------- */
async function routing(browser) {
  log('\n[stage 1] routing re-run')
  for (const w of [1440, 390]) {
    const { c, p } = await ctx(browser, w)
    await p.goto(BASE); await p.waitForTimeout(1200); loads++
    let s = await p.evaluate(() => ({ landing: !!document.querySelector('.landing'), hash: location.hash }))
    expect(s.landing, `@${w} first visit bare URL → landing (hash "${s.hash}")`)
    await p.click('.landing__cta--primary'); await p.waitForTimeout(1200)
    s = await p.evaluate(() => ({ landing: !!document.querySelector('.landing'), hash: location.hash, app: !!document.querySelector('main') }))
    expect(!s.landing && s.hash === '#plan', `@${w} CTA → app (${s.hash})`)
    await p.goto(BASE); await p.reload(); await p.waitForTimeout(1500)
    s = await p.evaluate(() => ({ landing: !!document.querySelector('.landing'), hash: location.hash, entered: localStorage.getItem('evelo:v2:entered') }))
    expect(!s.landing, `@${w} reload bare URL after entering → planner, no landing (hash "${s.hash}", entered=${s.entered})`)
    await p.goto(BASE + '#home'); await p.waitForTimeout(1200)
    s = await p.evaluate(() => ({ landing: !!document.querySelector('.landing'), hash: location.hash }))
    expect(s.landing, `@${w} #home → landing (hash "${s.hash}")`)
    await c.close()
  }
}

;(async () => {
  const browser = await chromium.launch()
  log(`eVelo v2 · Stage 2 (study G landing) · ${new Date().toISOString()} · ${BASE}`)
  for (const w of [1440, 1280, 1000, 820, 390, 360]) await check1(browser, w)
  await ctaNav(browser)
  for (const w of [1440, 1280, 1000, 820, 390, 360]) for (const s of ['light', 'dark']) await check2(browser, w, s)
  for (const w of [1440, 1280, 1000]) await check3(browser, w, false)
  await check3(browser, 1280, true)
  await check4(browser)
  for (const w of [1440, 1280, 1000, 820, 390, 360]) await check5(browser, w)
  await check6(browser, 1280)
  await check6(browser, 390)
  await routing(browser)
  log(`\n[check 7] console errors across ${loads} page loads: ${consoleErrors.length}`)
  consoleErrors.forEach((e) => log('  ' + e))
  expect(consoleErrors.length === 0, 'no console errors / page errors')
  log(`\nTOTAL FAILS: ${fails}`)
  await browser.close()
})()
