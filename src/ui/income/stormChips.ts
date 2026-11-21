// Same storm's chip selection, pure (SameStorm.tsx): which chip is selected for the futures shown,
// and where the arrow keys, Home and End move it. No React.

import type { StormFuture } from './sameStorm'

/** The chip picked by the reader, remembered with the list of futures it was picked on. */
export type StormPick = { on: readonly StormFuture[]; key: string } | null

/** The chip selected by default: the one holding the typical future, else the first. */
export const defaultFuture = (futures: readonly StormFuture[]) => Math.max(0, futures.findIndex((f) => f.keys.includes('typical')))

/** The selected chip: the reader's pick while the futures are the list it was made on (new results
 *  go back to the default), else the default. */
export function selectedChip(futures: readonly StormFuture[], picked: StormPick): number {
  const found = picked !== null && picked.on === futures ? futures.findIndex((f) => f.keys[0] === picked.key) : -1
  return found >= 0 ? found : defaultFuture(futures)
}

/** The chip a key moves to from chip `i` of `n` (arrows wrap; Home, End), or null for other keys. */
export function chipForKey(key: string, i: number, n: number): number | null {
  if (n <= 0) return null
  if (key === 'ArrowRight') return (i + 1) % n
  if (key === 'ArrowLeft') return (i + n - 1) % n
  if (key === 'Home') return 0
  if (key === 'End') return n - 1
  return null
}
