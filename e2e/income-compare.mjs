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
