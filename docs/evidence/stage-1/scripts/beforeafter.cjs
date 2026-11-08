const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
(async () => {
  const b = await chromium.launch();
  try {
  for (const phone of [false, true]) for (const scheme of ['light', 'dark']) {
    const tag = `${phone ? 'phone' : 'desktop'}-${scheme}`;
    const names = {};
    const styles = {};
    for (const [ver, url] of [['after', 'http://localhost:4791/#atlas'], ['before', 'http://localhost:4795/#atlas']]) {
      const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme } : { viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      const p = await ctx.newPage();
      await p.goto(url); await p.waitForSelector('.crow', { timeout: 60000 }); await p.waitForTimeout(2500);
      if (ver === 'after') {
        await p.click('.clist__openall'); await p.waitForTimeout(700);
        const rows = p.locator('section[aria-label="All cities"] .crow');
        names.pick = await rows.filter({ has: p.locator('.pickbadge:not(.pickbadge--profile)') }).first().locator('.crow__name b').innerText();
        names.chip = await rows.filter({ has: p.locator('.pickbadge--profile') }).first().locator('.crow__name b').innerText();
        names.cmp = await rows.filter({ hasNot: p.locator('.crow__tag') }).nth(4).locator('.crow__name b').innerText();
      }
      const all = p.locator('section[aria-label="All cities"] .crow');
      for (const k of ['pick', 'chip', 'cmp']) {
        const r = all.filter({ has: p.locator('.crow__name b', { hasText: new RegExp('^' + names[k].replace(/[()]/g, '\\$&') + '$') }) }).first();
        await r.scrollIntoViewIfNeeded();
        if (k === 'cmp') { await (phone ? r.locator('.crow__cmp').tap() : r.locator('.crow__cmp').click()); await p.waitForTimeout(600); }
        await p.mouse.move(0, 0); await p.waitForTimeout(400);
        await r.screenshot({ path: `${OUT}/rows-${tag}-${k}-${ver}.png` });
        styles[ver + k] = await r.evaluate(e => { const c = getComputedStyle(e); const box = e.getBoundingClientRect(); return `h=${Math.round(box.height)} w=${Math.round(box.width)} grid="${c.gridTemplateColumns}" bg=${c.backgroundColor} pad=${c.padding}`; });
      }
      await ctx.close();
    }
    for (const k of ['pick', 'chip', 'cmp']) {
      const same = styles['before' + k] === styles['after' + k];
      L(`${same ? 'SAME' : 'DIFF'} ${tag} ${k} row (${names[k]}):\n   before ${styles['before' + k]}\n   after  ${styles['after' + k]}`);
    }
  }
  } finally { await b.close(); }
  require('fs').writeFileSync(`${OUT}/rows-before-after.txt`, '$ node beforeafter.cjs   (same rows, HEAD ad60520 build on :4795 "before" vs working-tree build on :4791 "after"; computed row box and style)\n' + log.join('\n') + '\n');
})();
