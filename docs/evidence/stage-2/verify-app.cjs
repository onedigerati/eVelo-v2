// Stage 2 running-app proof. Usage: node verify-app.cjs <base> <outDir>
// base: `npx vite preview` of this branch's production build.
// St. Louis -> London at a 35% premium. London's rent and restaurants are pricier than St. Louis's, so the
// premium can't move Housing or Dining; Groceries (62/84) and Healthcare (0.45) are cheaper, so it can.
// Typed: Housing $40,000 (pricier than home), Groceries $6,000, Healthcare -40%, Travel -50%, Dining +10% (pricier).
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const fs = require('fs')
const [BASE, OUT] = process.argv.slice(2)
const lines = []
const log = (...a) => { const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); console.log(s); lines.push(s) }
const pass = []
const check = (k, v) => { pass.push([k, !!v]) }

const RAW = { groceries: 62 / 84, healthcare: 0.45 }
const m = (r, e) => (r < 1 ? r + (1 - r) * e : r)
const HOME = { housing: 26000, groceries: 11000, dining: 8000, transport: 10000, utilities: 5500, healthcare: 16000, travel: 14000, other: 19500 }
const SCALING = ['Groceries', 'Healthcare']
const NOT_SCALING = ['Housing', 'Travel', 'Dining out']

const settle = async (p) => { await p.waitForTimeout(600); await p.waitForFunction(() => !document.querySelector('.verdict__status'), null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(1000) }
const amtBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in London: .* a year`) })
const chgBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in London: .* versus home`) })
async function typeIn(p, btn, text) { await btn.click(); await p.keyboard.press('Control+a'); await p.keyboard.type(text); await p.keyboard.press('Enter'); await settle(p) }
async function slide(p, n) {
  const s = p.getByRole('slider', { name: /Expat price premium/ })
  await s.focus()
  for (let i = 0; i < Math.abs(n); i++) await p.keyboard.press(n > 0 ? 'ArrowRight' : 'ArrowLeft')
  await settle(p)
}
const noHScroll = (p) => p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }))

async function cardRows(p) {
  return p.evaluate(() => [...document.querySelectorAll('.expat__card .ratio')].map((li) => {
    const btns = [...li.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || '').filter(Boolean)
    return {
      label: btns.find((b) => / in London: /.test(b))?.split(' in London:')[0] || li.textContent.trim().slice(0, 20),
      text: li.textContent.replace(/\s+/g, ' ').trim(),
      note: li.querySelector('.ratio__note')?.textContent.replace(/\s+/g, ' ').trim() || null,
      amountBtn: btns.find((b) => / a year/.test(b)) || null,
    }
  }))
}
// The card's $ button speaks the compact amount ("$6.6K"), the same format the profile uses.
const amtOf = (r) => { const mm = r.amountBtn && r.amountBtn.match(/(\$[\d.,]+K?)/); return mm ? mm[1] : null }
const compact = (v) => (v >= 10000 ? '$' + Math.round(v / 1000) + 'K' : v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'K' : '$' + Math.round(v))

async function openProfile(p) {
  await p.goto(BASE + '#atlas')
  const btn = p.locator('button[aria-label="View the London profile"], button[aria-label="Open the London profile"], button[aria-label$="open the London profile"]')
  await btn.first().waitFor({ state: 'attached', timeout: 120000 })
  let clicked = false
  for (const b of await btn.all()) if (await b.isVisible()) { await b.scrollIntoViewIfNeeded(); await b.click(); clicked = true; break }
  if (!clicked) await btn.first().evaluate((b) => b.click())
  const list = p.locator('[role="dialog"] .pcats__list')
  await list.waitFor({ timeout: 30000 }); await p.waitForTimeout(1500)
  const rows = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"] .pcats__row')].map((li) => ({
    spoken: li.querySelector('.sr-only')?.textContent || '',
    mark: li.querySelector('.pcats__mark')?.textContent.trim() || null,
    title: li.querySelector('.pcats__v')?.getAttribute('title') || null,
  })))
  const note = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"] *')].map((e) => e.childElementCount === 0 ? e.textContent : '').find((t) => /budget at local prices/.test(t)) || null)
  return { rows, note, list }
}

