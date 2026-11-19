// Stage 1 verification: chart readouts on the built app, in headless Chromium.
// Run from the repo root after `npm run build`: `node docs/evidence/stage-1/readouts.mjs`.
// Writes screenshots next to itself; prints ok/FAIL lines; exits non-zero on any failure.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { runnerImport } from 'vite'
import { withPreview } from '../../../scripts/serve-preview.mjs'

const ROOT = new URL('../../../', import.meta.url).pathname
const OUT = new URL('./', import.meta.url).pathname
const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const info = (msg) => console.log(`     ${msg}`)
const load = async (p) => (await runnerImport(ROOT + p)).module

const [{ runIncomePaths, INCOME_DEFAULTS }, { simulate }, { CITIES }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }, { compareReadout }, { readoutRows }, { currency }] = await Promise.all([
  load('src/engine/income.ts'), load('src/engine/simulate.ts'), load('src/data/cities.ts'), load('src/engine/defaults.ts'),
  load('src/state/incomeSync.ts'), load('src/state/share.ts'), load('src/state/incomeState.ts'),
  load('src/ui/income/compareChart.ts'), load('src/ui/income/incomeChart.ts'), load('src/ui/format.ts'),
])
const market = JSON.parse(readFileSync(ROOT + 'src/data/market.json', 'utf8'))
const money = (v) => currency(Math.round(v / 100) * 100)

function captureWorker() {
  const W = window.Worker
  window.__income = []
  window.Worker = class extends W {
    constructor(...a) { super(...a); this.addEventListener('message', (e) => { if (e.data && e.data.kind === 'income') window.__income.push(e.data.result) }) }
  }
}
const phoneCtx = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const deskCtx = { viewport: { width: 1280, height: 860 } }
const CHART = '[data-testid="income-chart"]'
const field = (k) => `[data-field="${k}"]`
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

const QUESTIONS = [
  { fill: { portfolio: '2.4M', basisFraction: '60', spending: '96k' }, layers: 0 },
  { fill: { age: '62', horizonYears: '30' }, layers: 0 },
  { fill: { stockShare: '55%' }, layers: 1 },
  { fill: { muniShare: '70' }, layers: 2 },
  { select: { 'if-home': 'new-york', 'if-filing': 'mfj' }, layers: 3 },
  { fill: { otherIncome: '$40,000', incomeStartAge: '67' }, layers: 4 },
]
const LABELS = { 1: ['Dividends'], 2: ['Dividends', 'Muni coupons', 'Taxable interest'], 3: ['Dividends', 'Muni coupons', 'Taxable interest', 'Tax'] }

async function layersAre(page, n) {
  return page.waitForFunction(([sel, n]) => { const el = document.querySelector(sel); return el && el.dataset.layers === String(n) && el.getAttribute('aria-busy') !== 'true' }, [CHART, n], { timeout: 60000 }).then(() => true, () => false)
}

/** The visible readout inside `scope`: its age, note, rows and bounds. */
async function readout(page, scope) {
  return page.locator(`${scope} [data-testid="chart-readout"]`).evaluate((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      on: el.classList.contains('is-on') && cs.visibility === 'visible',
      age: Number(el.querySelector('.cread__age b')?.textContent),
      note: el.querySelector('.cread__age span')?.textContent ?? '',
      rows: [...el.querySelectorAll('.cread__row')].map((x) => [x.querySelector('.cread__label').textContent, x.querySelector('b').textContent, x.classList.contains('is-faint')]),
      box: { l: r.left, r: r.right, t: r.top, b: r.bottom },
      vw: window.innerWidth, vh: window.innerHeight,
    }
  }).catch(() => null)
}
const fmtBox = (b) => `L${b.l.toFixed(1)} R${b.r.toFixed(1)} T${b.t.toFixed(1)} B${b.b.toFixed(1)}`

