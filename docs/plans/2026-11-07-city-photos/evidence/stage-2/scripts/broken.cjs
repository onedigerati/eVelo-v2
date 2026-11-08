const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const OUT = process.argv[2]
;(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()
  const logs = []; p.on('console', (m) => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', (e) => logs.push('pageerror: ' + e.message))
  await p.goto('http://localhost:4233/#atlas')
  await p.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.pick__odds b'), null, { timeout: 60000 })
  const picks = await p.locator('.pick__open').count()
  const r = {}
  for (const city of ['Lisbon', 'Algarve (Faro)']) {
    await p.locator(`.pick__open:text-is("${city}")`).first().click(); await p.waitForSelector('.prof-sheet .prof'); await p.waitForTimeout(1200)
    r[city] = await p.evaluate(() => ({ pgal: !!document.querySelector('.pgal'), tiles: document.querySelectorAll('.pgal__mosaic .pgal__tile').length, card: document.querySelector('.pplan__big')?.textContent }))
    await p.screenshot({ path: `${OUT}/missing-photo-${city.split(' ')[0].toLowerCase()}.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(600)
  }
  console.log('Atlas ranked, pick cards:', picks)
  console.log('Lisbon (3.webp deleted):', JSON.stringify(r.Lisbon))
  console.log('Algarve (untouched):', JSON.stringify(r['Algarve (Faro)']))
  console.log('console:', logs.filter((l) => /photos|error/i.test(l)).join('\n  ') || 'none')
  const pass = picks > 0 && !r.Lisbon.pgal && r.Lisbon.card && r['Algarve (Faro)'].tiles === 5 && !logs.some((l) => l.startsWith('pageerror'))
  console.log(pass ? 'PASS' : 'FAIL', ' missing file drops only Lisbon\'s gallery; Atlas ranks and other galleries work')
  await b.close()
})()
