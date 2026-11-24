// Stage 4 verification (independent verifier): drives the built app (vite preview) in headless
// Chromium and checks Same storm against the engines re-run in node with the page's inputs.
// Run from the repo root after `npm run build`: node docs/evidence/stage-4/verify-same-storm.mjs
import { fileURLToPath } from 'node:url'
const R = fileURLToPath(new URL('../../../', import.meta.url))
const OUT = R + 'docs/evidence/stage-4/'
const { chromium } = await import(R + 'node_modules/playwright/index.mjs')
const { runnerImport } = await import(R + 'node_modules/vite/dist/node/index.js')
const { withPreview } = await import(R + 'scripts/serve-preview.mjs')
process.chdir(R)
const load = async (p) => (await runnerImport(R + p)).module
const [{ INCOME_DEFAULTS, runIncomePaths }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }, { simulate }, { CITIES }, market, ss, ssc, fmt] = await Promise.all([
  load('src/engine/income.ts'), load('src/engine/defaults.ts'), load('src/state/incomeSync.ts'), load('src/state/share.ts'), load('src/state/incomeState.ts'),
  load('src/engine/simulate.ts'), load('src/data/cities.ts'), load('src/data/market.json'), load('src/ui/income/sameStorm.ts'), load('src/ui/income/sameStormChart.ts'), load('src/ui/format.ts'),
])
const mk = market.default ?? market
const money = (v) => fmt.currencyCompact(v)

function scenario(patch, incomePatch = {}, planAfter = {}) {
  const plan0 = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 424242, age: 60, horizonYears: 30, homeCityId: 'new-york', ...patch })
  const snap = sync.snapshotFromEvelo(plan0)
  const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj' }, snap, sync.SYNC_FIELDS), ...incomePatch })
  const record = sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date('2026-11-18T12:00:00Z'))
  const plan = sanitizeInputs({ ...plan0, ...planAfter })
  return { plan, inputs, stored: { ...inputs, step: 6, done: true, sync: record } }
}

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const SS = '[data-testid="same-storm"]'
const parseMoney = (s) => { const t = s.replace('−', '-').replace('$', ''); const m = { K: 1e3, M: 1e6, B: 1e9 }[t.slice(-1)]; return m ? parseFloat(t) * m : parseFloat(t) }
const parsePath = (d) => [...(d ?? '').matchAll(/[ML]\s*(-?[\d.]+(?:e-?\d+)?),(-?[\d.]+(?:e-?\d+)?)/g)].map((m) => [+m[1], +m[2]])

/** The chart's plotted values, read back from the SVG: y inverted from two tick labels per panel. */
async function readChart(page) {
  return page.locator('[data-testid=storm-chart] svg').evaluate((svg) => {
    const ticks = [...svg.querySelectorAll('text.sschart__tick')].filter((t) => t.getAttribute('text-anchor') === 'end' && !t.closest('g[transform]')).map((t) => ({ s: t.textContent, y: +t.getAttribute('y') }))
    return {
      ticks,
      income: svg.querySelector('.sschart__line--income')?.getAttribute('d'),
      evelo: svg.querySelector('.sschart__line--evelo')?.getAttribute('d'),
      ltv: svg.querySelector('.sschart__line--ltv')?.getAttribute('d'),
      call: +svg.querySelector('.sschart__call')?.getAttribute('y1'),
      sales: [...svg.querySelectorAll('.sschart__sale')].map((c) => +c.dataset.age),
    }
  })
}
const rel = (got, v, span) => { const e = Math.abs(got - v) / span; return Number.isFinite(e) ? e : Infinity }
const fit = (ticks) => { const a = ticks[0], b = ticks[ticks.length - 1]; const k = (b.v - a.v) / (b.y - a.y); return (y) => a.v + (y - a.y) * k }

