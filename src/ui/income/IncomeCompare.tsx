// The comparison with eVelo, on the results after a sync (docs/PLAN.md, stage 6): a measure switch
// (a tablist) over two columns, living on income (brass) and eVelo (green), then one chart of real
// net worth for both, what each measure means for eVelo, and the like-for-like lines.
//
// eVelo's figures are its own result for the plan as it stands: the app's result when it was run
// for exactly this plan (the main pipeline runs on every route), else the main client's cache, else
// a run of `simulate` through the mode's own worker, kept for the session. Once eVelo's result is
// in, the two-retirements walkthrough (Walkthrough.tsx) follows the comparison, then Same storm
// (SameStorm.tsx), which needs the plan as well as the results. Both follow the Holdings switch
// (holdings.ts's belowCard): on a shared mix they read the swapped pair, each with its inputs.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { PlanInputs, SimulationResult } from '../../engine/types'
import { selectSync, useEveloPlan, useIncomeStore } from '../../state/incomeState'
import { sim } from '../../state/sim'
import { useStore } from '../../state/store'
import { InfoTip, SegmentedControl } from '../primitives'
import { compareHeading, EVELO_MEANING, eveloColumn, incomeColumn, isDiffLine, likeForLike, MEASURES, mixPercent, mixSentence, stableKey, statText, type CompareColumn, type MeasureKey, type MixPart } from './compare'
import { CompareChart } from './CompareChart'
import { approxNote, belowCard, belowWaitText, comparedLine, compareMixes, compareSides, HOLDINGS_CHOICES, HOLDINGS_TIP, waitText, type MixView } from './holdings'
import type { CompareSeries } from './compareChart'
import { IncomeClient, type IncomeComputed } from './incomeClient'
import { measureRate } from './IncomeMeasures'
import { SameStorm } from './SameStorm'
import type { HoldingsMode } from './swap'
import { useSwapPair } from './swapRuns'
import { Walkthrough } from './Walkthrough'
import './compare.css'

type EveloRun = { status: 'loading' } | { status: 'done'; result: SimulationResult } | { status: 'error' } | { status: 'empty' }

/** eVelo results this session ran for the mode, by plan. */
const sessionRuns = new Map<string, SimulationResult>()

/** eVelo's result for this plan (see the file comment for where it comes from). */
export function useEveloResult(plan: PlanInputs): EveloRun {
  const key = useMemo(() => stableKey(plan), [plan])
  const storeResult = useStore((s) => s.result)
  const storeBusy = useStore((s) => s.status === 'running' && stableKey(s.inputs) === key)
  const empty = !plan.holdings.some((h) => h.weight > 0)
  const known = empty ? undefined : storeResult && stableKey(storeResult.inputs) === key ? storeResult : (sim.peek(plan) ?? sessionRuns.get(key))
  const [own, setOwn] = useState<{ key: string; run: EveloRun } | null>(null)
  const client = useRef<IncomeClient | null>(null)

  useEffect(() => () => client.current?.stop(), [])
  useEffect(() => {
    if (empty || known || storeBusy) return
    let live = true
    const c = (client.current ??= new IncomeClient())
    c.simulate(plan).then(
      (result) => {
        sessionRuns.set(key, result)
        if (live) setOwn({ key, run: { status: 'done', result } })
      },
      (e: Error) => live && e.message !== 'cancelled' && setOwn({ key, run: { status: 'error' } }),
    )
    return () => {
      live = false
    }
  }, [key, plan, empty, known, storeBusy])

  if (empty) return { status: 'empty' }
  if (known) return { status: 'done', result: known }
  return own?.key === key ? own.run : { status: 'loading' }
}

export interface IncomeCompareProps {
  computed: IncomeComputed
  wide: boolean
}

export function IncomeCompare({ computed, wide }: IncomeCompareProps) {
  const sync = useIncomeStore(selectSync)
  if (!sync) return null
  return <CompareBody computed={computed} wide={wide} />
}

