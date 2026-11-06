import { AnimatePresence, m as motion } from 'framer-motion'
import { useId, useState } from 'react'
import type { ModelMethod, Outlook } from '../../engine/types'
import { useStore } from '../../state/store'
import { number } from '../format'
import { ease } from '../motion'
import { NumberField, Section, SegmentedControl, Slider } from '../primitives'

const METHOD: Record<ModelMethod, { label: string; desc: string }> = {
  bootstrap: { label: 'History replay', desc: 'Stitches together real stretches of market history, keeping crashes and recoveries intact.' },
  'fat-tail': { label: 'Fat tails', desc: 'Draws from a distribution with heavier-than-normal tails: rare, violent months happen more often.' },
}
const OUTLOOK: Record<Outlook, { label: string; desc: string }> = {
  historical: { label: 'Historical', desc: 'Each holding earns what it actually earned. Optimistic for recent winners.' },
  balanced: { label: 'Balanced', desc: 'Pulls hot streaks part-way toward a market-based expectation.' },
  conservative: { label: 'Conservative', desc: 'Leans hard on the market prior and trims returns. A stress-test.' },
}
const PATHS = [1000, 4000, 10000]

export function ModelSection() {
  const method = useStore((s) => s.inputs.method)
  const outlook = useStore((s) => s.inputs.outlook)
  const block = useStore((s) => s.inputs.blockMonths)
  const paths = useStore((s) => s.inputs.paths)
  const seed = useStore((s) => s.inputs.seed)
  const setInput = useStore((s) => s.setInput)
  const uid = useId()
  const [spin, setSpin] = useState(0)

  return (
    <Section
      index="05"
      title="Model"
      summary={`${METHOD[method].label} · ${OUTLOOK[outlook].label} · ${number(paths)} futures`}
      defaultOpen={false}
    >
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-method-label`}>
            How futures are drawn
          </span>
        </div>
        <SegmentedControl<ModelMethod>
          block
          aria-labelledby={`${uid}-method-label`}
          value={method}
          onChange={(v) => setInput('method', v)}
          options={(Object.keys(METHOD) as ModelMethod[]).map((m) => ({ value: m, label: METHOD[m].label }))}
        />
        <p className="field__hint seg-desc" aria-live="polite">
          {METHOD[method].desc}
        </p>
        <AnimatePresence initial={false}>
          {method === 'bootstrap' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ overflow: 'hidden' }}
            >
              <Slider
                className="slider--inset"
                label="Block length"
                value={block}
                min={6}
                max={60}
                step={6}
                format={(v) => `${v} months`}
                ticks={[6, 24, 42, 60].map((v) => ({ value: v, label: `${v}m` }))}
                onChange={(v) => setInput('blockMonths', v)}
                hint="Longer blocks keep multi-year booms and busts together."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-outlook-label`}>
            Return outlook
          </span>
        </div>
        <SegmentedControl<Outlook>
          block
          aria-labelledby={`${uid}-outlook-label`}
          value={outlook}
          onChange={(v) => setInput('outlook', v)}
          options={(Object.keys(OUTLOOK) as Outlook[]).map((o) => ({ value: o, label: OUTLOOK[o].label }))}
        />
        <p className="field__hint seg-desc" aria-live="polite">
          {OUTLOOK[outlook].desc}
        </p>
      </div>
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-paths-label`}>
            Number of futures
          </span>
        </div>
        <SegmentedControl<number>
          block
          aria-labelledby={`${uid}-paths-label`}
          value={PATHS.includes(paths) ? paths : 4000}
          onChange={(v) => setInput('paths', v)}
          options={PATHS.map((p) => ({ value: p, label: number(p) }))}
        />
        <p className="field__hint">More futures, steadier numbers, slower runs.</p>
      </div>
      <div className="seed">
        <NumberField
          label="Random seed"
          value={seed}
          min={0}
          max={2 ** 31 - 1}
          step={1}
          onChange={(v) => setInput('seed', Math.round(v))}
          stepper={false}
          hint="Same seed, same futures. Reshuffle to check the result isn’t luck."
        />
        <button
          type="button"
          className="btn btn--secondary seed__btn"
          onClick={() => {
            setInput('seed', Math.floor(Math.random() * 1_000_000))
            setSpin((s) => s + 1)
          }}
        >
          <motion.svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" animate={{ rotate: spin * 180 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
            <path d="M3.5 7h9.5l-2.5-2.5M16.5 13H7l2.5 2.5" />
          </motion.svg>
          Reshuffle
        </button>
      </div>
    </Section>
  )
}
