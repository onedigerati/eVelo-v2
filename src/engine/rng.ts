// Seeded PRNG: xoshiro128** seeded via splitmix32. Deterministic for a given seed.

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number
  /** Integer in [0, n). */
  int(n: number): number
  /** Standard normal (Box-Muller, cached pair). */
  normal(): number
}

function splitmix32(a: number): () => number {
  return () => {
    a = (a + 0x9e3779b9) | 0
    let z = a
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    return (z ^ (z >>> 16)) >>> 0
  }
}

export function createRng(seed: number): Rng {
  const sm = splitmix32(seed >>> 0)
  let s0 = sm(), s1 = sm(), s2 = sm(), s3 = sm()
  if ((s0 | s1 | s2 | s3) === 0) s0 = 1
  const u32 = (): number => {
    const r = Math.imul(rotl(Math.imul(s1, 5), 7), 9) >>> 0
    const t = s1 << 9
    s2 ^= s0
    s3 ^= s1
    s1 ^= s2
    s0 ^= s3
    s2 ^= t
    s3 = rotl(s3, 11)
    return r
  }
  let spare = 0
  let hasSpare = false
  const next = () => u32() / 4294967296
  return {
    next,
    int: (n) => Math.floor(next() * n),
    normal() {
      if (hasSpare) {
        hasSpare = false
        return spare
      }
      let u = 0
      while (u === 0) u = next()
      const v = next()
      const r = Math.sqrt(-2 * Math.log(u))
      spare = r * Math.sin(2 * Math.PI * v)
      hasSpare = true
      return r * Math.cos(2 * Math.PI * v)
    },
  }
}

function rotl(x: number, k: number): number {
  return (x << k) | (x >>> (32 - k))
}

/** FNV-1a string hash, for stable per-symbol seeds. */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
