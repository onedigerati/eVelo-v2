import { chromium } from 'playwright'
import fs from 'node:fs'
const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-3'
const BASE = 'http://localhost:4350/'
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }

for (const [w, h] of [[1280, 900], [390, 844]]) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => errs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`))
  page.on('response', (r) => { if (r.status() >= 400) errs.push(`HTTP ${r.status()}: ${r.url()}`) })
  const sw = () => page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  log(`\n===== ${w}x${h}`)

  // ---- Landing
  await page.goto(`${BASE}#home`)
  await page.waitForSelector('.story')
  if (w === 390) { await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' })) }
  await page.waitForTimeout(2600)
  const playing = await page.locator('.story__ctrl .story__btn').first().getAttribute('aria-label')
  const lead = await page.locator('.story__cap-beat:not([aria-hidden]) .story__cap-lead').textContent()
  expect(/^Pause/.test(playing), `landing: the card is playing ("${playing}", caption "${lead}")`)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${EV}/landing-${w}.png` })
  const links = await page.$$eval('.landing a[href]', (as) => as.map((a) => `${a.textContent.trim().replace(/\s+/g, ' ')} -> ${a.getAttribute('href')}`))
  log(`landing links: ${links.join(' | ')}`)
  const [s1, iw] = await sw(); expect(s1 <= iw, `landing: no sideways scroll (${s1}/${iw})`)
  // theme toggle
  const bg = () => page.evaluate(() => [document.documentElement.getAttribute('data-theme'), getComputedStyle(document.body).backgroundColor])
  const before = await bg()
  // Desktop: a three-way segmented control (System / Light / Dark); phone: one button cycling system -> light -> dark
  const seg = page.locator('.landing [aria-label="Dark theme"]')
  if (await seg.count() && await seg.first().isVisible()) {
    await seg.first().click(); await page.waitForTimeout(300)
    const dark = await bg()
    await page.screenshot({ path: `${EV}/landing-${w}-dark.png` })
    await page.locator('.landing [aria-label="Light theme"]').first().click(); await page.waitForTimeout(300)
    const light = await bg()
    await page.locator('.landing [aria-label="System theme"]').first().click(); await page.waitForTimeout(300)
    log(`theme control (Dark / Light / System): ${JSON.stringify(before)} -> dark ${JSON.stringify(dark)} -> light ${JSON.stringify(light)} -> system ${JSON.stringify(await bg())}`)
    expect(dark[0] === 'dark' && light[0] === 'light' && dark[1] !== light[1], 'landing: the theme control switches dark and light')
  } else {
    const toggle = page.locator('.landing button[aria-label*="switch to" i]').first()
    const seq = [before]
    for (let i = 0; i < 3; i++) { await toggle.click(); await page.waitForTimeout(300); seq.push(await bg()); if (seq.at(-1)[0] === 'dark') await page.screenshot({ path: `${EV}/landing-${w}-dark.png` }) }
    log(`theme cycle button: ${seq.map((x) => JSON.stringify(x)).join(' -> ')}`)
    expect(seq.some((x) => x[0] === 'dark') && seq.some((x) => x[0] === 'light') && seq.at(-1)[0] === 'system', 'landing: the theme button cycles light, dark and back to system')
  }
  // In-page link: How it works scrolls to the steps, hash unchanged
  const how = page.locator('.landing a', { hasText: /How it works/ }).first()
  if (await how.count() && await how.isVisible()) {
    await how.click(); await page.waitForTimeout(900)
    const r = await page.evaluate(() => [location.hash, Math.round(document.getElementById('how').getBoundingClientRect().top), Math.round(scrollY), document.documentElement.scrollHeight - innerHeight, document.activeElement?.id])
    expect(r[0] === '#home' && (Math.abs(r[1]) < 80 || r[2] >= r[3] - 1) && r[4] === 'how', `"How it works": hash stays ${r[0]}, scrolled to ${r[2]} of max ${r[3]} (steps top ${r[1]}px), focus on #${r[4]}`)
  } else log('"How it works" not visible at this width')
  // Explore the Atlas
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.locator('.landing a', { hasText: /Explore the Atlas/ }).first().click()
  await page.waitForTimeout(500)
  expect((await page.evaluate(() => location.hash)) === '#atlas', `"Explore the Atlas" -> ${await page.evaluate(() => location.hash)}`)
  // Back to landing, then Stress-test my plan
  await page.goto(`${BASE}#home`); await page.waitForSelector('.story')
  await page.locator('.landing a', { hasText: /Stress-test my plan/ }).first().click(); await page.waitForTimeout(500)
  log(`"Stress-test my plan" -> ${await page.evaluate(() => location.hash)}`)
  await page.goto(`${BASE}#home`); await page.waitForSelector('.story')
  await page.locator('.landing a', { hasText: /Open the planner/ }).first().click(); await page.waitForTimeout(500)
  log(`"Open the planner" -> ${await page.evaluate(() => location.hash)}`)

  // ---- Atlas
  await page.goto(`${BASE}#atlas`)
  await page.waitForTimeout(5000)
  const atlas = await page.evaluate(() => ({ svgs: document.querySelectorAll('svg').length, rows: document.querySelectorAll('.crow').length, mapPaths: document.querySelectorAll('svg path').length, sw: document.documentElement.scrollWidth }))
  log(`atlas: ${JSON.stringify(atlas)}`)
  await page.screenshot({ path: `${EV}/atlas-${w}.png` })
  // list on phone may be a separate tab
  if (!atlas.rows) {
    const listTab = page.getByRole('tab', { name: /list/i }).or(page.getByRole('button', { name: /^list$/i })).first()
    if (await listTab.count()) { await listTab.click(); await page.waitForTimeout(800) }
  }
  const rows = await page.locator('.crow').count()
  expect(rows > 0 && atlas.mapPaths > 0, `atlas: map drawn (${atlas.mapPaths} SVG paths) and list rows (${rows})`)
  await page.screenshot({ path: `${EV}/atlas-list-${w}.png`, fullPage: false })
  const prof = page.locator('button[aria-label^="Open the "][aria-label$=" profile"], button[aria-label*="open the "][aria-label$=" profile"]').first()
  const pname = await prof.getAttribute('aria-label')
  await prof.click(); await page.waitForTimeout(1500)
  const sheet = await page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); return d ? d.getAttribute('aria-label') || d.querySelector('h1,h2')?.textContent : null })
  expect(!!sheet, `atlas: "${pname}" opens a profile (${sheet})`)
  await page.screenshot({ path: `${EV}/atlas-profile-${w}.png` })
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)

  // ---- Plan and Outlook
  for (const r of ['plan', 'outlook']) {
    await page.goto(`${BASE}#${r}`)
    await page.waitForTimeout(4000)
    const info = await page.evaluate(() => ({ h: location.hash, svgs: document.querySelectorAll('svg').length, inputs: document.querySelectorAll('input').length, text: document.querySelector('main')?.innerText.slice(0, 80).replace(/\s+/g, ' '), sw: document.documentElement.scrollWidth }))
    expect(info.svgs > 0 && info.sw <= w, `${r}: ${JSON.stringify(info)}`)
    await page.screenshot({ path: `${EV}/${r}-${w}.png` })
  }
  // ---- Method
  await page.goto(`${BASE}#method`)
  await page.waitForTimeout(2500)
  const m = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, svgs: document.querySelectorAll('svg').length, sw: document.documentElement.scrollWidth }))
  expect(!!m.h1 && m.sw <= w, `method: ${JSON.stringify(m)}`)
  await page.screenshot({ path: `${EV}/method-${w}.png` })

  expect(errs.length === 0, `console errors/warnings, page errors, failed requests at ${w}: ${errs.length ? JSON.stringify(errs) : 'none'}`)
  await browser.close()
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/app-run.txt`, `$ node app.mjs (Playwright 1.57 Chromium, vite preview of npm run build at ${BASE}; console errors and warnings, page errors, failed requests and HTTP >= 400 collected for every page)\n` + out.join('\n') + '\n')
