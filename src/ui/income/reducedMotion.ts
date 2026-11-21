// prefers-reduced-motion, live, for the mode's walkthrough and Same storm. (Not ../hooks'
// useMediaQuery: that module pulls in the app store, which the server-rendered tests can't load.)

import { useSyncExternalStore } from 'react'

const REDUCED = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(REDUCED)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  )
}
