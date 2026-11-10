// Stage 1 running-app proof. Usage: node verify-app.cjs <newBase> <oldBase> <outDir>
// newBase: `npx vite preview` of this branch's production build; oldBase: same of 6a137cd (before the stage).
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const fs = require('fs')
const [NEW, OLD, OUT] = process.argv.slice(2)
const lines = []
const log = (...a) => { const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); console.log(s); lines.push(s) }
const errors = []

// eVelo's model ratio (engine/cost.ts modelAt) from the bundled indices: St. Louis [col 71, rent 25, groc 84, rest 70],
// Bangkok [42, 19, 46, 30]. Housing → rent, Dining → restaurants.
const RAW = { housing: 19 / 25, dining: 30 / 70 }
const m = (r, e) => (r < 1 ? r + (1 - r) * e : r)
const HOME = { housing: 26000, dining: 8000 }

async function st(p) {
  return p.evaluate(() => {
    const t = (s) => document.querySelector(s)?.textContent?.trim()
    const rows = [...document.querySelectorAll('.expat__card .ratio')].map((li) => li.textContent.replace(/\s+/g, ' ').trim() + (li.classList.contains('is-fixed') ? ' [$]' : li.classList.contains('is-ratio') ? ' [%]' : ''))
    const inp = JSON.parse(localStorage.getItem('evelo:v2') || '{}').inputs || {}
    const colRows = document.querySelector('.col .col__rows')?.getAttribute('aria-label') || ''
    const slider = document.querySelector('[role=slider][aria-label*="Expat price premium"]') || [...document.querySelectorAll('[role=slider]')].find((s) => /Expat/.test(s.getAttribute('aria-label') || s.closest('.slider')?.textContent || ''))
    return {
      premium: slider?.getAttribute('aria-valuenow'),
      planTotal: t('.expat__total-v'),
      outlookDest: t('.col .col__num:not(.col__num--home)'),
      odds: t('.verdict__number'),
      rows,
      outlookRows: colRows,
      amountOverrides: inp.amountOverrides, amountOverrideAt: inp.amountOverrideAt,
      ratioOverrides: inp.ratioOverrides, ratioOverrideAt: inp.ratioOverrideAt, expatFactor: inp.expatFactor,
    }
  })
}
const settle = async (p) => { await p.waitForTimeout(700); await p.waitForFunction(() => !document.querySelector('.verdict__status'), null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(1300) }
const amtBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in Bangkok: .* a year`) })
const chgBtn = (p, cat) => p.getByRole('button', { name: new RegExp(`^${cat} in Bangkok: .* versus home`) })
async function typeIn(p, btn, text) { await btn.click(); await p.keyboard.press('Control+a'); await p.keyboard.type(text); await p.keyboard.press('Enter') }
const outlookVal = (s, label) => { const mm = s.outlookRows.match(new RegExp(`${label}: \\$[\\d,]+ at home, \\$([\\d,]+) in`)); return mm ? Number(mm[1].replace(/,/g, '')) : null }
const money = (s) => Number(String(s).replace(/[^\d.]/g, ''))

async function profileRows(p, base) {
  await p.goto(base + '#atlas')
  const btn = p.locator('button[aria-label="View the Bangkok profile"], button[aria-label="Open the Bangkok profile"], button[aria-label$="open the Bangkok profile"]')
  await btn.first().waitFor({ state: 'attached', timeout: 120000 })
  let clicked = false
  for (const b of await btn.all()) if (await b.isVisible()) { await b.scrollIntoViewIfNeeded(); await b.click(); clicked = true; break }
  if (!clicked) await btn.first().evaluate((b) => b.click())
  const list = p.locator('[role="dialog"] .pcats__list')
  await list.waitFor({ timeout: 30000 }); await p.waitForTimeout(1500)
  const rows = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"] .pcats__row .sr-only')].map((e) => e.textContent))
  return { rows, list }
}

async function slide(p, n) {
  const slider = p.getByRole('slider', { name: /Expat price premium/ })
  await slider.focus()
  for (let i = 0; i < Math.abs(n); i++) await p.keyboard.press(n > 0 ? 'ArrowRight' : 'ArrowLeft')
  await settle(p)
}

;(async () => {
  const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1200/chrome-linux/headless_shell' }).catch(() => chromium.launch())
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } })
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: { homeCityId: 'st-louis', destCityId: 'bangkok', expatFactor: 0.35 }, theme: 'dark', themeV: 2 })); sessionStorage.setItem('seeded', '1') } })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message))
  p.on('console', (msg) => msg.type() === 'error' && errors.push('console ' + msg.text()))
  await p.goto(NEW + '#plan'); await settle(p)
  const card = p.locator('.expat__card'), cost = p.locator('.col').first()

  log('## A. St. Louis -> Bangkok, premium 35%. Type $6000 on Housing and -50% on Dining out (both rows cheaper in Bangkok, so the premium touches them)')
  let s0 = await st(p); log('before typing:', { premium: s0.premium, planTotal: s0.planTotal, outlookDest: s0.outlookDest, odds: s0.odds })
  await typeIn(p, amtBtn(p, 'Housing'), '6000'); await settle(p)
  await typeIn(p, chgBtn(p, 'Dining out'), '-50'); await settle(p)
  const s1 = await st(p)
  log('after typing at 35%:', { premium: s1.premium, planTotal: s1.planTotal, outlookDest: s1.outlookDest, odds: s1.odds })
  log('  stored: amountOverrides', s1.amountOverrides, 'amountOverrideAt', s1.amountOverrideAt, 'ratioOverrides', s1.ratioOverrides, 'ratioOverrideAt', s1.ratioOverrideAt)
  log('  plan card rows:'); s1.rows.forEach((r) => log('    ', r))
  log('  Outlook housing', outlookVal(s1, 'Housing'), 'dining', outlookVal(s1, 'Dining out'))
  await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: OUT + '/01-typed-at-35.png' })

  log('\n## B. Slide the premium 35% -> 65% (6 steps of 5)')
  await slide(p, 6)
  const s2 = await st(p)
  const wantH = 6000 * m(RAW.housing, 0.65) / m(RAW.housing, 0.35)
  const wantD = HOME.dining * 0.5 * m(RAW.dining, 0.65) / m(RAW.dining, 0.35)
  log('at 65%:', { premium: s2.premium, planTotal: s2.planTotal, outlookDest: s2.outlookDest, odds: s2.odds })
  log('  plan card rows:'); s2.rows.forEach((r) => log('    ', r))
  log('  Outlook housing', outlookVal(s2, 'Housing'), 'expected 6000 × m(.65)/m(.35) =', wantH.toFixed(2), '| cap max(26000, 6000) not reached')
  log('  Outlook dining', outlookVal(s2, 'Dining out'), 'expected 8000 × 0.5 × m(.65)/m(.35) =', wantD.toFixed(2))
  log('  stored anchors unchanged:', s2.amountOverrideAt, s2.ratioOverrideAt)
  const pass = []
  pass.push(['housing $ moved with the slider', Math.abs(outlookVal(s2, 'Housing') - Math.round(wantH)) <= 1])
  pass.push(['dining % moved with the slider', Math.abs(outlookVal(s2, 'Dining out') - Math.round(wantD)) <= 1])
  pass.push(['plan card total == Outlook dest total at 65%', s2.planTotal === s2.outlookDest])
  await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: OUT + '/02-slid-to-65-plan-card.png' })
  await cost.scrollIntoViewIfNeeded(); await p.waitForTimeout(900); await cost.screenshot({ path: OUT + '/03-slid-to-65-outlook-cost-card.png' })

  log('\n## C. Bangkok profile at 65%')
  const prof = await profileRows(p, NEW)
  prof.rows.forEach((r) => log('    ', r))
  const ph = prof.rows.find((r) => r.startsWith('Housing'))
  const planH = s2.rows.find((r) => r.startsWith('Housing'))
  const compact = (v) => '$' + (v / 1000).toFixed(1) + 'K'
  log('  profile housing', ph, '| plan card housing', planH, '| compact of expected', compact(wantH))
  pass.push(['profile housing shows the scaled $ (same as plan card)', ph.includes(compact(wantH) + ' here') && planH.includes(compact(wantH))])
  const pd = prof.rows.find((r) => r.startsWith('Dining'))
  pass.push(['profile dining shows the scaled % (same as plan card)', pd.includes(compact(wantD) + ' here')])
  await prof.list.scrollIntoViewIfNeeded(); await p.locator('[role="dialog"]').screenshot({ path: OUT + '/04-slid-to-65-profile.png' })
  await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  await p.goto(NEW + '#plan'); await settle(p)

  log('\n## D. Slide back 65% -> 35%')
  await slide(p, -6)
  const s3 = await st(p)
  log('back at 35%:', { premium: s3.premium, planTotal: s3.planTotal, outlookDest: s3.outlookDest, odds: s3.odds })
  log('  plan card rows:'); s3.rows.forEach((r) => log('    ', r))
  log('  Outlook housing', outlookVal(s3, 'Housing'), 'dining', outlookVal(s3, 'Dining out'))
  pass.push(['back at 35%: housing exactly $6,000', outlookVal(s3, 'Housing') === 6000])
  pass.push(['back at 35%: dining exactly 50% of $8,000', outlookVal(s3, 'Dining out') === 4000])
  pass.push(['back at 35%: totals identical to before sliding', s3.planTotal === s1.planTotal && s3.outlookDest === s1.outlookDest && s3.odds === s1.odds])
  await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: OUT + '/05-back-at-35.png' })
  const prof3 = await profileRows(p, NEW)
  log('  profile at 35%:', prof3.rows.find((r) => r.startsWith('Housing')), '|', prof3.rows.find((r) => r.startsWith('Dining')))
  pass.push(['profile back at 35%: housing $6.0K', prof3.rows.find((r) => r.startsWith('Housing')).includes('$6.0K here')])
  await p.keyboard.press('Escape')
  await ctx.close()

  log('\n## E. Old-style share link: overrides, no anchors, premium 50%')
  const d = { homeCityId: 'st-louis', destCityId: 'bangkok', expatFactor: 0.5, ratioOverrides: { dining: 0.5 }, amountOverrides: { bangkok: { housing: 6000 } } }
  const link = Buffer.from(JSON.stringify({ v: 1, d })).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  log('payload', d)
  log('link hash #p=' + link)
  const res = {}
  for (const [tag, base] of [['old build (6a137cd, before the stage)', OLD], ['new build (this branch)', NEW]]) {
    const c = await b.newContext({ viewport: { width: 1280, height: 1000 } })
    const q = await c.newPage()
    q.on('pageerror', (e) => errors.push(tag + ' pageerror ' + e.message))
    q.on('console', (msg) => msg.type() === 'error' && errors.push(tag + ' console ' + msg.text()))
    await q.goto(base + '#p=' + link); await settle(q)
    if (!(await q.locator('.expat__card').count())) { await q.goto(base + '#plan'); await settle(q) }
    const s = await st(q)
    res[tag] = s
    log(tag, { premium: s.premium, planTotal: s.planTotal, outlookDest: s.outlookDest, odds: s.odds, amountOverrideAt: s.amountOverrideAt, ratioOverrideAt: s.ratioOverrideAt })
    log('  outlook rows:', s.outlookRows)
    await q.locator('.expat__card').scrollIntoViewIfNeeded()
    await q.locator('.expat__card').screenshot({ path: OUT + `/06-share-link-${base === OLD ? 'old' : 'new'}-build.png` })
    if (base === NEW) {
      await slide(q, 2)
      const sx = await st(q)
      const want = 6000 * m(RAW.housing, 0.6) / m(RAW.housing, 0.5)
      log('  new build, slid 50% -> 60%: housing', outlookVal(sx, 'Housing'), 'expected', want.toFixed(2), '| plan total', sx.planTotal, 'outlook', sx.outlookDest)
      pass.push(['old link: anchored at its own premium, then moves with the slider', Math.abs(outlookVal(sx, 'Housing') - Math.round(want)) <= 1])
      await slide(q, -2)
      const sb = await st(q)
      pass.push(['old link: back at 50% equals the loaded numbers', sb.planTotal === s.planTotal && sb.outlookRows === s.outlookRows])
    }
    await c.close()
  }
  const [o, n] = Object.values(res)
  pass.push(['old link: same plan total, Outlook rows and odds on old and new builds', o.planTotal === n.planTotal && o.outlookRows === n.outlookRows && o.odds === n.odds && o.outlookDest === n.outlookDest])
  pass.push(['old link: $ reads as typed ($6,000) and % as typed (50% of $8,000)', outlookVal(n, 'Housing') === 6000 && outlookVal(n, 'Dining out') === 4000])

  log('\n## RESULTS')
  pass.forEach(([k, v]) => log(v ? 'PASS' : 'FAIL', k))
  log('console/page errors:', errors.length ? errors : 'none')
  fs.writeFileSync(OUT + '/running-app.txt', `node docs/evidence/stage-1/verify-app.cjs ${NEW} ${OLD} docs/evidence/stage-1   (Playwright, headless Chromium, 1280×1000, against npx vite preview of the production build; old = 6a137cd built the same way)\n\n` + lines.join('\n') + '\n')
  await b.close()
})().catch((e) => { console.error(e); fs.writeFileSync(OUT + '/running-app.txt', lines.join('\n') + '\nFAILED: ' + e.stack); process.exit(1) })