/** Bar i's centre in the income chart, page coords. */
async function barXY(page, scope, i) {
  const b = await page.locator(`${scope} .ic__bar`).nth(i).boundingBox()
  const p = await page.locator(`${scope} .ic__plot`).boundingBox()
  return { x: b.x + b.width / 2, y: p.y + p.height * 0.5 }
}

async function touchDrag(page, scope, from, to, steps = 8) {
  const cdp = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  for (let s = 1; s <= steps; s++) {
    const x = from.x + ((to.x - from.x) * s) / steps
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, from.y) })
  }
  const mid = await readout(page, scope)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  return mid
}

// ─────────────────────────────────── income chart: walk + results
async function incomeRun(browser, base, w) {
  const name = `${w}`
  const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), reducedMotion: 'reduce' })
  await ctx.addInitScript(captureWorker)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#income')
  await page.locator('.iask').waitFor({ timeout: 15000 })

  for (const [i, q] of QUESTIONS.entries()) {
    const n = i + 1
    for (const [k, v] of Object.entries(q.fill ?? {})) await page.locator(field(k)).fill(v)
    for (const [id, v] of Object.entries(q.select ?? {})) await page.locator('#' + id).selectOption(v)
    await layersAre(page, q.layers)
    const variant = await page.locator('figure.ic').getAttribute('class').catch(() => null)
    if (q.layers >= 1) {
      const svgTab = await page.locator(`${CHART} .ic__svg`).getAttribute('tabindex')
      const nRead = await page.locator(`${CHART} [data-testid="chart-readout"]`).count()
      if (w === 1280) {
        check(/ic--ask/.test(variant) && svgTab === '0' && nRead === 1, `${name} ask q${n}: desktop ask chart (${variant}) is focusable with a readout`)
        const mid = Math.floor((await page.locator(`${CHART} .ic__bar`).count()) / 2)
        const p = await barXY(page, CHART, mid)
        await page.mouse.move(p.x, p.y)
        const r = await readout(page, CHART)
        const labels = r?.rows.map((x) => x[0]) ?? []
        const want = q.layers >= 4 ? null : LABELS[q.layers]
        if (want) check(r?.on && JSON.stringify(labels) === JSON.stringify(want), `${name} ask q${n} (layers ${q.layers}): readout shows only unlocked lines: ${labels.join(', ')}`)
        else check(r?.on && labels.includes('Spending') && labels.includes('Tax') && labels.includes('Social Security') === (r.age >= 67), `${name} ask q${n} (layers 4): readout adds Social Security/Spending: ${labels.join(', ')} (age ${r?.age})`)
        await page.screenshot({ path: `${OUT}ask-1280-q${n}-hover.png` })
        await page.mouse.move(5, 5)
      } else {
        check(/ic--phone-ask/.test(variant) && svgTab === null && nRead === 0, `${name} ask q${n}: phone ask chart (${variant}) has no tabindex (${svgTab}) and no readout element (${nRead})`)
        const box = await page.locator(`${CHART} .ic__plot`).boundingBox()
        check(Math.round(box.height) === 150, `${name} ask q${n}: phone ask plot is 150px tall (${box.height})`)
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        const dimmed = await page.locator(`${CHART} .ic__bars.is-hovering`).count()
        check(dimmed === 0 && (await page.locator('[data-testid="chart-readout"]').count()) === 0, `${name} ask q${n}: a tap on the phone ask chart shows no readout and dims nothing`)
        await page.screenshot({ path: `${OUT}ask-390-q${n}-tap.png` })
      }
    } else {
      check((await page.locator('[data-testid="chart-readout"]').count()) === 0, `${name} ask q${n}: no layers yet, no readout`)
    }
    if (n === 1) await page.locator(field('basisFraction')).press('Enter')
    else await page.getByRole('button', { name: n === 6 ? 'See the answer' : 'Next' }).click()
  }

  // Results
  await page.locator('[data-testid="income-results"]').waitFor()
  await layersAre(page, 5)
  await page.waitForFunction(() => document.querySelector('[data-testid="income-results"]')?.getAttribute('aria-busy') === 'false', null, { timeout: 60000 }).catch(() => {})
  const result = await page.evaluate(() => window.__income.at(-1))
  const rows = result.median
  const hasSocial = rows.some((r) => r.otherIncome > 0)
  const nBars = await page.locator(`${CHART} .ic__bar`).count()
  check(nBars === rows.length && rows.length === 30, `${name} results: ${nBars} bars for ${rows.length} median years`)
  await page.locator(CHART).scrollIntoViewIfNeeded()

  // Ledger rows by age
  await page.getByRole('button', { name: 'See year by year' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.waitFor()
  const ledger = await sheet.locator('tbody tr').evaluateAll((trs) => Object.fromEntries(trs.map((tr) => {
    const age = Number(tr.querySelector('th').textContent.match(/age (\d+)/)[1])
    return [age, [...tr.querySelectorAll('td')].map((td) => td.textContent.trim())]
  })))
  const COLS = ['Dividends', 'Muni coupons', 'Taxable interest', 'Treasury interest', 'Social Security', 'Tax', 'Sold to cover', 'Value']
  await page.keyboard.press('Escape')
  await sheet.waitFor({ state: 'hidden' })
  await page.locator(CHART).scrollIntoViewIfNeeded()

  const num = (s) => Number(String(s).replace(/[^0-9.-]/g, '')) || 0
  const probe = w === 1280 ? [0, 4, 12, 22, 29] : [0, 5, 29]
  for (const i of probe) {
    let r
    if (w === 1280) { const p = await barXY(page, CHART, i); await page.mouse.move(p.x, p.y); r = await readout(page, CHART) }
    else { const p = await barXY(page, CHART, i); await page.touchscreen.tap(p.x, p.y); r = await readout(page, CHART) }
    const row = rows[i]
    const active = await page.locator(`${CHART} .ic__bar.is-active`).count()
    const ops = await page.locator(`${CHART} .ic__bar`).evaluateAll((gs) => gs.map((g) => Number(getComputedStyle(g).opacity)))
    const dimOk = ops[i] === 1 && ops.every((o, j) => j === i || o < 0.5)
    const want = readoutRows(row, 5, hasSocial).map((l) => [l.label, money(l.value)])
    const got = r?.rows.map((x) => [x[0], x[1]]) ?? []
    check(r?.on && r.age === row.age && active === 1 && dimOk, `${name} results ${w === 1280 ? 'hover' : 'tap'} bar ${i}: readout on, age ${r?.age} (= ${row.age}), one bar active, rest dimmed (opacity ${ops[i]} vs ${ops[(i + 1) % ops.length]})`)
    check(JSON.stringify(got) === JSON.stringify(want), `${name} results bar ${i}: readout = worker's median year → ${got.map((x) => x.join(' ')).join(' · ')}`)
    // Against the ledger row
    const L = Object.fromEntries(COLS.map((c, j) => [c, ledger[row.age]?.[j]]))
    const g = Object.fromEntries(got)
    const ledgerOk = ['Dividends', 'Muni coupons', 'Social Security', 'Tax'].every((k) => g[k] === undefined ? num(L[k]) === 0 : g[k] === L[k])
      && (g['Sold to cover'] ? g['Sold to cover'] === L['Sold to cover'] : num(L['Sold to cover']) === 0)
      && Math.abs(num(g['Taxable interest']) - num(L['Taxable interest']) - num(L['Treasury interest'])) <= 100
    check(ledgerOk, `${name} results bar ${i}: matches ledger row age ${row.age} (ledger: ${COLS.slice(0, 7).map((c) => `${c} ${L[c]}`).join(', ')})`)
    const ends = ['Spending', 'Sold to cover', 'Reinvested']
    check(got.some((x) => x[0] === 'Spending') && got.some((x) => x[0] === 'Sold to cover' || x[0] === 'Reinvested'), `${name} results bar ${i}: cash in vs spending, with ${got.filter((x) => ends.includes(x[0])).map((x) => x.join(' ')).join(' / ')}`)
    if (i === 0 || i === 29) {
      const ov = await overflow(page)
      const inW = r && r.box.l >= 0 && r.box.r <= r.vw
      const inH = r && r.box.t >= 0 && r.box.b <= r.vh
      check(inW && ov <= 0, `${name} results year ${i === 0 ? 'first' : 'last'}: readout inside viewport width (${fmtBox(r.box)}, vw ${r.vw}), page overflow ${ov}`)
      check(inH, `${name} results year ${i === 0 ? 'first' : 'last'}: readout inside viewport height (vh ${r.vh})`)
      const plot = await page.locator(`${CHART} .ic__plot`).boundingBox()
      info(`income plot ${plot.x.toFixed(1)}..${(plot.x + plot.width).toFixed(1)} x, ${plot.y.toFixed(1)}..${(plot.y + plot.height).toFixed(1)} y; readout below plot bottom by ${(r.box.b - plot.y - plot.height).toFixed(1)}px`)
      await page.screenshot({ path: `${OUT}results-${w}-${i === 0 ? 'first' : 'last'}.png` })
    }
  }

  if (w === 390) {
    const p = await barXY(page, CHART, 3)
    await page.touchscreen.tap(p.x, p.y)
    const r = await readout(page, CHART)
    const plot = await page.locator(`${CHART} .ic__plot`).boundingBox()
    check(r.on && r.box.t >= plot.y + plot.height, `${name} results: on a phone the readout sits under the bars (readout top ${r.box.t.toFixed(1)} ≥ plot bottom ${(plot.y + plot.height).toFixed(1)})`)
    const hb = await page.locator('.icmp, h1, h2').first().boundingBox().catch(() => null)
    info(`outside tap target ${JSON.stringify(hb)}; url ${page.url()}`)
    await page.touchscreen.tap(hb ? hb.x + 10 : 195, hb ? hb.y + 10 : 40)
    info(`after outside tap url ${page.url()}`)
    check(!(await readout(page, CHART)).on, `${name} results: a tap outside the chart clears the readout`)
  }
  if (w === 1280) {
    await page.mouse.move(5, 5)
    check(!(await readout(page, CHART)).on && (await page.locator(`${CHART} .ic__bar.is-active`).count()) === 0, `${name} results: mouse off the chart clears the readout and dimming`)
    await page.locator(`${CHART} .ic__svg`).focus()
    const seq = []
    for (const k of ['Home', 'ArrowRight', 'ArrowRight', 'End', 'ArrowLeft', 'PageDown', 'Home', 'ArrowLeft']) { await page.keyboard.press(k); seq.push(`${k}→${(await readout(page, CHART)).age}`) }
    const ages = seq.map((s) => Number(s.split('→')[1]))
    check(JSON.stringify(ages) === JSON.stringify([62, 63, 64, 91, 90, 85, 62, 62]), `${name} results keys: ${seq.join(' ')}`)
    await page.keyboard.press('End')
    await page.screenshot({ path: `${OUT}results-1280-key-end.png` })
    await page.keyboard.press('Escape')
    check(!(await readout(page, CHART)).on, `${name} results: Escape clears the readout`)
  } else {
    const a = await barXY(page, CHART, 2), b = await barXY(page, CHART, 20)
    const mid = await touchDrag(page, CHART, a, b)
    const after = await readout(page, CHART)
    check(mid?.on && after?.on && after.age === rows[20].age, `${name} results: a touch drag from bar 2 to bar 20 scrubs (readout age ${after?.age}, expected ${rows[20].age})`)
    check((await overflow(page)) <= 0, `${name} results: no sideways scroll after drag`)
  }
  check(errors.length === 0, `${name}: no page/console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

// ─────────────────────────────────── comparison chart (seeded like e2e/income-compare.mjs)
function scenario() {
  const plan = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 424242, age: 60, horizonYears: 28, portfolio: 3_000_000, homeCityId: 'new-york' })
  const snap = sync.snapshotFromEvelo(plan)
  const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj' }, snap, sync.SYNC_FIELDS) })
  const record = sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date('2026-11-18T12:00:00Z'))
  const stored = { ...inputs, step: 6, done: true, sync: record }
  const ir = runIncomePaths(market, inputs)
  const er = simulate(market, CITIES, plan)
  const series = [{ key: 'income', label: 'Living on income', age: inputs.age, bands: ir.value }, { key: 'evelo', label: 'eVelo', age: plan.age, bands: er.netWorth }]
  return { plan, stored, series }
}

async function compareRun(browser, base, w, s) {
  const name = `${w} compare`
  const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), reducedMotion: 'reduce' })
  await ctx.addInitScript(([plan, stored]) => { try { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: plan, theme: 'dark', themeV: 2 })); localStorage.setItem('evelo:v2:income', JSON.stringify(stored)) } catch {} }, [s.plan, s.stored])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#income')
  await page.locator('[data-testid="income-results"]').waitFor({ timeout: 20000 })
  const ok = await page.waitForFunction(() => document.querySelector('[data-testid="income-compare"]')?.dataset.evelo === 'done', null, { timeout: 90000 }).then(() => true, () => false)
  check(ok, `${name}: comparison ready with eVelo's result`)
  const C = '[data-testid="compare-chart"]'
  await page.locator(C).scrollIntoViewIfNeeded()
  const svg = page.locator(`${C} .cchart__svg`)
  const sb = await svg.boundingBox()
  const a0 = Math.min(s.series[0].age, s.series[1].age)

  const expectFor = (age) => {
    const e = compareReadout(s.series, age - a0)
    const rows = []
    for (const r of e.rows) { rows.push([r.label, r.median]); if (w !== 390) rows.push(['middle half', r.middle]) }
    if (e.gap) rows.push([e.gap.text, e.gap.value])
    return { note: e.note, rows }
  }
  const verify = async (label) => {
    const r = await readout(page, C)
    const cross = await page.locator(`${C} .cchart__cross`).evaluate((g) => ({ x: Number(g.querySelector('line').getAttribute('x1')), dots: g.querySelectorAll('.cchart__cross-dot').length, rings: g.querySelectorAll('.cchart__cross-ring').length })).catch(() => null)
    const e = expectFor(r?.age)
    const got = r?.rows.map((x) => [x[0], x[1]])
    check(r?.on && cross && cross.dots === 2 && cross.rings === 4, `${name} ${label}: guide line at x=${cross?.x?.toFixed(1)}, ${cross?.dots} median dots, ${cross?.rings} quartile rings; readout age ${r?.age}`)
    check(JSON.stringify(got) === JSON.stringify(e.rows) && r.note === e.note, `${name} ${label}: readout = node compareReadout → ${got?.map((x) => x.join(' ')).join(' · ')}`)
    return r
  }

  if (w === 1280) {
    for (const f of [0.3, 0.7]) { await page.mouse.move(sb.x + sb.width * f, sb.y + sb.height / 2); await verify(`hover ${Math.round(f * 100)}%`) }
    await page.screenshot({ path: `${OUT}compare-1280-hover.png` })
    await page.mouse.move(5, 5)
    check(!(await readout(page, C)).on && (await page.locator(`${C} .cchart__cross`).count()) === 0, `${name}: mouse off clears readout and guide`)
    await svg.focus()
    const seq = []
    for (const k of ['Home', 'ArrowRight', 'End', 'ArrowLeft']) { await page.keyboard.press(k); seq.push(`${k}→${(await readout(page, C)).age}`) }
    const last = Math.max(...s.series.map((x) => x.age + x.bands.p50.length - 1))
    const ages = seq.map((x) => Number(x.split('→')[1]))
    check(JSON.stringify(ages) === JSON.stringify([a0, a0 + 1, last, last - 1]), `${name} keys: ${seq.join(' ')}`)
    for (const [k, tag] of [['Home', 'first'], ['End', 'last']]) {
      await page.keyboard.press(k)
      const r = await verify(`key ${k}`)
      const ov = await overflow(page)
      check(r.box.l >= 0 && r.box.r <= r.vw && ov <= 0, `${name} ${tag} age: readout inside viewport width (${fmtBox(r.box)}, vw ${r.vw}), overflow ${ov}`)
      check(r.box.t >= 0 && r.box.b <= r.vh, `${name} ${tag} age: readout inside viewport height (vh ${r.vh})`)
      await page.screenshot({ path: `${OUT}compare-1280-${tag}.png` })
    }
    await page.keyboard.press('Escape')
    check(!(await readout(page, C)).on, `${name}: Escape clears the readout`)
  } else {
    for (const [x, tag] of [[sb.x + 2, 'first'], [sb.x + sb.width - 2, 'last']]) {
      await page.touchscreen.tap(x, sb.y + sb.height / 2)
      const r = await verify(`tap ${tag}`)
      const ov = await overflow(page)
      check(r.box.l >= 0 && r.box.r <= r.vw && ov <= 0, `${name} ${tag} age (${r.age}): readout inside viewport width (${fmtBox(r.box)}, vw ${r.vw}), overflow ${ov}`)
      check(r.box.t >= 0 && r.box.b <= r.vh, `${name} ${tag} age: readout inside viewport height (vh ${r.vh})`)
      info(`compare plot ${sb.y.toFixed(1)}..${(sb.y + sb.height).toFixed(1)} y; readout below svg bottom by ${(r.box.b - sb.y - sb.height).toFixed(1)}px`)
      await page.screenshot({ path: `${OUT}compare-390-${tag}.png` })
    }
    const mid = await touchDrag(page, C, { x: sb.x + sb.width * 0.2, y: sb.y + sb.height / 2 }, { x: sb.x + sb.width * 0.8, y: sb.y + sb.height / 2 })
    const after = await readout(page, C)
    check(mid?.on && after?.on && after.age > a0 + 5, `${name}: a touch drag scrubs (age ${after?.age})`)
  }
  check(errors.length === 0, `${name}: no page/console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

// ─────────────────────────────────── main site's fan chart
async function fanRun(browser, base) {
  const ctx = await browser.newContext({ ...deskCtx, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '#plan')
  const svg = page.locator('.fan .fan__svg').first()
  await svg.waitFor({ timeout: 30000 })
  await page.waitForTimeout(3000)
  await svg.scrollIntoViewIfNeeded()
  const b = await svg.boundingBox()
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5)
  const on = await page.locator('.fan__readout.is-on').count()
  const age = (await page.locator('.fan__readout-age').first().innerText().catch(() => '')).replace(/\s+/g, ' ')
  check(on === 1 && /\d/.test(age), `fan (#plan): hover shows eVelo's own .fan__readout (${age})`)
  await page.screenshot({ path: `${OUT}fan-1280-hover.png` })
  await page.mouse.move(2, 2)
  check((await page.locator('.fan__readout.is-on').count()) === 0, 'fan (#plan): mouse off clears it')
  check((await page.locator('[data-testid="chart-readout"]').count()) === 0, "fan (#plan): the mode's readout isn't on the main site")
  check(errors.length === 0, `fan: no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    await incomeRun(browser, base, 1280)
    await incomeRun(browser, base, 390)
    const s = scenario()
    await compareRun(browser, base, 1280, s)
    await compareRun(browser, base, 390, s)
    await fanRun(browser, base)
  } finally {
    await browser.close()
  }
}, 4183)

console.log(fails.length ? `\n${fails.length} failure(s)` : '\nall readout checks passed')
process.exit(fails.length ? 1 : 0)
