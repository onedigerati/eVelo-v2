const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' });
  for (const [tag, opts, theme] of [['desk-light', { viewport: { width: 1440, height: 900 } }, 'light'], ['desk-dark', { viewport: { width: 1440, height: 900 } }, 'dark'], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'light']]) {
    const ctx = await b.newContext(opts);
    await ctx.addInitScript(([theme]) => {
      if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
      localStorage.clear(); localStorage.setItem('evelo:v2:entered', '1');
      localStorage.setItem('evelo:v2', JSON.stringify({ theme, inputs: { homeCityId: 'st-louis', destCityId: 'bangkok' } }));
    }, [theme]);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:5191/#atlas');
    await p.waitForSelector('.crow', { timeout: 90000 }); await p.waitForTimeout(3000);
    await p.locator('.atlas__tiles').screenshot({ path: `${OUT}/tiles-${tag}.png` });
    const links = p.locator('.atile__profile:visible');
    const n = await links.count();
    console.log(tag, 'profile links:', n, await p.locator('.atile').evaluateAll(t => t.map(x => x.querySelector('.t-eyebrow').textContent + ':' + !!x.querySelector('.atile__profile'))));
    for (let i = 0; i < n; i++) {
      const l = links.nth(i);
      if (opts.hasTouch) await l.tap(); else await l.click();
      const d = p.locator('[role=dialog]'); await d.waitFor(); await p.waitForTimeout(1000);
      console.log('  sheet:', await d.evaluate(el => el.querySelector('.prof__eyebrow')?.textContent?.trim() + ' | ' + el.querySelector('h2')?.textContent?.trim()));
      await p.keyboard.press('Escape'); await p.waitForTimeout(700);
    }
    console.log('  hscroll', await p.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth), 'errors', errs);
    await ctx.close();
  }
  await b.close();
})();
