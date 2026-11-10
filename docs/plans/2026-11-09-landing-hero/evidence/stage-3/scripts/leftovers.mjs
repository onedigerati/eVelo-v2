// Leftover search for stage 3: old map-card names, unused landing exports, dead CSS selectors and tokens.
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
const ROOT = '/home/jonah/repos/eVelo-v2'
const out = []
const log = (s) => { out.push(s); console.log(s) }
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const SRC = walk(`${ROOT}/src`).filter((f) => /\.(tsx?|css|html|mjs|js)$/.test(f))
const ALL = [...SRC, ...walk(`${ROOT}/scripts`).filter((f) => /\.(mjs|js|ts)$/.test(f)), `${ROOT}/index.html`].filter((f) => fs.existsSync(f))
const text = Object.fromEntries(ALL.map((f) => [f, fs.readFileSync(f, 'utf8')]))
const rel = (f) => path.relative(ROOT, f)

// 1. Old map-card names
log('== 1. Old map-card names in src/, scripts/ and index.html')
const OLD = ['atlasCard', 'MAP_VIEWBOX', 'projectX', 'projectY', 'MAP_LABELS', 'PHONE_LABEL', 'MERIDIANS', 'PARALLELS', 'HIGHLIGHT', 'LISBON', 'AUSTIN', 'MapCity', 'MapLabel', 'FAN_W', 'FAN_H', 'fanMedian', 'fanQuantile', 'fanLoan', 'fanMargin', 'fanLine', 'fanBand', 'landing__card', 'landing__map', 'landing__fan', 'landing__city', 'landing__pin', 'landing__label', 'landing__odds', 'landing__legend', 'landing__meridian', 'landing__grat', 'mapCard', 'MapCard', 'AtlasCard']
for (const n of OLD) {
  const hits = Object.entries(text).filter(([, t]) => t.includes(n)).map(([f]) => rel(f))
  log(`  ${n.padEnd(16)} ${hits.length ? 'FOUND in ' + hits.join(', ') : 'none'}`)
}

// 2. Unused exports in src/ui/landing
log('\n== 2. Exports in src/ui/landing (non-test files) and where else they are used')
const LAND = SRC.filter((f) => f.includes('/src/ui/landing/') && !f.includes('__tests__') && /\.tsx?$/.test(f))
const rows = []
for (const f of LAND) {
  const t = text[f]
  const re = /export\s+(?:const|function|interface|type|class|let)\s+([A-Za-z0-9_]+)/g
  let m
  while ((m = re.exec(t))) {
    const name = m[1]
    const mod = path.basename(f).replace(/\.tsx?$/, '')
    const imp = new RegExp(`import\\s*(?:type\\s*)?\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"][^'"]*/${mod}['"]`)
    const users = Object.entries(text).filter(([g, s]) => g !== f && imp.test(s)).map(([g]) => rel(g))
    const prod = users.filter((u) => !u.includes('__tests__'))
    rows.push({ file: rel(f), name, prod, tests: users.filter((u) => u.includes('__tests__')) })
  }
}
for (const r of rows) log(`  ${r.file}: ${r.name} -> ${r.prod.length ? 'used by ' + r.prod.map((p) => path.basename(p)).join(', ') : r.tests.length ? 'TEST ONLY (' + r.tests.map((p) => path.basename(p)).join(', ') + ')' : 'UNUSED'}`)
const unused = rows.filter((r) => !r.prod.length && !r.tests.length)
const testOnly = rows.filter((r) => !r.prod.length && r.tests.length)
log(`  -> ${rows.length} exports: ${unused.length} unused anywhere, ${testOnly.length} used only by tests`)

// 3. Dead CSS selectors in landing.css and storyCard.css
log('\n== 3. Class selectors in landing.css and storyCard.css not referenced from any .tsx/.ts')
const TSX = Object.entries(text).filter(([f]) => /\.tsx?$/.test(f) && !f.includes('__tests__')).map(([, t]) => t).join('\n')
for (const css of ['landing.css', 'storyCard.css']) {
  const t = text[`${ROOT}/src/ui/landing/${css}`].replace(/\/\*[\s\S]*?\*\//g, '')
  const classes = [...new Set([...t.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))].filter((c) => !/^\d/.test(c))
  const dead = []
  for (const c of classes) {
    if (TSX.includes(c)) continue
    // template classes: story__svg--${L.id}, landing--${bp}, story__sw--x built from a prefix
    const prefix = c.replace(/--[\w-]+$/, '--')
    const dyn = prefix !== c && new RegExp(`${prefix.replace(/[-]/g, '\\-')}\\$\\{`).test(TSX)
    dead.push(dyn ? `${c} (built from \`${prefix}\${…}\`)` : c)
  }
  const real = dead.filter((d) => !d.includes('built from'))
  log(`  ${css}: ${classes.length} classes; not found literally: ${dead.length ? dead.join(', ') : 'none'}; dead: ${real.length ? real.join(', ') : 'none'}`)
}

// 4. Custom properties (tokens) defined in the two files
log('\n== 4. Custom properties defined in landing.css / storyCard.css and their uses across src/')
const CSSALL = Object.entries(text).filter(([f]) => /\.(css|tsx?)$/.test(f)).map(([, t]) => t).join('\n')
for (const css of ['landing.css', 'storyCard.css']) {
  const t = text[`${ROOT}/src/ui/landing/${css}`]
  const defs = [...new Set([...t.matchAll(/(?:^|[{;\s])(--[\w-]+)\s*:(?!hover|focus|active)/gm)].map((m) => m[1]))]
  for (const d of defs) {
    const uses = (CSSALL.match(new RegExp(`var\\(\\s*${d}\\b`, 'g')) || []).length
    log(`  ${css}: ${d} used ${uses}x${uses ? '' : '  <- UNUSED'}`)
  }
  if (!defs.length) log(`  ${css}: defines no custom properties`)
}
// tokens used in these files that are defined nowhere
log('\n== 5. var(--x) used in landing.css / storyCard.css but defined nowhere in src/')
for (const css of ['landing.css', 'storyCard.css']) {
  const t = text[`${ROOT}/src/ui/landing/${css}`]
  const used = [...new Set([...t.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))]
  const undef = used.filter((u) => !new RegExp(`${u}\\s*:`).test(CSSALL))
  log(`  ${css}: ${used.length} tokens used; undefined: ${undef.length ? undef.join(', ') : 'none'}`)
}
// 6. git grep across the repo for atlasCard outside docs
log('\n== 6. git grep -n atlasCard (whole tree, excluding docs/)')
try { log(execSync(`git -C ${ROOT} grep -n atlasCard -- . ':!docs'`, { encoding: 'utf8' })) } catch { log('  none') }
fs.writeFileSync(`${ROOT}/docs/evidence/stage-3/leftovers.txt`, '$ node leftovers.mjs (scripts/leftovers.mjs: name search; landing exports matched against import statements naming the module; CSS class and token uses)\n' + out.join('\n') + '\n')
