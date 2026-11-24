// Stage 2 verification: drives the built app (vite preview) in headless Chromium and checks the
// walkthrough against the engines re-run in node with the same inputs.
// Run from the repo root after `npm run build`: node docs/evidence/stage-2/verify-walkthrough.mjs
import { fileURLToPath } from 'node:url'
const R = fileURLToPath(new URL('../../../', import.meta.url))
const OUT = R + 'docs/evidence/stage-2/'
const { chromium } = await import(R + 'node_modules/playwright/index.mjs')
const { runnerImport } = await import(R + 'node_modules/vite/dist/node/index.js')
const { withPreview } = await import(R + 'scripts/serve-preview.mjs')
process.chdir(R)
const load = async (p) => (await runnerImport(R + p)).module
const [{ INCOME_DEFAULTS, runIncomePaths }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }, { simulate }, { CITIES }, market, wt, fmt] = await Promise.all([
  load('src/engine/income.ts'), load('src/engine/defaults.ts'), load('src/state/incomeSync.ts'), load('src/state/share.ts'), load('src/state/incomeState.ts'),
  load('src/engine/simulate.ts'), load('src/data/cities.ts'), load('src/data/market.json'), load('src/ui/income/walkthrough.ts'), load('src/ui/format.ts'),
])

const plan = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 424242, age: 60, horizonYears: 30, portfolio: 2_000_000, homeCityId: 'new-york', otherIncome: 30000, incomeStartAge: 67 })
const snap = sync.snapshotFromEvelo(plan)
const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj' }, snap, sync.SYNC_FIELDS) })
const record = sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date('2026-11-18T12:00:00Z'))
const stored = { ...inputs, step: 6, done: true, sync: record }
const unsynced = { ...inputs, step: 6, done: true }

// The engines, in node, on the same inputs.
const mk = market.default ?? market
const iRes = runIncomePaths(mk, inputs)
const eRes = simulate(mk, CITIES, plan)
const years = wt.buildYears(iRes, inputs, eRes)
const list = wt.chapters(years, inputs)
const money = (v) => fmt.currencyCompact(v)

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
console.log('node chapters:', list.map((c) => `${c.key}[${c.from}-${c.to}]`).join(' '))

const W = '[data-testid="walkthrough"]'
const seed = (ctx, income, theme = 'light') => ctx.addInitScript(([p, s, t]) => { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: p, theme: t, themeV: 2 })); localStorage.setItem('evelo:v2:income', JSON.stringify(s)) }, [plan, income, theme])
const state = (page) => page.locator(W).evaluate((el) => ({ ch: el.dataset.chapter, year: Number(el.dataset.year) }))
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
/** Ledger rows as {label: text}. */
const ledger = (page, id) => page.locator(`[data-testid=${id}] dt`).evaluateAll((dts) => Object.fromEntries(dts.map((d) => [d.textContent.trim(), d.nextElementSibling?.textContent.trim()])))

