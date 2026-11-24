// "Same storm, two boats" (docs/PLAN.md stage 4): under the walkthrough's chapters, both plans
// through the same sampled futures. Chips (a tablist) pick a future, the chart (SameStormChart)
// draws both net worths and eVelo's loan-to-value through it, and the future's caption follows.
// Shown only when both plans drew the same futures (stormGate); otherwise one line says why.
// The gate, the merged futures and the captions live in sameStorm.ts.

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import type { PlanInputs, SimulationResult } from '../../engine/types'
import { stormFutures, stormGate, stormHiddenText, type StormFuture } from './sameStorm'
import type { StormStart } from './sameStormChart'
import { SameStormChart } from './SameStormChart'
import { chipForKey, selectedChip, type StormPick } from './stormChips'
import './sameStorm.css'

export interface SameStormProps {
  evelo: PlanInputs
  eveloResult: SimulationResult
  income: IncomeInputs
  incomeResult: IncomeResult
  phone: boolean
  /** Under a shared mix, the line saying which mix both plans are on (the props are then the
   *  swapped pair's plan and results). Absent under "Each its own". */
  mixLine?: string | null
}

export { defaultFuture } from './stormChips'

const TITLE = 'Same storm, two boats'

// The caption is a live region that announces chip picks only: it re-mounts (silently) for each new
// list of futures, so new results don't announce, and its text changes in place on a pick.
const listIds = new WeakMap<readonly StormFuture[], number>()
let nextListId = 0
const listId = (futures: readonly StormFuture[]) => {
  let id = listIds.get(futures)
  if (id === undefined) listIds.set(futures, (id = nextListId++))
  return id
}

export function SameStorm({ evelo, eveloResult, income, incomeResult, phone, mixLine }: SameStormProps) {
  const gate = useMemo(() => stormGate(evelo, eveloResult, income, incomeResult), [evelo, eveloResult, income, incomeResult])
  const futures = useMemo(() => (gate === 'shown' ? stormFutures(evelo, eveloResult, income, incomeResult) : []), [gate, evelo, eveloResult, income, incomeResult])
  const start = useMemo<Partial<StormStart>>(
    () => ({ income: incomeResult.value?.p50?.[0], evelo: eveloResult.netWorth?.p50?.[0], ltv: eveloResult.ltv?.p50?.[0] }),
    [incomeResult, eveloResult],
  )
  // The picked chip, for exactly the futures it was picked on (new results go back to the default).
  const [picked, setPicked] = useState<StormPick>(null)
  const chips = useRef<(HTMLButtonElement | null)[]>([])
  const mix = mixLine ? (
    <p className="ss__mix" data-testid="storm-mix">
      {mixLine}
    </p>
  ) : null

  if (gate !== 'shown' || futures.length === 0) {
    return (
      <section className="ss" aria-labelledby="ss-head" data-testid="same-storm" data-gate={gate}>
        <h3 id="ss-head" className="ss__title">
          {TITLE}
        </h3>
        {mix}
        <p className="ss__hidden" data-testid="storm-hidden">
          {stormHiddenText(gate === 'shown' ? 'no-samples' : gate, evelo.blockMonths)}
        </p>
      </section>
    )
  }

  const i = selectedChip(futures, picked)
  const f = futures[i]

  const pick = (j: number) => setPicked({ on: futures, key: futures[j].keys[0] })
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const j = chipForKey(e.key, i, futures.length)
    if (j === null) return
    e.preventDefault()
    pick(j)
    chips.current[j]?.focus()
  }

  return (
    <section className={`ss${phone ? ' ss--phone' : ''}`} aria-labelledby="ss-head" data-testid="same-storm" data-gate="shown" data-future={f.keys[0]}>
      <div className="ss__head">
        <h3 id="ss-head" className="ss__title">
          {TITLE}
        </h3>
        <p className="ss__lede">The chapters follow each year’s median. Pick a future to see both plans live through the same months.</p>
        {mix}
      </div>

      <div className="ss__chips" role="tablist" aria-label="Future" onKeyDown={onKey}>
        {futures.map((x, j) => (
          <button
            key={x.keys[0]}
            ref={(el) => {
              chips.current[j] = el
            }}
            type="button"
            role="tab"
            id={`ss-chip-${x.keys[0]}`}
            aria-selected={j === i}
            aria-controls="ss-panel"
            tabIndex={j === i ? 0 : -1}
            className="ss__chip"
            data-testid={`storm-chip-${x.keys[0]}`}
            onClick={() => pick(j)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div id="ss-panel" role="tabpanel" tabIndex={0} aria-labelledby={`ss-chip-${f.keys[0]}`} className="ss__panel">
        <ul className="ss__legend" aria-hidden="true">
          <li className="ss__key ss__key--income">Living on income</li>
          <li className="ss__key ss__key--evelo">eVelo, after its loan</li>
          <li className="ss__key ss__key--loan">Forced sale</li>
        </ul>
        <SameStormChart futures={futures} index={i} start={start} phone={phone} />
        <p key={listId(futures)} className="ss__caption" aria-live="polite" data-testid="storm-caption">
          {f.caption}
        </p>
      </div>
    </section>
  )
}