async function run(b, width, tag) {
  const errors = []
  const ctx = await b.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 }, deviceScaleFactor: width < 500 ? 2 : 1 })
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: { homeCityId: 'st-louis', destCityId: 'london', expatFactor: 0.35 }, theme: 'dark', themeV: 2 })); sessionStorage.setItem('seeded', '1') } })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message))
  p.on('console', (msg) => msg.type() === 'error' && errors.push('console ' + msg.text()))
  await p.goto(BASE + '#plan'); await settle(p)
  const card = p.locator('.expat__card')

  log(`\n######## ${tag}: ${width}px ########`)
  log('## A. Type at 35%: Housing $40000 (pricier than home), Groceries $6000, Healthcare -40, Travel -50, Dining out +10 (pricier)')
  await typeIn(p, amtBtn(p, 'Housing'), '40000')
  await typeIn(p, amtBtn(p, 'Groceries'), '6000')
  await typeIn(p, chgBtn(p, 'Healthcare'), '-40')
  await typeIn(p, chgBtn(p, 'Travel'), '-50')
  await typeIn(p, chgBtn(p, 'Dining out'), '10')
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('evelo:v2')).inputs)
  log('stored:', { expatFactor: st.expatFactor, amountOverrides: st.amountOverrides, amountOverrideAt: st.amountOverrideAt, ratioOverrides: st.ratioOverrides, ratioOverrideAt: st.ratioOverrideAt })
  const r35 = await cardRows(p)
  r35.forEach((r) => log('  ', r.label, '| note:', r.note, '|', r.amountBtn))
  const by35 = Object.fromEntries(r35.map((r) => [r.label, r]))
  check(`${tag} 35%: Groceries and Healthcare say "scales with premium" (no "you typed" yet)`, SCALING.every((c) => by35[c]?.note === 'scales with premium'))
  check(`${tag} 35%: Housing (pricier), Travel, Dining out (pricier) carry no note`, NOT_SCALING.every((c) => by35[c] && by35[c].note === null))
  check(`${tag} 35%: Groceries reads $6,000, Housing $40,000`, amtOf(by35['Groceries']) === '$6.0K' && amtOf(by35['Housing']) === '$40K')
  await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: `${OUT}/${tag}-01-plan-card-typed-at-35.png` })
  let hs = await noHScroll(p); log('page width', hs); check(`${tag} plan page: no horizontal scroll at 35%`, hs.scrollW <= hs.clientW)

  log('## B. ⓘ tip')
  const tipBtn = p.getByRole('button', { name: 'How spending in London is worked out' })
  await tipBtn.scrollIntoViewIfNeeded(); await tipBtn.click(); await p.waitForTimeout(500)
  const tip = await p.evaluate(() => { const b = document.querySelector('.expat__card .infotip__btn'); const t = document.getElementById(b.getAttribute('aria-describedby')); return { text: t.textContent, open: t.classList.contains('is-open'), rect: t.getBoundingClientRect().toJSON(), vw: innerWidth } })
  log('tip open:', tip.open, '| rect', tip.rect, '| viewport', tip.vw); log('tip text:', tip.text)
  check(`${tag} tip is open and fits the viewport`, tip.open && tip.rect.left >= 0 && tip.rect.right <= tip.vw)
  check(`${tag} tip says scales from where typed, returns exactly, capped at larger of home and typed; no "stays put"`,
    /scales with the premium from where you typed it/.test(tip.text) && /returns exactly to what you typed when you slide back/.test(tip.text) && /larger of your home amount and what you typed/.test(tip.text) && !/stays put/.test(tip.text))
  await p.screenshot({ path: `${OUT}/${tag}-02-info-tip-open.png` })
  await p.keyboard.press('Escape'); await p.mouse.click(2, 2); await p.waitForTimeout(300)

  log('## C. Slide 35% -> 65%')
  await slide(p, 6)
  const sl = p.getByRole('slider', { name: /Expat price premium/ }); log('slider now', await sl.getAttribute('aria-valuetext'), await sl.getAttribute('aria-valuenow'))
  const r65 = await cardRows(p)
  r65.forEach((r) => log('  ', r.label, '| note:', r.note, '|', r.amountBtn))
  const by65 = Object.fromEntries(r65.map((r) => [r.label, r]))
  const wantG = Math.min(6000 * m(RAW.groceries, 0.65) / m(RAW.groceries, 0.35), 11000)
  const wantH = 16000 * Math.min(0.6 * m(RAW.healthcare, 0.65) / m(RAW.healthcare, 0.35), 1)
  log('expected Groceries', wantG.toFixed(2), 'Healthcare', wantH.toFixed(2))
  check(`${tag} 65%: Groceries note "scales with premium · you typed $6,000 at 35%"`, by65['Groceries']?.note === 'scales with premium · you typed $6,000 at 35%')
  check(`${tag} 65%: Healthcare note "scales with premium · you typed −40% at 35%"`, by65['Healthcare']?.note === 'scales with premium · you typed −40% at 35%')
  check(`${tag} 65%: Housing, Travel, Dining out still no note and unchanged`, NOT_SCALING.every((c) => by65[c]?.note === null && amtOf(by65[c]) === amtOf(by35[c])))
  check(`${tag} 65%: Groceries amount moved to the formula`, amtOf(by65['Groceries']) === compact(wantG))
  check(`${tag} 65%: Healthcare amount moved to the formula`, amtOf(by65['Healthcare']) === compact(wantH))
  await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: `${OUT}/${tag}-03-plan-card-slid-to-65.png` })
  hs = await noHScroll(p); check(`${tag} plan page: no horizontal scroll at 65%`, hs.scrollW <= hs.clientW)

  log('## D. London profile at 65%')
  const prof = await openProfile(p)
  prof.rows.forEach((r) => log('  ', r.spoken, '| mark:', r.mark, '| title:', r.title))
  log('  profile note:', prof.note)
  const pr = (c) => prof.rows.find((r) => r.spoken.startsWith(c + ':'))
  for (const c of [...SCALING, ...NOT_SCALING]) {
    const row = pr(c), cardRow = by65[c]
    const want = c === 'Groceries' || c === 'Housing' ? 'your amount' : 'your change'
    const scales = SCALING.includes(c)
    // Scaling rows show a visible "your amount · scales with premium" marker; non-scaling typed rows show none
    // (their tooltip and screen-reader line still say "your amount"/"your change", without "scales").
    check(`${tag} profile ${c}: ${scales ? `visible marker "${want} · scales with premium"` : `no "scales" marker, spoken "${want}." only`}; agrees with the plan card note`,
      row && (scales ? row.mark === `${want} · scales with premium` && row.spoken.endsWith(`${want}, scales with premium.`)
                     : row.mark === null && row.spoken.endsWith(`, ${want}.`) && !/scales/.test(row.title || ''))
        && (cardRow.note !== null) === scales)
    check(`${tag} profile ${c}: same number as the plan card (${amtOf(cardRow)})`, row && row.spoken.startsWith(`${c}: ${amtOf(cardRow)} here`))
  }
  check(`${tag} profile note names only the scaling rows`, /Groceries and Healthcare follow the Expat price premium from where they were typed/.test(prof.note || ''))
  await prof.list.scrollIntoViewIfNeeded(); await p.waitForTimeout(400)
  await p.locator('[role="dialog"]').screenshot({ path: `${OUT}/${tag}-04-profile-london-65.png` })
  if (width < 500) await p.screenshot({ path: `${OUT}/${tag}-04b-profile-london-65-viewport.png` })
  hs = await noHScroll(p); check(`${tag} atlas/profile: no horizontal scroll`, hs.scrollW <= hs.clientW)
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)

  log('## E. Back to 35%')
  await p.goto(BASE + '#plan'); await settle(p)
  await slide(p, -6)
  const rb = Object.fromEntries((await cardRows(p)).map((r) => [r.label, r]))
  check(`${tag} back at 35%: every row reads as typed, "you typed" gone`, r35.every((r) => amtOf(rb[r.label]) === amtOf(r) && rb[r.label].note === r.note))

  log('## F. Method page, "Living abroad"')
  await p.goto(BASE + '#method'); await p.waitForTimeout(1500)
  const sec = p.locator('#abroad').first()
  await sec.waitFor({ timeout: 15000 }); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
  const mt = await sec.textContent()
  const para = mt.match(/A typed number is read as a real price[\s\S]*?never below what was typed\./)
  log('method text:', para ? para[0].replace(/\s+/g, ' ') : mt.slice(0, 400))
  check(`${tag} Method "Living abroad" explains typed spending scales with the premium (formula, cap, returns exactly, untouched rows)`,
    para && /typed × m\(e\) ÷ m\(e₀\)/.test(mt) && /capped at the larger of the home/.test(mt) && /returns to it when the\s*slider comes back/.test(mt.replace(/\s+/g, ' ')))
  await sec.screenshot({ path: `${OUT}/${tag}-05-method-living-abroad.png` })
  hs = await noHScroll(p); check(`${tag} method page: no horizontal scroll`, hs.scrollW <= hs.clientW)

  log(`${tag} console/page errors:`, errors.length ? errors : 'none')
  check(`${tag} no console or page errors`, errors.length === 0)
  await ctx.close()
}

;(async () => {
  const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1200/chrome-linux/headless_shell' }).catch(() => chromium.launch())
  await run(b, 1280, 'desktop')
  await run(b, 390, 'phone')
  log('\n## RESULTS')
  pass.forEach(([k, v]) => log(v ? 'PASS' : 'FAIL', k))
  fs.writeFileSync(OUT + '/running-app.txt', `node docs/evidence/stage-2/verify-app.cjs ${BASE} docs/evidence/stage-2   (Playwright, headless Chromium, 1280×1000 and 390×844, against npx vite preview of the production build)\n` + lines.join('\n') + '\n')
  await b.close()
})().catch((e) => { console.error(e); fs.writeFileSync(OUT + '/running-app.txt', lines.join('\n') + '\nFAILED: ' + e.stack); process.exit(1) })
