// Dev-only preview of the mode's results panels on the engine fixture, shown at the foot of
// #styleguide when Vite runs in dev (the import is gated on import.meta.env.DEV, so the build drops
// it and nothing on the built site points to the mode).

import type { IncomeResult } from '../../engine/incomeTypes'
import fixture from './__tests__/fixtures/incomeResult.json'
import { HowWorkedOut } from './HowWorkedOut'
import { IncomeLedger } from './IncomeLedger'
import { IncomeMeasures } from './IncomeMeasures'
import { IncomeSummary } from './IncomeSummary'
import { YearByYear } from './YearByYear'
import './income.css'

const result = fixture as IncomeResult
const first = result.median[0]

export default function IncomePreview() {
  return (
    <section className="income income-preview" aria-label="Living on income, results preview" data-testid="income-preview">
      <p className="income__eyebrow">Dev preview · living on income results (fixture)</p>
      <div className="income-preview__stack">
        <IncomeSummary result={result} inputs={{ spending: first.spending, otherIncome: 40_000, age: first.age, incomeStartAge: 67 }} />
        <IncomeMeasures result={result} />
        <div>
          <YearByYear result={result} />
        </div>
        <IncomeLedger rows={result.median} />
        <HowWorkedOut defaultOpen />
      </div>
    </section>
  )
}
