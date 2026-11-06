import { motion } from 'framer-motion'
import { useStore } from '../../state/store'
import { IconReset } from '../icons'
import { rise, stagger } from '../motion'
import { toast } from '../primitives'
import { BorrowingSection } from './BorrowingSection'
import { LifeSection } from './LifeSection'
import { ModelSection } from './ModelSection'
import { PlaceSection } from './PlaceSection'
import { PortfolioSection } from './PortfolioSection'
import { useSyncPlanUi } from './planUi'
import { TickerPalette, usePaletteShortcut } from './TickerPalette'
import './plan.css'

/** The Plan: every input, as collapsible sections. Used in the desktop rail, the tablet drawer and the phone Plan tab. */
export function PlanRail({ showHeader = true }: { showHeader?: boolean }) {
  const reset = useStore((s) => s.resetInputs)
  useSyncPlanUi()
  usePaletteShortcut()
  return (
    <motion.div className="plan" variants={stagger(0.05, 0.05)} initial="hidden" animate="show">
      {showHeader && (
        <motion.header className="plan__header" variants={rise}>
          <div>
            <div className="t-eyebrow">The plan</div>
            <h1 className="t-h1 plan__title">
              Your <em>terms</em>
            </h1>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Reset plan to defaults"
            title="Reset to defaults"
            onClick={() => {
              reset()
              toast('Plan reset to defaults')
            }}
          >
            <IconReset size={18} />
          </button>
        </motion.header>
      )}
      <motion.div variants={rise}>
        <PortfolioSection />
      </motion.div>
      <motion.div variants={rise}>
        <LifeSection />
      </motion.div>
      <motion.div variants={rise}>
        <PlaceSection />
      </motion.div>
      <motion.div variants={rise}>
        <BorrowingSection />
      </motion.div>
      <motion.div variants={rise}>
        <ModelSection />
      </motion.div>
      <TickerPalette />
    </motion.div>
  )
}
