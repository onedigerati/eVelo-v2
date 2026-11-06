import { AnimatePresence, motion } from 'framer-motion'
import { useStore, type ThemePref } from '../../state/store'
import { IconMoon, IconSun, IconSystem } from '../icons'
import { SegmentedControl } from '../primitives'

const LABEL: Record<ThemePref, string> = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' }
const ICON = { system: IconSystem, light: IconSun, dark: IconMoon }
const ORDER: ThemePref[] = ['system', 'light', 'dark']

/** Three-way segmented toggle (desktop/tablet). */
export function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  return (
    <SegmentedControl<ThemePref>
      size="sm"
      aria-label="Color theme"
      value={theme}
      onChange={setTheme}
      options={ORDER.map((t) => {
        const I = ICON[t]
        return { value: t, label: <I size={16} />, ariaLabel: LABEL[t], title: LABEL[t] }
      })}
    />
  )
}

/** Single button that cycles system → light → dark (phone). */
export function ThemeCycleButton() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
  const I = ICON[theme]
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={`${LABEL[theme]} — switch to ${LABEL[next].toLowerCase()}`}
      title={LABEL[theme]}
      onClick={() => setTheme(next)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{ display: 'grid' }}
        >
          <I size={20} />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
