// Mean abs pixel diff and Laplacian-energy sharpness (lead half / small-tile half) of base vs stage2 screenshots.
import sharp from '/home/jonah/repos/eVelo-v2/node_modules/sharp/dist/index.cjs'
const dir = process.argv[2]
const lap = { width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0], offset: 128 }
async function gray(f, box) {
  let s = sharp(`${dir}/${f}`).grayscale()
  if (box) s = s.extract(box)
  return s
}
async function energy(f, box) {
  const { data } = await (await gray(f, box)).convolve(lap).raw().toBuffer({ resolveWithObject: true })
  let e = 0; for (const v of data) e += (v - 128) ** 2
  return e / data.length
}
for (const n of ['desktop-dpr1', 'desktop-dpr2', 'phone-dpr3']) {
  const A = `base-${n}.png`, B = `stage2-${n}.png`
  const m = await sharp(`${dir}/${A}`).metadata(), mb = await sharp(`${dir}/${B}`).metadata()
  const W = m.width, H = m.height
  if (W !== mb.width || H !== mb.height) { console.log(n, 'sizes differ'); continue }
  const a = await (await gray(A)).raw().toBuffer(), b = await (await gray(B)).raw().toBuffer()
  let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i])
  const parts = n.startsWith('phone') ? { whole: null } : { 'lead (left half)': { left: 0, top: 0, width: Math.floor(W / 2), height: H }, 'small tiles (right half)': { left: Math.floor(W / 2), top: 0, width: W - Math.floor(W / 2), height: H } }
  const out = []
  for (const [k, box] of Object.entries(parts)) out.push(`${k}: Laplacian energy base ${(await energy(A, box)).toFixed(1)} vs stage2 ${(await energy(B, box)).toFixed(1)}`)
  console.log(`${n} ${W}x${H}: mean abs gray diff ${(d / a.length).toFixed(2)}/255; ${out.join('; ')}`)
}
