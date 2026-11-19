// The layered chart in its frame, for asking and for the results: a calm empty frame until there is
// something to draw (before question 3, or before the first answer from the worker), else the chart
// at the given layers. `data-layers` says how many are drawn.
//
// Everything is drawn from one `computed` pair, the result and the answers it was worked out for, so
// an older result is never read against newer answers. While a newer run is pending the chart dims
// and says "Updating…"; after a failed run it dims and says the figures are for earlier answers.

import type { IncomeComputed } from './incomeClient'
import { IncomeChart, type IncomeChartVariant } from './IncomeChart'
import type { IncomeLayers } from './incomeChart'

/** How the figures on screen relate to the current answers. */
export type FigureStatus = 'current' | 'updating' | 'stale'

export const STATUS_TEXT: Record<FigureStatus, string> = {
  current: '',
  updating: 'Updating…',
  stale: 'These figures are for your earlier answers',
}

export interface ChartPanelProps {
  computed: IncomeComputed | null
  /** A run is pending (before the first result, or a newer one). */
  busy: boolean
  status: FigureStatus
  layers: IncomeLayers
  variant: IncomeChartVariant
  justAdded?: boolean
  /** Say the status in the panel (off on the results, which say it once at the top). */
  showStatus?: boolean
}

export function ChartPanel({ computed, busy, status, layers, variant, justAdded, showStatus = true }: ChartPanelProps) {
  const drawn = computed && layers > 0 ? layers : 0
  const phone = variant.startsWith('phone')
  const note = !computed ? (busy ? 'Working it out…' : '') : STATUS_TEXT[status]
  return (
    <section
      className={`ichart-panel ichart-panel--${variant} is-${computed ? status : 'current'}`}
      aria-label="Income each year"
      aria-busy={busy}
      data-layers={drawn}
      data-status={computed ? status : 'current'}
      data-testid="income-chart"
    >
      {(!phone || showStatus) && (
        <div className="ichart-panel__head">
          {!phone && <span>Income each year, median future</span>}
          {showStatus && (
            <span className={`ichart-panel__busy ichart-panel__busy--${status}`} role="status">
              {note}
            </span>
          )}
        </div>
      )}
      {drawn > 0 && computed ? (
        <div className="ichart-panel__figure">
          <IncomeChart rows={computed.result.median} layers={drawn} spending={computed.inputs.spending} variant={variant} justAdded={justAdded} />
        </div>
      ) : (
        <div className="ichart-panel__empty">
          <p>{layers === 0 ? 'Your income builds here as you answer.' : 'Working out your futures…'}</p>
        </div>
      )}
    </section>
  )
}
