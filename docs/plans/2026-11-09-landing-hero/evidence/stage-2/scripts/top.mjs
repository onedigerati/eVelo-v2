import { open, EV } from './common.mjs'
const { browser, page } = await open({ width: 390, height: 844, dpr: 2, clock: false })
await page.waitForTimeout(800)
const y = await page.evaluate(() => [scrollY, Math.round(document.querySelector('.story').getBoundingClientRect().top)])
console.log('scrollY, card top', y)
await page.screenshot({ path: `${EV}/home-load-390-light.png` })
await browser.close()
