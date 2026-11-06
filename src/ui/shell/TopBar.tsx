import { m as motion } from 'framer-motion'
import { NAV_ROUTES, type Route } from '../../state/router'
import { useStore } from '../../state/store'
import type { Breakpoint } from '../hooks'
import { Mark } from '../icons'
import { spring } from '../motion'
import { cx } from '../primitives'
import { ShareButton } from './ShareButton'
import { ThemeCycleButton, ThemeToggle } from './ThemeToggle'

export function Wordmark() {
  return (
    <a href="#outlook" className="wordmark" aria-label="eVelo — home">
      <Mark size={28} />
      <span className="wordmark__text">eVelo</span>
    </a>
  )
}

/** Which nav item is lit for a route. On desktop, plan + outlook share a screen. */
function activeFor(route: Route): Route | null {
  return route === 'styleguide' ? null : route
}

export function TopBar({ bp }: { bp: Breakpoint }) {
  const route = useStore((s) => s.route)
  const active = activeFor(route)
  const phone = bp === 'phone'
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Wordmark />
        {!phone && (
          <nav className="topnav" aria-label="Primary">
            {NAV_ROUTES.map((n) => {
              const on = active === n.route
              return (
                <a key={n.route} href={n.href} className={cx('topnav__link', on && 'is-active')} aria-current={on ? 'page' : undefined}>
                  {on && <motion.span layoutId="topnav-pill" className="topnav__pill" transition={spring} />}
                  <span className="topnav__label">{n.label}</span>
                </a>
              )
            })}
          </nav>
        )}
        <div className="topbar__actions">
          {phone ? <ThemeCycleButton /> : <ThemeToggle />}
          <ShareButton compact={phone} />
        </div>
      </div>
    </header>
  )
}
