const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1'; const lines = [];
(async () => { const b = await chromium.launch(); try {
 for (const [w, scheme] of [[390, 'light'], [390, 'dark'], [1280, 'light']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500, colorScheme: scheme })).newPage();
  await p.goto('http://localhost:4791/#atlas'); await p.waitForSelector('.ctier'); await p.waitForTimeout(2500);
  const r = await p.$$eval('.ctier:not(.is-open)', els => els.map(e => { const b = e.querySelector('.ctier__btn').getBoundingClientRect(); const k = e.querySelector('.ctier__peek').getBoundingClientRect(); return `${e.querySelector('.ctier__label').innerText.replace(/\n/g,' ')}${e.querySelector('.ctier__home') ? ' [HOME]' : ''}: peek left offset ${Math.round(k.left - b.left)}px, top ${Math.round(k.top - b.top)}px, peek margin-left ${getComputedStyle(e.querySelector('.ctier__peek')).marginLeft}`; }));
  lines.push(`--- ${w}px ${scheme} · Best odds at rest`, ...r);
  const geo = () => p.$$eval('.ctier:not(.is-open)', els => els.map(e => { const b = e.querySelector('.ctier__btn').getBoundingClientRect(); const k = e.querySelector('.ctier__peek').getBoundingClientRect(); return `${e.querySelector('.ctier__label').innerText.replace(/\n/g,' ')}${e.querySelector('.ctier__home') ? ' [HOME]' : ''}: peek left offset ${Math.round(k.left - b.left)}px, top ${Math.round(k.top - b.top)}px`; }));
  if (w < 500) {
    await p.getByRole('radio', { name: 'Cheapest' }).tap(); await p.waitForTimeout(800);
    lines.push(`--- ${w}px ${scheme} · Cheapest at rest`, ...(await geo()));
    const home = p.locator('.ctier', { has: p.locator('.ctier__home') }); await home.scrollIntoViewIfNeeded();
    const hb = await home.boundingBox(); const lst = await p.locator('.ctier').last().boundingBox(); const first = await p.locator('.ctier').nth(1).boundingBox();
    await p.screenshot({ path: `${OUT}/phone-${scheme}-cheapest-tiers-r2.png`, clip: { x: 0, y: Math.max(0, first.y - 10), width: w, height: Math.min(lst.y + lst.height - first.y + 20, 1600) } });
    await p.getByRole('radio', { name: 'Best odds' }).tap(); await p.waitForTimeout(800);
  }
  if (w < 500) { const home = p.locator('.ctier', { has: p.locator('.ctier__home') }); await home.scrollIntoViewIfNeeded();
   const box = await home.boundingBox(); const prev = await p.locator('.ctier').nth(2).boundingBox();
   await p.screenshot({ path: `${OUT}/phone-${scheme}-home-tier-peek-r2.png`, clip: { x: 0, y: prev.y, width: w, height: box.y + box.height - prev.y + 70 } }); }
 }
} finally { await b.close(); }
 const s = '$ node peek-r2.cjs   (closed-tier header geometry at rest, vite preview of npm run build)\n' + lines.join('\n') + '\n'; require('fs').writeFileSync(`${OUT}/home-tier-peek-alignment-r2.txt`, s); console.log(s); })();
