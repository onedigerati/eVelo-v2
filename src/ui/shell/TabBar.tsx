import { motion } from 'framer-motion'
import { NAV_ROUTES, type Route } from '../../state/router'
import { useStore } from '../../state/store'
import { IconAtlas, IconMethod, IconOutlook, IconPlan } from '../icons'
import { springBouncy } from '../motion'
import { cx } from '../primitives'

const ICONS: Record<string, typeof IconPlan> = { plan: IconPlan, outlook: IconOutlook, atlas: IconAtlas, method: IconMethod }

/** Phone-only bottom tab bar (iOS-style blurred glass, safe-area aware). */
export function TabBar() {
  const route = useStore((s) => s.route)
  return (
    <nav className="tabbar" aria-label="Primary">
      {NAV_ROUTES.map((n) => {
        const on = route === n.route
        const I = ICONS[n.route as Route]
        return (
          <a key={n.route} href={n.href} className={cx('tabbar__tab', on && 'is-active')} aria-current={on ? 'page' : undefined}>
            <span className="tabbar__icon">
              {on && <motion.span layoutId="tabbar-pill" className="tabbar__pill" transition={springBouncy} />}
              <motion.span animate={{ scale: on ? 1.06 : 1, y: on ? -1 : 0 }} transition={springBouncy} style={{ display: 'grid' }}>
                <I size={22} />
              </motion.span>
            </span>
            <span className="tabbar__label">{n.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
