import { m as motion } from 'framer-motion'

/** Progress ring for the verdict pills (phone Plan tab and the docked desktop/tablet pill). */
export function PillRing({ success }: { success: number }) {
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <svg className="verdict-pill__ring" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r={r} fill="none" stroke="var(--hairline-strong)" strokeWidth="2.5" />
      <motion.circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - success) }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        transform="rotate(-90 12 12)"
      />
    </svg>
  )
}
