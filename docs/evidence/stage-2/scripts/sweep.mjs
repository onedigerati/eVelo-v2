import { open, EV } from './common.mjs'
import fs from 'node:fs'
const out = []
const log = (s) => { out.push(s); console.log(s) }
const step = (page, name) => page.locator('.landing__step', { has: page.locator('.landing__step-title', { hasText: new RegExp(`^${name}$`) }) })

const widths = new Set()
for (let w = 360; w <= 1920; w += 8) widths.add(w)
for (let w = 470; w <= 640; w++) widths.add(w)
for (let w = 1100; w <= 1260; w++) widths.add(w)
for (const w of [375, 390, 414, 1280]) widths.add(w)
widths.add(1920)
const W = [...widths].sort((a, b) => a - b)

// Frames: mid-beat (replay, run, pause) and each beat's finished frame (paused step jump)
const FRAMES = [
  { id: 'buy-mid', t: 2 }, { id: 'borrow-mid', t: 6 }, { id: 'live-mid', t: 10 }, { id: 'die-14.05', t: 14.05 }, { id: 'die-mid-14.2', t: 14.2 }, { id: 'die-14.4', t: 14.4 },
  { id: 'buy-end', jump: 'Buy' }, { id: 'borrow-end', jump: 'Borrow' }, { id: 'live-end', jump: 'Live anywhere' }, { id: 'die-end', jump: 'Die' },
]

async function setFrame(page, f) {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(100)
  const label = await page.locator('.story__ctrl .story__btn').first().getAttribute('aria-label')
  if (f.jump) {
    if (label.startsWith('Pause')) await page.locator('.story__ctrl .story__btn').first().click()
    await step(page, f.jump).click()
  } else {
    await page.locator('.story__ctrl .story__btn').nth(1).click() // replay: t = 0, playing
    await page.clock.runFor(Math.round(f.t * 1000))
    await page.locator('.story__ctrl .story__btn').first().click() // pause
  }
  await page.waitForTimeout(50)
}

const measure = (page) => page.evaluate(() => {
  const svg = document.querySelector('.story__svg')
  const vb = svg.viewBox.baseVal
  const sr = svg.getBoundingClientRect()
  const scale = sr.width / vb.width
  const effOpacity = (el) => { let o = 1; for (let e = el; e && e !== svg.parentElement; e = e.parentElement) { const a = e.getAttribute && e.getAttribute('opacity'); if (a != null) o *= +a; o *= +getComputedStyle(e).opacity } return o }
  const texts = [...svg.querySelectorAll('text')].filter((t) => getComputedStyle(t).visibility !== 'hidden' && t.textContent.trim() && effOpacity(t) > 0)
  let min = Infinity, minText = ''
  const small = [], clipped = []
  for (const t of texts) {
    const px = parseFloat(getComputedStyle(t).fontSize) * scale
    if (px < min) { min = px; minText = t.textContent }
    if (px < 11 - 1e-6) small.push(`${t.textContent}=${px.toFixed(2)}`)
    const r = t.getBoundingClientRect()
    if (r.left < sr.left - 0.5 || r.right > sr.right + 0.5 || r.top < sr.top - 0.5 || r.bottom > sr.bottom + 0.5 || r.left < 0 || r.right > innerWidth) clipped.push(t.textContent)
  }
  // card parts outside the card
  const card = document.querySelector('.story').getBoundingClientRect()
  const over = [...document.querySelectorAll('.story > *, .story__key li, .story__cap > *, .story__head > *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.left < card.left - 0.5 || r.right > card.right + 0.5) || e.scrollWidth > e.clientWidth + 1 }).map((e) => e.className)
  // Loan repaid clearance: label lines vs the heirs bar's right edge
  let gap = null
  const lab = [...svg.querySelectorAll('.story__t--slice, .story__t--mono')].filter((t) => effOpacity(t) > 0 && getComputedStyle(t).visibility !== 'hidden')
  const heirs = svg.querySelector('.story__heirs-soft')
  if (lab.length && heirs && effOpacity(heirs) > 0) {
    const hr = heirs.getBoundingClientRect().right
    gap = Math.min(...lab.map((t) => t.getBoundingClientRect().left)) - hr
  }
  // overlapping SVG texts (bbox intersection by > 1px both ways), visible ones only
  const ov = []
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i].getBoundingClientRect(), b = texts[j].getBoundingClientRect()
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
    if (ix > 1 && iy > 3) ov.push(`${texts[i].textContent}~${texts[j].textContent}`)
  }
  return {
    layout: svg.classList.contains('story__svg--narrow') ? 'narrow' : 'wide',
    sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: innerWidth,
    min: +min.toFixed(2), minText, small, clipped, over, gap: gap == null ? null : +gap.toFixed(1), ov, cardH: Math.round(card.height),
  }
})

