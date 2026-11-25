// Order statistics by selection instead of a full sort, shared by the engines.

/** In place, move the k-th smallest of `a` to a[k], smaller to its left, larger to its right (Hoare
 *  quickselect, median-of-three pivot). */
export function select(a: Float64Array, k: number): void {
  let lo = 0, hi = a.length - 1
  while (hi > lo) {
    const mid = (lo + hi) >> 1
    // Order a[lo] <= a[mid] <= a[hi], then partition around a[mid].
    if (a[mid] < a[lo]) swap(a, mid, lo)
    if (a[hi] < a[lo]) swap(a, hi, lo)
    if (a[hi] < a[mid]) swap(a, hi, mid)
    const pivot = a[mid]
    let i = lo, j = hi
    while (i <= j) {
      while (a[i] < pivot) i++
      while (a[j] > pivot) j--
      if (i <= j) swap(a, i++, j--)
    }
    if (k <= j) hi = j
    else if (k >= i) lo = i
    else return
  }
}
function swap(a: Float64Array, i: number, j: number): void {
  const t = a[i]
  a[i] = a[j]
  a[j] = t
}

/** quantile(sorted a, 0.5), exactly, by selection instead of a full sort (reorders `a`). */
export function median50(a: Float64Array): number {
  const n = a.length
  if (!n) return 0
  const pos = (n - 1) * 0.5
  const lo = Math.floor(pos)
  const hi = Math.min(n - 1, lo + 1)
  select(a, lo)
  let b = a[lo]
  if (hi > lo) {
    b = a[hi]
    for (let i = hi + 1; i < n; i++) if (a[i] < b) b = a[i]
  }
  return a[lo] + (b - a[lo]) * (pos - lo)
}
