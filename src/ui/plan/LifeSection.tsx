import { AnimatePresence, m as motion } from 'framer-motion'
import { useId, useState } from 'react'
import { budgetTotal } from '../../engine/cost'
import { maxRetireInYears } from '../../state/retireClamp'
import { MAX_SAVINGS_WHILE_WORKING } from '../../state/share'
import { useStore } from '../../state/store'
import { currencyCompact } from '../format'
import { ease } from '../motion'
import { NumberField, Section, SegmentedControl, Slider } from '../primitives'
import { BudgetEditor } from './BudgetEditor'

export { budgetTotal }

const PRESET_HORIZONS = [15, 20, 30]
/** Board A's "Retire in" presets, in years from today (0 = now); "Other" covers 1–15. */
const PRESET_RETIRE = [0, 2, 4, 5]

export function LifeSection() {
  const age = useStore((s) => s.inputs.age)
  const horizon = useStore((s) => s.inputs.horizonYears)
  const budget = useStore((s) => s.inputs.budget)
  const otherIncome = useStore((s) => s.inputs.otherIncome)
  const incomeStart = useStore((s) => s.inputs.incomeStartAge)
  const setInput = useStore((s) => s.setInput)
  const uid = useId()
  const total = budgetTotal(budget)
  const [customOpen, setCustomOpen] = useState(!PRESET_HORIZONS.includes(horizon))
  const custom = customOpen || !PRESET_HORIZONS.includes(horizon)
  const startsIn = Math.max(0, incomeStart - age)

  const retireIn = useStore((s) => s.inputs.retireInYears)
  const saving = useStore((s) => s.inputs.savingsWhileWorking)
  // Retirement stays at least a year before the plan ends (the store re-clamps when the horizon drops).
  const retireMax = maxRetireInYears(horizon)
  const retirePresets = PRESET_RETIRE.filter((y) => y <= retireMax)
  const [otherOpen, setOtherOpen] = useState(!PRESET_RETIRE.includes(retireIn))
  const other = retireMax >= 1 && (otherOpen || !retirePresets.includes(retireIn))
  const summary = [`Age ${age}`, retireIn > 0 && `retire ${age + retireIn}`, `${horizon} yrs`, `${currencyCompact(total)}/yr`].filter(Boolean).join(' · ')

  return (
    <Section index="02" title="Life & lifestyle" summary={summary}>
      <Slider label="Your age" value={age} min={30} max={85} step={1} ticks={[30, 45, 60, 75, 85]} onChange={(v) => setInput('age', v)} />
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-retire-label`}>
            Retire in
          </span>
          <span className="field__value num ink-3" id={`${uid}-retire-age`}>
            at age {age + retireIn}
          </span>
        </div>
        <SegmentedControl<number | 'other'>
          block
          aria-labelledby={`${uid}-retire-label ${uid}-retire-age`}
          value={other ? 'other' : retireIn}
          onChange={(v) => {
            if (v === 'other') {
              setOtherOpen(true)
              // "Other" means working a while: start the slider at a year rather than at "now".
              if (retireIn === 0) setInput('retireInYears', 1)
            } else {
              setOtherOpen(false)
              setInput('retireInYears', v)
            }
          }}
          options={[
            ...retirePresets.map((y) => ({
              value: y,
              label: y === 0 ? 'Now' : `${y} yrs`,
              ariaLabel: y === 0 ? 'Now' : `${y} years`,
            })),
            ...(retireMax >= 1
              ? [
                  {
                    value: 'other' as const,
                    label: other ? `${retireIn} yrs` : 'Other',
                    ariaLabel: other ? `Other: ${retireIn} ${retireIn === 1 ? 'year' : 'years'}` : 'Other',
                  },
                ]
              : []),
          ]}
        />
        <AnimatePresence initial={false}>
          {other && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ overflow: 'hidden' }}
            >
              <Slider
                className="slider--inset"
                label="Years until you retire"
                value={Math.min(Math.max(1, retireIn), retireMax)}
                min={1}
                max={retireMax}
                step={1}
                format="years"
                ticks={[...[1, 5, 10].filter((v) => v < retireMax), retireMax].map((v) => ({ value: v, label: String(v) }))}
                onChange={(v) => setInput('retireInYears', v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {retireIn > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ overflow: 'hidden' }}
            >
              <NumberField
                className="numfield--inset"
                label="Saving while working"
                kind="currency"
                suffix="/yr"
                value={saving}
                min={0}
                max={MAX_SAVINGS_WHILE_WORKING}
                step={1_000}
                onChange={(v) => setInput('savingsWhileWorking', v)}
                hint="Per year, today’s dollars. Added to the portfolio each year until you retire. Pays down your loan first."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-horizon-label`}>
            Horizon
          </span>
          <span className="field__value num ink-3">
            to age {age + horizon}
          </span>
        </div>
        <SegmentedControl<number | 'custom'>
          block
          aria-labelledby={`${uid}-horizon-label`}
          value={custom ? 'custom' : horizon}
          onChange={(v) => {
            if (v === 'custom') setCustomOpen(true)
            else {
              setCustomOpen(false)
              setInput('horizonYears', v)
            }
          }}
          options={[
            ...PRESET_HORIZONS.map((y) => ({ value: y, label: `${y} yrs` })),
            { value: 'custom' as const, label: custom ? `${horizon} yrs` : 'Custom' },
          ]}
        />
        <AnimatePresence initial={false}>
          {custom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ overflow: 'hidden' }}
            >
              <Slider
                className="slider--inset"
                label="Custom horizon"
                value={horizon}
                min={10}
                max={40}
                step={1}
                format="years"
                ticks={[10, 20, 30, 40].map((v) => ({ value: v, label: String(v) }))}
                onChange={(v) => setInput('horizonYears', v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BudgetEditor />

      <div className="subgroup">
        <NumberField
          label="Social Security & pensions"
          kind="currency"
          value={otherIncome}
          min={0}
          max={1_000_000}
          step={1_000}
          onChange={(v) => setInput('otherIncome', v)}
          hint="Per year, today’s dollars, inflation-indexed. Reduces what you borrow."
        />
        <Slider
          label="Income starts at"
          value={incomeStart}
          min={50}
          max={80}
          step={1}
          format={(v) => `age ${v}`}
          ticks={[50, 62, 67, 80].map((v) => ({ value: v, label: String(v) }))}
          onChange={(v) => setInput('incomeStartAge', v)}
          disabled={otherIncome <= 0}
          hint={otherIncome <= 0 ? 'No other income set.' : startsIn === 0 ? 'Already being paid.' : `Starts in ${startsIn} ${startsIn === 1 ? 'year' : 'years'}.`}
        />
      </div>
    </Section>
  )
}
