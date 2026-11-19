// End-to-end check of "Sync with my eVelo plan" inside the living-on-income mode, on the built app
// in headless Chromium. Run after `npm run build`: `node e2e/income-sync.mjs`. Exits non-zero on any
// failure. Screenshots go to e2e/screenshots/ (git-ignored).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { withPreview } from '../scripts/serve-preview.mjs'

const SHOTS = new URL('./screenshots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const INCOME = 'evelo:v2:income'
const EVELO = 'evelo:v2'
const RESULTS = '[data-testid="income-results"]'
const CHIP = '[data-testid="sync-chip"]'
const SHEET = '[data-testid="sync-sheet"]'
const row = (f) => `${SHEET} li[data-field="${f}"]`
const FIELDS = ['portfolio', 'basisFraction', 'age', 'horizonYears', 'spending', 'otherIncome', 'homeCityId', 'futures']

const phoneCtx = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const deskCtx = { viewport: { width: 1280, height: 860 } }

// The eVelo plan as the app stores it ({ inputs, theme, themeV }); sanitizeInputs fills the rest.
const EVELO_INPUTS = {
  portfolio: 2_400_000, basisFraction: 0.55, age: 52, horizonYears: 40, homeCityId: 'new-york',
  otherIncome: 38_000, incomeStartAge: 68, seed: 99, paths: 1000, blockMonths: 36, outlook: 'conservative',
}
// The mode, finished, with its own answers (horizon matches eVelo's, the rest differ).
const MODE = {
  portfolio: 1_000_000, basisFraction: 0.3, age: 60, horizonYears: 40, spending: 80_000, otherIncome: 0, incomeStartAge: 67,
  stockShare: 0.7, muniShare: 0.4, filingStatus: 'mfj', homeCityId: 'st-louis', seed: 7, paths: 1000, blockMonths: 24, outlook: 'balanced',
  step: 6, done: true,
}

async function open(browser, base, { w, scheme }) {
  const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), colorScheme: scheme, reducedMotion: 'reduce' })
  await ctx.addInitScript(([e, i, ek, ik, theme]) => {
    try {
      if (!localStorage.getItem(ek)) localStorage.setItem(ek, JSON.stringify({ inputs: e, theme, themeV: 2 }))
      if (!localStorage.getItem(ik)) localStorage.setItem(ik, JSON.stringify(i))
    } catch {}
  }, [EVELO_INPUTS, MODE, EVELO, INCOME, scheme])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '#income')
  await page.locator(RESULTS).waitFor({ timeout: 15000 })
  return { ctx, page, errors }
}

const raw = (page, k) => page.evaluate((k) => localStorage.getItem(k), k)
const stored = async (page, k) => JSON.parse((await raw(page, k)) ?? 'null')
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
const active = (page) => page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), id: document.activeElement?.id, tag: document.activeElement?.tagName }))
const ticks = (page) => page.locator(`${SHEET} input[type=checkbox]`).evaluateAll((els) => els.map((e) => e.checked))
const evText = (page, f) => page.getByTestId(`sync-ev-${f}`).innerText().then((s) => s.replace(/\s+/g, ' ').trim())

