// Pixel diff of the open profile, stage 2 build vs main, at 1440 and 390 in both themes.
// usage (from the repo): node docs/evidence/stage-3/screenshot-diff.mjs
import sharp from 'sharp'
const dir = new URL('.', import.meta.url).pathname
for (const t of ['light', 'dark']) for (const w of [1440, 390]) {
  const load = (l) => sharp(`${dir}${l}-profile-${w}-${t}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const [a, b] = await Promise.all([load('baseline-803e875'), load('main-0a86f47')])
  let n = 0
  if (a.data.length === b.data.length) for (let i = 0; i < a.data.length; i += 3) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) n++
  console.log(`${t} ${w}: ${a.info.width}x${a.info.height} vs ${b.info.width}x${b.info.height}, differing pixels: ${a.data.length === b.data.length ? n : 'size differs'}`)
}