function CompareBody({ computed, wide }: IncomeCompareProps) {
  const plan = useEveloPlan()
  const run = useEveloResult(plan)
  const [measure, setMeasure] = useState<MeasureKey>('lasts')
  // The Holdings switch: a what-if, local to the card (back to "Each its own" when it remounts).
  const [holdings, setHoldings] = useState<HoldingsMode>('own')
  const pair = useSwapPair(holdings, plan, computed, run)
  const sides = compareSides(holdings, pair, plan, computed, run)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const lines = useMemo(() => likeForLike(plan, computed.inputs), [plan, computed.inputs])
  // The differences that stop this being like for like go up under the heading; the rest stay below.
  const diffs = lines.filter(isDiffLine)
  const mixes = useMemo(() => compareMixes(holdings, plan, computed.inputs), [holdings, plan, computed.inputs])
  const compared = comparedLine(holdings, plan, computed.inputs)
  const approx = approxNote(holdings)
  const notes = lines.filter((l) => !isDiffLine(l))

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = MEASURES.findIndex((m) => m.key === measure)
    const n = MEASURES.length
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (j < 0) return
    e.preventDefault()
    setMeasure(MEASURES[j].key)
    tabs.current[j]?.focus()
  }

  // The walkthrough and Same storm follow the switch: the plans' own results under "Each its own",
  // the swapped pair under a shared mix (stage 3).
  const below = belowCard(holdings, pair, plan, computed, run)
  const series: CompareSeries[] = []
  if (sides.income.status === 'done') {
    const i = sides.income.value
    series.push({ key: 'income', label: 'Living on income', age: i.inputs.age, bands: i.result.value })
  }
  if (sides.evelo.status === 'done') {
    const e = sides.evelo.value.result
    series.push({ key: 'evelo', label: 'eVelo', age: e.inputs.age, bands: e.netWorth })
  }

  return (
    <>
      <section className="icmp" aria-labelledby="cmp-head" data-testid="income-compare" data-evelo={run.status} data-holdings={holdings} data-pair={pair.status}>
        <div className="icmp__top">
          <h2 id="cmp-head" className="icmp__head">
            {compareHeading(lines)}
          </h2>
          <div className="icmp__tabs" role="tablist" aria-label="Measure" onKeyDown={onKey}>
            {MEASURES.map((m, i) => (
              <button
                key={m.key}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`icmp-tab-${m.key}`}
                aria-selected={m.key === measure}
                aria-controls="cmp-panel"
                tabIndex={m.key === measure ? 0 : -1}
                className="icmp__tab"
                data-testid={`compare-tab-${m.key}`}
                onClick={() => setMeasure(m.key)}
              >
                {wide ? m.tab : m.short}
              </button>
            ))}
          </div>
        </div>

        <div className="icmp__holdings" data-testid="compare-holdings">
          <span className="icmp__holdings-head">
            <span id="icmp-holdings-label" className="icmp__holdings-label">
              Holdings
            </span>
            <InfoTip label="How the Holdings switch works" side="bottom">
              {HOLDINGS_TIP}
            </InfoTip>
          </span>
          <SegmentedControl<HoldingsMode>
            options={HOLDINGS_CHOICES.map((c) => ({ value: c.value, label: c.label }))}
            value={holdings}
            onChange={setHoldings}
            aria-labelledby="icmp-holdings-label"
            size="sm"
            className="icmp__seg"
          />
          {compared && (
            <p className="icmp__compared" data-testid="compare-what">
              {compared}
            </p>
          )}
          {approx && (
            <p className="icmp__approx" data-testid="compare-approx">
              {approx}
            </p>
          )}
        </div>

        {diffs.length > 0 && (
          <ul className="icmp__lines icmp__lines--diff" aria-label="What differs" data-testid="compare-diffs">
            {diffs.map((l) => (
              <li key={l.key} data-line={l.key}>
                {l.text}
              </li>
            ))}
          </ul>
        )}

        <div id="cmp-panel" role="tabpanel" aria-labelledby={`icmp-tab-${measure}`} className="icmp__panel" data-measure={measure}>
          <div className="icmp__cols">
            {sides.income.status === 'done' ? (
              <Column col={incomeColumn(measure, sides.income.value.result)} mix={mixes.income} />
            ) : (
              <Waiting side="income" name="Living on income" status={sides.income.status} mix={mixes.income} />
            )}
            {sides.evelo.status === 'done' ? (
              <Column col={eveloColumn(measure, sides.evelo.value.result)} mix={mixes.evelo} />
            ) : (
              <Waiting side="evelo" name="eVelo" status={sides.evelo.status} mix={mixes.evelo} />
            )}
          </div>
          <p className="icmp__meaning" data-testid="compare-meaning">
            {EVELO_MEANING[measure]}
          </p>
        </div>

        <CompareChart series={series} phone={!wide} />

        {notes.length > 0 && (
          <ul className="icmp__lines" aria-label="Like for like" data-testid="compare-lines">
            {notes.map((l) => (
              <li key={l.key} data-line={l.key}>
                {l.text}
              </li>
            ))}
          </ul>
        )}
      </section>
      {below.status === 'done' && (
        <>
          <Walkthrough income={below.income.result} incomeInputs={below.income.inputs} evelo={below.evelo.result} wide={wide} mixLine={below.mixLine} />
          <SameStorm
            evelo={below.evelo.inputs}
            eveloResult={below.evelo.result}
            income={below.income.inputs}
            incomeResult={below.income.result}
            phone={!wide}
            mixLine={below.mixLine}
          />
        </>
      )}
      {below.status !== 'done' && holdings !== 'own' && (
        <p className="icmp__below-wait" role={below.status === 'error' ? 'alert' : 'status'} data-testid="below-wait" data-wait={below.status}>
          {belowWaitText(holdings, below.status)}
        </p>
      )}
    </>
  )
}

