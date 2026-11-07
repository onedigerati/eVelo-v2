// Writes a self-contained HTML contact sheet of cities' photos for checking them by eye.
// Usage: npm run photos:sheet -- <cityId ...> <out.html> [--embed]
//   Images are referenced by paths relative to out.html; --embed inlines them as data URIs so the
//   file can be moved anywhere (about 1.3x the photos' size).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const PHOTOS = join(REPO, 'src', 'data', 'photos')

const args = process.argv.slice(2)
const embed = args.includes('--embed')
const rest = args.filter((a) => a !== '--embed')
const out = rest.pop()
const ids = rest
if (!out || !out.endsWith('.html') || !ids.length) {
  console.error('usage: npm run photos:sheet -- <cityId ...> <out.html> [--embed]')
  process.exit(1)
}

// City names from src/data/cities.ts rows: mk(XX, 'id', 'Name', …)
const names = {}
const citiesTs = readFileSync(join(REPO, 'src', 'data', 'cities.ts'), 'utf8')
for (const m of citiesTs.matchAll(/mk\(\w+,\s*'([^']+)',\s*'((?:[^'\\]|\\.)*)'/g)) names[m[1]] = m[2].replace(/\\'/g, "'")

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const outAbs = resolve(out)
mkdirSync(dirname(outAbs), { recursive: true })

let total = 0
const sections = ids.map((id) => {
  const jsonPath = join(PHOTOS, id, 'photos.json')
  if (!existsSync(jsonPath)) throw new Error(`${id}: no photos.json`)
  const list = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const cards = list.map((p, i) => {
    const file = join(PHOTOS, id, p.file ?? `${i + 1}.webp`)
    if (!existsSync(file)) throw new Error(`${id}: ${file} missing (run npm run photos ${id})`)
    const src = embed
      ? `data:image/webp;base64,${readFileSync(file).toString('base64')}`
      : relative(dirname(outAbs), file).split('\\').join('/')
    total++
    return `<figure class="${i === 0 ? 'lead' : ''}">
  <img src="${esc(src)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy">
  <figcaption>
    <b>${i + 1}. ${esc(p.caption)}</b>
    <span class="alt">Alt: ${esc(p.alt)}</span>
    <span class="credit">${esc(p.author)} · <a href="${esc(p.licenseUrl)}">${esc(p.license)}</a> · <a href="${esc(p.source)}">Commons</a> · ${p.width}×${p.height}${p.focus ? ` · focus ${esc(p.focus)}` : ''}</span>
  </figcaption>
</figure>`
  })
  return `<section>
<h2>${esc(names[id] ?? id)} <small>${esc(id)}</small></h2>
<div class="grid">
${cards.join('\n')}
</div>
</section>`
})

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Photo contact sheet</title>
<style>
  :root { color-scheme: light; --ink: #1b1b1b; --muted: #5b5b5b; --line: #ddd; --bg: #fafaf7; }
  body { margin: 0; padding: 24px; background: var(--bg); color: var(--ink); font: 14px/1.4 system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: var(--muted); margin: 0 0 24px; }
  section { margin: 0 0 40px; }
  h2 { font-size: 18px; margin: 0 0 12px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  h2 small { color: var(--muted); font-weight: 400; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
  figure { margin: 0; background: #fff; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
  figure.lead { outline: 2px solid #c58b00; }
  img { display: block; width: 100%; height: 220px; object-fit: cover; background: #eee; }
  figcaption { padding: 8px 10px 10px; display: grid; gap: 4px; }
  .alt, .credit { color: var(--muted); font-size: 12px; }
  a { color: inherit; }
</style>
</head>
<body>
<h1>Photo contact sheet</h1>
<p class="meta">${total} photos · ${ids.length} ${ids.length === 1 ? 'city' : 'cities'} · photo 1 (outlined) is the mosaic's large photo · generated ${new Date().toISOString().slice(0, 10)}</p>
${sections.join('\n')}
</body>
</html>
`
writeFileSync(outAbs, html)
console.log(`wrote ${relative(process.cwd(), outAbs)}: ${total} photos, ${ids.length} cities${embed ? ' (embedded)' : ''}`)
