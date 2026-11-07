// "Has entered the app" flag: once set, the bare URL opens the planner instead of the landing.
// Storage can be blocked (private mode, sandboxed iframes) — then the flag reads as unset and the
// bare URL keeps showing the landing; route hashes and share links still go straight to the app.

const LS_KEY = 'evelo:v2:entered'
/** The saved plan's key (store.ts). A visitor who has one used the app before this flag existed. */
const PLAN_KEY = 'evelo:v2'

let cached: boolean | null = null

export function readEntered(): boolean {
  if (cached !== null) return cached
  try {
    const ls = window.localStorage
    const flag = ls.getItem(LS_KEY)
    if (flag !== null) cached = flag === '1'
    else {
      // First read on this device: a plan saved before the flag existed counts as having entered.
      // Recorded straight away, so a plan saved later from the landing (theme toggle) can't count.
      cached = ls.getItem(PLAN_KEY) !== null
      ls.setItem(LS_KEY, cached ? '1' : '0')
    }
  } catch {
    cached = false
  }
  return cached
}

export function markEntered() {
  if (cached === true) return
  cached = true
  try {
    window.localStorage.setItem(LS_KEY, '1')
  } catch {
    /* storage blocked — the flag lasts for this page load only */
  }
}