const summary = []
const all = {}
for (const dark of [false, true]) {
  const { browser, page, logs } = await open({ width: 1280, height: 1000, dark })
  for (const f of FRAMES) {
    await setFrame(page, f)
    const cap = await page.locator('.story__cap-beat:not([aria-hidden]) .story__cap-lead').textContent()
    const ws = dark ? W.filter((w) => w % 40 === 0 || w === 360 || w === 1920) : W
    const rows = []
    for (const w of ws) {
      await page.setViewportSize({ width: w, height: 1000 })
      await page.waitForTimeout(30)
      rows.push({ w, ...(await measure(page)) })
    }
    const key = `${dark ? 'dark' : 'light'} ${f.id}`
    all[key] = rows
    const minRow = rows.reduce((a, b) => (b.min < a.min ? b : a))
    const sideways = rows.filter((r) => r.sw > r.iw || r.bw > r.iw)
    const small = rows.filter((r) => r.small.length)
    const clip = rows.filter((r) => r.clipped.length)
    const over = rows.filter((r) => r.over.length)
    const narrowGaps = rows.filter((r) => r.layout === 'narrow' && r.gap != null)
    const minGap = narrowGaps.length ? narrowGaps.reduce((a, b) => (b.gap < a.gap ? b : a)) : null
    const ovs = new Set(rows.flatMap((r) => r.ov))
    const heights = rows.filter((r) => r.w === 390 || r.w === 1280).map((r) => `${r.w}:${r.cardH}`)
    const line = `${key.padEnd(20)} caption "${cap.slice(0, 22)}…" ${rows.length} widths | min text ${minRow.min}px ("${minRow.minText}" at ${minRow.w}, ${minRow.layout}) | <11px at ${small.length} widths${small.length ? ' e.g. ' + small.slice(0, 3).map((r) => r.w + ':' + r.small.join(',')).join('; ') : ''} | sideways scroll at ${sideways.length}${sideways.length ? ' e.g. ' + sideways.slice(0, 5).map((r) => `${r.w}:${r.sw}`).join(',') : ''} | clipped text at ${clip.length}${clip.length ? ' e.g. ' + clip.slice(0, 3).map((r) => r.w + ':' + r.clipped.join(',')).join('; ') : ''} | card overflow at ${over.length}${over.length ? ' e.g. ' + over.slice(0, 2).map((r) => r.w + ':' + r.over.join(',')).join('; ') : ''} | narrow "Loan repaid" min gap to heirs ${minGap ? minGap.gap + 'px at ' + minGap.w : 'n/a (label not shown)'} | text overlaps: ${ovs.size ? [...ovs].join(', ') : 'none'} | card height ${heights.join(' ')}`
    log(line)
    summary.push(line)
  }
  log(`console (${dark ? 'dark' : 'light'}): ${JSON.stringify(logs)}`)
  await browser.close()
}
fs.writeFileSync(`${EV}/sweep.txt`, `$ node sweep.mjs (Playwright 1.57 Chromium, 1x; per frame: set by replay + clock.runFor(t) + pause, or a paused step jump for each beat's finished frame; then resize 360..1920 (every 8px, every px over 470-640 and 1100-1260, plus 375/390/414/1280; dark every 40px). Min text = computed font-size x rendered SVG scale over visible texts; clipped = text bbox outside the SVG or the screen; gap = left of the "Loan repaid" lines minus the heirs bar's right edge, narrow layout)\n` + out.join('\n') + '\n')
