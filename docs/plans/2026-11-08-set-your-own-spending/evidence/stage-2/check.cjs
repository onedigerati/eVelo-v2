const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const fs = require('fs')
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/'
const URL = 'http://localhost:5231/#/plan'
const lines = []
const log = (...a) => { const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); console.log(s); lines.push(s) }
const errors = []
async function st(p) {
  return p.evaluate(() => {
    const t = (s) => document.querySelector(s)?.textContent?.trim()
    const rows = [...document.querySelectorAll('.expat__card .ratio')].map((li) => li.textContent.replace(/\s+/g, ' ').trim() + (li.classList.contains('is-fixed') ? ' [$]' : li.classList.contains('is-ratio') ? ' [%]' : ''))
    const inp = JSON.parse(localStorage.getItem('evelo:v2') || '{}').inputs || {}
    return { total: t('.expat__total-v'), chip: t('.expat__card .delta-chip'), outlook: t('.col__num:not(.col__num--home)'), odds: t('.verdict__number'), rows, amt: inp.amountOverrides, ratio: inp.ratioOverrides, reset: !!document.querySelector('.ratios__foot .text-btn'), home: inp.homeCityId, dest: inp.destCityId }
  })
}
const settle = async (p) => { await p.waitForTimeout(600); await p.waitForFunction(() => !document.querySelector('.verdict__status'), null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(1200) }
const amtBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in Bangkok: .* a year`) })
const chgBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in Bangkok: .* versus home`) })
async function typeIn(p, btn, text, key = 'Enter') { await btn.click(); await p.keyboard.press('Control+a'); await p.keyboard.type(text); await p.keyboard.press(key) }
async function pickCity(p, label, query, optName) {
  await p.getByRole('button', { name: new RegExp(label) }).first().click()
  await p.getByRole('combobox', { name: 'Filter options' }).fill(query)
  await p.getByRole('option', { name: new RegExp(optName) }).first().click()
}
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message))
  p.on('console', (m) => m.type() === 'error' && errors.push('console ' + m.text()))
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL); await p.reload(); await settle(p)
  // Set home and destination explicitly through the pickers
  await pickCity(p, 'Home city', 'Louis', 'St. Louis')
  await pickCity(p, 'Retire to', 'Bangkok', 'Bangkok')
  await settle(p)
  const card = p.locator('.expat__card')
  const costCard = p.locator('.col').first()
  await card.scrollIntoViewIfNeeded()
  let s = await st(p); log('## START', s.home, '->', s.dest, 'card', s.total, s.chip, 'outlook dest', s.outlook, 'odds', s.odds); s.rows.forEach((r) => log('  ', r))
  await card.screenshot({ path: OUT + '01-start-light.png' })

  log('\n## CHECK 1: type $ / Enter / Esc')
  const o0 = s.odds
  await typeIn(p, amtBtn(p, 'Housing'), '$18k'); await settle(p)
  s = await st(p); log('Housing "$18k" Enter ->', s.rows[0], '| card', s.total, s.chip, '| outlook', s.outlook, '| odds', o0, '->', s.odds, '| focus', await p.evaluate(() => document.activeElement?.getAttribute('aria-label')))
  log('  amountOverrides', s.amt, 'ratioOverrides', s.ratio)
  await card.screenshot({ path: OUT + '02-housing-18k.png' })
  const before = s.rows[1]
  await typeIn(p, amtBtn(p, 'Groceries'), '99999', 'Escape'); await p.waitForTimeout(300)
  s = await st(p); log('Groceries "99999" Esc ->', before, '=>', s.rows[1], '| focus', await p.evaluate(() => document.activeElement?.getAttribute('aria-label')), '| amt', s.amt)
  await typeIn(p, amtBtn(p, 'Dining out'), '18,000'); await settle(p)
  s = await st(p); log('Dining "18,000" Enter ->', s.rows[2], '| card', s.total, s.chip, '| outlook', s.outlook, '| odds', s.odds, '| EQUAL', s.total === s.outlook)
  await costCard.scrollIntoViewIfNeeded(); await p.waitForTimeout(900)
  await costCard.screenshot({ path: OUT + '03-outlook-cost-card-fixed.png' })
  log('Outlook cost card rows:', await costCard.locator('.col__row').allTextContents())
  log('Outlook caption/save:', await costCard.locator('.col__save').textContent())

  log('\n## JUNK input in $ field (Housing currently $18K)')
  for (const junk of ['abc', '-5', '1e12', '1b', '0']) {
    await typeIn(p, amtBtn(p, 'Utilities & phone'), junk); await settle(p)
    s = await st(p); log(`Utilities "${junk}" Enter ->`, s.rows[4], '| amt.bangkok.utilities =', s.amt?.bangkok?.utilities, '| card', s.total, '| outlook', s.outlook)
    if (junk === '1b') await card.screenshot({ path: OUT + '04-junk-1b.png' })
  }
  await p.getByRole('button', { name: 'Reset Utilities & phone to the city estimate' }).click(); await settle(p)

  log('\n## CHECK 2: % <-> $ replacement, ×, Reset all')
  await typeIn(p, chgBtn(p, 'Housing'), '-20'); await settle(p)
  s = await st(p); log('Housing (fixed) set % -20 ->', s.rows[0], '| amt', s.amt, '| ratio', s.ratio)
  await typeIn(p, chgBtn(p, 'Groceries'), '-50'); await settle(p)
  await typeIn(p, amtBtn(p, 'Groceries'), '5000'); await settle(p)
  s = await st(p); log('Groceries % -50 then $5000 ->', s.rows[1], '| amt', s.amt, '| ratio', s.ratio, '| card', s.total, 'outlook', s.outlook)
  await card.screenshot({ path: OUT + '05-mixed-overrides.png' })
  await p.getByRole('button', { name: 'Reset Dining out to the city estimate' }).click(); await settle(p)
  s = await st(p); log('× Dining ->', s.rows[2], '| focus', await p.evaluate(() => document.activeElement?.getAttribute('aria-label')), '| amt', s.amt)
  await p.getByRole('button', { name: 'Reset Housing to the city estimate' }).click(); await settle(p)
  s = await st(p); log('× Housing (%) ->', s.rows[0], '| ratio', s.ratio)
  // plant another city's research, then Reset all
  await typeIn(p, chgBtn(p, 'Transportation'), '+10'); await settle(p)
  await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('evelo:v2')); o.inputs.amountOverrides = { ...(o.inputs.amountOverrides || {}), 'chiang-mai': { housing: 9000 } }; localStorage.setItem('evelo:v2', JSON.stringify(o)) })
  await p.reload(); await settle(p); await card.scrollIntoViewIfNeeded()
  s = await st(p); log('Before Reset all: amt', s.amt, 'ratio', s.ratio, 'reset btn', s.reset)
  await p.getByRole('button', { name: 'Reset all' }).click(); await settle(p)
  s = await st(p); log('After Reset all: amt', s.amt, 'ratio', s.ratio, 'reset btn shown', s.reset, '| card', s.total, 'outlook', s.outlook); s.rows.forEach((r) => log('  ', r))
  await card.screenshot({ path: OUT + '06-after-reset-all.png' })

  log('\n## CHECK 3: home budget + premium moves; fixed holds, % rows follow; $0 home row')
  await typeIn(p, amtBtn(p, 'Housing'), '18000'); await settle(p)
  await typeIn(p, chgBtn(p, 'Groceries'), '-50'); await settle(p)
  const r0 = (await st(p)).rows
  await card.screenshot({ path: OUT + '07-before-budget-change.png' })
  const tot = p.getByLabel('Total lifestyle budget per year')
  await tot.scrollIntoViewIfNeeded(); log('home total before', await tot.inputValue())
  await tot.click(); await p.keyboard.press('Control+a'); await p.keyboard.type('200000'); await p.keyboard.press('Enter'); await settle(p)
  log('home total after', await tot.inputValue())
  await card.scrollIntoViewIfNeeded()
  s = await st(p); log('Home budget -> $200,000: card', s.total, 'outlook', s.outlook); s.rows.forEach((r, i) => log('  ', r0[i], ' => ', r))
  await card.screenshot({ path: OUT + '08-after-budget-200k.png' })
  const r1 = s.rows
  const slider = p.getByRole('slider', { name: /Expat price premium/ })
  log('premium before', await slider.getAttribute('aria-valuetext') || await slider.getAttribute('aria-valuenow'))
  await slider.focus(); for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight'); await settle(p)
  log('premium after', await slider.getAttribute('aria-valuetext') || await slider.getAttribute('aria-valuenow'))
  s = await st(p); log('Premium +30 pts: card', s.total, 'outlook', s.outlook); s.rows.forEach((r, i) => log('  ', r1[i], ' => ', r))
  await card.screenshot({ path: OUT + '09-after-premium-up.png' })
  const tr = p.locator('#budget-travel'); await tr.scrollIntoViewIfNeeded(); await tr.click(); await p.keyboard.press('Control+a'); await p.keyboard.type('0'); await p.keyboard.press('Enter'); await settle(p)
  await card.scrollIntoViewIfNeeded()
  s = await st(p); log('Travel home budget $0 ->', s.rows[6], '| % button present:', await chgBtn(p, 'Travel').count())
  await typeIn(p, amtBtn(p, 'Travel'), '4.5k'); await settle(p)
  s = await st(p); log('Travel $0-home row, type "4.5k" ->', s.rows[6], '| card', s.total, s.chip, 'outlook', s.outlook, '| amt', s.amt)
  await card.screenshot({ path: OUT + '10-zero-home-travel.png' })
  await costCard.scrollIntoViewIfNeeded(); await p.waitForTimeout(900)
  await costCard.screenshot({ path: OUT + '11-outlook-cost-card-zero-home.png' })
  log('Outlook cost rows:', await costCard.locator('.col__row').allTextContents())

  log('\n## per-city: switch to Chiang Mai and back')
  await pickCity(p, 'Retire to', 'Chiang', 'Chiang Mai'); await settle(p)
  s = await st(p); log('Chiang Mai housing row:', s.rows[0], '| card', s.total, 'outlook', s.outlook)
  await pickCity(p, 'Retire to', 'Bangkok', 'Bangkok'); await settle(p)
  s = await st(p); log('Back to Bangkok housing row:', s.rows[0])

  log('\n## CHECK 4: tip')
  await card.scrollIntoViewIfNeeded()
  const tipBtn = p.getByRole('button', { name: 'How spending in Bangkok is worked out' })
  await tipBtn.click(); await p.waitForTimeout(500)
  const tipText = await p.evaluate(() => [...document.querySelectorAll('[role=tooltip], .infotip__bubble, .tooltip')].map((e) => e.textContent.trim()).filter(Boolean).join(' || '))
  log('Tip text:', tipText)
  const bb = await card.boundingBox()
  await p.screenshot({ path: OUT + '12-tip-light.png', clip: { x: Math.max(0, bb.x - 60), y: Math.max(0, bb.y - 30), width: bb.width + 120, height: 420 } })
  await p.keyboard.press('Escape')

  log('\n## CHECK 5: keyboard walk + a11y tree')
  await slider.focus()
  for (let i = 0; i < 26; i++) { await p.keyboard.press('Tab'); const f = await p.evaluate(() => { const a = document.activeElement; return `${a.tagName.toLowerCase()} "${a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40)}"` }); log('  Tab', i + 1, f) }
  await amtBtn(p, 'Healthcare').focus(); await p.keyboard.press('Enter')
  log('  Enter on Healthcare $ -> focused', await p.evaluate(() => document.activeElement.getAttribute('aria-label')))
  await p.keyboard.type('12,500'); await p.keyboard.press('Enter'); await settle(p)
  log('  typed 12,500 Enter -> row', (await st(p)).rows[5], '| focus back', await p.evaluate(() => document.activeElement.getAttribute('aria-label')))
  await p.keyboard.press('Tab'); log('  Tab ->', await p.evaluate(() => document.activeElement.getAttribute('aria-label')))
  await p.keyboard.press('Space'); log('  Space on % ->', await p.evaluate(() => document.activeElement.getAttribute('aria-label')))
  await p.keyboard.press('Tab'); log('  Tab out of % input (untouched) -> focus', await p.evaluate(() => document.activeElement.getAttribute('aria-label')), '| row', (await st(p)).rows[5])
  await chgBtn(p, 'Groceries').click(); await p.waitForTimeout(200)
  await p.locator('.expat__card').screenshot({ path: OUT + '13-editing-pct-light.png' }); await p.keyboard.press('Escape')
  const snap = await card.ariaSnapshot()
  fs.writeFileSync(OUT + 'a11y-tree.txt', 'Playwright locator(".expat__card").ariaSnapshot(), desktop 1280, after the edits above\n\n' + snap + '\n')
  // dark desktop
  const keep = await p.evaluate(() => localStorage.getItem('evelo:v2'))
  for (const [name, vp, theme] of [['14-desktop-dark', { width: 1280, height: 1000 }, 'dark'], ['15-phone-375-light', { width: 375, height: 812 }, 'light'], ['16-phone-375-dark', { width: 375, height: 812 }, 'dark']]) {
    const phone = vp.width < 500
    const c2 = await b.newContext({ viewport: vp, hasTouch: phone, isMobile: phone, deviceScaleFactor: 2 })
    const q = await c2.newPage()
    q.on('pageerror', (e) => errors.push(name + ' pageerror ' + e.message))
    q.on('console', (m) => m.type() === 'error' && errors.push(name + ' console ' + m.text()))
    await q.goto(phone ? 'http://localhost:5231/#/outlook' : URL); await q.evaluate(([k, t]) => { const o = JSON.parse(k); o.theme = t; localStorage.setItem('evelo:v2', JSON.stringify(o)) }, [keep, theme])
    await q.reload(); await settle(q)
    if (phone) {
      // real phone flow: tab bar -> Plan
      await q.screenshot({ path: OUT + name + '-outlook-start.png' }); const tabs = await q.locator('.tabbar a').allTextContents(); log(name, 'tab bar:', tabs)
      await q.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Plan' }).tap(); await settle(q)
      log(name, 'after Plan tab: hash', await q.evaluate(() => location.hash), 'card count', await q.locator('.expat__card').count())
    }
    const c = q.locator('.expat__card')
    if (!(await c.count())) { log(name, 'NO CARD'); await q.screenshot({ path: OUT + name + '-page.png', fullPage: false }); await c2.close(); continue }
    await c.scrollIntoViewIfNeeded(); await q.waitForTimeout(500)
    await c.screenshot({ path: OUT + name + '.png' })
    const sw = await q.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
    if (phone) {
      await q.getByRole('button', { name: /^Everything else in Bangkok: .* a year/ }).tap(); await q.keyboard.press('Control+a'); await q.keyboard.type('$22,000')
      await c.screenshot({ path: OUT + name + '-editing.png' })
      const sw2 = await q.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
      await q.keyboard.press('Enter'); await settle(q)
      log(name, 'scrollWidth/innerWidth idle', sw, 'editing', sw2, '| Other row', (await st(q)).rows[7])
      await q.getByRole('button', { name: 'How spending in Bangkok is worked out' }).tap(); await q.waitForTimeout(500)
      await q.screenshot({ path: OUT + name + '-tip.png' })
      log(name, 'scrollWidth with tip open', await q.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]))
    } else {
      await q.getByRole('button', { name: 'How spending in Bangkok is worked out' }).click(); await q.waitForTimeout(400)
      const bb2 = await c.boundingBox(); await q.screenshot({ path: OUT + name + '-tip.png', clip: { x: bb2.x - 60, y: Math.max(0, bb2.y - 30), width: bb2.width + 120, height: 420 } })
      await q.keyboard.press('Escape')
      const cc = q.locator('.col').first(); await cc.scrollIntoViewIfNeeded(); await q.waitForTimeout(900); await cc.screenshot({ path: OUT + name + '-outlook-cost.png' })
      log(name, 'scrollWidth/innerWidth', sw)
    }
    await c2.close()
  }
  log('\n## console/page errors:', errors.length ? errors : 'none')
  fs.writeFileSync(OUT + 'run-log.txt', 'node check.cjs  (Playwright against npx vite preview --port 5231, build of 8c8486c)\n\n' + lines.join('\n') + '\n')
  await b.close()
})().catch((e) => { console.error(e); fs.writeFileSync(OUT + 'run-log.txt', lines.join('\n') + '\nFAILED: ' + e.stack); process.exit(1) })
