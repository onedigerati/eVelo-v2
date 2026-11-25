import { chromium } from '/home/jonah/src/repos/eVelo-v2/node_modules/playwright/index.mjs'
import { withPreview } from '/home/jonah/src/repos/eVelo-v2/scripts/serve-preview.mjs'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EVELO = { portfolio: 2_000_000, age: 60, horizonYears: 20, homeCityId: 'new-york', otherIncome: 30_000, incomeStartAge: 62, paths: 300, seed: 11 }
const MODE = { portfolio: 2_000_000, basisFraction: 0.5, age: 60, horizonYears: 20, spending: 90_000, otherIncome: 30_000, incomeStartAge: 62, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj', homeCityId: 'new-york', seed: 11, paths: 300, blockMonths: 36, outlook: 'balanced', step: 6, done: true }
await withPreview(async (base) => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(([e, m]) => { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: e, theme: 'light', themeV: 2 })); localStorage.setItem('evelo:v2:income', JSON.stringify(m)) }, [EVELO, MODE])
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p)
  await p.goto(base + '#income'); await p.locator('[data-testid="income-results"]').waitFor({ timeout: 20000 })
  await p.getByRole('button', { name: 'Sync with my eVelo plan' }).click(); await p.locator('.isync__copy').click()
  const CH = '[data-testid="wt-chart-svg"]'; await p.locator(CH).waitFor({ timeout: 30000 }); await sleep(1500)
  const ax = async (label) => {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree')
    const out = nodes.filter((n) => n.role?.value === 'slider').map((n) => ({ name: n.name?.value, value: n.value?.value, vt: (n.properties ?? []).find((q) => q.name === 'valuetext')?.value.value }))
    const pq = await cdp.send('Accessibility.queryAXTree', { backendNodeId: (await cdp.send('DOM.describeNode', { objectId: (await cdp.send('Runtime.evaluate', { expression: `document.querySelector('${CH}')` })).result.objectId })).node.backendNodeId })
    console.log(label, 'DOM valuetext=', await p.locator(CH).getAttribute('aria-valuetext'), '| full tree:', JSON.stringify(out), '| queried:', JSON.stringify(pq.nodes.map((n) => ({ role: n.role?.value, name: n.name?.value, value: n.value, vt: (n.properties ?? []).find((q) => q.name === 'valuetext') }))))
    console.log(label, 'ariaSnapshot:', (await p.locator(CH).ariaSnapshot()).replace(/\n/g, ' / '))
  }
  await cdp.send('DOM.getDocument')
  await ax('load')
  await p.locator(CH).focus(); await p.keyboard.press('ArrowRight'); await sleep(300); await ax('after ArrowRight')
  // control: an HTML div slider with the same attributes
  await p.evaluate(() => { const d = document.createElement('div'); d.setAttribute('role', 'slider'); d.setAttribute('aria-label', 'control'); d.setAttribute('aria-valuemin', '0'); d.setAttribute('aria-valuemax', '19'); d.setAttribute('aria-valuenow', '1'); d.setAttribute('aria-valuetext', 'End of age 61, year 2 of 20'); d.tabIndex = 0; document.body.prepend(d) })
  await sleep(300)
  const { nodes } = await cdp.send('Accessibility.getFullAXTree')
  console.log('control div:', JSON.stringify(nodes.filter((n) => n.role?.value === 'slider').map((n) => ({ name: n.name?.value, value: n.value?.value, vt: (n.properties ?? []).find((q) => q.name === 'valuetext')?.value.value }))))
  console.log('control ariaSnapshot:', await p.locator('div[aria-label=control]').ariaSnapshot())
  await b.close()
})
