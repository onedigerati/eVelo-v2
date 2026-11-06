import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { BUDGET_CATEGORIES, budgetTotal } from '../../engine/cost'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { Budget, BudgetCategory } from '../../engine/types'
import { useStore } from '../../state/store'
import { scaleBudget } from './budget'
import { currency, number, parseLoose, percent } from '../format'
import { cx, SegmentedControl, StackBar } from '../primitives'

export const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  housing: 'Housing',
  groceries: 'Groceries',
  dining: 'Dining out',
  transport: 'Transportation',
  utilities: 'Utilities & phone',
  healthcare: 'Healthcare',
  travel: 'Travel',
  other: 'Everything else',
}
export const catColor = (c: BudgetCategory) => `var(--cat-${BUDGET_CATEGORIES.indexOf(c) + 1})`

const DEFAULT_TOTAL = budgetTotal(DEFAULT_INPUTS.budget)
/** Default mix scaled to a total, rounded to $100/category. */
function scaled(total: number): Budget {
  const out = {} as Budget
  for (const c of BUDGET_CATEGORIES) out[c] = Math.round((DEFAULT_INPUTS.budget[c] * total) / DEFAULT_TOTAL / 100) * 100
  return out
}
const PRESETS = [
  { id: 'lean', label: 'Lean', total: 70_000 },
  { id: 'comfortable', label: 'Comfortable', total: 110_000 },
  { id: 'generous', label: 'Generous', total: 180_000 },
].map((p) => ({ ...p, budget: scaled(p.total) }))

type Period = 'mo' | 'yr'

export function BudgetEditor() {
  const budget = useStore((s) => s.inputs.budget)
  const setInput = useStore((s) => s.setInput)
  const [period, setPeriod] = useState<Period>('yr')
  const total = budgetTotal(budget)
  const div = period === 'mo' ? 12 : 1
  const setCat = (c: BudgetCategory, annual: number) => setInput('budget', { ...budget, [c]: Math.max(0, Math.round(annual)) })

  return (
    <div className="budget">
      <div className="field__row">
        <span className="field__label" id="budget-label">
          Lifestyle budget
        </span>
        <SegmentedControl<Period>
          size="sm"
          className="budget__period"
          aria-label="Show amounts per"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'mo', label: 'Monthly' },
            { value: 'yr', label: 'Annual' },
          ]}
        />
      </div>
      <div className="budget__total">
        <MoneyInput
          id="budget-total"
          className="money--total"
          label={`Total lifestyle budget ${period === 'mo' ? 'per month' : 'per year'}`}
          value={total / div}
          step={period === 'mo' ? 100 : 1000}
          onChange={(v) => setInput('budget', scaleBudget(budget, v * div))}
        />
        <label className="budget__total-u" htmlFor="budget-total">
          {period === 'mo' ? 'per month' : 'per year'}, today’s dollars, at home · type your own amount; categories keep their mix
        </label>
      </div>
      <StackBar
        height={8}
        aria-label={`Budget mix: ${BUDGET_CATEGORIES.map((c) => `${CATEGORY_LABEL[c]} ${percent(total ? budget[c] / total : 0)}`).join(', ')}`}
        segments={BUDGET_CATEGORIES.map((c) => ({ key: c, value: budget[c], color: catColor(c), label: `${CATEGORY_LABEL[c]} ${percent(total ? budget[c] / total : 0)}` }))}
      />
      <ul className="ledger" aria-labelledby="budget-label">
        {BUDGET_CATEGORIES.map((c) => (
          <li key={c} className="ledger__row" style={{ '--c': catColor(c) } as CSSProperties}>
            <span className="ledger__swatch" aria-hidden="true" />
            <label className="ledger__label" htmlFor={`budget-${c}`}>
              {CATEGORY_LABEL[c]}
            </label>
            <span className="ledger__share num" aria-hidden="true">
              {percent(total ? budget[c] / total : 0)}
            </span>
            <MoneyInput id={`budget-${c}`} value={budget[c] / div} step={period === 'mo' ? 50 : 500} onChange={(v) => setCat(c, v * div)} />
          </li>
        ))}
      </ul>
      <div className="chips" role="group" aria-label="Budget presets">
        {PRESETS.map((p) => {
          const active = BUDGET_CATEGORIES.every((c) => p.budget[c] === budget[c])
          return (
            <button key={p.id} type="button" className={cx('chip', active && 'is-active')} aria-pressed={active} onClick={() => setInput('budget', { ...p.budget })}>
              {p.label}
              <span className="chip__meta num">${number(p.total / 1000)}k</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Compact right-aligned currency input (accepts "2.5k", "$1,200"). Arrow keys step. */
export function MoneyInput({ id, value, step, onChange, label, className }: { id?: string; value: number; step: number; onChange: (v: number) => void; label?: string; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = `$${number(Math.round(value))}`
  const commit = (raw: string) => {
    const v = parseLoose(raw, 'currency')
    if (v !== null) onChange(Math.max(0, v))
    setDraft(null)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const st = step * (e.shiftKey ? 10 : 1)
      onChange(Math.max(0, Math.round((value + (e.key === 'ArrowUp' ? st : -st)) / st) * st))
      setDraft(null)
    } else if (e.key === 'Enter') commit(e.currentTarget.value)
    else if (e.key === 'Escape') setDraft(null)
  }
  return (
    <span className={cx('money', className)}>
      <input
        id={id}
        className="money__input num"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        title={currency(value)}
        value={draft ?? shown}
        onFocus={(e) => {
          // Select all, unless the user already started typing (late rAF would eat a keystroke).
          const el = e.currentTarget
          const v = el.value
          el.select()
          requestAnimationFrame(() => document.activeElement === el && el.value === v && el.select())
        }}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={(e) => draft !== null && commit(e.currentTarget.value)}
        onKeyDown={onKey}
      />
    </span>
  )
}
