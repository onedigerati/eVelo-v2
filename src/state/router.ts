// Hash routing: #/ (outlook), #/plan, #/atlas, #/method, #/styleguide.
// `#/plan` and `#/` render the same two-column layout on desktop; on phones they are
// separate tabs. A `?p=` query on the hash carries a shared plan (see share.ts).

export type Route = 'outlook' | 'plan' | 'atlas' | 'method' | 'styleguide'

export const NAV_ROUTES: { route: Route; label: string; href: string }[] = [
  { route: 'plan', label: 'Plan', href: '#/plan' },
  { route: 'outlook', label: 'Outlook', href: '#/' },
  { route: 'atlas', label: 'Atlas', href: '#/atlas' },
  { route: 'method', label: 'Method', href: '#/method' },
]

export function parseHash(hash: string): { route: Route; params: URLSearchParams } {
  const h = hash.replace(/^#/, '')
  const [path, query = ''] = h.split('?')
  const seg = path.replace(/^\/+|\/+$/g, '').toLowerCase()
  const route: Route =
    seg === 'plan' || seg === 'atlas' || seg === 'method' || seg === 'styleguide' ? seg : 'outlook'
  return { route, params: new URLSearchParams(query) }
}

export function hrefFor(route: Route): string {
  return route === 'outlook' ? '#/' : `#/${route}`
}

export function navigate(route: Route) {
  const target = hrefFor(route)
  if (window.location.hash !== target) window.location.hash = target
}
