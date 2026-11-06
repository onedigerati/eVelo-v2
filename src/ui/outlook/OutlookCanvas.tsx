import { motion } from 'framer-motion'
import { useStore } from '../../state/store'
import { stagger } from '../motion'
import { Badge, Button } from '../primitives'
import { IconPlan } from '../icons'
import { ChartFrame } from './ChartFrame'
import { PlaceholderFan } from './PlaceholderFan'
import { VerdictHero } from './VerdictHero'
import './outlook.css'

/** Right-hand canvas: the verdict, then chart cards. Stage 4 fills the frames. */
export function OutlookCanvas({ onEditPlan }: { onEditPlan?: () => void }) {
  const horizon = useStore((s) => s.inputs.horizonYears)
  return (
    <div className="outlook">
      <VerdictHero />
      {onEditPlan && (
        <div className="outlook__edit">
          <Button variant="secondary" icon={<IconPlan size={16} />} onClick={onEditPlan}>
            Adjust the plan
          </Button>
        </div>
      )}
      <motion.div className="outlook__grid" variants={stagger(0.07, 0.35)} initial="hidden" animate="show">
        <ChartFrame
          span="full"
          eyebrow="Net worth · today’s dollars"
          title={
            <>
              The range of <em>futures</em>
            </>
          }
          subtitle="Median path with the middle half and 90% of outcomes shaded."
          actions={<Badge tone="holds" dot>Median</Badge>}
          aspect="16 / 6.5"
        >
          <PlaceholderFan years={horizon} className="outlook__fan" />
        </ChartFrame>
        <ChartFrame eyebrow="Loan-to-value" title="How close to the line" aspect="4 / 3" />
        <ChartFrame eyebrow="Margin calls" title="When the risk arrives" aspect="4 / 3" />
        <ChartFrame eyebrow="Estate" title={<>Borrow <em>vs.</em> sell</>} aspect="4 / 3" />
        <ChartFrame eyebrow="Safe spending" title="What you could spend" aspect="4 / 3" />
      </motion.div>
    </div>
  )
}
