import { useId } from 'react'
import type { Budget } from '../../engine/types'
import { useStore } from '../../state/store'
import { currencyCompact } from '../format'
import { NumberField, Section, SegmentedControl, Slider } from '../primitives'

export const budgetTotal = (b: Budget) => Object.values(b).reduce((a, v) => a + v, 0)

export function LifeSection() {
  const age = useStore((s) => s.inputs.age)
  const horizon = useStore((s) => s.inputs.horizonYears)
  const budget = useStore((s) => s.inputs.budget)
  const otherIncome = useStore((s) => s.inputs.otherIncome)
  const setInput = useStore((s) => s.setInput)
  const uid = useId()
  const total = budgetTotal(budget)
  return (
    <Section index="02" title="Life & lifestyle" summary={`Age ${age} · ${horizon} yrs · ${currencyCompact(total)}/yr`}>
      <Slider label="Your age" value={age} min={30} max={85} step={1} ticks={[30, 45, 60, 75, 85]} onChange={(v) => setInput('age', v)} />
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-horizon-label`}>
            Horizon
          </span>
          <span className="field__value num ink-3">to age {age + horizon}</span>
        </div>
        <SegmentedControl<number>
          block
          aria-labelledby={`${uid}-horizon-label`}
          value={horizon}
          onChange={(v) => setInput('horizonYears', v)}
          options={[15, 20, 30].map((y) => ({ value: y, label: `${y} years` }))}
        />
      </div>
      <div className="budget-line">
        <span className="field__label">Lifestyle budget</span>
        <span className="budget-line__v num">{currencyCompact(total)}</span>
        <span className="ink-3 t-small">per year, today’s dollars</span>
      </div>
      <NumberField
        label="Social Security & pensions"
        kind="currency"
        value={otherIncome}
        min={0}
        step={1_000}
        onChange={(v) => setInput('otherIncome', v)}
        hint="Per year, inflation-indexed."
      />
    </Section>
  )
}
