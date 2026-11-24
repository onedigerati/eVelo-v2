// End-to-end check of the comparison with eVelo inside the living-on-income mode (#income), on the
// built app in headless Chromium. Run after `npm run build`: `node e2e/income-compare.mjs`. Exits
// non-zero on any failure. Screenshots go to e2e/screenshots/ (git-ignored).
//
// Each run seeds `evelo:v2` with a plan and `evelo:v2:income` with a finished flow plus a SyncRecord
// that copied every field, then checks the page's figures against a node run of runIncomePaths and
// simulate on the same (sanitized) inputs.
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { runnerImport } from 'vite'
import { withPreview } from '../scripts/serve-preview.mjs'

const ROOT = new URL('..', import.meta.url).pathname
const SHOTS = new URL('./screenshots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const load = async (p) => (await runnerImport(ROOT + p)).module

// The engine and the mode's pure state logic, straight from the sources.
const [{ runIncomePaths, INCOME_DEFAULTS }, { simulate }, { CITIES }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }, { currencyCompact }] = await Promise.all([
  load('src/engine/income.ts'),
  load('src/engine/simulate.ts'),
  load('src/data/cities.ts'),
  load('src/engine/defaults.ts'),
  load('src/state/incomeSync.ts'),
  load('src/state/share.ts'),
  load('src/state/incomeState.ts'),
  load('src/ui/format.ts'),
])
const { swappedEveloPlan, swappedIncomeInputs } = await load('src/ui/income/swap.ts')
const [{ buildYears, chapters }, { chapterStory }, { stormFutures, stormGate }, { defaultFuture }, { incomeEvent, eveloEvent }] = await Promise.all([
  load('src/ui/income/walkthrough.ts'),
  load('src/ui/income/walkthroughStory.ts'),
  load('src/ui/income/sameStorm.ts'),
  load('src/ui/income/stormChips.ts'),
  load('src/ui/income/twinLedgers.ts'),
])
const market = JSON.parse(readFileSync(ROOT + 'src/data/market.json', 'utf8'))

const pct = (r) => `${Math.round(r * 100)}%`
const last = (a) => a[a.length - 1]
const COMPARE = '[data-testid="income-compare"]'
const phoneCtx = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const deskCtx = { viewport: { width: 1280, height: 900 } }
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

/** A plan, the mode's stored state after a full sync, and the expected figures from node. */
function scenario(planPatch, { synced = true } = {}) {
  const plan = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 424242, age: 60, horizonYears: 28, portfolio: 3_000_000, homeCityId: 'new-york', ...planPatch })
  const snap = sync.snapshotFromEvelo(plan)
  const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj' }, snap, sync.SYNC_FIELDS) })
  const record = synced ? sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date('2026-11-18T12:00:00Z')) : null
  const stored = { ...inputs, step: 6, done: true, ...(record ? { sync: record } : {}) }
  const ir = runIncomePaths(market, inputs)
  const er = simulate(market, CITIES, plan)
  return { plan, inputs, stored, ir, er }
}

const expectRates = (s) => ({
  lasts: [pct(s.ir.lastsRate), pct(1 - s.er.brokenRate)],
  principal: [pct(s.ir.principalKeptRate), pct(s.er.successRate)],
  pace: [pct(s.ir.keepsPaceRate), pct(1 - s.er.brokenRate)],
})

async function open(browser, base, s, { w, scheme }) {
  const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), colorScheme: scheme, reducedMotion: 'reduce' })
  await ctx.addInitScript(([plan, stored, theme]) => {
    try {
      localStorage.setItem('evelo:v2', JSON.stringify({ inputs: plan, theme, themeV: 2 }))
      localStorage.setItem('evelo:v2:income', JSON.stringify(stored))
    } catch {}
  }, [s.plan, s.stored, scheme])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '#income')
  await page.locator('[data-testid="income-results"]').waitFor({ timeout: 20000 })
  return { ctx, page, errors }
}