await withPreview(async (base) => {
  const browser = await chromium.launch()
  const errors = []
  const newPage = async (ctxOpt, income, theme) => {
    const ctx = await browser.newContext(ctxOpt)
    await seed(ctx, income, theme)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    return { ctx, page }
  }
  const DESK = { viewport: { width: 1280, height: 900 } }
  const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

  // --- Not before sync
  {
    const { ctx, page } = await newPage(DESK, unsynced)
    await page.goto(base + '#income')
    await page.locator('[data-testid=income-results]').waitFor({ timeout: 60000 })
    await page.waitForTimeout(4000)
    check(await page.locator('[data-testid=income-results]').isVisible(), 'unsynced: income results show')
    check((await page.locator('[data-testid=income-compare]').count()) === 0, 'unsynced: no comparison')
    check((await page.locator(W).count()) === 0, 'unsynced: no walkthrough')
    await page.screenshot({ path: OUT + 'unsynced-desk.png', fullPage: true })
    await ctx.close()
  }

  // --- Desktop, synced
  {
    const { ctx, page } = await newPage(DESK, stored)
    await page.goto(base + '#income')
    const wtl = page.locator(W)
    await wtl.waitFor({ timeout: 90000 })
    check((await page.locator('[data-testid=income-compare]').getAttribute('data-evelo')) === 'done', 'synced: walkthrough shows with eVelo result done')
    const order = await page.evaluate(() => {
      const a = document.querySelector('[data-testid=income-compare]'), b = document.querySelector('[data-testid=walkthrough]')
      return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    })
    check(order, 'walkthrough sits after (under) the comparison')
    await wtl.scrollIntoViewIfNeeded()
    const tabs = await page.locator('[role=tablist][aria-label=Chapters] [role=tab]').evaluateAll((b) => b.map((x) => x.dataset.testid.replace('wt-tab-', '')))
    check(JSON.stringify(tabs) === JSON.stringify(list.map((c) => c.key)), `rail chapters ${tabs.join(',')} match node chapters`)
    const inc = (await page.locator('[data-testid=wt-story-income]').innerText()).trim(), ev = (await page.locator('[data-testid=wt-story-evelo]').innerText()).trim()
    check(inc.length > 40 && ev.length > 40, 'per-plan chapter paragraphs present')
    console.log('  story income:', inc.replace(/\n+/g, ' / ').slice(0, 200))
    console.log('  story evelo :', ev.replace(/\n+/g, ' / ').slice(0, 200))
    check(await page.getByText("the lines don't add up").isVisible(), 'ledger note: medians don’t add up')

    // Ledger values vs engine medians, at two years
    const verifyYear = async (label) => {
      const s = await state(page)
      const iy = s.year + 1 // income median row index iy-1 = year index (both plans start at age 60)
      const m = iRes.median[s.year]
      const expInc = {
        'Dividends and interest': money(m.dividends + m.muniInterest + m.taxableInterest + m.treasuryInterest),
        'Social Security': money(m.otherIncome), 'Shares sold': money(m.gapSold), 'Portfolio at year end': money(iRes.value.p50[iy]),
      }
      const expEv = {
        Borrowed: money(eRes.yearly.borrowed[s.year]), 'Interest added': money(eRes.yearly.interest[s.year]),
        'Loan at year end': money(eRes.loan.p50[iy]), 'Portfolio at year end': money(eRes.portfolioValue.p50[iy]),
      }
      const gotI = await ledger(page, 'tl-income'), gotE = await ledger(page, 'tl-evelo')
      const ltv = (await page.locator('[data-testid=tl-evelo] .tl__who .tl__small').innerText()).trim()
      const mism = []
      // After review fix 11 the income tax shows once, in the ledger header.
      const taxHead = (await page.locator('[data-testid=tl-income] .tl__who .tl__small').innerText()).trim()
      if (!taxHead.includes(money(m.tax))) mism.push(`income tax header page "${taxHead}" engine ${money(m.tax)}`)
      for (const [k, v] of Object.entries(expInc)) if (gotI[k] !== v) mism.push(`income ${k}: page ${gotI[k]} engine ${v}`)
      for (const [k, v] of Object.entries(expEv)) if (gotE[k] !== v) mism.push(`evelo ${k}: page ${gotE[k]} engine ${v}`)
      const expLtv = fmt.percent(eRes.ltv.p50[iy])
      if (!ltv.includes(expLtv)) mism.push(`ltv page "${ltv}" engine ${expLtv}`)
      console.log(`  ${label} year ${s.year} income`, JSON.stringify(gotI), 'evelo', JSON.stringify(gotE), ltv)
      check(mism.length === 0, `${label}: ledger figures equal engine medians (age ${60 + s.year})${mism.length ? ': ' + mism.join('; ') : ''}`)
    }
    await verifyYear('chapter 1 first year')
    await page.screenshot({ path: OUT + 'desk-ch1.png', fullPage: false, clip: await wtl.boundingBox().then((b) => ({ x: 0, y: b.y, width: 1280, height: Math.min(b.height, 2000) })) }).catch(() => wtl.screenshot({ path: OUT + 'desk-ch1.png' }))
    await wtl.screenshot({ path: OUT + 'desk-ch1.png' })

    // Slider bounds = chapter span
    const slider = page.locator('[data-testid=wt-year]')
    const sb = await slider.evaluate((e) => [Number(e.min), Number(e.max)])
    check(sb[0] === list[0].from && sb[1] === list[0].to, `slider covers chapter 1 only: [${sb}] vs [${list[0].from},${list[0].to}]`)

    // Chart lit span and tap-to-jump
    const svg = page.locator('[data-testid=wt-chart] svg')
    const box = await svg.boundingBox()
    const lit = await page.locator('.wtchart__lit').evaluate((r) => ({ x: Number(r.getAttribute('x')), w: Number(r.getAttribute('width')) }))
    const target = list.find((c) => c.key === 'middle') ?? list[list.length - 2]
    const targetYear = Math.round((target.from + target.to) / 2)
    // x of a year: the lit rect spans [x(from), x(to+1)] for chapter 0, so the per-year width is w / (len)
    const per = lit.w / (list[0].to - list[0].from + 1)
    const x0 = lit.x - list[0].from * per
    await svg.click({ position: { x: x0 + (targetYear + 0.5) * per, y: box.height / 2 } })
    let s = await state(page)
    check(s.ch === target.key && s.year === targetYear, `chart click on year ${targetYear} jumps to ${target.key} (got ${s.ch} ${s.year})`)
    const lit2 = await page.locator('.wtchart__lit').evaluate((r) => ({ x: Number(r.getAttribute('x')), w: Number(r.getAttribute('width')) }))
    check(Math.abs(lit2.x - (x0 + target.from * per)) < 1.5 && Math.abs(lit2.w - (target.to - target.from + 1) * per) < 1.5, `lit band spans ${target.key}'s years (x ${lit2.x.toFixed(1)}, w ${lit2.w.toFixed(1)})`)
    const sb2 = await slider.evaluate((e) => [Number(e.min), Number(e.max), Number(e.value)])
    check(sb2[0] === target.from && sb2[1] === target.to && sb2[2] === targetYear, `slider now [${sb2}] for ${target.key}`)
    await verifyYear('after chart tap')
    await wtl.screenshot({ path: OUT + 'desk-tapped.png' })

    // Play: years advance one at a time and stop at the chapter's end
    const ci = list.indexOf(target)
    await page.locator(`[data-testid=wt-tab-${target.key}]`).click()
    const seen = []
    const t0 = Date.now()
    await page.locator('[data-testid=wt-play]').click()
    while (Date.now() - t0 < 30000) {
      const st = await state(page); if (seen.at(-1) !== st.year) seen.push(st.year)
      if ((await page.locator('[data-testid=wt-play]').getAttribute('aria-pressed')) === 'false') break
      await page.waitForTimeout(80)
    }
    await page.waitForTimeout(2000)
    s = await state(page)
    check(s.ch === target.key && s.year === target.to && seen[0] === target.from && seen.every((y, i) => i === 0 || y === seen[i - 1] + 1),
      `Play runs ${target.key} ${seen.join('→')} and stops at its end (${target.to}); 2s later still ${s.ch} ${s.year}`)
    await page.locator('[data-testid=wt-next]').click()
    s = await state(page)
    check(s.ch === list[ci + 1].key && s.year === list[ci + 1].from, `Next chapter carries on to ${s.ch} at ${s.year}`)

    // Arrives chapter: Social Security shows in both ledgers
    if (list.some((c) => c.key === 'arrives')) {
      await page.locator('[data-testid=wt-tab-arrives]').click()
      await verifyYear('arrives')
      const gotE = await ledger(page, 'tl-evelo')
      check(gotE['Social Security'] === money(30000) || Number(gotE['Social Security'].replace(/[$,K]/g, '')) > 0, `eVelo Social Security in arrives year: ${gotE['Social Security']}`)
    }
    check(await overflow(page) <= 0, `desktop 1280: no horizontal scroll (scrollWidth - innerWidth = ${await overflow(page)})`)
    await ctx.close()
  }

  // --- Keyboard only (desktop)
  {
    const { ctx, page } = await newPage(DESK, stored)
    await page.goto(base + '#income')
    await page.locator(W).waitFor({ timeout: 90000 })
    // Start from the walkthrough heading area: focus the last focusable before the section, then Tab.
    await page.evaluate(() => {
      const wt = document.querySelector('[data-testid=walkthrough]')
      const all = [...document.querySelectorAll('a,button,input,select,[tabindex]:not([tabindex="-1"])')].filter((e) => !e.disabled && e.offsetParent !== null)
      const before = all.filter((e) => wt.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING).at(-1)
      before.focus()
    })
    const focusId = () => page.evaluate(() => { const a = document.activeElement; return a?.dataset?.testid ?? a?.closest('[data-testid]')?.dataset.testid ?? a?.tagName })
    const path = []
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); path.push(await focusId()) }
    console.log('  tab order:', path.join(' → '))
    check(path[0]?.startsWith('wt-tab-'), `Tab reaches the rail first (${path[0]})`)
    for (const id of ['wt-next', 'wt-play', 'wt-chart', 'wt-year']) check(path.includes(id), `Tab reaches ${id}`)
    // Rail arrows
    await page.keyboard.press('Shift+Tab'); // back toward the rail
    await page.locator('.wt__tab[aria-selected=true]').focus()
    await page.keyboard.press('ArrowRight')
    let s = await state(page)
    check(s.ch === list[1].key && (await focusId()) === `wt-tab-${list[1].key}`, `rail ArrowRight selects and focuses ${s.ch}`)
    await page.keyboard.press('End'); s = await state(page)
    check(s.ch === list.at(-1).key, `rail End → ${s.ch}`)
    await page.keyboard.press('Home'); s = await state(page)
    check(s.ch === list[0].key, `rail Home → ${s.ch}`)
    // Next button by keyboard
    while ((await focusId()) !== 'wt-next') await page.keyboard.press('Tab')
    await page.keyboard.press('Enter'); s = await state(page)
    check(s.ch === list[1].key, `Enter on Next chapter → ${s.ch}`)
    await page.keyboard.press('Shift+Tab'); // to Previous
    if ((await focusId()) === 'wt-prev') { await page.keyboard.press('Space'); s = await state(page); check(s.ch === list[0].key, `Space on Previous → ${s.ch}`) }
    // Chart keys
    while ((await focusId()) !== 'wt-chart') await page.keyboard.press('Tab')
    const y0 = (await state(page)).year
    await page.keyboard.press('ArrowRight'); s = await state(page)
    check(s.year === y0 + 1, `chart ArrowRight: year ${y0} → ${s.year} (${s.ch})`)
    await page.keyboard.press('End'); s = await state(page)
    check(s.year === years.length - 1 && s.ch === 'estate', `chart End → last year ${s.year} in ${s.ch}`)
    // Slider keys
    while ((await focusId()) !== 'wt-year') await page.keyboard.press('Tab')
    await page.keyboard.press('Home'); const a = (await state(page)).year
    await page.keyboard.press('ArrowRight'); const b = (await state(page)).year
    const est = list.at(-1)
    check(a === est.from && b === est.from + 1, `slider Home/ArrowRight: ${a} → ${b} within estate [${est.from},${est.to}]`)
    await page.keyboard.press('End'); await page.keyboard.press('ArrowRight')
    check((await state(page)).year === est.to, 'slider stops at the chapter end')
    await page.locator('[data-testid=wt-chart] svg').focus()
    await page.locator(W).screenshot({ path: OUT + 'desk-keyboard-chart-focus.png' })
    await ctx.close()
  }

  // --- Phone 390
  {
    const { ctx, page } = await newPage(PHONE, stored)
    await page.goto(base + '#income')
    const wtl = page.locator(W)
    await wtl.waitFor({ timeout: 90000 })
    await wtl.scrollIntoViewIfNeeded(); await page.waitForTimeout(400)
    const o = await overflow(page)
    const past = await page.evaluate((sel) => [...document.querySelectorAll(sel + ' *')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5).length, W)
    check(o <= 0 && past === 0, `phone 390: no horizontal scroll (overflow ${o}, elements past edge ${past})`)
    await wtl.screenshot({ path: OUT + 'phone-ch1.png' })
    const svg = page.locator('[data-testid=wt-chart] svg'); const box = await svg.boundingBox()
    await svg.tap({ position: { x: box.width * 0.6, y: box.height / 2 } })
    const s = await state(page)
    check(s.ch !== list[0].key, `phone: tapping the chart at 60% jumps (${s.ch} ${s.year})`)
    await wtl.screenshot({ path: OUT + 'phone-tapped.png' })
    check(await overflow(page) <= 0, 'phone 390: still no horizontal scroll after tap')
    await ctx.close()
  }

  // --- Reduced motion
  {
    const { ctx, page } = await newPage({ ...DESK, reducedMotion: 'reduce' }, stored)
    await page.goto(base + '#income')
    await page.locator(W).waitFor({ timeout: 90000 })
    const moving = await page.evaluate((sel) => [...document.querySelectorAll(sel + ', ' + sel + ' *')].filter((e) => {
      const cs = getComputedStyle(e)
      return cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0) || (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0)
    }).map((e) => e.className?.baseVal ?? e.className), W)
    check(moving.length === 0, `reduced motion: no transitions/animations in the section${moving.length ? ': ' + moving.slice(0, 5).join(', ') : ''}`)
    const c0 = list[0]
    const seen = []; const t0 = Date.now()
    await page.locator('[data-testid=wt-play]').click()
    while (Date.now() - t0 < 60000) {
      const st = await state(page); if (seen.at(-1) !== st.year) seen.push(st.year)
      if ((await page.locator('[data-testid=wt-play]').getAttribute('aria-pressed')) === 'false') break
      await page.waitForTimeout(80)
    }
    const s = await state(page)
    check(seen.length > 1 && s.year === c0.to, `reduced motion: Play still steps ${seen.join('→')} and stops at ${c0.to} (${Date.now() - t0}ms)`)
    await ctx.close()
  }

  // --- Dark mode
  {
    const { ctx, page } = await newPage({ ...DESK, colorScheme: 'dark' }, stored, 'dark')
    await page.goto(base + '#income')
    const wtl = page.locator(W)
    await wtl.waitFor({ timeout: 90000 })
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    const colors = await wtl.evaluate((el) => ({ bg: getComputedStyle(document.body).backgroundColor, text: getComputedStyle(el.querySelector('.wt__title')).color, ledger: getComputedStyle(el.querySelector('.tl__num')).color }))
    console.log('  dark', theme, JSON.stringify(colors))
    await wtl.screenshot({ path: OUT + 'desk-dark.png' })
    const ph = await newPage({ ...PHONE, colorScheme: 'dark' }, stored, 'dark')
    await ph.page.goto(base + '#income'); await ph.page.locator(W).waitFor({ timeout: 90000 })
    await ph.page.locator(W).screenshot({ path: OUT + 'phone-dark.png' })
    await ph.ctx.close()
    await ctx.close()
  }

  check(errors.length === 0, `no console/page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await browser.close()
})
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed')
process.exit(fails.length ? 1 : 0)
