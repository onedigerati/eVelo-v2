// Stages 4-5 verifier: node docs/evidence/stage-4/scripts/profiles.cjs http://localhost:4197/ <outdir> 'Mexico City=mexico-city' 'Cuenca=cuenca' ...
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = process.argv[2], OUT = process.argv[3]
let fails = 0
const ok = (c, m) => { if (!c) fails++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`) }
const errs = []
;(async () => {
  const b = await chromium.launch()
  for (const [name, id] of process.argv.slice(4).map((a) => a.split('='))) {
    const c = await b.newContext({ viewport: { width: 1440, height: 1000 } })
    const p = await c.newPage()
    p.on('pageerror', (e) => errs.push(`${id} pageerror: ${e.message}`))
    p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`${id} ${m.type()}: ${m.text()}`) })
    await p.goto(BASE + '#atlas')
    await p.waitForSelector('.pick__open', { timeout: 20000 })
    await p.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.pick__odds b'), null, { timeout: 90000 })
    let btn = p.locator(`.pick__open:has-text("${name}")`).first()
    let via = 'top-pick card .pick__open', pickOdds
    if (!(await btn.count())) {
      // Only the first cards show by default: press "Show all top N" (the card grid's own more button, not the Also list's).
      const all = p.locator('.atlas__picks .picks__more:not(.also .picks__more) .chip-btn').first()
      if (await all.count()) { await all.click(); await p.waitForTimeout(500); via = 'top-pick card .pick__open, after "Show all top N"' }
    }
    if (await btn.count()) {
      pickOdds = await btn.evaluate((el) => el.closest('.pick')?.querySelector('.pick__odds b')?.textContent?.trim() ?? null)
    } else {
      // Not one of the first cards: open it from the "Also worth a look" list (expanding it if needed).
      const row = () => p.locator(`.also__row:has(.also__name b:has-text("${name}"))`).first()
      if (!(await row().count())) { const more = p.locator('.also .picks__more .chip-btn'); if (await more.count()) await more.click() }
      const r = row()
      ok((await r.count()) > 0, `${name}: found in the "Also worth a look" list`)
      if (!(await r.count())) { await c.close(); continue }
      pickOdds = (await r.locator('.also__odds').textContent()).trim()
      btn = r.locator('.also__main')
      via = `"Also worth a look" row (rank ${(await r.locator('.also__rank').textContent()).trim()}, .also__main button)`
    }
    console.log(`${name}: opened via ${via}`)
    await btn.scrollIntoViewIfNeeded(); await btn.click()
    await p.waitForSelector('.prof-sheet .pgal__mosaic', { timeout: 15000 })
    await p.waitForFunction(() => [...document.querySelectorAll('.pgal__mosaic img')].every((i) => i.complete), null, { timeout: 20000 })
    await p.waitForTimeout(800)
    const s = await p.evaluate(() => {
      const q = (x) => document.querySelector(x)
      const imgs = [...document.querySelectorAll('.pgal__mosaic img')]
      return {
        tiles: document.querySelectorAll('.pgal__mosaic .pgal__tile').length,
        loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
        srcs: imgs.map((i) => i.currentSrc.split('/').pop()),
        badge: q('.pgal__mosaic .podds')?.innerText.replace(/\s+/g, ' '),
        badgeBig: q('.pgal__mosaic .podds__big')?.textContent?.trim(),
        badgeVs: q('.pgal__mosaic .podds__vs')?.textContent?.replace(/\s+/g, ' ').trim(),
        cardBig: q('.pplan__big')?.textContent?.trim(),
        cardSub: q('.pplan__sub')?.textContent?.replace(/\s+/g, ' ').trim(),
        badgeHome: q('.pgal__mosaic .podds__home')?.style.left,
        cardMark: q('.pplan__mark')?.style.left,
        credit: q('.pgal > .pgal__credit')?.textContent,
        title: q('.prof-sheet .prof h2, .prof-sheet .prof h1')?.textContent?.trim(),
      }
    })
    console.log(id, JSON.stringify({ pickOdds, ...s }))
    ok(s.tiles === 5 && s.loaded === 5, `${name}: mosaic has ${s.tiles} tiles, ${s.loaded} images loaded`)
    ok(!!s.badge && s.badgeBig && s.cardBig && s.badgeBig.replace('%', '') === s.cardBig.replace('%', ''), `${name}: badge ${s.badgeBig} == card ${s.cardBig} (top-picks list shows ${pickOdds})`)
    ok(s.badgeVs && s.cardSub && s.cardSub.includes(s.badgeVs), `${name}: badge "${s.badgeVs}" within card sub "${s.cardSub}"`)
    ok(s.badgeHome && s.cardMark && parseFloat(s.badgeHome).toFixed(2) === parseFloat(s.cardMark).toFixed(2), `${name}: home tick ${s.badgeHome} == card mark ${s.cardMark}`)
    const gal = p.locator('.prof-sheet .pgal').first()
    await gal.scrollIntoViewIfNeeded()
    await gal.screenshot({ path: `${OUT}/${id}-mosaic.png` })
    await p.screenshot({ path: `${OUT}/${id}-profile.png` })
    await c.close()
  }
  await b.close()
  console.log('console errors/warnings:', errs.length ? errs : 'none')
  console.log(fails ? `${fails} FAIL` : 'ALL PASS')
  process.exit(fails ? 1 : 0)
})()
