// The results, stacked: the summary sentence, the chart with every layer and its legend, the three
// measures, the ledger one tap away, the method notes, and "Edit answers" back to question 1.
// Everything reads from one `computed` pair (the result and the answers it was run for); while a
// newer run is pending, or after one failed, the figures dim and a line beside the heading says so.

import { useEffect, useRef } from 'react'
import { useIncomeStore } from '../../state/incomeState'
import { ChartPanel, STATUS_TEXT, type FigureStatus } from './ChartPanel'
import { HowWorkedOut } from './HowWorkedOut'
import type { IncomeComputed } from './incomeClient'
import { IncomeCompare } from './IncomeCompare'
import { IncomeMeasures } from './IncomeMeasures'
import { IncomeSummary } from './IncomeSummary'
import { YearByYear } from './YearByYear'

export interface IncomeResultsViewProps {
  computed: IncomeComputed | null
  busy: boolean
  status: FigureStatus
  wide: boolean
  /** Move focus to the heading (on arriving from question 6, not on a fresh load). */
  focusOnMount: boolean
}

export function IncomeResultsView({ computed, busy, status, wide, focusOnMount }: IncomeResultsViewProps) {
  const setFlow = useIncomeStore((s) => s.setFlow)
  const head = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusOnMount) head.current?.focus()
  }, [focusOnMount])
  const shown = computed ? status : 'current'

  return (
    <div className={`ires is-${shown}`} aria-busy={busy} data-status={shown} data-testid="income-results">
      <div className="ires__top">
        <h2 ref={head} tabIndex={-1} className="ires__head">
          Your answer
        </h2>
        <span className={`ires__status ires__status--${shown}`} role="status" data-testid="income-status">
          {STATUS_TEXT[shown]}
        </span>
      </div>
      {computed ? <IncomeSummary result={computed.result} inputs={computed.inputs} /> : <p className="isummary ires__wait">Working out your futures…</p>}
      <ChartPanel computed={computed} busy={busy} status={status} layers={5} variant={wide ? 'results' : 'phone-results'} showStatus={false} />
      {computed && <IncomeMeasures result={computed.result} />}
      {computed && <IncomeCompare computed={computed} wide={wide} />}
      <div className="ires__actions">
        {computed && <YearByYear result={computed.result} />}
        <button type="button" className="ires__edit" onClick={() => setFlow({ step: 1, done: false })}>
          Edit answers
        </button>
      </div>
      <HowWorkedOut />
    </div>
  )
}
