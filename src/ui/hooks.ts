import { useEffect, useSyncExternalStore } from 'react'
import { useStore, type ThemePref } from '../state/store'
import { parseHash } from '../state/router'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export type Breakpoint = 'phone' | 'tablet' | 'desktop'
/** phone < 700 <= tablet < 1100 <= desktop. Mirrors the CSS breakpoints. */
export function useBreakpoint(): Breakpoint {
  const desktop = useMediaQuery('(min-width: 1100px)')
  const tablet = useMediaQuery('(min-width: 700px)')
  return desktop ? 'desktop' : tablet ? 'tablet' : 'phone'
}

const THEME_COLORS = { light: '#F5F2EA', dark: '#0A0D0C' }

/** Resolved theme ('light' | 'dark') given the preference and the OS setting. */
export function useResolvedTheme(): 'light' | 'dark' {
  const pref = useStore((s) => s.theme)
  const sysDark = useMediaQuery('(prefers-color-scheme: dark)')
  return pref === 'system' ? (sysDark ? 'dark' : 'light') : pref
}

/** Applies the theme preference to <html data-theme> and the browser chrome color. */
export function useThemeEffect() {
  const pref = useStore((s) => s.theme)
  const resolved = useResolvedTheme()
  useEffect(() => {
    applyTheme(pref)
  }, [pref])
  useEffect(() => {
    // With an explicit theme, force both theme-color metas to that color.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      const scheme = m.media.includes('dark') ? 'dark' : 'light'
      m.content = pref === 'system' ? THEME_COLORS[scheme] : THEME_COLORS[resolved]
    })
  }, [pref, resolved])
}

export function applyTheme(pref: ThemePref) {
  const root = document.documentElement
  root.classList.add('theme-switching')
  root.dataset.theme = pref
  // Let the color transition happen once, then drop the class.
  window.setTimeout(() => root.classList.remove('theme-switching'), 400)
}

/** Keeps store.route in sync with location.hash. */
export function useHashRoute() {
  const setRoute = useStore((s) => s.setRoute)
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash).route)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [setRoute])
}

/** Locks body scroll while `active` (for sheets/drawers). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [active])
}
