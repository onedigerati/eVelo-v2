// Hash routing. Canonical form is the plain hash: #plan, #atlas, #method, #styleguide and
// #outlook (or no hash). The older slash form (#/atlas, #/) is still read. Plain hashes are what
// iframe preview hosts pass through, so navigation always writes them.
// `#/plan` and `#outlook` render the same two-column layout on desktop; on phones they are
// separate tabs. A shared plan rides in the hash as `p=` (see share.ts): `#p=…`, `#plan?p=…`
// and the legacy `#/?p=…` all work.
// `#home` is the landing page. The bare URL shows it until the visitor has entered the app once
// (see resolveRoute); after that the bare URL opens the planner.

export type Route = 'home' | 'outlook' | 'plan' | 'atlas' | 'method' | 'styleguide'

/** App routes (everything but the landing). */
const APP_ROUTES: readonly Route[] = ['outlook', 'plan', 'atlas', 'method', 'styleguide']
const ROUTES: readonly Route[] = ['home', ...APP_ROUTES]

export const NAV_ROUTES: { route: Route; label: string; href: string }[] = [
  { route: 'plan', label: 'Plan', href: '#plan' },
  { route: 'outlook', label: 'Outlook', href: '#outlook' },
  { route: 'atlas', label: 'Atlas', href: '#atlas' },
  { route: 'method', label: 'Method', href: '#method' },
]

export function parseHash(hash: string): { route: Route; params: URLSearchParams; known: boolean } {
  const h = hash.replace(/^#/, '')
  const q = h.indexOf('?')
  let path = q < 0 ? h : h.slice(0, q)
  let query = q < 0 ? '' : h.slice(q + 1)
  // `#p=…` (no route, payload only).
  if (q < 0 && path.includes('=')) {
    query = path
    path = ''
  }
  const seg = path.replace(/^\/+|\/+$/g, '').toLowerCase()
  const known = (ROUTES as readonly string[]).includes(seg)
  const route: Route = known ? (seg as Route) : 'outlook'
  return { route, params: new URLSearchParams(query), known }
}

/**
 * The first-visit rule. Given the hash and whether this browser has entered the app before:
 * - `#home` → the landing, always (the flag is left as it was);
 * - a known app route (`#plan`, `#atlas`, `#/atlas`, …) or a share link (`#p=…`, `#/?p=…`) → that
 *   route, and the visitor has now entered the app;
 * - anything else (no hash, `#/`, an unknown hash) → the planner once entered, else the landing.
 */
export function resolveRoute(hash: string, entered: boolean): { route: Route; entered: boolean } {
  const { route, params, known } = parseHash(hash)
  if (known && route === 'home') return { route, entered }
  if (known || params.has('p')) return { route, entered: true }
  return entered ? { route: 'plan', entered } : { route: 'home', entered }
}

export function hrefFor(route: Route): string {
  return `#${route}`
}

export function navigate(route: Route) {
  const target = hrefFor(route)
  if (window.location.hash !== target) window.location.hash = target
}
