// Stage 2 browser checks against the built app (npm run build first).
// node docs/evidence/stage-2/verify.mjs  -> screenshots + run-product.txt in this folder.
// Check 2: Outlook "Portfolio lens" card shows "Avg. return" (average year) beside "Median CAGR", desktop 1440 + phone 390, dark.
// Check 1 (in the app): a link with the loan rate between the shown Median CAGR (nominal) and the average year
//   (nominal) gets the loan diagnosis quoting the compounded figure.
// Check 4/5: Method page currency paragraph and dividend drag default; plan rail drag input + tooltip.
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPreview } from '../../../scripts/serve-preview.mjs'

const OUT = dirname(fileURLToPath(import.meta.url))
const log = []
const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
let fails = 0
const check = (ok, msg) => { L(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails++ }
const link = (d) => Buffer.from(JSON.stringify({ v: 1, d }), 'utf8').toString('base64url')

async function newCtx(b, phone) {
  const ctx = await b.newContext({
    colorScheme: 'dark',
    ...(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } }),
  })
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.clear()
    localStorage.setItem('evelo:v2:entered', '1')
    localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'dark' }))
  })
  return ctx
}
function watch(p, errors) {
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text().slice(0, 200)}`) })
}
async function settle(p, ms = 4000) { await p.waitForLoadState('networkidle'); await p.waitForTimeout(ms) }

async function lens(p) {
  return p.evaluate(() => {
    const card = [...document.querySelectorAll('.lens')][0]
    if (!card) return null
    const cells = [...card.querySelectorAll('.lens__stats > div')].map((d) => {
      const els = [...d.querySelectorAll('.t-eyebrow, .lens__num, .lens__sub')]
      return {
        text: d.innerText.replace(/\s+/g, ' ').trim(),
        truncated: els.some((e) => e.scrollWidth > e.clientWidth + 1),
        rect: (() => { const r = d.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width)] })(),
      }
    })
    return cells
  })
}
const why = (p) => p.evaluate(() => document.querySelector('.verdict__why')?.textContent.trim() ?? null)

await withPreview(async (base) => {
  const b = await chromium.launch()
  try {
    let avgNom = null, cagrNom = null
    for (const phone of [false, true]) {
      const vp = phone ? 'phone' : 'desktop'
      // ---- Check 2: defaults, Outlook lens card ----
      L(`\n== [${vp}] Check 2: Outlook lens card, default plan ==`)
      let ctx = await newCtx(b, phone)
      let p = await ctx.newPage()
      let errors = []
      watch(p, errors)
      await p.goto(`${base}#outlook`)
      await settle(p, 6000)
      const cells = await lens(p)
      L(`lens cells: ${JSON.stringify(cells)}`)
      const avg = cells?.find((c) => /^avg\. return/i.test(c.text))
      const cagr = cells?.find((c) => /^median cagr/i.test(c.text))
      check(!!avg && /average year · after inflation · [\d.]+% nominal/.test(avg.text), `[${vp}] "Avg. return" labelled "average year · after inflation · N% nominal": ${avg?.text}`)
      check(!!cagr && /after inflation · [\d.]+% nominal/.test(cagr.text), `[${vp}] "Median CAGR" present in the same row: ${cagr?.text}`)
      check(!(await p.evaluate(() => document.body.innerText.includes('Exp. return'))), `[${vp}] no "Exp. return" left on the Outlook`)
      check(cells && cells.every((c) => !c.truncated), `[${vp}] no stat label/number/sub truncated`)
      const h = p.locator('.lens').first()
      await h.scrollIntoViewIfNeeded()
      await p.waitForTimeout(800)
      await p.locator('.lens').first().locator('xpath=ancestor::*[contains(@class,"chart-frame") or self::figure or self::section][1]').screenshot({ path: join(OUT, `outlook-lens-${vp}-dark.png`) }).catch(async () => {
        await h.screenshot({ path: join(OUT, `outlook-lens-${vp}-dark.png`) })
      })
      if (!phone) {
        avgNom = parseFloat(avg.text.match(/([\d.]+)% nominal/)[1])
        cagrNom = parseFloat(cagr.text.match(/([\d.]+)% nominal/)[1])
        L(`default: avg year nominal ${avgNom}%, median CAGR nominal ${cagrNom}%, default diagnosis: ${await why(p)}`)
      }
      check(errors.length === 0, `[${vp}] no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()

      // ---- Check 1 in the app: loan rate between CAGR and average ----
      const rate = Math.round(((cagrNom + avgNom) / 2) * 4) / 4 / 100 // on the slider's 0.25% grid
      L(`\n== [${vp}] Check 1 in app: loanRate ${(rate * 100).toFixed(2)}% (CAGR ${cagrNom}% < rate < avg ${avgNom}%) ==`)
      check(rate * 100 > cagrNom && rate * 100 < avgNom, `[${vp}] chosen rate sits between the two`)
      ctx = await newCtx(b, phone)
      p = await ctx.newPage()
      errors = []
      watch(p, errors)
      await p.goto(`${base}#plan?p=${link({ loanRate: rate })}`)
      await settle(p, 2000)
      await p.evaluate(() => { location.hash = '#outlook' })
      await settle(p, 6000)
      const w = await why(p)
      const c2 = await lens(p)
      L(`diagnosis: ${w}`)
      L(`lens: ${JSON.stringify(c2?.map((c) => c.text))}`)
      const shownCagr = c2?.find((c) => /^median cagr/i.test(c.text))?.text.match(/([\d.]+)% nominal/)?.[1]
      check(!!w && new RegExp(`^The loan costs ${(rate * 100).toFixed(1).replace('.0', '')}(\\.0)?% a year`).test(w) && w.includes(`about ${shownCagr}% a year compounded`), `[${vp}] diagnosis quotes loan ${(rate * 100).toFixed(1)}% and the compounded ${shownCagr}% shown as Median CAGR nominal`)
      check(!w?.includes(`${avgNom}%`), `[${vp}] diagnosis does not quote the average year ${avgNom}%`)
      await p.evaluate(() => window.scrollTo(0, 0))
      await p.waitForTimeout(500)
      await p.screenshot({ path: join(OUT, `loan-diagnosis-${vp}-dark.png`) })
      check(errors.length === 0, `[${vp}] no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()

      // ---- Check 4/5: Method page ----
      L(`\n== [${vp}] Checks 4/5: Method page ==`)
      ctx = await newCtx(b, phone)
      p = await ctx.newPage()
      errors = []
      watch(p, errors)
      await p.goto(`${base}#method`)
      await settle(p, 2500)
      const cur = p.locator('p', { hasText: 'Then the currency.' }).first()
      const curText = (await cur.innerText()).replace(/\s+/g, ' ')
      L(`currency paragraph: ${curText}`)
      check(/typical future keeps today’s rate/.test(curText), `[${vp}] currency paragraph: typical future keeps today's rate`)
      check(/volatile currency costs odds/.test(curText), `[${vp}] currency paragraph: a volatile currency costs odds`)
      await cur.scrollIntoViewIfNeeded()
      await cur.screenshot({ path: join(OUT, `method-currency-${vp}-dark.png`) })
      const drag = p.locator('p', { hasText: 'tax on dividends' }).first()
      const dragText = (await drag.innerText()).replace(/\s+/g, ' ')
      L(`dividend paragraph: ${dragText}`)
      check(/0\.4% a year drag/.test(dragText), `[${vp}] Method page shows the 0.4% dividend drag default`)
      await drag.scrollIntoViewIfNeeded()
      await drag.screenshot({ path: join(OUT, `method-dividend-drag-${vp}-dark.png`) })
      const allText = await p.evaluate(() => document.body.innerText)
      const dragHits = allText.match(/[^.]*dividend[^.]*\d[^.]*/gi) ?? []
      L(`all dividend mentions with numbers: ${JSON.stringify(dragHits)}`)
      check(errors.length === 0, `[${vp}] no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()

      // ---- Check 5: plan rail drag input + tooltip ----
      L(`\n== [${vp}] Check 5: plan rail dividend drag ==`)
      ctx = await newCtx(b, phone)
      p = await ctx.newPage()
      errors = []
      watch(p, errors)
      await p.goto(`${base}#plan`)
      await settle(p, 2500)
      const tip = p.getByRole('button', { name: 'What is dividend tax drag?' }).first()
      await tip.scrollIntoViewIfNeeded()
      const field = await p.evaluate(() => {
        const r = [...document.querySelectorAll('input[type="range"], [role="slider"]')].find((e) => /dividend tax drag/i.test(e.getAttribute('aria-label') ?? '') || /dividend tax drag/i.test(e.closest('.slider')?.textContent ?? ''))
        if (!r) return null
        const box = r.closest('.slider') ?? r.parentElement
        return `${r.getAttribute('aria-valuetext') ?? r.value} | ${box.innerText.replace(/\s+/g, ' ').slice(0, 160)}`
      })
      L(`drag field: ${field}`)
      check(/0\.40?%/.test(field ?? ''), `[${vp}] drag input shows 0.40% by default`)
      if (phone) await tip.tap(); else await tip.hover()
      await p.waitForTimeout(600)
      const tipText = await p.evaluate(() => [...document.querySelectorAll('[role="tooltip"], .infotip__panel, .tip')].map((e) => e.textContent.trim()).filter((t) => /dividend/i.test(t)).join(' | '))
      L(`tooltip: ${tipText}`)
      check(/1\.7% × 23\.8% ≈ 0\.40%/.test(tipText), `[${vp}] tooltip gives 1.7% × 23.8% ≈ 0.40%`)
      await p.screenshot({ path: join(OUT, `plan-dividend-drag-${vp}-dark.png`) })
      check(errors.length === 0, `[${vp}] no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }
  } finally {
    await b.close()
  }
})
L(`\n${fails ? `${fails} FAILED` : 'all ok'}`)
writeFileSync(join(OUT, 'run-product.txt'), '$ node docs/evidence/stage-2/verify.mjs\n' + log.join('\n') + '\n')
process.exit(fails ? 1 : 0)
