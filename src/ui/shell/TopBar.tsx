import { m as motion } from 'framer-motion'
import { hrefFor, topNav } from '../../state/router'
import { useStore } from '../../state/store'
import type { Breakpoint } from '../hooks'
import { Mark } from '../icons'
import { spring } from '../motion'
import { cx } from '../primitives'
import { ShareButton } from './ShareButton'
import { ThemeCycleButton, ThemeToggle } from './ThemeToggle'

/** The logo + name; links to the landing page (`#home`). */
export function Wordmark() {
  return (
    <a href={hrefFor('home')} className="wordmark" aria-label="eVelo — home">
      <Mark size={28} />
      <span className="wordmark__text">eVelo</span>
    </a>
  )
}

export function TopBar({ bp }: { bp: Breakpoint }) {
  const route = useStore((s) => s.route)
  const phone = bp === 'phone'
  const { items, active } = topNav(route, bp === 'desktop')
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Wordmark />
        {!phone && (
          <nav className="topnav" aria-label="Primary">
            {items.map((n) => {
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
