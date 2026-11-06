import { motion } from 'framer-motion'
import { useStore } from '../../state/store'
import { IconPlan } from '../icons'
import { stagger } from '../motion'
import { Button, cx } from '../primitives'
import { CostBody, EstateBody, LensBody, SafeSpendBody, cityName, costCaption, estateCaption, lensCaption, safeSpendCaption } from './cards'
import { ChartFrame } from './ChartFrame'
import { FanCard } from './FanCard'
import { MarginCallChart, marginCallCaption } from './MarginCallChart'
import { VerdictHero } from './VerdictHero'
import './outlook.css'

/** Right-hand canvas: the verdict, then the detail cards (summary before detail). */
export function OutlookCanvas({ onEditPlan }: { onEditPlan?: () => void }) {
  const result = useStore((s) => s.result)
  const solve = useStore((s) => s.solve)
  const solving = useStore((s) => s.solving)
  const running = useStore((s) => s.status === 'running')
  const hasDest = !!result?.inputs.destCityId

  return (
    <div className={cx('outlook', running && 'is-running')}>
      <VerdictHero />
      {onEditPlan && (
        <div className="outlook__edit">
          <Button variant="secondary" icon={<IconPlan size={16} />} onClick={onEditPlan}>
            Adjust the plan
          </Button>
        </div>
      )}
      <motion.div className="outlook__grid" variants={stagger(0.07, 0.35)} initial="hidden" animate="show">
        <FanCard />

        <ChartFrame
          eyebrow="Margin calls · first forced sale"
          title={
            <>
              When the risk <em>arrives</em>
            </>
          }
          subtitle={result ? marginCallCaption(result) : 'The chance your first forced sale lands in each year.'}
          aspect="4 / 2.6"
        >
          {result && <MarginCallChart result={result} />}
        </ChartFrame>

        <ChartFrame
          eyebrow="Safe spending · 90% confidence"
          title={
            <>
              What you could <em>spend</em>
            </>
          }
          subtitle={result && solve ? safeSpendCaption(result, solve) : 'The most you can spend while 9 in 10 futures still hold.'}
          aspect="4 / 2.6"
          stale={solving}
        >
          {result && <SafeSpendBody result={result} solve={solve} solving={solving} />}
        </ChartFrame>

        <ChartFrame
          eyebrow="Estate · today’s dollars"
          title={
            <>
              Borrow <em>vs.</em> sell
            </>
          }
          subtitle={result ? estateCaption(result) : 'What your heirs receive under each strategy.'}
          aspect="4 / 2.6"
        >
          {result && <EstateBody result={result} />}
        </ChartFrame>

        <ChartFrame
          eyebrow="Portfolio lens"
          title={
            <>
              What you <em>own</em>
            </>
          }
          subtitle={result ? lensCaption(result) : 'How your holdings behave together.'}
          aspect="4 / 2.6"
        >
          {result && <LensBody result={result} />}
        </ChartFrame>

        {hasDest && result && (
          <ChartFrame
            span="full"
            eyebrow={`Cost of living · ${cityName(result.inputs.homeCityId)} vs ${cityName(result.inputs.destCityId)}`}
            title={
              <>
                The same life, <em>abroad</em>
              </>
            }
            subtitle={costCaption(result, result.inputs.budget)}
          >
            <CostBody result={result} />
          </ChartFrame>
        )}
      </motion.div>
    </div>
  )
}
