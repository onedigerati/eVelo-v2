// The results' one-line summary, the fraction set in brass (text from incomeSummary.ts).
import './incomeResults.css'

import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import { summaryParts } from './incomeSummary'

export interface IncomeSummaryProps {
  result: IncomeResult
  inputs: Pick<IncomeInputs, 'spending' | 'otherIncome' | 'age' | 'incomeStartAge'>
}

export function IncomeSummary({ result, inputs }: IncomeSummaryProps) {
  const p = summaryParts(result, inputs)
  return (
    <p className="isummary" data-testid="income-summary">
      {p.before}
      {p.emphasis && <em className="isummary__em">{p.emphasis}</em>}
      {p.after}
    </p>
  )
}
