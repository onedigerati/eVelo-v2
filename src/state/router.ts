// Hash routing. Canonical form is the plain hash: #plan, #atlas, #method, #styleguide and
// #outlook (or no hash). The older slash form (#/atlas, #/) is still read. Plain hashes are what
// iframe preview hosts pass through, so navigation always writes them.
// `#/plan` and `#outlook` render the same two-column layout on desktop; on phones they are
// separate tabs. A shared plan rides in the hash as `p=` (see share.ts): `#p=…`, `#plan?p=…`
// and the legacy `#/?p=…` all work.

export type Route = 'outlook' | 'plan' | 'atlas' | 'method' | 'styleguide'

const ROUTES: readonly Route[] = ['outlook', 'plan', 'atlas', 'method', 'styleguide']

export const NAV_ROUTES: { route: Route; label: string; href: string }[] = [
  { route: 'plan', label: 'Plan', href: '#plan' },
  { route: 'outlook', label: 'Outlook', href: '#outlook' },
  { route: 'atlas', label: 'Atlas', href: '#atlas' },
  { route: 'method', label: 'Method', href: '#method' },
]

export function parseHash(hash: string): { route: Route; params: URLSearchParams } {
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
  const route: Route = (ROUTES as readonly string[]).includes(seg) ? (seg as Route) : 'outlook'
  return { route, params: new URLSearchParams(query) }
}

export function hrefFor(route: Route): string {
  return `#${route}`
}

export function navigate(route: Route) {
  const target = hrefFor(route)
  if (window.location.hash !== target) window.location.hash = target
}
