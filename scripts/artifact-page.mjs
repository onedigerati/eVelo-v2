// Builds dist/artifact.html: the body-only page the claude.ai Artifact preview wraps in its own skeleton.
// Usage: npm run build && node scripts/artifact-page.mjs  → prints the files map as JSON.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const html = readFileSync('dist/index.html', 'utf8')
const js = html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1]
const css = html.match(/href="\.\/(assets\/[^"]+\.css)"/)[1]
const page = `<title>eVelo</title>
<meta name="description" content="Stress-test a Buy-Borrow-Die retirement across thousands of market futures, at home or abroad.">
<script>try{var t=JSON.parse(localStorage.getItem('evelo:v2')||'{}').theme;if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="${css}">
<div id="root"></div>
<script type="module" src="${js}"></script>
`
writeFileSync('dist/artifact.html', page)
const files = Object.fromEntries(readdirSync('dist/assets').map((f) => [`assets/${f}`, `dist/assets/${f}`]))
writeFileSync('dist/artifact-files.json', JSON.stringify(files, null, 1))
console.log(Object.keys(files).length, 'files')
