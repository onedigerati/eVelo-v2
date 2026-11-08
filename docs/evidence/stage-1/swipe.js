const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' });
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.addInitScript(([t]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('evelo:v2:entered', '1'); localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, inputs: { homeCityId: 'st-louis', destCityId: 'bangkok' } })) }, [theme]);
    const p = await ctx.newPage(); await p.goto('http://localhost:5192/#atlas'); await p.waitForSelector('.crow', { timeout: 90000 }); await p.waitForTimeout(2500);
    for (const name of ['Tokyo', 'Volcán', 'Lisbon']) {
      await p.fill('.search__input', name); await p.waitForTimeout(500);
      await p.locator('.crow', { hasText: name }).first().locator('.pickbadge').first().tap(); await p.locator('[role=dialog]').waitFor(); await p.waitForTimeout(800);
      const imgs = p.locator('[role=dialog] .pgal__track img'); const n = await imgs.count(); const dots = p.locator('[role=dialog] .pgal__dots button');
      for (let i = 0; i < await dots.count(); i++) { await dots.nth(i).tap(); await p.waitForTimeout(700) }
      const loaded = await imgs.evaluateAll(a => a.filter(i => i.complete && i.naturalWidth > 0 && i.getAttribute('src').startsWith('/_blob/')).length);
      console.log(`phone-${theme} ${name}: ${loaded}/${n} loaded after swiping through`);
      if (name === 'Tokyo') await p.screenshot({ path: `docs/evidence/stage-1/v30-phone-${theme}-tokyo-photo5.png` });
      await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    }
    await ctx.close();
  }
  await b.close();
})();
