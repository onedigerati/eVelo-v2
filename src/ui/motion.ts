// Shared motion presets. <MotionConfig reducedMotion="user"> at the app root turns
// transform/layout animations off for users who prefer reduced motion.
import type { Transition, Variants } from 'framer-motion'

export const ease = [0.16, 1, 0.3, 1] as const

export const spring: Transition = { type: 'spring', stiffness: 520, damping: 38, mass: 0.9 }
export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 30 }
export const springBouncy: Transition = { type: 'spring', stiffness: 600, damping: 26 }

/** Parent: staggers children that use `rise`. */
export const stagger = (gap = 0.06, delay = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Child: fade + rise 14px. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
}