/** Sets the eVelo plan's yearly budget on the real plan page (#plan), in the same tab. */
async function setBudgetOnPlan(page, perYear) {
  await page.evaluate(() => { location.hash = '#plan' })
  const input = page.locator('#budget-total')
  if (!(await input.isVisible().catch(() => false))) {
    // The budget lives in a section that may start closed.
    const heads = page.locator('button[aria-expanded="false"]', { hasText: /spend|budget|life|place/i })
    for (let i = 0; i < (await heads.count()) && !(await input.isVisible()); i++) await heads.nth(i).click().catch(() => {})
  }
  await input.waitFor({ state: 'visible', timeout: 15000 })
  const label = (await input.evaluate((el) => el.labels?.[0]?.textContent ?? el.getAttribute('aria-label') ?? '')) || ''
  const perMonth = /month/.test(label) || /per month/.test(await page.locator('.budget__total-u').innerText().catch(() => ''))
  await input.fill(String(perMonth ? perYear / 12 : perYear))
  await input.press('Enter')
  await page.waitForTimeout(500) // past eVelo's debounced save
}

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    // 1. The full flow, desktop dark.
    {
      const { ctx, page, errors } = await open(browser, base, { w: 1280, scheme: 'dark' })
      const eveloBefore = await raw(page, EVELO)
      const opener = page.getByRole('button', { name: 'Sync with my eVelo plan' })
      check(await opener.isVisible(), 'the results header offers "⇄ Sync with my eVelo plan"')
      check((await page.locator(CHIP).locator('.isync-chip__text').count()) === 0, 'no chip before a sync')
      await opener.click()
      const dialog = page.getByRole('dialog', { name: 'Bring values from your eVelo plan' })
      await dialog.waitFor()
      const listed = await page.locator(`${SHEET} li[data-field]`).evaluateAll((els) => els.map((e) => e.dataset.field))
      check(JSON.stringify(listed) === JSON.stringify(FIELDS), `the sheet lists every shared value (${listed.join(', ')})`)
      check((await ticks(page)).every(Boolean) && (await ticks(page)).length === 8, 'all ticked by default')
      const ev = {}
      for (const f of FIELDS) ev[f] = await evText(page, f)
      check(ev.portfolio === '$2,400,000' && ev.age === '52' && ev.basisFraction === '55%' && ev.horizonYears === '40 years' && ev.homeCityId === 'New York City' && ev.otherIncome === '$38,000 at 68', `eVelo's values shown (${JSON.stringify(ev)})`)
      check(/1,000 paths · 36 mo Conservative · seed 99/.test(ev.futures), `eVelo's futures shown (${ev.futures})`)
      const evSpend = ev.spending
      check(/^\$[\d,]+$/.test(evSpend), `eVelo's spending is its home budget total (${evSpend})`)
      check((await page.locator(row('horizonYears')).getAttribute('data-same')) === 'true' && (await page.locator(row('portfolio')).getAttribute('data-same')) === 'false', 'matching values are marked the same, differing ones not')
      const colors = await page.evaluate(() => ({
        same: getComputedStyle(document.querySelector('li[data-field="horizonYears"] .isync__cv')).color,
        diff: getComputedStyle(document.querySelector('li[data-field="portfolio"] .isync__cv')).color,
        brass: getComputedStyle(document.documentElement).getPropertyValue('--bruised-text').trim(),
      }))
      check(colors.same !== colors.diff && colors.diff === 'rgb(227, 178, 98)', `matching grey, differing brass (${JSON.stringify(colors)})`)
      const never = await page.locator('.isync__never').innerText()
      check(['holdings mix', 'muni share', 'filing status', 'loan settings', 'destination'].every((w) => never.includes(w)), 'names what is never shared')
      check((await page.locator('.isync__copy').innerText()).trim() === 'Copy 8 values', 'Copy 8 values')

      // Cancel leaves everything.
      const modeBefore = await raw(page, INCOME)
      await page.getByRole('button', { name: 'Cancel' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await page.waitForTimeout(400)
      check((await raw(page, INCOME)) === modeBefore, 'Cancel copies nothing')
      check((await active(page)).text?.includes('Sync with my eVelo plan'), `focus returns to the opener (${JSON.stringify(await active(page))})`)

      // Untick age, copy the rest.
      await opener.click()
      await dialog.waitFor()
      await page.locator(`${row('age')} input`).uncheck()
      check((await page.locator('.isync__copy').innerText()).trim() === 'Copy 7 values', 'unticking one reads "Copy 7 values"')
      await page.screenshot({ path: `${SHOTS}income-sync-1280-dark-sheet.png` })
      await page.locator('.isync__copy').click()
      await dialog.waitFor({ state: 'hidden' })
      await page.waitForTimeout(500)
      const st = await stored(page, INCOME)
      const spend = Number(evSpend.replace(/[$,]/g, ''))
      const copied = st.portfolio === 2_400_000 && st.basisFraction === 0.55 && st.horizonYears === 40 && Math.round(st.spending) === spend && st.otherIncome === 38_000 && st.incomeStartAge === 68 && st.homeCityId === 'new-york' && st.seed === 99 && st.paths === 1000 && st.blockMonths === 36 && st.outlook === 'conservative'
      check(copied, `the ticked values are copied (${JSON.stringify(st)})`)
      check(st.age === 60, `the unticked one is not (age ${st.age})`)
      check(st.stockShare === 0.7 && st.muniShare === 0.4 && st.filingStatus === 'mfj', 'the mode keeps its own mix and filing status')
      check(st.sync && st.sync.fields.length === 7 && !st.sync.fields.includes('age') && !Number.isNaN(Date.parse(st.sync.at)), `the sync record is stored beside the inputs (${JSON.stringify(st.sync?.fields)})`)
      check((await raw(page, EVELO)) === eveloBefore, 'evelo:v2 is byte-identical after the sync')
      const chip = (await page.locator(CHIP).innerText()).replace(/\s+/g, ' ').trim()
      check(/^Synced [A-Z][a-z]{2} \d{1,2} · 7 values Re-sync$/.test(chip), `the chip says when and how many (${chip})`)
      check((await active(page)).text === 'Re-sync', `focus lands on Re-sync after the copy (${JSON.stringify(await active(page))})`)
      await page.screenshot({ path: `${SHOTS}income-sync-1280-dark-chip.png` })

      // Change eVelo's spending on the real plan page, come back.
      const newSpend = spend + 12_000
      await setBudgetOnPlan(page, newSpend)
      const evAfter = await stored(page, EVELO)
      check(evAfter && evAfter.inputs.portfolio === 2_400_000 && (await raw(page, EVELO)) !== eveloBefore, 'the plan page saved a new eVelo plan')
      await page.evaluate(() => { location.hash = '#income' })
      await page.locator(RESULTS).waitFor({ timeout: 15000 })
      await page.locator(`${CHIP}.isync-chip--changed`).waitFor({ timeout: 5000 }).catch(() => {})
      const changed = (await page.locator(CHIP).innerText()).replace(/\s+/g, ' ').trim()
      check(changed === 'eVelo changed since · spending Re-sync', `the chip says eVelo changed and names spending (${changed})`)
      const st2 = await stored(page, INCOME)
      check(Math.round(st2.spending) === spend, 'the change is not copied silently')
      await page.screenshot({ path: `${SHOTS}income-sync-1280-dark-changed.png` })

      // Re-sync: the changed field ticked only.
      await page.getByRole('button', { name: 'Re-sync' }).click()
      await dialog.waitFor()
      const t = await ticks(page)
      check(t[FIELDS.indexOf('spending')] && t.filter(Boolean).length === 1, `re-sync ticks the changed field only (${t})`)
      check((await evText(page, 'spending')) === '$' + newSpend.toLocaleString('en-US'), `the sheet shows eVelo's new spending (${await evText(page, 'spending')})`)
      await page.locator('.isync__copy').click()
      await dialog.waitFor({ state: 'hidden' })
      await page.waitForTimeout(500)
      const st3 = await stored(page, INCOME)
      check(Math.round(st3.spending) === newSpend && st3.age === 60 && st3.portfolio === 2_400_000, `Re-sync copies it (${st3.spending})`)
      const chip3 = (await page.locator(CHIP).innerText()).replace(/\s+/g, ' ').trim()
      check(/^Synced .* · 7 values Re-sync$/.test(chip3), `the chip is back to synced (${chip3})`)

      // Keyboard through the sheet.
      const before = await raw(page, INCOME)
      await page.getByRole('button', { name: 'Re-sync' }).focus()
      await page.keyboard.press('Enter')
      await dialog.waitFor()
      await page.waitForTimeout(100)
      check((await active(page)).id === 'isync-portfolio', `focus starts on the first tick (${JSON.stringify(await active(page))})`)
      await page.keyboard.press('Space')
      check((await ticks(page))[0] === false && (await page.locator('.isync__copy').innerText()).trim() === 'Copy 7 values', 'Space toggles a tick')
      for (let i = 0; i < 9; i++) await page.keyboard.press('Tab')
      const afterTabs = await active(page)
      await page.keyboard.press('Tab')
      const wrapped = await active(page)
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))
      check(inside && (wrapped.text === 'Copy 7 values' || wrapped.tag === 'BUTTON' || wrapped.tag === 'INPUT'), `Tab stays inside the sheet (${JSON.stringify(afterTabs)} → ${JSON.stringify(wrapped)})`)
      for (let i = 0; i < 14; i++) await page.keyboard.press('Shift+Tab')
      check(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), 'Shift+Tab stays inside the sheet')
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      await page.waitForTimeout(400)
      check((await active(page)).text === 'Re-sync', 'Escape closes and focus returns to Re-sync')
      check((await raw(page, INCOME)) === before, 'Escape copies nothing')

      // Another tab saves a new eVelo plan: the chip notices (storage event).
      const other = await ctx.newPage()
      await other.goto(base + '#plan')
      await other.waitForTimeout(300)
      await other.evaluate((k) => {
        const v = JSON.parse(localStorage.getItem(k))
        v.inputs.portfolio = 2_500_000
        localStorage.setItem(k, JSON.stringify(v))
      }, EVELO)
      await page.locator(`${CHIP}.isync-chip--changed`).waitFor({ timeout: 5000 }).catch(() => {})
      const chip4 = (await page.locator(CHIP).innerText()).replace(/\s+/g, ' ').trim()
      check(chip4 === 'eVelo changed since · portfolio Re-sync', `a save in another tab shows in the chip (${chip4})`)
      await other.close()
      check((await overflow(page)) <= 0, 'no horizontal scroll')
      check(errors.length === 0, `no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }

    // 2. Every size and scheme: the button, the sheet, the chip, and the changed chip.
    for (const w of [1280, 390]) {
      for (const scheme of ['light', 'dark']) {
        const name = `${w}-${scheme}`
        const { ctx, page, errors } = await open(browser, base, { w, scheme })
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll with the sync button`)
        await page.screenshot({ path: `${SHOTS}income-sync-${name}-button.png` })
        await page.getByRole('button', { name: 'Sync with my eVelo plan' }).click()
        const dialog = page.getByRole('dialog')
        await dialog.waitFor()
        await page.waitForTimeout(300)
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll with the sheet open`)
        const fits = await page.locator('.sync-sheet').evaluate((el) => el.getBoundingClientRect().right <= window.innerWidth + 0.5)
        check(fits, `${name}: the sheet fits the screen`)
        await page.screenshot({ path: `${SHOTS}income-sync-${name}-sheet.png` })
        if (w === 390) {
          await page.locator('.sheet__body').evaluate((el) => el.scrollTo(0, el.scrollHeight))
          await page.screenshot({ path: `${SHOTS}income-sync-${name}-sheet-end.png` })
        }
        await page.locator('.isync__copy').click()
        await dialog.waitFor({ state: 'hidden' })
        await page.waitForTimeout(300)
        await page.screenshot({ path: `${SHOTS}income-sync-${name}-chip.png` })
        // eVelo moves on (age and spending) in its own store, as the plan page would.
        await setBudgetOnPlan(page, 150_000)
        await page.evaluate(() => { location.hash = '#income' })
        await page.locator(RESULTS).waitFor({ timeout: 15000 })
        await page.locator(`${CHIP}.isync-chip--changed`).waitFor({ timeout: 5000 }).catch(() => {})
        const text = (await page.locator(CHIP).innerText()).replace(/\s+/g, ' ').trim()
        check(text.startsWith('eVelo changed since · spending'), `${name}: changed chip (${text})`)
        await page.waitForFunction((sel) => document.querySelector(sel)?.getAttribute('aria-busy') === 'false', RESULTS, { timeout: 60000 }).catch(() => {})
        check((await overflow(page)) <= 0, `${name}: no horizontal scroll with the changed chip`)
        await page.screenshot({ path: `${SHOTS}income-sync-${name}-changed.png` })
        check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
  }
}, 4191)

if (fails.length) { console.error(`\n${fails.length} income sync e2e check(s) failed`); process.exit(1) }
console.log(`\nincome sync e2e passed — screenshots in ${SHOTS}`)