await withPreview(async (base) => {
  const browser = await chromium.launch()
  const open = async (s, ctxOpt = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...ctxOpt })
    await ctx.addInitScript(([p, st, theme]) => { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: p, theme, themeV: 2 })); localStorage.setItem('evelo:v2:income', JSON.stringify(st)) }, [s.plan, s.stored, ctxOpt.colorScheme ?? 'light'])
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(base + '#income')
    await page.locator(SS).waitFor({ timeout: 90000 })
    await page.locator(SS).scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    return { ctx, page, errors }
  }
  const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

  // ---- 1. Hidden reasons, in the real UI
  const hidden = [
    ['fat-tail', scenario({ portfolio: 2_000_000 }, {}, { method: 'fat-tail' }), 'fat tails'],
    ['different-futures', scenario({ portfolio: 2_000_000 }, { seed: 424243 }), 'Futures'],
    ['different-years', scenario({ portfolio: 2_000_000 }, { horizonYears: 25 }), 'Years'],
    // Added after the builders' review fix: a fractional eVelo block length (share-link style).
    ['block-fraction', scenario({ portfolio: 2_000_000 }, {}, { blockMonths: 36.5 }), 'isn’t a whole number'],
  ]
  for (const [want, s, word] of hidden) {
    const iRes = runIncomePaths(mk, s.inputs)
    const eRes = simulate(mk, CITIES, s.plan)
    const nodeGate = ss.stormGate(s.plan, eRes, s.inputs, iRes)
    const { ctx, page, errors } = await open(s)
    await page.locator(`${SS}[data-gate="${want}"]`).waitFor({ timeout: 30000 }).catch(() => {})
    const gate = await page.locator(SS).getAttribute('data-gate')
    const line = await page.locator('[data-testid=storm-hidden]').innerText().catch(() => '')
    const chips = await page.locator(`${SS} [role=tab]`).count()
    console.log(`  hidden ${want}: page gate=${gate} node gate=${nodeGate} line="${line}"`)
    check(gate === want && nodeGate === want && line.includes(word) && chips === 0, `hidden (${want}): one line says why ("${word}"), no chips`)
    check(errors.length === 0, `hidden (${want}): no console/page errors ${errors.join(' | ')}`)
    await page.locator(SS).screenshot({ path: OUT + `hidden-${want}.png` })
    await ctx.close()
  }

  // ---- 2/3. Shown: chips, plotted values, markers, caption, alt — against node
  const cases = [
    ['default', scenario({ portfolio: 2_000_000, otherIncome: 30000, incomeStartAge: 67 })],
    ['risky', scenario({ portfolio: 1_200_000, otherIncome: 0 })],
  ]
  for (const [cname, s] of cases) {
    const iRes = runIncomePaths(mk, s.inputs)
    const eRes = simulate(mk, CITIES, s.plan)
    const gateN = ss.stormGate(s.plan, eRes, s.inputs, iRes)
    // Expected chips from the raw samples (independent of stormFutures): unique paths in key order.
    const eBy = new Map(eRes.samples.map((x) => [x.key, x])), iBy = new Map(iRes.samples.map((x) => [x.key, x]))
    const want = []
    for (const k of ['earlyCrash', 'typical', 'lateCrash', 'lucky']) {
      const a = eBy.get(k), b = iBy.get(k)
      if (!a || !b) continue
      const same = want.find((w) => w.path === a.path)
      if (same) same.keys.push(k); else want.push({ keys: [k], path: a.path, e: a.years, i: b.years })
    }
    const futuresN = ss.stormFutures(s.plan, eRes, s.inputs, iRes)
    console.log(`${cname}: node gate=${gateN} chips=${want.map((w) => w.keys.join('+') + '#' + w.path).join(' ')}`)
    const { ctx, page, errors } = await open(s)
    const gate = await page.locator(SS).getAttribute('data-gate')
    const chipIds = await page.locator(`${SS} [role=tab]`).evaluateAll((b) => b.map((x) => x.dataset.testid.replace('storm-chip-', '')))
    check(gate === 'shown' && gateN === 'shown', `${cname}: shown when both plans draw the same futures (page and node)`)
    check(JSON.stringify(chipIds) === JSON.stringify(want.map((w) => w.keys[0])), `${cname}: chips = node's distinct sample paths in key order (${chipIds.join(', ')})`)
    check(await page.evaluate(() => { const a = document.querySelector('[data-testid=income-compare]'), b = document.querySelector('[data-testid=same-storm]'), w = document.querySelector('[data-testid=walkthrough]'); return !!(a.compareDocumentPosition(b) & 4) && !!(w.compareDocumentPosition(b) & 4) }), `${cname}: mounted after the comparison and the walkthrough`)
    const start = { income: iRes.value.p50[0], evelo: eRes.netWorth.p50[0], ltv: eRes.ltv.p50[0] }
    for (let j = 0; j < want.length; j++) {
      const w = want[j]
      await page.locator(`${SS} [role=tab]`).nth(j).click()
      await page.waitForTimeout(900) // past the 600 ms tween
      const sel = await page.locator(SS).getAttribute('data-future')
      const c = await readChart(page)
      const n = Math.min(w.e.length, w.i.length)
      const age0 = s.inputs.age
      const mt = c.ticks.filter((t) => t.s.includes('$')).map((t) => ({ v: parseMoney(t.s), y: t.y - 4 }))
      const pct = c.ticks.filter((t) => t.s.includes('%')).map((t) => ({ v: parseFloat(t.s.replace('−', '-')) / 100, y: t.y - 4 }))
      const fy = fit(mt), fl = fit(pct)
      const span = Math.abs(mt[mt.length - 1].v - mt[0].v)
      const pi = parsePath(c.income), pe = parsePath(c.evelo), pl = parsePath(c.ltv)
      const expI = [start.income, ...w.i.slice(0, n).map((r) => r.portfolio)]
      const expE = [start.evelo, ...w.e.slice(0, n).map((r) => r.netWorth)]
      let worstI = 0, worstE = 0, worstL = 0
      expI.forEach((v, k) => { worstI = Math.max(worstI, rel(fy(pi[k]?.[1] ?? NaN), v, span)) })
      expE.forEach((v, k) => { worstE = Math.max(worstE, rel(fy(pe[k]?.[1] ?? NaN), v, span)) })
      // LTV points (gaps after eVelo reaches $0): map x back to year index.
      const x0 = pi[0][0], x1 = pi[pi.length - 1][0]
      for (const [px, py] of pl) { const k = Math.round(((px - x0) / (x1 - x0)) * n); const v = k === 0 ? start.ltv : w.e[k - 1].ltv; worstL = Math.max(worstL, Math.abs(fl(py) - v)) }
      check(pi.length === n + 1 && pe.length === n + 1 && worstI < 1e-4 && worstE < 1e-4 && worstL < 1e-3,
        `${cname}/${sel}: plotted net worths and LTV = engine sample rows for path ${w.path} (${n + 1} pts; max err ${(worstI * 100).toFixed(4)}% / ${(worstE * 100).toFixed(4)}% of axis, LTV ${(worstL * 100).toFixed(3)} pts; ${pl.length} LTV pts)`)
      check(Math.abs(fl(c.call) - s.plan.maxLtv) < 1e-3, `${cname}/${sel}: margin-call line at maxLtv ${s.plan.maxLtv} (read ${fl(c.call).toFixed(4)})`)
      const forcedAges = w.e.slice(0, n).map((r, y) => (r.forcedSaleSold > 0 ? age0 + y : null)).filter((a) => a !== null)
      check(JSON.stringify(c.sales) === JSON.stringify(forcedAges), `${cname}/${sel}: forced-sale markers at ages [${c.sales}] = years with forcedSaleSold>0 [${forcedAges}]`)
      // Caption vs the rows (independently recomputed)
      const cap = await page.locator('[data-testid=storm-caption]').innerText()
      const fN = futuresN.find((f) => f.path === w.path)
      check(cap === fN.caption, `${cname}/${sel}: caption equals stormFutures in node`)
      const lastE = w.e[n - 1].netWorth, lastI = w.i[n - 1].portfolio, diff = lastE - lastI
      const aheadOk = lastI <= 1 && lastE <= 1 ? /run out/.test(cap) : diff > 0 ? cap.includes(`eVelo ends ${money(diff)} ahead`) : cap.toLowerCase().includes(`living on income ends ${money(-diff)} ahead`.toLowerCase())
      const fsum = w.e.slice(0, n).reduce((t, r) => t + Math.max(0, r.forcedSaleSold), 0)
      const forcedOk = forcedAges.length ? cap.includes(`forced sale at ${forcedAges[0]} (${money(fsum)} sold in all)`) : cap.includes('never hits a forced sale')
      const sold7 = w.i.slice(0, Math.min(7, n)).reduce((t, r) => t + Math.max(0, r.sold), 0)
      const soldOk = sold7 >= 1 ? cap.includes(`sells ${money(sold7)} in its first`) : cap.includes('sells nothing')
      check(aheadOk && forcedOk && soldOk, `${cname}/${sel}: caption words follow the rows (ahead ${money(diff)}, forced ${forcedAges[0] ?? 'none'}/${money(fsum)}, sold 7y ${money(sold7)}): "${cap}"`)
      const alt = await page.locator('[data-testid=storm-chart]').getAttribute('aria-label')
      check(alt === ssc.stormChartLabel(fN) && alt.includes(money(lastI)) && alt.includes(money(lastE)), `${cname}/${sel}: chart text alternative (role=img) names both end values: "${alt.slice(0, 120)}…"`)
      if (cname === 'default') await page.locator(SS).screenshot({ path: OUT + `desk-${sel}.png` })
      if (cname === 'risky' && forcedAges.length) await page.locator(SS).screenshot({ path: OUT + `desk-risky-${sel}-forced.png` })
    }
    check((await overflow(page)) <= 0, `${cname}: desktop 1280 no horizontal scroll`)

    // Keyboard: focus the selected chip, arrows/Home/End move selection and focus
    if (cname === 'default') {
      await page.locator(`${SS} [role=tab][aria-selected=true]`).focus()
      const st = () => page.evaluate(() => ({ sel: document.querySelector('[data-testid=same-storm] [role=tab][aria-selected=true]')?.dataset.testid, focus: document.activeElement?.dataset?.testid, tab0: [...document.querySelectorAll('[data-testid=same-storm] [role=tab]')].filter((b) => b.tabIndex === 0).length }))
      const s0 = await st()
      await page.keyboard.press('ArrowRight'); const s1 = await st()
      await page.keyboard.press('ArrowLeft'); const s2 = await st()
      await page.keyboard.press('End'); const s3 = await st()
      await page.keyboard.press('Home'); const s4 = await st()
      await page.keyboard.press('ArrowLeft'); const s5 = await st()
      console.log('  keys', [s0, s1, s2, s3, s4, s5].map((x) => x.sel?.replace('storm-chip-', '')).join(' → '))
      check(s1.sel !== s0.sel && s1.focus === s1.sel && s2.sel === s0.sel && s3.sel === `storm-chip-${chipIds.at(-1)}` && s4.sel === `storm-chip-${chipIds[0]}` && s5.sel === `storm-chip-${chipIds.at(-1)}` && [s0, s1, s2, s3, s4, s5].every((x) => x.focus === x.sel && x.tab0 === 1),
        `${cname}: arrow keys / Home / End move selection and focus with a roving tabindex (wraps)`)
      await page.waitForTimeout(800)
      await page.locator(SS).screenshot({ path: OUT + 'desk-keyboard-focus.png' })
      // Animation without reduced motion: count d-attribute changes during a switch
      const count = () => page.evaluate(() => new Promise((res) => {
        const el = document.querySelector('[data-testid=same-storm] .sschart__line--evelo')
        let n = 0; const mo = new MutationObserver((ms) => { n += ms.length }); mo.observe(el, { attributes: true, attributeFilter: ['d'] })
        const tabs = [...document.querySelectorAll('[data-testid=same-storm] [role=tab]')]; const j = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
        tabs[(j + 1) % tabs.length].click()
        setTimeout(() => { mo.disconnect(); res(n) }, 1000)
      }))
      const animated = await count()
      check(animated > 3, `${cname}: without reduced motion the switch tweens (${animated} intermediate line updates)`)
    }
    check(errors.length === 0, `${cname}: no console/page errors ${errors.join(' | ')}`)
    await ctx.close()
  }

  // ---- 4. Reduced motion (dark), and phone 390
  {
    const s = cases[0][1]
    const { ctx, page, errors } = await open(s, { colorScheme: 'dark', reducedMotion: 'reduce' })
    const n = await page.evaluate(() => new Promise((res) => {
      const el = document.querySelector('[data-testid=same-storm] .sschart__line--evelo')
      const before = el.getAttribute('d'); let n = 0
      const mo = new MutationObserver((ms) => { n += ms.length }); mo.observe(el, { attributes: true, attributeFilter: ['d'] })
      const tabs = [...document.querySelectorAll('[data-testid=same-storm] [role=tab]')]; const j = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
      tabs[(j + 1) % tabs.length].click()
      setTimeout(() => { mo.disconnect(); res({ n, changed: el.getAttribute('d') !== before }) }, 1000)
    }))
    check(n.changed && n.n === 1, `reduced motion: the switch jumps in one update, no tween (${n.n} update)`)
    const tr = await page.locator(`${SS} [role=tab]`).first().evaluate((b) => getComputedStyle(b).transitionDuration)
    check(tr.split(',').every((d) => parseFloat(d) < 0.01), `reduced motion: chip transitions off (${tr})`)
    await page.locator(SS).screenshot({ path: OUT + 'desk-dark-reduced.png' })
    check(errors.length === 0, `reduced/dark: no console/page errors ${errors.join(' | ')}`)
    await ctx.close()
  }
  for (const scheme of ['light', 'dark']) {
    const s = cases[1][1]
    const { ctx, page, errors } = await open(s, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme })
    const ov = await overflow(page)
    const box = await page.locator(SS).boundingBox()
    check(ov <= 0 && box.x >= 0 && box.x + box.width <= 390, `phone 390 ${scheme}: no horizontal scroll (overflow ${ov}px, section ${Math.round(box.x)}..${Math.round(box.x + box.width)})`)
    const chipsFit = await page.locator(`${SS} [role=tab]`).evaluateAll((b) => b.every((x) => { const r = x.getBoundingClientRect(); return r.left >= 0 && r.right <= 390 && r.height >= 24 }))
    check(chipsFit, `phone 390 ${scheme}: every chip inside the viewport and >=24px tall`)
    await page.locator(`${SS} [role=tab]`).nth(1).tap()
    await page.waitForTimeout(900)
    check((await overflow(page)) <= 0, `phone 390 ${scheme}: no horizontal scroll after a tap`)
    await page.locator(SS).screenshot({ path: OUT + `phone-${scheme}.png` })
    check(errors.length === 0, `phone ${scheme}: no console/page errors ${errors.join(' | ')}`)
    await ctx.close()
  }
  await browser.close()
})
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed')
process.exit(fails.length ? 1 : 0)
