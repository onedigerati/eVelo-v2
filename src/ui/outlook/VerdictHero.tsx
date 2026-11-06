import { motion } from 'framer-motion'
import { PLACEHOLDER_SUCCESS, selectSuccess, useStore } from '../../state/store'
import { percent } from '../format'
import { rise, stagger } from '../motion'
import { AnimatedNumber, Badge, Stat, cx } from '../primitives'
import { toneFor } from '../verdict'

/** Placeholder split used until the engine reports bruised/broken rates. */
function useOutcomeSplit() {
  const result = useStore((s) => s.result)
  const success = useStore(selectSuccess)
  if (result) return { holds: result.successRate, bruised: result.bruisedRate, broken: result.brokenRate, dots: result.outcomeDots }
  const bruised = 0.09
  const broken = 1 - PLACEHOLDER_SUCCESS - bruised
  const n = Math.round(success * 100)
  const nb = Math.round(bruised * 100)
  const dots = Array.from({ length: 100 }, (_, i) => (i < n ? 0 : i < n + nb ? 1 : 2)) as (0 | 1 | 2)[]
  return { holds: success, bruised, broken, dots }
}

export function VerdictHero() {
  const age = useStore((s) => s.inputs.age)
  const horizon = useStore((s) => s.inputs.horizonYears)
  const hasResult = useStore((s) => s.result !== null)
  const split = useOutcomeSplit()
  const tone = toneFor(split.holds)
  const lowOdds = split.holds < 0.6

  return (
    <motion.section className={cx('verdict', `verdict--${tone}`)} variants={stagger(0.08, 0.05)} initial="hidden" animate="show" aria-labelledby="verdict-h">
      <motion.div className="verdict__meta" variants={rise}>
        <span className="t-eyebrow">
          The verdict · {horizon} years, age {age} → {age + horizon}
        </span>
        {!hasResult && <Badge tone="neutral">Illustrative</Badge>}
      </motion.div>

      <h1 id="verdict-h" className="verdict__headline">
        <motion.span className="verdict__lead t-display" variants={rise}>
          Your plan <em>holds</em> in{lowOdds ? ' only' : ''}
        </motion.span>
        <motion.span className="verdict__number t-hero" variants={rise}>
          <AnimatedNumber value={split.holds} from={0} format={(v) => String(Math.round(v * 100))} duration={1.4} delay={0.25} aria-label={percent(split.holds)} />
          <span className="verdict__pct" aria-hidden="true">%</span>
        </motion.span>
        <motion.span className="verdict__tail t-display" variants={rise}>
          of <em>futures.</em>
        </motion.span>
      </h1>

      <motion.p className="t-lede verdict__lede" variants={rise}>
        In {Math.round(split.holds * 100)} of every 100 simulated markets you never face a forced sale and stay solvent to age{' '}
        {age + horizon}. Borrowing covers your lifestyle; the portfolio is never sold.
      </motion.p>

      <motion.div className="verdict__dots" variants={rise} role="img" aria-label={`${Math.round(split.holds * 100)} of 100 futures hold, ${Math.round(split.bruised * 100)} survive a margin call, ${Math.round(split.broken * 100)} break.`}>
        {split.dots.map((d, i) => (
          <motion.i
            key={i}
            className={cx('dot', d === 0 ? 'dot--holds' : d === 1 ? 'dot--bruised' : 'dot--broken')}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.008, type: 'spring', stiffness: 500, damping: 24 }}
          />
        ))}
      </motion.div>

      <motion.div className="verdict__stats" variants={rise}>
        <Stat label="Holds" tone="holds" value={split.holds} format="percent" hint="No forced sale" size="sm" />
        <Stat label="Bruised" tone="bruised" value={split.bruised} format="percent" hint="Margin call, survived" size="sm" />
        <Stat label="Broken" tone="broken" value={split.broken} format="percent" hint="Ran out" size="sm" />
      </motion.div>
    </motion.section>
  )
}
