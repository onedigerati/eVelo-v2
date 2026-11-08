// Usage: node docs/evidence/stage-4/scripts/check-photos.mjs <ids...>
import fs from 'node:fs'
const ids = process.argv.slice(2)
const F = ['commons','file','caption','alt','author','license','licenseUrl','source','width','height']
const root = 'src/data/photos'
let bad = 0; const seen = new Map()
for (const d of fs.readdirSync(root)) {
  const p = `${root}/${d}/photos.json`; if (!fs.existsSync(p)) continue
  for (const e of JSON.parse(fs.readFileSync(p,'utf8'))) { const k = e.commons.replace(/_/g,' ').toLowerCase(); seen.set(k, [...(seen.get(k)||[]), d]) }
}
for (const id of ids) {
  const dir = `${root}/${id}`; const errs = []
  const webps = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.webp')) : []
  if (webps.length !== 5) errs.push(`${webps.length} webp`)
  const sizes = webps.map(f => fs.statSync(`${dir}/${f}`).size)
  for (const [i,s] of sizes.entries()) if (s > 200000) errs.push(`${webps[i]} ${s} B`)
  let j = []; try { j = JSON.parse(fs.readFileSync(`${dir}/photos.json`,'utf8')) } catch { errs.push('no photos.json') }
  if (j.length !== 5) errs.push(`${j.length} entries`)
  for (const e of j) {
    for (const f of F) if (e[f] === undefined || e[f] === null || String(e[f]).trim() === '') errs.push(`${e.file}: missing ${f}`)
    if (!webps.includes(e.file)) errs.push(`${e.file} listed but absent`)
    if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(e.source)) errs.push(`${e.file}: source ${e.source}`)
    if (!/^https:\/\//.test(e.licenseUrl)) errs.push(`${e.file}: licenseUrl ${e.licenseUrl}`)
  }
  if (errs.length) bad++
  console.log(`${errs.length ? 'FAIL' : 'ok  '} ${id.padEnd(22)} webp=${webps.length} json=${j.length} max=${Math.max(...sizes)} B ${errs.join('; ')}`)
}
const dups = [...seen].filter(([,v]) => v.length > 1)
console.log(`\nCommons files across all cities: ${seen.size}, used more than once: ${dups.length}`, dups)
console.log(`${ids.length} cities checked, ${bad} failing`)
process.exit(bad || dups.length ? 1 : 0)
