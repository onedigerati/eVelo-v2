import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }

// Record every aria-live text change during autoplay (two passes) with a MutationObserver
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('== A. aria-live during autoplay (two passes + rest), 1280')
  await page.evaluate(() => {
    window.__live = []
    const el = document.querySelector('.story [aria-live]')
    window.__live.push('[initial] ' + el.textContent)
    new MutationObserver(() => window.__live.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true })
  })
  const snaps = {}
  for (let ms = 0; ms <= 45000; ms += 500) {
    if (ms) await page.clock.runFor(500)
    const s = await state(page)
    const b = BEAT[s.lead]
    // a11y snapshot at the middle of each beat in the first pass, and its finished frame
    const tag = { 2000: 'buy-mid', 3500: 'buy-end', 6000: 'borrow-mid', 7500: 'borrow-end', 10000: 'live-mid', 11500: 'live-end', 14000: 'die-mid', 16000: 'die-end' }[ms]
    if (tag) snaps[tag] = { beat: b, aria: await page.locator('.story').ariaSnapshot(), hiddenKey: await page.evaluate(() => [...document.querySelectorAll('.story__key li')].map((li) => `${li.textContent}:${getComputedStyle(li).visibility}/${getComputedStyle(li).opacity}`)) }
  }
  const live = await page.evaluate(() => window.__live)
  log('aria-live text changes:')
  for (const l of live) log(`  "${l}"`)
  const steps = live.map((l) => l.replace('[initial] ', '')).filter((l) => l.startsWith('Step')) // the first (Buy) is set as autoplay starts, before the observer attaches
  expect(steps.length === 4 && ['Step 1', 'Step 2', 'Step 3', 'Step 4'].every((p, i) => steps[i].startsWith(p)), `each beat announced once across two passes (${steps.length} announcements)`)
  for (const [tag, v] of Object.entries(snaps)) {
    log(`\n-- ${tag} (card shows ${v.beat})`)
    log(`key items (text:visibility/opacity): ${v.hiddenKey.join(' | ')}`)
    log(v.aria)
  }
  // faded key entries must be absent from the tree
  for (const [tag, v] of Object.entries(snaps)) {
    const hidden = v.hiddenKey.filter((k) => k.endsWith(':hidden/0')).map((k) => k.split(':')[0])
    const leaked = hidden.filter((h) => v.aria.includes(h))
    const zeroButVisible = v.hiddenKey.filter((k) => /visible\/0$/.test(k))
    expect(leaked.length === 0 && zeroButVisible.length === 0, `${tag}: key entries at opacity 0 are hidden and absent from the tree (hidden: ${JSON.stringify(hidden)}; leaked: ${JSON.stringify(leaked)}; opacity 0 but visible: ${JSON.stringify(zeroButVisible)})`)
  }
  // hidden captions (all four share one grid cell) must be out of the tree
  const LEADS = Object.keys(BEAT)
  for (const [tag, v] of Object.entries(snaps)) {
    const own = LEADS.find((l) => BEAT[l] === v.beat)
    const others = LEADS.filter((l) => l !== own && v.aria.includes(l))
    const figName = (v.aria.match(/- figure "([^"]*)"/) || [])[1] || ''
    expect(others.length === 0 && figName.startsWith(own), `${tag}: only the ${v.beat} caption is in the tree (other captions found: ${JSON.stringify(others)}; figure name starts "${figName.slice(0, 30)}")`)
  }
  // SVG name
  const name = await page.locator('.story__svg').getAttribute('aria-label')
  const role = await page.locator('.story__svg').getAttribute('role')
  log(`\nSVG role=${role} aria-label="${name}"`)
  const names = new Set(Object.values(snaps).map((v) => (v.aria.match(/- img "([^"]*)"/) || [])[1]))
  expect(names.size === 1 && role === 'img', `the SVG's name is the same whole-story name at every beat (${names.size} distinct)`)
  // odds badge in the tree?
  expect(!Object.values(snaps).some((v) => /of futures hold/.test(v.aria)), 'odds badge (aria-hidden, "of futures hold in …") is not in the tree; the odds are read in the SVG name and the Live anywhere caption')
  log(`console: ${JSON.stringify(logs)}`)
  fs.writeFileSync(`${EV}/a11y-beats.txt`, `$ node a11y.mjs (Playwright 1.57 Chromium; MutationObserver on the card's aria-live region during two autoplay passes; locator('.story').ariaSnapshot() mid-beat and at each beat's finished frame)\n` + out.join('\n') + '\n')
  await browser.close()
}

// Step presses and user actions: announcements
{
  out.length = 0
  const { browser, page } = await open({ width: 1280, height: 900 })
  log('== B. announcements on user actions')
  await page.clock.runFor(1000)
  await page.evaluate(() => { window.__live = []; const el = document.querySelector('.story [aria-live]'); new MutationObserver(() => window.__live.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }) })
  await page.click('.story__ctrl .story__btn >> nth=0') // pause
  for (const n of ['02', '02', '04']) { await page.locator('.landing__step-n', { hasText: n }).click(); await page.clock.runFor(100) }
  await page.click('.story__ctrl .story__btn >> nth=1') // replay
  await page.clock.runFor(17000)
  const live = await page.evaluate(() => window.__live)
  for (const l of live) log(`  ${JSON.stringify(l.slice(0, 60))}${l.endsWith(' ') ? ' (trailing space variant)' : ''}`)
  fs.appendFileSync(`${EV}/a11y-beats.txt`, '\n' + out.join('\n') + '\n')
  await browser.close()
}
log(`\n${fails} failures`)
fs.appendFileSync(`${EV}/a11y-beats.txt`, `\n${fails} failures\n`)
