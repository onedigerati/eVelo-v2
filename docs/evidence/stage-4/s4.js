// Stage 2: each city opens from its list "Profile" chip; 5 photos (desktop mosaic / phone carousel), eyebrow, not in top picks.
const { chromium } = require('playwright');
const [OUT, BASE, CITIES] = process.argv.slice(2); const cities = require(CITIES);
const EXE = '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell';
(async () => {
  const b = await chromium.launch({ executablePath: EXE }); const errs = [];
  for (const [tag, theme, phone] of [['desk-light', 'light', false], ['desk-dark', 'dark', false], ['phone-light', 'light', true], ['phone-dark', 'dark', true]]) {
    const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(([t]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('evelo:v2:entered', '1'); localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, inputs: { homeCityId: 'st-louis', destCityId: 'bangkok' } })) }, [theme]);
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error') errs.push(`[${tag}] ${m.text().slice(0, 200)}`) }); p.on('pageerror', e => errs.push(`[${tag}] pageerror ${e.message}`));
    p.on('response', r => { if (r.status() >= 400) errs.push(`[${tag}] HTTP ${r.status()} ${r.url()}`) });
    await p.goto(BASE + '#atlas'); await p.waitForSelector('.crow', { timeout: 90000 }); await p.waitForTimeout(3000);
    const picks = await p.locator('.atlas__picks').innerText().catch(() => '');
    const res = [];
    for (const [id, name] of cities) {
      await p.fill('.search__input', name); await p.waitForTimeout(450);
      const chip = p.locator('.crow', { hasText: name }).first().locator('.pickbadge--profile');
      if (!(await chip.count())) { res.push(`${id}: NO CHIP`); continue }
      phone ? await chip.tap() : await chip.click(); await p.locator('[role=dialog]').waitFor(); await p.waitForTimeout(700);
      const sel = phone ? '.pgal__track img' : '.pgal__mosaic img';
      if (phone) { const dots = p.locator('[role=dialog] .pgal__dots button'); for (let i = 0; i < await dots.count(); i++) { await dots.nth(i).tap(); await p.waitForTimeout(450) } }
      else await p.waitForTimeout(800);
      const g = await p.locator('[role=dialog]').evaluate((el, sel) => { const im = [...el.querySelectorAll(sel)]; return { eb: el.querySelector('.prof__eyebrow')?.textContent?.trim(), n: im.length, ok: im.filter(i => i.complete && i.naturalWidth > 0).length } }, sel);
      res.push(`${id}: ${g.ok}/${g.n} · "${g.eb}" · in top picks: ${picks.includes(name)}`);
      if (['montreal', 'buenos-aires'].includes(id)) await p.screenshot({ path: `${OUT}/sheet-${id}-${tag}.png` });
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    }
    const hs = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(`${tag} (overflow ${hs}px)\n  ${res.join('\n  ')}`);
    await ctx.close();
  }
  console.log('errors:', JSON.stringify(errs)); await b.close();
})();
