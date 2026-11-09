import { chromium } from 'playwright'
export const URL = 'http://localhost:4330/#home'
export const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2'

export async function open({ width = 1280, height = 900, dark = false, reduced = false, clock = true, dpr = 1 } = {}) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    colorScheme: dark ? 'dark' : 'light',
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
  if (clock) await page.clock.install({ time: new Date('2026-11-08T12:00:00Z') })
  await page.goto(URL)
  await page.waitForSelector('.story')
  if (clock) await page.clock.pauseAt(new Date('2026-11-08T12:00:30Z'))
  return { browser, ctx, page, logs }
}

/** Snapshot of what the card and steps show. */
export async function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const cur = document.querySelector('.landing__step[aria-current="step"] .landing__step-title')
    const btn = document.querySelector('.story__ctrl .story__btn')
    const live = document.querySelector('.story [aria-live]')
    const lead = q('.story__cap-beat:not([aria-hidden]) .story__cap-lead')?.textContent
    const odds = q('.story__odds-num')?.textContent + ' ' + q('.story__odds-unit')?.textContent
    const curs = [...document.querySelectorAll('.landing__step[aria-current]')].length
    const bars = [...document.querySelectorAll('.story__bar-paid')].length
    const loan = q('.story__loan')?.getAttribute('d')?.length ?? 0
    return { lead, current: cur?.textContent ?? null, nCurrent: curs, btn: btn?.getAttribute('aria-label'), live: live?.textContent, odds, bars, loanD: loan }
  })
}
export const leadToBeat = {}
