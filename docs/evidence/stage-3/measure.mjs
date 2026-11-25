// Stage 3 (Wide city profile): open Lisbon's profile (#atlas, second top pick) and measure the sheet,
// its columns, the photo banner and horizontal overflow; screenshot. Run against a build served by
// `vite preview`: node measure.mjs <baseUrl> <label> <outDir>
// (from outside the repo, set NODE_PATH or run with the repo's node_modules resolvable).
import { chromium } from 'playwright'
import fs from 'node:fs'

const [base, label, outDir] = process.argv.slice(2)
const SIZES = [[1440, 900], [1920, 1080], [2560, 1440], [390, 844]]
const browser = await chromium.launch()
const out = []
for (const theme of ['light', 'dark']) for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, reducedMotion: 'reduce' })
  await ctx.addInitScript((t) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, theme)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#atlas'); await page.waitForLoadState('networkidle')
  await page.locator('.pick').nth(1).click()
  await page.locator('.prof-sheet .prof').waitFor()
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500)
  const m = await page.evaluate(() => {
    const de = document.documentElement, vw = de.clientWidth
    const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left * 10) / 10, t: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }
    const sheet = document.querySelector('.prof-sheet'), body = sheet?.querySelector('.sheet__body'), prof = sheet?.querySelector('.prof')
    const title = sheet?.querySelector('h2')?.textContent?.trim()
    const cols = prof ? [...prof.querySelectorAll('.prof__lead, .prof__sec, .prof__plan')].map((e) => ({ cls: [...e.classList].join('.'), ...box(e) })) : []
    const clipped = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false }
    const past = []
    for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.right > vw + 0.5 || r.left < -0.5) && !clipped(e) && getComputedStyle(e).position !== 'fixed') past.push(e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']') }
    // Inside the sheet, anything wider than the sheet body's box (clipped or not).
    const pastSheet = []
    if (body) { const br = body.getBoundingClientRect(); for (const e of body.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.right > br.right + 0.5 || r.left < br.left - 0.5) && !e.closest('.pgal__track, .pgal__cover')) pastSheet.push(e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']') } }
    return {
      theme: de.dataset.theme || null, title, clientWidth: vw, scrollWidth: de.scrollWidth, bodyScrollWidth: document.body.scrollWidth,
      sheet: box(sheet), sheetMaxWidth: sheet && getComputedStyle(sheet).maxWidth,
      sheetBody: body && { ...box(body), scrollWidth: body.scrollWidth, clientWidth: body.clientWidth, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight },
      prof: box(prof), profCols: prof && getComputedStyle(prof).gridTemplateColumns, sections: cols,
      pgal: box(sheet?.querySelector('.pgal')), pgalPosition: sheet?.querySelector('.pgal') && getComputedStyle(sheet.querySelector('.pgal')).position,
      mosaic: box(sheet?.querySelector('.pgal__mosaic')), cover: box(sheet?.querySelector('.pgal__cover')),
      pastEdge: past.length, pastSample: past.slice(0, 5), pastSheet: pastSheet.length, pastSheetSample: pastSheet.slice(0, 5),
    }
  })
  const rec = { label, theme, width: w, height: h, ...m, errors }
  out.push(rec)
  console.log(JSON.stringify({ label, theme, w, title: m.title, sheet: m.sheet, prof: m.prof, cols: m.profCols, mosaic: m.mosaic, sw: [m.scrollWidth, m.clientWidth], body: m.sheetBody && [m.sheetBody.scrollWidth, m.sheetBody.clientWidth], past: m.pastEdge, pastSheet: m.pastSheet, errors }))
  await page.screenshot({ path: `${outDir}/${label}-profile-${w}-${theme}.png` })
  await ctx.close()
}
await browser.close()
fs.writeFileSync(`${outDir}/${label}-measurements.json`, JSON.stringify(out, null, 1))
