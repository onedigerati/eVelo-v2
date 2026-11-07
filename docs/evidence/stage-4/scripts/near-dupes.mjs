// Usage: node docs/evidence/stage-4/scripts/near-dupes.mjs  — 64-bit difference hash of every photo; lists pairs within 10 bits.
import fs from 'node:fs'
import sharp from 'sharp'
const root = 'src/data/photos'
const hs = []
for (const d of fs.readdirSync(root)) for (const f of fs.readdirSync(`${root}/${d}`).filter((x) => x.endsWith('.webp'))) {
  const px = await sharp(`${root}/${d}/${f}`).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer()
  let h = 0n
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h = (h << 1n) | (px[y * 9 + x] > px[y * 9 + x + 1] ? 1n : 0n)
  hs.push([`${d}/${f}`, h])
}
const bits = (v) => { let n = 0; while (v) { n += Number(v & 1n); v >>= 1n } return n }
const pairs = []
for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) { const b = bits(hs[i][1] ^ hs[j][1]); if (b <= 10) pairs.push([b, hs[i][0], hs[j][0]]) }
pairs.sort((a, b) => a[0] - b[0])
console.log(`${hs.length} photos hashed; pairs within 10 of 64 bits: ${pairs.length}`)
for (const p of pairs) console.log(p.join('  '))
