// Recovery for a plan that can't be drawn: clear the stored plan, drop a share link from the URL,
// reload to the defaults. Saved portfolios (`evelo:v2:portfolios`) and other keys are kept.
import { parseHash } from './router'

/** The localStorage key the store keeps the plan (and theme) under — see store.ts. */
export const PLAN_KEY = 'evelo:v2'

export interface ResetDeps {
  /** Null when storage is unavailable. */
  storage: Pick<Storage, 'removeItem'> | null
  location: { pathname: string; search: string; hash: string }
  replaceUrl: (url: string) => void
  reload: () => void
}

/** The URL to land on after a reset: the same page, minus any `#p=` / `#/?p=` share payload. */
export function urlWithoutShare(loc: { pathname: string; search: string; hash: string }): string {
  const hasShare = loc.hash.length > 1 && parseHash(loc.hash).params.has('p')
  return `${loc.pathname}${loc.search}${hasShare ? '' : loc.hash}`
}

export function resetPlan(deps: ResetDeps): void {
  try {
    deps.storage?.removeItem(PLAN_KEY)
  } catch {
    /* storage blocked — the reload still drops the bad link */
  }
  try {
    deps.replaceUrl(urlWithoutShare(deps.location))
  } catch {
    /* history blocked — reload anyway */
  }
  deps.reload()
}

/** resetPlan against the real window. */
export function resetPlanInBrowser(): void {
  let storage: Storage | null = null
  try {
    storage = window.localStorage
  } catch {
    /* storage blocked */
  }
  resetPlan({
    storage,
    location: window.location,
    replaceUrl: (url) => window.history.replaceState(null, '', url),
    reload: () => window.location.reload(),
  })
}