/** Shades of the column's own hue for the mix, darkest = largest; the "N more" slice is neutral. */
const MIX_TONES = [100, 72, 50, 32, 20]

/** A plan's holdings: a thin bar split by weight, with ticker labels keyed to its shades. */
function Mix({ name, parts, side, borrowed }: { name: string; parts: readonly MixPart[]; side: CompareColumn['key']; borrowed?: boolean }) {
  const tone = (p: MixPart, i: number) => (p.rest ? 'color-mix(in oklab, var(--ink-3) 40%, transparent)' : `color-mix(in oklab, var(--icmp-ink) ${MIX_TONES[i] ?? 20}%, transparent)`)
  return (
    <div className="icmp__mix" data-testid={`compare-mix-${side}`} data-borrowed={borrowed ? 'true' : undefined}>
      <span className="sr-only">
        {mixSentence(name, parts)}
        {borrowed && ` Borrowed from ${side === 'income' ? 'eVelo' : 'living on income'} for this comparison.`}
      </span>
      <div className="icmp__mix-bar" aria-hidden="true">
        {parts.map((p, i) => (
          <span key={p.symbol} style={{ flexGrow: p.weight, background: tone(p, i) }} />
        ))}
      </div>
      <ul className="icmp__mix-keys" aria-hidden="true">
        {parts.map((p, i) => (
          <li key={p.symbol}>
            <span className="icmp__mix-dot" style={{ background: tone(p, i) }} />
            <span className="icmp__mix-sym">{p.symbol}</span> {mixPercent(p.weight)}
          </li>
        ))}
        {borrowed && (
          <li className="icmp__mix-tag" data-testid={`compare-mix-borrowed-${side}`}>
            borrowed
          </li>
        )}
      </ul>
    </div>
  )
}

/** A column waiting on its result: under "Each its own" only eVelo's, as before the switch; under a
 *  shared mix the borrower's while its swapped run is worked out. */
function Waiting({ side, name, status, mix }: { side: CompareColumn['key']; name: string; status: 'loading' | 'error' | 'empty'; mix: MixView }) {
  return (
    <div className={`icmp__col icmp__col--${side} icmp__col--wait`} data-testid={`compare-col-${side}`} data-wait={status}>
      <span className="icmp__name">{name}</span>
      {mix.parts.length > 0 && <Mix name={name} parts={mix.parts} side={side} borrowed={mix.borrowed} />}
      <p className="icmp__wait" role={status === 'error' ? 'alert' : undefined}>
        {waitText(side, status, mix.borrowed)}
      </p>
    </div>
  )
}

function Column({ col, mix }: { col: CompareColumn; mix: MixView }) {
  return (
    <div className={`icmp__col icmp__col--${col.key}`} data-testid={`compare-col-${col.key}`}>
      <div className="icmp__name-row">
        <span className="icmp__name">{col.name}</span>
        <span className="icmp__how">{col.how}</span>
      </div>
      {mix.parts.length > 0 && <Mix name={col.name} parts={mix.parts} side={col.key} borrowed={mix.borrowed} />}
      <div className="icmp__rate-row">
        <span className="icmp__rate" data-testid={`compare-rate-${col.key}`}>
          {measureRate(col.rate)}
        </span>
        <span className="icmp__rate-note">{col.rateNote}</span>
      </div>
      <dl className="icmp__stats">
        {col.stats.map((s) => (
          <div key={s.key} className={`icmp__stat${s.value == null ? ' icmp__stat--note' : ''}`} data-testid={`compare-${col.key}-${s.key}`}>
            <dt>{s.label}</dt>
            <dd>{statText(s)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
