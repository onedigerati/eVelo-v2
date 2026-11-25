// Stage 1 (Wide screens) measurement: widths, grid columns, ranking-table gaps, horizontal scroll.
// usage: node measure.mjs <baseUrl> <label> <outDir> [--shots]
import { chromium } from 'playwright'
import fs from 'node:fs'

const [base, label, outDir, shotsFlag] = process.argv.slice(2)
const shots = shotsFlag === '--shots'
const WIDTHS = [1440, 1920, 2560, 390]
const THEMES = ['light', 'dark']
const ROUTES = [['landing', ''], ['plan', '#plan'], ['atlas', '#atlas'], ['method', '#method']]


const browser = await chromium.launch()
const out = []
for (const theme of THEMES) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 1200 }, colorScheme: theme })
    await ctx.addInitScript((t) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, theme)
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    for (const [name, hash] of ROUTES) {
      await page.goto(base + hash)
      await page.waitForLoadState('networkidle')
      if (name === 'atlas') await page.locator('.pick').first().waitFor({ timeout: 30000 }).catch(() => {})
      if (name === 'atlas') await page.locator('.crow').first().waitFor({ timeout: 30000 }).catch(() => {})
      if (name === 'plan' && w !== 390) await page.locator('.outlook__grid .chart-frame').first().waitFor({ timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(1500)
      const m = await page.evaluate(`(() => {
        const de = document.documentElement
        const w = (sel) => { const e = document.querySelector(sel); if (!e) return null; return Math.round(e.getBoundingClientRect().width * 10) / 10 }
        const rows = (els) => { const tops = new Map(); for (const e of els) { const r = e.getBoundingClientRect(); if (r.width === 0) continue; const k = Math.round(r.top); tops.set(k, (tops.get(k) || 0) + 1) } return [...tops.entries()].sort((a, b) => a[0] - b[0]).map((x) => x[1]) }
        const r = {
          theme: de.dataset.theme || null,
          clientWidth: de.clientWidth, scrollWidth: de.scrollWidth, bodyScrollWidth: document.body.scrollWidth,
          topbarInner: w('.topbar__inner'), workspace: w('.workspace'), atlasPage: w('.page--atlas'), landingFrame: w('.landing__frame'), methodPage: w('.page--method'),
        }
        const grid = document.querySelector('.outlook__grid')
        if (grid) {
          const kids = [...grid.children]
          r.planGrid = { width: w('.outlook__grid'), rowCounts: rows(kids), cards: kids.map((k) => ({ cls: [...k.classList].filter((c) => c.startsWith('chart-frame--')).join(' '), w: Math.round(k.getBoundingClientRect().width) })) }
        }
        const picks = document.querySelector('.picks')
        if (picks) r.picks = { width: w('.picks'), cols: getComputedStyle(picks).gridTemplateColumns.split(' ').length, rowCounts: rows(picks.querySelectorAll(':scope > .pick')), n: picks.querySelectorAll(':scope > .pick').length }
        const also = document.querySelector('.also__list')
        if (also) r.also = { cols: getComputedStyle(also).gridTemplateColumns.split(' ').length, rowCounts: rows(also.children), n: also.children.length }
        const row = document.querySelector('.crow')
        if (row) {
          const g = (s) => { const e = row.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) } }
          const bar = g('.crow__bar'), odds = g('.crow__odds'), spend = g('.crow__spend'), delta = g('.crow__delta')
          r.crow = { rowWidth: Math.round(row.getBoundingClientRect().width), cols: getComputedStyle(row).gridTemplateColumns, odds, bar, spend, delta,
            gapBarToSpend: bar && spend ? spend.l - bar.r : null, gapBarRightToSpendRight: bar && spend ? spend.r - bar.r : null }
        }
        return r
      })()`)
      const rec = { label, theme, width: w, route: name, ...m, errors: [...errors] }
      out.push(rec)
      console.log(JSON.stringify(rec))
      if (shots && w !== 390 && (name === 'atlas' || name === 'plan' || (theme === 'light'))) {
        await page.screenshot({ path: `${outDir}/${label}-${name}-${w}-${theme}.png`, fullPage: name === 'atlas' || name === 'plan' })
      }
      if (shots && w === 390 && theme === 'light') await page.screenshot({ path: `${outDir}/${label}-${name}-390-${theme}.png` })
    }
    await ctx.close()
  }
}
await browser.close()
fs.writeFileSync(`${outDir}/${label}-measurements.json`, JSON.stringify(out, null, 1))