async function ready(page) {
  return page
    .waitForFunction((sel) => {
      const el = document.querySelector(sel)
      const res = document.querySelector('[data-testid="income-results"]')
      return el && el.dataset.evelo === 'done' && res?.dataset.status === 'current'
    }, COMPARE, { timeout: 90000 })
    .then(() => true, () => false)
}

const text = (page, id) => page.getByTestId(id).innerText().then((t) => t.replace(/\s+/g, ' ').trim())

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    const home = scenario({})
    const R = expectRates(home)
    const stats = {
      'compare-income-estate': currencyCompact(last(home.ir.value.p50)),
      'compare-income-tax': currencyCompact(home.ir.totalTaxMedian),
      'compare-income-sold': currencyCompact(home.ir.totalSoldMedian),
      'compare-evelo-estate': currencyCompact(home.er.estate.bbdMedian),
      'compare-evelo-loan': currencyCompact(last(home.er.loan.p50)),
    }
    console.log(`node: income lasts ${R.lasts[0]}, kept ${R.principal[0]}, pace ${R.pace[0]}; eVelo lasts ${R.lasts[1]}, principal ${R.principal[1]}; ${JSON.stringify(stats)}`)

    for (const w of [1280, 390]) {
      for (const scheme of ['dark', 'light']) {
        const name = `${w}-${scheme}`
        const { ctx, page, errors } = await open(browser, base, home, { w, scheme })
        check(await ready(page), `${name}: the comparison appears with eVelo's result`)
        const head = (await page.locator(`${COMPARE} h2`).innerText()).trim()
        check(head === 'Same person, same markets, two ways', `${name}: the header line (${head})`)

        // The switch moves both columns; every figure is the node run's.
        for (const [i, key] of ['lasts', 'principal', 'pace'].entries()) {
          const tab = page.getByTestId(`compare-tab-${key}`)
          if (i === 0) await tab.click()
          else if (w === 1280) {
            // Keyboard: arrow right from the previous tab.
            await page.getByTestId(`compare-tab-${['lasts', 'principal', 'pace'][i - 1]}`).focus()
            await page.keyboard.press('ArrowRight')
          } else await tab.click()
          const selected = await tab.getAttribute('aria-selected')
          const focusOk = w !== 1280 || i === 0 || (await page.evaluate(() => document.activeElement?.dataset?.testid)) === `compare-tab-${key}`
          const got = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
          check(selected === 'true' && focusOk && got[0] === R[key][0] && got[1] === R[key][1], `${name}: "${key}" shows ${got.join(' | ')} (node ${R[key].join(' | ')})`)
          const meaning = await text(page, 'compare-meaning')
          const want = { lasts: /solvent at the horizon/, principal: /no forced sale/, pace: /same as the money lasts/ }[key]
          check(want.test(meaning), `${name}: "${key}" states eVelo's meaning`)
        }
        if (w === 1280) {
          await page.keyboard.press('ArrowRight')
          check((await page.getByTestId('compare-tab-lasts').getAttribute('aria-selected')) === 'true', `${name}: the arrow wraps round to the first tab`)
        }
        for (const [id, v] of Object.entries(stats)) {
          const got = (await text(page, id)).split(' ').slice(-1)[0]
          check(got === v, `${name}: ${id} = ${got} (node ${v})`)
        }
        const tax = await text(page, 'compare-evelo-tax')
        check(/Not tallied: a 0\.4% yearly dividend-tax drag/.test(tax) && !/\$/.test(tax), `${name}: eVelo's lifetime tax is not invented (${tax})`)

        // The chart: role img, a label, a hidden table with every age, both series.
        const svg = page.locator('[data-testid="compare-chart"] svg[role="img"]')
        const label = (await svg.getAttribute('aria-label')) ?? ''
        const rows = await page.locator('[data-testid="compare-chart"] table tbody tr').count()
        const series = await page.locator('[data-testid="compare-chart"] .cchart__median').count()
        check(label.includes(`eVelo's median goes from`) && label.includes('Living on income'), `${name}: the chart's label names both medians`)
        check(rows === home.plan.horizonYears + 1 && series === 2, `${name}: hidden table has ${rows} ages, ${series} median lines`)
        const lines = await page.locator('[data-testid="compare-lines"] li').allInnerTexts()
        const NY_TAX = 'eVelo’s figures include New York City’s state estate tax; living on income doesn’t model it.'
        check(
          lines.length === 2 && lines[0].trim() === NY_TAX && lines[1].trim() === 'Both run on the same 1,000 futures.',
          `${name}: like for like names the home's tax and says the futures match (${lines.join(' / ')})`,
        )
        check((await page.locator('[data-testid="compare-diffs"]').count()) === 0, `${name}: nothing flagged as differing`)
        const estLabel = await page.locator('[data-testid="compare-income-estate"] dt').innerText()
        check(estLabel.trim() === 'Median estate, before inheritance tax', `${name}: the mode's estate says it is before inheritance tax (${estLabel})`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll`)

        await page.getByTestId('compare-tab-lasts').click()
        await page.locator(COMPARE).scrollIntoViewIfNeeded()
        await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-${name}.png` })
        await page.screenshot({ path: `${SHOTS}income-compare-${name}-page.png`, fullPage: true })
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }

    // The Holdings switch (Swap the mixes, stage 2): a radio group, "Each its own" by default; a shared
    // mix re-runs the borrower and the columns and chart show the swapped pair's figures (node's);
    // a seen choice is instant; nothing saved changes; it resets on leaving and coming back.
    {
      const onEvelo = swappedIncomeInputs(home.inputs, home.plan)
      const onMode = swappedEveloPlan(home.plan, home.inputs)
      const SW = { evelo: pct(runIncomePaths(market, onEvelo).lastsRate), income: pct(1 - simulate(market, CITIES, onMode).brokenRate) }
      console.log(`node: income on eVelo's mix lasts ${SW.evelo}; eVelo on the mode's mix lasts ${SW.income}`)
      const pairDone = (page, mode) =>
        page
          .waitForFunction((m) => {
            const el = document.querySelector('[data-testid="income-compare"]')
            return el?.dataset.holdings === m && el.dataset.pair === 'done'
          }, mode, { timeout: 90000 })
          .then(() => true, () => false)
      const saved = (page) => page.evaluate(() => [localStorage.getItem('evelo:v2'), localStorage.getItem('evelo:v2:income'), location.href])
      for (const w of [1280, 390]) {
        const name = `holdings-${w}`
        const { ctx, page, errors } = await open(browser, base, home, { w, scheme: 'dark' })
        check(await ready(page), `${name}: the comparison appears`)
        const before = await saved(page)
        const group = page.getByRole('radiogroup', { name: 'Holdings' })
        const radios = group.getByRole('radio')
        const labels = (await radios.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim())
        check(JSON.stringify(labels) === JSON.stringify(['Each its own', 'Both on eVelo’s mix', 'Both on this mode’s mix']), `${name}: three choices (${labels.join(' / ')})`)
        const own = group.getByRole('radio', { name: 'Each its own' })
        check((await own.getAttribute('aria-checked')) === 'true', `${name}: "Each its own" is the default`)
        const plain = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
        check(plain[0] === R.lasts[0] && plain[1] === R.lasts[1] && (await page.getByTestId('compare-what').count()) === 0 && (await page.locator('.icmp__mix-tag').count()) === 0, `${name}: the default view is unchanged (${plain.join(' | ')}, no line, no tag)`)

        // Keyboard on desktop: Tab into the group lands on the checked radio; arrows move. Taps on the phone.
        const pick = async (label, key) => {
          if (w === 1280) await page.keyboard.press(key)
          else await group.getByRole('radio', { name: label }).click()
        }
        if (w === 1280) {
          await page.getByTestId('compare-tab-pace').focus() // before the group (its info tip may come between)
          for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Tab')
            if (await page.evaluate(() => document.activeElement?.getAttribute('role') === 'radio')) break
          }
          check((await page.evaluate(() => document.activeElement?.textContent)) === 'Each its own', `${name}: Tab enters the group on the checked choice`)
        }
        await pick('Both on eVelo’s mix', 'ArrowRight')
        const eveloRadio = group.getByRole('radio', { name: 'Both on eVelo’s mix' })
        check((await eveloRadio.getAttribute('aria-checked')) === 'true', `${name}: "Both on eVelo’s mix" picked`)
        if (w === 1280) check((await page.evaluate(() => document.activeElement?.textContent)) === 'Both on eVelo’s mix', `${name}: focus follows the arrow`)
        check(await pairDone(page, 'evelo'), `${name}: the mode re-runs on eVelo's mix`)
        let got = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
        check(got[0] === SW.evelo && got[1] === R.lasts[1], `${name}: on eVelo's mix ${got.join(' | ')} (node ${SW.evelo} | ${R.lasts[1]})`)
        const swIr = runIncomePaths(market, onEvelo)
        for (const [id, v] of [['compare-income-tax', swIr.totalTaxMedian], ['compare-income-sold', swIr.totalSoldMedian], ['compare-income-estate', last(swIr.value.p50)]]) {
          const shown = (await text(page, id)).split(' ').slice(-1)[0]
          check(shown === currencyCompact(v), `${name}: on eVelo's mix ${id} = ${shown} (node ${currencyCompact(v)}, raw ${Math.round(v)})`)
        }
        const what = await text(page, 'compare-what')
        check(/^Both plans on eVelo’s mix: \d+% stocks/.test(what), `${name}: what's compared (${what})`)
        const approx = await text(page, 'compare-approx')
        check(/approximate/.test(approx) && /stock and muni shares/.test(approx), `${name}: the approximate note (${approx})`)
        const tag = page.getByTestId('compare-mix-borrowed-income')
        const keys = (side) => page.locator(`[data-testid="compare-mix-${side}"] .icmp__mix-keys li:not(.icmp__mix-tag)`).allInnerTexts()
        const incomeMix = (await keys('income')).join(', ')
        const eveloMix = (await keys('evelo')).join(', ')
        check((await tag.isVisible()) && (await tag.innerText()).trim().toLowerCase() === 'borrowed' && incomeMix === eveloMix, `${name}: the mode's mix bar shows eVelo's mix, tagged borrowed (${incomeMix})`)
        const chartOwnLabel = `Living on income's median goes from`
        const chartLabel = (await page.locator('[data-testid="compare-chart"] svg[role="img"]').getAttribute('aria-label')) ?? ''
        check(chartLabel.includes(chartOwnLabel) && chartLabel.includes(currencyCompact(last(runIncomePaths(market, onEvelo).value.p50))), `${name}: the chart shows the swapped mode's median`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll on eVelo's mix`)
        await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-${name}-evelo-mix.png` })

        await pick('Both on this mode’s mix', 'ArrowRight')
        check(await pairDone(page, 'income'), `${name}: eVelo re-runs on the mode's mix`)
        got = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
        check(got[0] === R.lasts[0] && got[1] === SW.income, `${name}: on the mode's mix ${got.join(' | ')} (node ${R.lasts[0]} | ${SW.income})`)
        const what2 = await text(page, 'compare-what')
        check(what2 === 'Both plans on this mode’s mix: 60% stocks, 20% munis, 20% taxable bonds.', `${name}: what's compared (${what2})`)
        check((await page.getByTestId('compare-approx').count()) === 0, `${name}: no approximate note on the mode's mix (eVelo's run is exact)`)
        check((await page.getByTestId('compare-mix-borrowed-evelo').isVisible()) && /SPY.*VWITX.*VFITX.*VBMFX/.test(await text(page, 'compare-mix-evelo')), `${name}: eVelo's mix bar shows the mode's four funds, tagged borrowed`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll on the mode's mix`)
        await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-${name}-mode-mix.png` })

        // Back to a seen choice: instant, no loading state.
        await pick('Both on eVelo’s mix', 'ArrowLeft')
        const instant = await page.evaluate(() => {
          const el = document.querySelector('[data-testid="income-compare"]')
          return el?.dataset.holdings === 'evelo' && el.dataset.pair === 'done' && !document.querySelector('[data-testid="income-compare"] [data-wait]')
        })
        check(instant, `${name}: switching back to eVelo's mix is instant`)
        await pick('Each its own', 'ArrowLeft')
        got = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
        check(got[0] === R.lasts[0] && got[1] === R.lasts[1] && (await page.getByTestId('compare-what').count()) === 0, `${name}: back to each its own (${got.join(' | ')})`)

        // A what-if: the saved plans and the link are untouched; leaving and coming back resets it.
        await pick('Both on this mode’s mix', 'ArrowRight') // via own → eVelo's on the keyboard
        if (w === 1280) await page.keyboard.press('ArrowRight')
        check(await pairDone(page, 'income'), `${name}: on the mode's mix before leaving`)
        const after = await saved(page)
        check(JSON.stringify(after) === JSON.stringify(before), `${name}: neither saved plan nor the link changed`)
        await page.evaluate(() => { location.hash = '#plan' })
        await page.waitForFunction(() => !document.querySelector('[data-testid="income-compare"]'), null, { timeout: 20000 })
        await page.evaluate(() => { location.hash = '#income' })
        check(await ready(page), `${name}: the comparison is back`)
        check((await page.getByRole('radiogroup', { name: 'Holdings' }).getByRole('radio', { name: 'Each its own' }).getAttribute('aria-checked')) === 'true' && (await page.locator(COMPARE).getAttribute('data-holdings')) === 'own', `${name}: back to "Each its own" after leaving`)
        const after2 = await saved(page)
        check(after2[0] === before[0] && after2[1] === before[1], `${name}: still nothing saved after leaving`)
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }

    // Below the card (Swap the mixes, stage 3): the walkthrough and Same storm follow the switch. On a
    // shared mix their figures are node's runs of the swapped pair (chapters, story, chart, ledgers,
    // Play, the storm's futures and captions), with the same path indices as each plan's own; each
    // says which mix it's on, the card's line; "Each its own" is as before.
    {
      const onEvelo = swappedIncomeInputs(home.inputs, home.plan)
      const onMode = swappedEveloPlan(home.plan, home.inputs)
      const swIr = runIncomePaths(market, onEvelo)
      const swEr = simulate(market, CITIES, onMode)
      /** What node expects below the card for a pair of runs. */
      const expectBelow = (incInputs, ir, evInputs, er) => {
        const years = buildYears(ir, incInputs, er)
        const list = chapters(years, incInputs)
        const story = chapterStory(list[0], years, { income: incInputs, evelo: er.inputs })
        const gate = stormGate(evInputs, er, incInputs, ir)
        const futures = gate === 'shown' ? stormFutures(evInputs, er, incInputs, ir) : []
        return { years, list, story, gate, futures, f: futures[defaultFuture(futures)] }
      }
      const X = {
        own: expectBelow(home.inputs, home.ir, home.plan, home.er),
        evelo: expectBelow(onEvelo, swIr, home.plan, home.er),
        income: expectBelow(home.inputs, home.ir, onMode, swEr),
      }
      const picks = (x) => JSON.stringify(x.futures.map((f) => [f.keys.join('+'), f.path]))
      console.log(`node: storm gates own ${X.own.gate}, on eVelo's mix ${X.evelo.gate}, on the mode's mix ${X.income.gate}; paths ${picks(X.own)}`)
      check(X.own.gate === 'shown' && X.evelo.gate === 'shown' && X.income.gate === 'shown', 'node: Same storm shown for the own pair and both swapped pairs')
      check(picks(X.evelo) === picks(X.own) && picks(X.income) === picks(X.own), 'node: the swapped pairs pick the same path indices as the own pair')
      const nw = (row, k) => (row[k] ? currencyCompact(row[k].netWorth) : 'not lived')
      // The overview chart's marked year: each plan's value label at the dashed marker ('not lived' when
      // the plan has no dot there). The labels hide while the readout is on, so the pointer goes away first.
      const chartMark = async (page) => {
        await page.mouse.move(0, 0)
        return page.locator('[data-testid="wt-chart-svg"] .wtchart__mark').evaluate((g) => {
          const v = (k) => g.querySelector(`.wtchart__series--${k} .wtchart__value`)?.textContent?.trim() ?? 'not lived'
          return { income: v('income'), evelo: v('evelo') }
        })
      }
      const pairDone = (page, mode) =>
        page
          .waitForFunction((m) => {
            const el = document.querySelector('[data-testid="income-compare"]')
            return el?.dataset.holdings === m && el.dataset.pair === 'done' && !!document.querySelector('[data-testid="walkthrough"]') && !!document.querySelector('[data-testid="same-storm"]')
          }, mode, { timeout: 90000 })
          .then(() => true, () => false)
      const belowCheck = async (page, name, x, mixLine) => {
        const WT = page.getByTestId('walkthrough')
        const tabs = await page.locator('[data-testid^="wt-tab-"]').evaluateAll((els) => els.map((e) => e.dataset.testid.slice(7)))
        check(JSON.stringify(tabs) === JSON.stringify(x.list.map((c) => c.key)), `${name}: walkthrough chapters ${tabs.join(',')} (node ${x.list.map((c) => c.key).join(',')})`)
        for (const who of ['income', 'evelo']) {
          const fig = (await page.locator(`[data-testid="wt-story-${who}"] .wt__part-figure`).innerText()).trim()
          check(fig === x.story[who].figure, `${name}: walkthrough story (${who}) figure ${fig} (node ${x.story[who].figure})`)
        }
        const year = Number(await WT.getAttribute('data-year'))
        const row = x.years[year]
        const shown = await chartMark(page)
        check(shown.income === nw(row, 'income') && shown.evelo === nw(row, 'evelo'), `${name}: overview chart at age ${row.age}: income ${nw(row, 'income')}, eVelo ${nw(row, 'evelo')} (${JSON.stringify(shown)})`)
        const prev = year > 0 ? x.years[year - 1] : null
        const ev = [await text(page, 'tl-income-event'), await text(page, 'tl-evelo-event')]
        const nodeEv = [incomeEvent(row.income, prev?.income), eveloEvent(row.evelo, prev?.evelo)]
        check(ev[0] === nodeEv[0] && ev[1] === nodeEv[1], `${name}: twin ledgers' events match node (${ev.join(' | ')})`)
        // Same storm: the chips are node's futures (same paths), the selected one's caption is node's.
        const SS = page.getByTestId('same-storm')
        const gate = await SS.getAttribute('data-gate')
        const chips = await page.locator('[data-testid^="storm-chip-"]').allInnerTexts()
        check(gate === 'shown' && JSON.stringify(chips) === JSON.stringify(x.futures.map((f) => f.label)), `${name}: Same storm shown with chips ${chips.join(' / ')}`)
        const cap = await text(page, 'storm-caption')
        check((await SS.getAttribute('data-future')) === x.f.keys[0] && cap === x.f.caption.replace(/\s+/g, ' ').trim(), `${name}: storm caption is node's for ${x.f.label} (${cap})`)
        // The mix lines.
        const wtMix = await page.getByTestId('wt-mix').count()
        const ssMix = await page.getByTestId('storm-mix').count()
        if (!mixLine) check(wtMix === 0 && ssMix === 0, `${name}: no mix line below the card`)
        else {
          const a = await text(page, 'wt-mix')
          const b = await text(page, 'storm-mix')
          check(a === b && a.startsWith(mixLine), `${name}: walkthrough and Same storm say which mix (${a})`)
        }
      }
      for (const w of [1280, 390]) {
        const name = `below-${w}`
        const { ctx, page, errors } = await open(browser, base, home, { w, scheme: 'dark' })
        check(await ready(page), `${name}: the comparison appears`)
        await page.getByTestId('same-storm').waitFor({ timeout: 30000 })
        await belowCheck(page, `${name} each its own`, X.own, null)
        const group = page.getByRole('radiogroup', { name: 'Holdings' })

        await group.getByRole('radio', { name: 'Both on eVelo’s mix' }).click()
        const waited = await page.getByTestId('below-wait').count().then((n) => n > 0, () => false)
        check(await pairDone(page, 'evelo'), `${name}: below the card follows eVelo's mix${waited ? ' (after a waiting line)' : ''}`)
        const what = await text(page, 'compare-what')
        await belowCheck(page, `${name} eVelo's mix`, X.evelo, what)
        check(/approximate/.test(await text(page, 'wt-mix')), `${name}: the mix line says the mode's side is approximate`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll below the card on eVelo's mix`)
        await page.getByTestId('walkthrough').screenshot({ path: `${SHOTS}income-compare-${name}-evelo-mix-walkthrough.png` })
        await page.getByTestId('same-storm').screenshot({ path: `${SHOTS}income-compare-${name}-evelo-mix-storm.png` })

        await group.getByRole('radio', { name: 'Both on this mode’s mix' }).click()
        check(await pairDone(page, 'income'), `${name}: below the card follows the mode's mix`)
        const what2 = await text(page, 'compare-what')
        await belowCheck(page, `${name} mode's mix`, X.income, what2)
        check((await text(page, 'wt-mix')) === what2 && (await text(page, 'storm-mix')) === what2, `${name}: on the mode's mix the lines are the card's (${what2})`)
        // Play story on the shared mix: stops on the chapter's last year, with node's figures there.
        await page.getByTestId('wt-play').click()
        await page.waitForFunction(() => document.querySelector('[data-testid="wt-play"]')?.getAttribute('aria-pressed') === 'false', null, { timeout: 30000 })
        const end = X.income.list[0].to
        const y = Number(await page.getByTestId('walkthrough').getAttribute('data-year'))
        const shown = await chartMark(page)
        check(y === end && shown.evelo === nw(X.income.years[end], 'evelo'), `${name}: Play story stops at the chapter's end with the swapped eVelo's figure (${nw(X.income.years[end], 'evelo')})`)
        // A non-default future: its caption is node's for the swapped pair.
        const other = X.income.futures.find((f) => f !== X.income.f)
        if (other) {
          await page.getByTestId(`storm-chip-${other.keys[0]}`).click()
          check((await text(page, 'storm-caption')) === other.caption.replace(/\s+/g, ' ').trim(), `${name}: storm caption for ${other.label} is node's on the mode's mix`)
        }
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll below the card on the mode's mix`)
        await page.getByTestId('walkthrough').screenshot({ path: `${SHOTS}income-compare-${name}-mode-mix-walkthrough.png` })
        await page.getByTestId('same-storm').screenshot({ path: `${SHOTS}income-compare-${name}-mode-mix-storm.png` })

        await group.getByRole('radio', { name: 'Each its own' }).click()
        await page.waitForFunction(() => document.querySelector('[data-testid="income-compare"]')?.dataset.holdings === 'own', null, { timeout: 5000 })
        await belowCheck(page, `${name} back to each its own`, X.own, null)
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }

    // A plan that moves abroad, retires later, uses fat tails and starts with a loan: the lines say so,
    // and eVelo's figures are that plan's.
    {
      const away = scenario({ destCityId: 'lisbon', retireInYears: 3, savingsWhileWorking: 40_000, method: 'fat-tail', existingLoan: 200_000 })
      const R2 = expectRates(away)
      for (const w of [1280, 390]) {
        const name = `away-${w}`
        const { ctx, page, errors } = await open(browser, base, away, { w, scheme: 'dark' })
        check(await ready(page), `${name}: the comparison appears`)
        const lines = (await page.locator('[data-testid="compare-lines"] li').allInnerTexts()).map((t) => t.trim())
        const want = [
          'Your eVelo plan moves to Lisbon; living on income stays home.',
          `eVelo retires in 3 years, adding ${currencyCompact(40_000)} a year until then; this mode retires now.`,
          'eVelo uses fat tails; this mode always replays history.',
          `eVelo starts with a ${currencyCompact(200_000)} loan.`,
        ]
        check(JSON.stringify(lines) === JSON.stringify(want), `${name}: like-for-like lines (${lines.join(' / ')})`)
        const head = (await page.locator(`${COMPARE} h2`).innerText()).trim()
        check(head === 'Your two plans, side by side', `${name}: fat tails are not the same markets, so the neutral heading (${head})`)
        const got = [await text(page, 'compare-rate-income'), await text(page, 'compare-rate-evelo')]
        check(got[0] === R2.lasts[0] && got[1] === R2.lasts[1], `${name}: rates ${got.join(' | ')} (node ${R2.lasts.join(' | ')})`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll`)
        await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-${name}.png` })
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }

    // Futures not copied: the line says so. No sync at all: no comparison.
    {
      const s = scenario({})
      const { ctx, page } = await open(browser, base, { ...s, stored: { ...s.stored, seed: s.plan.seed + 1 } }, { w: 1280, scheme: 'dark' })
      check(await ready(page), 'different futures: the comparison appears')
      const lines = (await page.locator('[data-testid="compare-diffs"] li').allInnerTexts()).map((t) => t.trim())
      check(lines.includes('These run on different futures; sync ‘Futures’ to match.'), `different futures: the line says so, up top (${lines.join(' / ')})`)
      await ctx.close()
    }
    // Only "Futures" synced, and a different portfolio here: the portfolio line, the neutral heading.
    {
      const s = scenario({})
      const stored = { ...s.stored, portfolio: 2_000_000, sync: sync.makeSyncRecord(null, sync.snapshotFromEvelo(s.plan), ['futures'], new Date('2026-11-18T12:00:00Z')) }
      for (const w of [1280, 390]) {
        const name = `futures-only-${w}`
        const { ctx, page, errors } = await open(browser, base, { ...s, stored }, { w, scheme: 'light' })
        check(await ready(page), `${name}: the comparison appears`)
        const head = (await page.locator(`${COMPARE} h2`).innerText()).trim()
        check(head === 'Your two plans, side by side', `${name}: the neutral heading (${head})`)
        const diffs = (await page.locator('[data-testid="compare-diffs"] li').allInnerTexts()).map((t) => t.trim())
        const want = `Portfolio differs: ${currencyCompact(3_000_000)} in eVelo, ${currencyCompact(2_000_000)} here.`
        check(diffs.length === 1 && diffs[0] === want, `${name}: the portfolio line, up top (${diffs.join(' / ')})`)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll`)
        await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-${name}.png` })
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }
    // A home city with an inheritance tax: eVelo's figures include it, the mode's don't.
    {
      const s = scenario({ homeCityId: 'philadelphia' })
      const { ctx, page, errors } = await open(browser, base, s, { w: 390, scheme: 'dark' })
      check(await ready(page), 'philadelphia: the comparison appears')
      const lines = (await page.locator('[data-testid="compare-lines"] li').allInnerTexts()).map((t) => t.trim())
      check(lines.includes('eVelo’s figures include Philadelphia’s state inheritance tax; living on income doesn’t model it.'), `philadelphia: the tax line (${lines.join(' / ')})`)
      const head = (await page.locator(`${COMPARE} h2`).innerText()).trim()
      check(head === 'Same person, same markets, two ways', `philadelphia: fully synced, same person (${head})`)
      check((await text(page, 'compare-evelo-estate')).startsWith('Median estate, after loan and inheritance tax'), 'philadelphia: eVelo’s estate is after inheritance tax')
      await page.locator(COMPARE).screenshot({ path: `${SHOTS}income-compare-philadelphia-390.png` })
      check(errors.length === 0, `philadelphia: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }
    {
      const s = scenario({}, { synced: false })
      const { ctx, page } = await open(browser, base, s, { w: 1280, scheme: 'dark' })
      await page.locator('[data-testid="income-measure-lasts"]').waitFor({ timeout: 60000 })
      check((await page.locator(COMPARE).count()) === 0, 'no sync: no comparison')
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}, 4185)

if (fails.length) { console.error(`\n${fails.length} income-compare e2e check(s) failed`); process.exit(1) }
console.log(`\nincome-compare e2e passed — screenshots in ${SHOTS}`)
