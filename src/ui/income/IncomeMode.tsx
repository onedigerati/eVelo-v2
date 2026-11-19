// The living-on-income mode (#income), loaded lazily as its own chunk. A different room in the same
// house: eVelo's paper, type and wordmark, its own slim header in place of the app's nav (nothing
// here points back into the mode), and brass (--bruised) as the accent instead of eVelo's green.
// Six one-sentence questions build the layered chart (IncomeAsk), then the stacked results
// (IncomeResultsView). The worker runs on the current answers as they change (debounced, latest
// only). The last result stays on screen with the answers it was run for, never the newer ones:
// dimmed with "Updating…" while a newer one is worked out, and dimmed with "These figures are for
// your earlier answers" if that run fails.

import { useEffect, useRef, useState } from 'react'
import { hrefFor } from '../../state/router'
import { useIncomeStore } from '../../state/incomeState'
import { useMediaQuery } from '../hooks'
import { Wordmark } from '../shell/TopBar'
import { IncomeAsk } from './IncomeAsk'
import { useIncomeRun, type IncomeComputed } from './incomeClient'
import type { FigureStatus } from './ChartPanel'
import { STEPS } from './incomeFlow'
import { IncomeResultsView } from './IncomeResultsView'
import { SyncHeader } from './SyncChip'
import './income.css'
import './incomeFlow.css'

export default function IncomeMode() {
  const inputs = useIncomeStore((s) => s.inputs)
  const { step, done } = useIncomeStore((s) => s.flow)
  const run = useIncomeRun(inputs)
  const wide = useMediaQuery('(min-width: 900px)')

  const [last, setLast] = useState<IncomeComputed | null>(null)
  useEffect(() => {
    if (run.status === 'done') setLast({ inputs: run.inputs, result: run.result })
  }, [run])
  const computed: IncomeComputed | null = run.status === 'done' ? (last?.result === run.result ? last : { inputs: run.inputs, result: run.result }) : last
  // Current only when the figures were run for the answers on screen now; a run between an answer
  // changing and the debounce firing counts as updating too.
  const status: FigureStatus = run.status === 'error' ? 'stale' : run.status === 'done' && computed?.inputs === inputs ? 'current' : 'updating'
  const busy = status === 'updating'

  // Focus the results heading only when arriving from the questions, not on a fresh load.
  const wasDone = useRef(done)
  const arrived = done && !wasDone.current
  const reopened = !done && wasDone.current
  useEffect(() => {
    wasDone.current = done
  }, [done])

  return (
    <div className={done ? 'income income--results' : 'income income--asking'}>
      <header className="income__header">
        <Wordmark />
        {!done && (
          <span className="income__progress" data-testid="income-progress">
            <span className="sr-only">Question </span>
            {step} of {STEPS}
          </span>
        )}
        {done && (
          <div className="income__sync">
            <SyncHeader />
          </div>
        )}
        <a className="income__back" href={hrefFor('plan')}>
          <span aria-hidden="true">←</span> <span className="income__back-text">Back to eVelo</span>
        </a>
      </header>
      <main id="main" tabIndex={-1} className="income__main">
        <h1 className="income__eyebrow">Living on income</h1>
        {run.status === 'error' && (
          <p className="income__error" role="alert">
            This couldn’t be worked out. Change an answer to try again, or reload.
          </p>
        )}
        {done ? (
          <IncomeResultsView computed={computed} busy={busy} status={status} wide={wide} focusOnMount={arrived} />
        ) : (
          <IncomeAsk step={step} computed={computed} busy={busy} status={status} wide={wide} focusOnMount={reopened} />
        )}
      </main>
    </div>
  )
}
