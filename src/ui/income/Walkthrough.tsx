// The two-retirements walkthrough (docs/PLAN.md stage 2): under the comparison once synced and both
// results are in. A chapter rail (a tablist), the chapter's title and ages, Back / Next chapter /
// Play story, a paragraph per plan, the overview chart (the only year control: tap, drag or keys
// pick a year, and the section moves to its chapter) and the twin ledgers for that year. Play story
// steps the chapter's years and stops at its end; Next chapter carries on. The data and chapter rules
// live in walkthrough.ts; the chart, ledgers and paragraphs are leaves (WalkthroughChart.tsx,
// TwinLedgers.tsx, walkthroughStory.ts) coding against its types.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import type { SimulationResult } from '../../engine/types'
import { useReducedMotion } from './reducedMotion'
import { TwinLedgers } from './TwinLedgers'
import { buildYears, chapterOf, chapters, type Chapter, type StoryPart, type WalkInputs, type WalkYear } from './walkthrough'
import { WalkthroughChart } from './WalkthroughChart'
import { chapterStory } from './walkthroughStory'
import './walkthrough.css'

/** Play story's step, ms: a year at a time, slower with reduced motion (and no transitions then). */
export const PLAY_MS = 650
export const PLAY_MS_REDUCED = 1100

/** Play story is running for exactly the chapter list it started on: any change to the years or
 *  chapters (an input or sync update makes a new list) stops it. */
export const isPlaying = (playingOn: readonly Chapter[] | null, list: readonly Chapter[]) => playingOn !== null && playingOn === list

export interface WalkthroughProps {
  income: IncomeResult
  incomeInputs: IncomeInputs
  evelo: SimulationResult
  wide: boolean
  /** Under a shared mix (the comparison's Holdings switch), the line saying which mix both plans are
   *  on; the results passed are then the swapped pair's. Absent under "Each its own". */
  mixLine?: string | null
}

const agesOf = (c: Chapter, years: readonly WalkYear[]) => {
  const a = years[c.from].age
  const b = years[c.to].age
  return a === b ? `${a}` : `${a}–${b}`
}

