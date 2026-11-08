// Loads the artifact-mode build at BASE with whatever dist/photo-assets.json holds; reports photo srcs.
const { chromium } = require('playwright');
const [OUT, BASE, TAG] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('evelo:v2:entered','1'); localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'light' })) });
  const p = await ctx.newPage(); const msgs = [], reqs = [];
  p.on('console', m => msgs.push(`${m.type()}: ${m.text().slice(0, 300)}`)); p.on('pageerror', e => msgs.push('pageerror: ' + e.message));
  p.on('request', r => { const u = r.url(); if (/photo-assets|\.webp/.test(u)) reqs.push(u.replace(BASE, '')) });
  await p.goto(BASE + '#atlas'); await p.waitForSelector('.crow', { timeout: 60000 }); await p.waitForTimeout(2500);
  for (const name of ['Tokyo', 'Austin', 'Lisbon']) {
    await p.fill('.search__input', name); await p.waitForTimeout(600);
    await p.locator('.crow', { hasText: name }).first().locator('.pickbadge').click();
    await p.locator('[role=dialog]').waitFor(); await p.waitForTimeout(1500);
    const info = await p.evaluate(() => { const im = [...document.querySelectorAll('[role=dialog] .pgal__mosaic img')]; return { n: im.length, loaded: im.filter(i => i.complete && i.naturalWidth > 0).length, srcs: im.map(i => i.getAttribute('src')) } });
    console.log(`[${TAG}] ${name}: ${JSON.stringify(info)}`);
    await p.screenshot({ path: `${OUT}/assets-${TAG}-${name.toLowerCase()}.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  }
  console.log(`[${TAG}] requests: ${JSON.stringify([...new Set(reqs)].slice(0, 40))}`);
  console.log(`[${TAG}] console: ${JSON.stringify(msgs)}`);
  await b.close();
})();
