// Stage 2 (Landing side by side) measurement: landing frame, hero columns, story card, chart text
// size on screen, horizontal overflow; screenshots. Reduced motion, so the story shows its resting frame.
// usage (from the repo, with `vite preview` serving the build): node measure.mjs <baseUrl> <label> <outDir>
import { chromium } from 'playwright'
import fs from 'node:fs'

const [base, label, outDir] = process.argv.slice(2)
const WIDTHS = [1440, 1920, 2560, 390]
const browser = await chromium.launch()
const out = []
for (const theme of ['light', 'dark']) for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 1200 }, colorScheme: theme, reducedMotion: 'reduce' })
  await ctx.addInitScript((t) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  // The app's topbar width on another page, for comparison with the landing frame.
  await page.goto(base + '#plan'); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500)
  const topbar = await page.evaluate(() => { const e = document.querySelector('.topbar__inner'); return e ? Math.round(e.getBoundingClientRect().width * 10) / 10 : null })
  await page.goto(base); await page.waitForLoadState('networkidle'); await page.waitForTimeout(2500)
  const m = await page.evaluate(() => {
    const de = document.documentElement, vw = de.clientWidth
    const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }
    const hero = document.querySelector('.landing__hero')
    const kids = hero ? [...hero.children].map((k) => ({ cls: k.className.split(' ')[0], ...box(k) })) : []
    const story = document.querySelector('.story'), svg = document.querySelector('.story__svg')
    let svgInfo = null
    if (svg) {
      const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), scale = r.width / vb.width
      const texts = [...svg.querySelectorAll('text')].filter((t) => t.getBoundingClientRect().height > 0)
      const byClass = {}
      for (const t of texts) {
        const k = t.getAttribute('class') || 'text'
        const fs = parseFloat(getComputedStyle(t).fontSize)
        ;(byClass[k] ||= { n: 0, unitFs: fs, screenFs: Math.round(fs * scale * 100) / 100, bboxH: [] }).n++
        byClass[k].bboxH.push(Math.round(t.getBoundingClientRect().height * 100) / 100)
      }
      for (const v of Object.values(byClass)) { v.maxBboxH = Math.max(...v.bboxH); v.minBboxH = Math.min(...v.bboxH); delete v.bboxH }
      svgInfo = { cls: svg.getAttribute('class'), viewBox: [vb.width, vb.height], rendered: [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10], scale: Math.round(scale * 10000) / 10000, text: byClass }
    }
    const clipped = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false }
    const past = []
    for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.right > vw + 0.5 || r.left < -0.5) && !clipped(e) && getComputedStyle(e).position !== 'fixed') past.push(e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']') }
    const heroW = hero ? hero.getBoundingClientRect().width : 0
    return {
      theme: de.dataset.theme || null, clientWidth: vw, scrollWidth: de.scrollWidth, bodyScrollWidth: document.body.scrollWidth, pageHeight: de.scrollHeight,
      frame: box(document.querySelector('.landing__frame')), hero: box(hero), heroCols: hero ? getComputedStyle(hero).gridTemplateColumns : null, heroKids: kids,
      story: box(story), storyShareOfHero: story && heroW ? Math.round((story.getBoundingClientRect().width / heroW) * 1000) / 1000 : null,
      plot: box(document.querySelector('.story__plot')), svg: svgInfo, pastEdge: past.length, pastSample: past.slice(0, 5),
    }
  })
  const rec = { label, theme, width: w, topbarOnPlan: topbar, ...m, errors }
  out.push(rec)
  console.log(JSON.stringify(rec))
  await page.screenshot({ path: `${outDir}/${label}-landing-${w}-${theme}.png`, fullPage: w === 390 })
  await ctx.close()
}
await browser.close()
fs.writeFileSync(`${outDir}/${label}-measurements.json`, JSON.stringify(out, null, 1))
