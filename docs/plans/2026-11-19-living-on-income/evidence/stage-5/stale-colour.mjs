import { chromium } from '/home/jonah/src/repos/eVelo-v2/node_modules/playwright/index.mjs'
import { withPreview } from '/home/jonah/src/repos/eVelo-v2/scripts/serve-preview.mjs'
const EV = process.argv[2]; const out = []
const ans = { portfolio: 1.5e6, basisFraction: 0.4, spending: 70000, age: 66, horizonYears: 25, stockShare: 0.4, muniShare: 0.8, homeCityId: 'chicago', filingStatus: 'mfj', otherIncome: 36000, incomeStartAge: 70 }
await withPreview(async (base) => {
  const b = await chromium.launch()
  for (const [w, scheme] of [[1280,'light'],[1280,'dark'],[390,'light'],[390,'dark']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 844 }, colorScheme: scheme, ...(w<900?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{}) })
    await ctx.addInitScript(([a, t]) => { localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })); if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x','1'); localStorage.setItem('evelo:v2:income', JSON.stringify({ ...a, step: 6, done: false })) }
      const W = window.Worker; window.__block = false
      window.Worker = class extends W { postMessage(m, ...r) { if (window.__block && m?.kind === 'income') { setTimeout(() => this.dispatchEvent(new ErrorEvent('error', { message: 'blocked' }))); return } return super.postMessage(m, ...r) } } }, [ans, scheme])
    const p = await ctx.newPage()
    await p.goto(base + '#income')
    await p.waitForFunction(() => document.querySelector('[data-testid="income-chart"]')?.dataset.status === 'current' && document.querySelector('[data-testid="income-chart"]').dataset.layers === '4')
    await p.evaluate(() => { window.__block = true })
    await p.locator('[data-field="otherIncome"]').fill('30k')
    await p.waitForFunction(() => document.querySelector('[data-testid="income-chart"]')?.dataset.status === 'stale')
    await p.waitForTimeout(400)
    const brass = await p.evaluate(() => { const s = document.createElement('span'); s.style.color = 'var(--bruised-text)'; document.querySelector('.income').append(s); const c = getComputedStyle(s).color; s.remove(); return c })
    const ask = await p.locator('.ichart-panel__busy').evaluate((e) => [e.textContent, getComputedStyle(e).color, getComputedStyle(document.querySelector('.ichart-panel__figure')).opacity])
    await p.screenshot({ path: `${EV}/v-${w}-${scheme}-stale-ask-only.png` })
    await p.locator('[data-field="otherIncome"]').press('Enter')
    await p.waitForFunction(() => document.querySelector('[data-testid="income-results"]')?.dataset.status === 'stale')
    await p.waitForTimeout(400)
    const res = await p.locator('[data-testid="income-status"]').evaluate((e) => [e.className, e.textContent, getComputedStyle(e).color, getComputedStyle(document.querySelector('.imeasures')).opacity, getComputedStyle(document.querySelector('.ichart-panel__figure')).opacity])
    out.push(`${w}-${scheme}: brass ${brass} | ask label ${JSON.stringify(ask)} | results label ${JSON.stringify(res)}`)
    await p.screenshot({ path: `${EV}/v-${w}-${scheme}-stale-results-top.png` })
    await ctx.close()
  }
  await b.close()
}, 4192)
console.log(out.join('\n'))
