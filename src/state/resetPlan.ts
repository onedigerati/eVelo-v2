// Recovery for a plan that can't be drawn: clear the stored plan, drop a share link from the URL,
// reload to the defaults. The theme (stored beside the plan), saved portfolios
// (`evelo:v2:portfolios`) and other keys are kept.
import { parsePersisted } from './persisted'
import { parseHash } from './router'

/** The localStorage key the store keeps the plan (and theme) under — see store.ts. */
export const PLAN_KEY = 'evelo:v2'

export interface ResetDeps {
  /** Null when storage is unavailable. */
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null
  location: { pathname: string; search: string; hash: string }
  replaceUrl: (url: string) => void
  reload: () => void
}

/** The URL to land on after a reset: the same page, minus any `#p=` / `#/?p=` share payload. */
export function urlWithoutShare(loc: { pathname: string; search: string; hash: string }): string {
  const hasShare = loc.hash.length > 1 && parseHash(loc.hash).params.has('p')
  return `${loc.pathname}${loc.search}${hasShare ? '' : loc.hash}`
}

/** Drops the stored plan but keeps the theme fields beside it; a value with no theme (or a
 *  corrupt one) is removed outright. */
export function clearStoredPlan(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): void {
  const saved = parsePersisted(storage.getItem(PLAN_KEY))
  const keep: Record<string, unknown> = {}
  if ('theme' in saved) keep.theme = saved.theme
  if ('themeV' in saved) keep.themeV = saved.themeV
  if (Object.keys(keep).length) storage.setItem(PLAN_KEY, JSON.stringify(keep))
  else storage.removeItem(PLAN_KEY)
}

export function resetPlan(deps: ResetDeps): void {
  try {
    if (deps.storage) clearStoredPlan(deps.storage)
  } catch {
    try {
      deps.storage?.removeItem(PLAN_KEY)
    } catch {
      /* storage blocked — the reload still drops the bad link */
    }
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
