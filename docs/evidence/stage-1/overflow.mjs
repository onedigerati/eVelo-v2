// Body has overflow-x: clip, so scrollWidth alone can hide a too-wide element. Count elements whose
// box runs past the viewport's right/left edge and that aren't inside their own clipping/scrolling container.
import { chromium } from 'playwright'
const b = await chromium.launch()
for (const theme of ['light', 'dark']) for (const w of [1440, 1920, 2560, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w === 390 ? 844 : 1200 }, colorScheme: theme })
  await ctx.addInitScript((t) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, theme)
  const p = await ctx.newPage()
  for (const h of ['', '#plan', '#atlas', '#method']) {
    await p.goto('http://localhost:4173/' + h); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500)
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth; const out = []
      const clipped = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o !== 'visible') return true } return false }
      for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.right > vw + 0.5 || r.left < -0.5) && !clipped(e) && getComputedStyle(e).position !== 'fixed') out.push(e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']') }
      return { theme: document.documentElement.dataset.theme, sw: document.documentElement.scrollWidth, cw: vw, bodyOverflowX: getComputedStyle(document.body).overflowX, past: out.slice(0, 5), n: out.length }
    })
    console.log(JSON.stringify({ w, route: h || 'landing', ...r }))
  }
  await ctx.close()
}
await b.close()
