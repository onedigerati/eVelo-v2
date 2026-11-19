// The six questions, one sentence at a time, with the chart building beside (desktop) or above
// (phone) it. Enter or Next moves on; focus goes to the new sentence's first field.

import { useEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useIncomeStore } from '../../state/incomeState'
import { IncomeField } from './IncomeField'
import { cityGroups, layersFor, muniHint, recapLine, STEPS } from './incomeFlow'
import { ChartPanel, type FigureStatus } from './ChartPanel'
import type { IncomeComputed } from './incomeClient'

const GROUPS = cityGroups()

export interface IncomeAskProps {
  step: number
  /** The latest result with the answers it was worked out for. */
  computed: IncomeComputed | null
  busy: boolean
  status: FigureStatus
  wide: boolean
  /** Focus the first field on mount too (after "Edit answers"). */
  focusOnMount?: boolean
}

export function IncomeAsk({ step, computed, busy, status, wide, focusOnMount = false }: IncomeAskProps) {
  const inputs = useIncomeStore((s) => s.inputs)
  const setInputs = useIncomeStore((s) => s.setInputs)
  const setFlow = useIncomeStore((s) => s.setFlow)
  const first = useRef<HTMLInputElement & HTMLSelectElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const mounted = useRef(false)

  // Focus the new sentence's first field on every step change (not on a fresh load).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      if (!focusOnMount) return
    }
    first.current?.focus()
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    const bad = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (bad) {
      bad.focus()
      return
    }
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    if (step >= STEPS) setFlow({ done: true })
    else setFlow({ step: step + 1 })
  }
  const back = () => setFlow({ step: step - 1 })
  // Pressing a button mustn't blur the field first: leaving it reformats the value ("70" → "70%"),
  // which can rewrap the sentence and move the button out from under the pointer before the click.
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault()
  // Enter on a select moves on too, as it does in a text field.
  const enterOnSelect = (e: KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter') next(e as unknown as FormEvent)
  }

  const s = (step: number): { sentence: ReactNode; hint: string } => {
    switch (step) {
      case 1:
        return {
          sentence: (
            <>
              I have <IncomeField k="portfolio" label="Saved, in dollars" inputRef={first} /> saved, about{' '}
              <IncomeField k="basisFraction" label="Share of it that is what you paid (cost basis), percent" /> of it what I paid, and I’d like{' '}
              <IncomeField k="spending" label="Spending a year after tax, in dollars" /> a year to live on.
            </>
          ),
          hint: 'Type amounts any way you like: 2.4M, $96,000 or 96k. Spending is after tax, in today’s dollars.',
        }
      case 2:
        return {
          sentence: (
            <>
              I’m <IncomeField k="age" label="Your age" inputRef={first} />, and I want it to last{' '}
              <IncomeField k="horizonYears" label="Years it should last" /> years.
            </>
          ),
          hint: 'The money has to meet your spending in every one of these years.',
        }
      case 3:
        return {
          sentence: (
            <>
              I keep <IncomeField k="stockShare" label="Share in stocks, percent" inputRef={first} /> in stocks; the rest is in bonds.
            </>
          ),
          hint: 'Stocks here are the S&P 500. Their dividends are the first layer of income.',
        }
      case 4:
        return {
          sentence: (
            <>
              Of my bonds, I’d hold <IncomeField k="muniShare" label="Share of bonds in munis, percent" inputRef={first} /> in munis.
            </>
          ),
          hint: muniHint(computed?.result.startYield ?? null),
        }
      case 5:
        return {
          sentence: (
            <>
              I live in{' '}
              <span className="ifield">
                <label htmlFor="if-home" className="sr-only">
                  Home city
                </label>
                <select
                  id="if-home"
                  ref={first}
                  className="ifield__select"
                  value={inputs.homeCityId}
                  onChange={(e) => setInputs({ homeCityId: e.currentTarget.value })}
                  onKeyDown={enterOnSelect}
                >
                  {GROUPS.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </span>{' '}
              and file{' '}
              <span className="ifield">
                <label htmlFor="if-filing" className="sr-only">
                  Filing status
                </label>
                <select
                  id="if-filing"
                  className="ifield__select"
                  value={inputs.filingStatus}
                  onChange={(e) => setInputs({ filingStatus: e.currentTarget.value as 'single' | 'mfj' })}
                  onKeyDown={enterOnSelect}
                >
                  <option value="single">single</option>
                  <option value="mfj">jointly</option>
                </select>
              </span>
              .
            </>
          ),
          hint: 'Tax follows your home: federal plus the city’s state and local tax. A city outside the US is taxed federally only.',
        }
      default:
        return {
          sentence: (
            <>
              Social Security pays <IncomeField k="otherIncome" label="Social Security a year, in dollars" inputRef={first} /> a year from age{' '}
              <IncomeField k="incomeStartAge" label="Age Social Security starts" />.
            </>
          ),
          hint: 'In today’s dollars. Put $0 to leave it out.',
        }
    }
  }

  const q = s(step)
  const recap = recapLine(step, inputs)
  const layers = layersFor(step, false)

  return (
    <div className={wide ? 'iask iask--split' : 'iask iask--phone'}>
      <section className="iask__ask" aria-labelledby="iask-q">
        {recap && <p className="iask__recap">{recap}</p>}
        <form ref={formRef} className="iask__form" onSubmit={next} noValidate>
          <h2 id="iask-q" className="sr-only">
            Question {step} of {STEPS}
          </h2>
          <p key={step} className="iask__sentence">
            {q.sentence}
          </p>
          <p className="iask__hint">{q.hint}</p>
          <div className="iask__nav">
            {step > 1 && (
              <button type="button" className="iask__back" onMouseDown={keepFocus} onClick={back}>
                Back
              </button>
            )}
            <button type="submit" className="iask__next" onMouseDown={keepFocus}>
              {step >= STEPS ? 'See the answer' : 'Next'}
            </button>
          </div>
        </form>
      </section>
      <ChartPanel computed={computed} busy={busy} status={status} layers={layers} variant={wide ? 'ask' : 'phone-ask'} justAdded />
    </div>
  )
}
