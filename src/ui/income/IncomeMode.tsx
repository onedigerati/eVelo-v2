// The living-on-income mode (#income), loaded lazily as its own chunk. A different room in the same
// house: eVelo's paper, type and wordmark, its own slim header in place of the app's nav (nothing
// here points back into the mode), and brass (--bruised) as the accent instead of eVelo's green.
// Stage 4 is the shell: it runs the `income` worker request on the mode's saved inputs and shows
// the headline measure. The questions, the chart and the other measures arrive in stage 5.

import { hrefFor } from '../../state/router'
import { useIncomeStore } from '../../state/incomeState'
import { currency, percent } from '../format'
import { Wordmark } from '../shell/TopBar'
import { useIncomeRun } from './incomeClient'
import './income.css'

export default function IncomeMode() {
  const inputs = useIncomeStore((s) => s.inputs)
  const run = useIncomeRun(inputs)
  const done = run.status === 'done' ? run.result : null

  return (
    <div className="income">
      <header className="income__header">
        <Wordmark />
        <a className="income__back" href={hrefFor('plan')}>
          <span aria-hidden="true">←</span> Back to eVelo
        </a>
      </header>
      <main id="main" tabIndex={-1} className="income__main">
        <p className="income__eyebrow">Living on income</p>
        <h1 className="income__title">Retire the conventional way: live on dividends and interest, sell only to cover the gap.</h1>

        <section className="income__measure" aria-labelledby="income-lasts" aria-busy={run.status === 'loading'}>
          <h2 id="income-lasts" className="income__measure-label">
            The money lasts
          </h2>
          <p className="income__rate" data-testid="income-lasts-rate" aria-live="polite">
            {done ? percent(done.lastsRate) : run.status === 'error' ? '—' : <span className="income__rate-wait" aria-label="Working it out" />}
          </p>
          <p className="income__measure-note">
            {done
              ? `In ${percent(done.lastsRate)} of ${done.paths.toLocaleString('en-US')} futures drawn from history, ${currency(inputs.spending)} a year after tax is met every year to age ${inputs.age + inputs.horizonYears}.`
              : run.status === 'error'
                ? "This couldn't be worked out just now. Reload to try again."
                : `Running ${inputs.paths.toLocaleString('en-US')} futures drawn from history…`}
          </p>
        </section>

        <p className="income__next">These are starting figures. The questions that make them yours arrive next.</p>
      </main>
    </div>
  )
}