export function Walkthrough({ income, incomeInputs, evelo, wide, mixLine }: WalkthroughProps) {
  const years = useMemo(() => buildYears(income, incomeInputs, evelo), [income, incomeInputs, evelo])
  const list = useMemo(() => chapters(years, incomeInputs), [years, incomeInputs])
  const inputs = useMemo<WalkInputs>(() => ({ income: incomeInputs, evelo: evelo.inputs }), [incomeInputs, evelo.inputs])
  const [pos, setPos] = useState({ chapter: 0, year: 0 })
  const [playingOn, setPlayingOn] = useState<readonly Chapter[] | null>(null)
  const playing = isPlaying(playingOn, list)
  const setPlaying = (on: boolean) => setPlayingOn(on ? list : null)
  const reduced = useReducedMotion()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Clamped, so a new result (fewer years or chapters) never leaves the state out of range.
  const ci = Math.min(Math.max(0, pos.chapter), list.length - 1)
  const c = list[ci] as Chapter | undefined
  const year = c ? Math.min(c.to, Math.max(c.from, pos.year)) : 0
  const ms = reduced ? PLAY_MS_REDUCED : PLAY_MS

  // Play story: one year per step, stopping on the chapter's last year.
  useEffect(() => {
    if (!playing || !c) return
    if (year >= c.to) {
      setPlayingOn(null)
      return
    }
    const t = window.setTimeout(() => setPos({ chapter: ci, year: year + 1 }), ms)
    return () => window.clearTimeout(t)
  }, [playing, ci, c, year, ms])

  const story = useMemo(() => (c ? chapterStory(c, years, inputs) : null), [c, years, inputs])
  if (!c || !story) return null

  const go = (i: number, y?: number) => {
    setPlaying(false)
    setPos({ chapter: i, year: y ?? list[i].from })
  }
  const pickYear = (y: number) => {
    const i = chapterOf(list, y)
    if (i >= 0) go(i, y)
  }
  const play = () => {
    if (playing) return setPlaying(false)
    if (year >= c.to) setPos({ chapter: ci, year: c.from })
    setPlaying(true)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = list.length
    const j = e.key === 'ArrowRight' ? (ci + 1) % n : e.key === 'ArrowLeft' ? (ci + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (j < 0) return
    e.preventDefault()
    go(j)
    tabs.current[j]?.focus()
  }

  const ages = agesOf(c, years)
  const one = c.from === c.to
  const row = years[year]

  return (
    <section className={`wt${wide ? '' : ' wt--phone'}`} aria-labelledby="wt-head" data-testid="walkthrough" data-chapter={c.key} data-year={year}>
      <div className="wt__head">
        <span className="wt__eyebrow">Living on income vs eVelo</span>
        <h2 id="wt-head" className="wt__title">
          How the two plans play out
        </h2>
        <p className="wt__lede">Same money, same markets. One lives on what the portfolio pays and sells for the rest; the other never sells and borrows.</p>
        {mixLine && (
          <p className="wt__mix" data-testid="wt-mix">
            {mixLine}
          </p>
        )}
      </div>

      <div className="wt__rail" role="tablist" aria-label="Chapters" onKeyDown={onKey} style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }}>
        {list.map((ch, i) => (
          <button
            key={ch.key}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`wt-tab-${ch.key}`}
            aria-selected={i === ci}
            aria-controls="wt-panel"
            aria-label={`${ch.name}, ${ch.from === ch.to ? 'age' : 'ages'} ${agesOf(ch, years)}`}
            tabIndex={i === ci ? 0 : -1}
            className={`wt__tab${i < ci ? ' wt__tab--done' : ''}`}
            data-testid={`wt-tab-${ch.key}`}
            onClick={() => go(i)}
          >
            {wide && <b className="wt__tab-name">{ch.name}</b>}
            <span className="wt__tab-ages">{agesOf(ch, years)}</span>
          </button>
        ))}
      </div>

      <div id="wt-panel" role="tabpanel" aria-labelledby={`wt-tab-${c.key}`} className="wt__panel">
        <div className="wt__chapter">
          <span className="wt__eyebrow" data-testid="wt-ages">
            Chapter {ci + 1} of {list.length} · {one ? 'age' : 'ages'} {ages}
          </span>
          <h3 className="wt__name" data-testid="wt-name">
            {c.name}
          </h3>
          <div className="wt__nav">
            {/* aria-disabled, not disabled, at the ends: a disabled button drops keyboard focus to the page. */}
            <button type="button" className="wt__btn" aria-label="Previous chapter" aria-disabled={ci === 0} data-testid="wt-prev" onClick={() => ci > 0 && go(ci - 1)}>
              ← Back
            </button>
            <button type="button" className="wt__btn" aria-disabled={ci === list.length - 1} data-testid="wt-next" onClick={() => ci < list.length - 1 && go(ci + 1)}>
              Next chapter →
            </button>
            <button type="button" className="wt__btn wt__btn--play" aria-pressed={playing} data-testid="wt-play" onClick={play}>
              {playing ? 'Pause' : '▶ Play story'}
            </button>
          </div>
        </div>

        <div className="wt__story" data-testid="wt-story">
          <StoryBlock who="income" name="Living on income" part={story.income} />
          <StoryBlock who="evelo" name="eVelo" part={story.evelo} />
        </div>

        <WalkthroughChart years={years} chapters={list} chapter={ci} year={year} onPickYear={pickYear} phone={!wide} />

        <TwinLedgers row={row} prev={year > 0 ? years[year - 1] : null} phone={!wide} />
      </div>
    </section>
  )
}

function StoryBlock({ who, name, part }: { who: 'income' | 'evelo'; name: string; part: StoryPart }) {
  return (
    <div className={`wt__part wt__part--${who}`} data-testid={`wt-story-${who}`}>
      <b className="wt__part-title">
        <small>{name}</small>
        {part.title}
      </b>
      <span className="wt__part-figure">{part.figure}</span>
      <p className="wt__part-text">{part.text}</p>
    </div>
  )
}
