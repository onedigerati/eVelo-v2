// The layered income chart: the engine's median income by year as stacked bars that build one layer
// per answered question (geometry and encodings in incomeChart.ts). Layers grow in with CSS
// transitions on the bars' y/height, which reduced motion turns off (incomeChart.css). Hover, tap
// or arrow keys pick a year: its bar stays full strength, the rest dim, and a readout shows its
// figures (not on the small phone chart while asking).

import { scaleLinear } from 'd3-scale'
import { useId } from 'react'
import type { IncomeYearRow } from '../../engine/incomeTypes'
import { currency, currencyCompact } from '../format'
import { moneyTick, useCrosshair, useSize } from '../outlook/chartKit'
import { cx } from '../primitives'
import { ChartReadout, ReadoutHead, ReadoutRow } from './ChartReadout'
import { ageTicks, bandIndexAt, bandX, chartSummary, justAddedLine, MEDIAN_NOTE, readoutRows, stackRows, taxableOf, yMaxFor, type IncomeLayers, type Span } from './incomeChart'
import './incomeChart.css'

export type IncomeChartVariant = 'ask' | 'results' | 'phone-ask' | 'phone-results'

export interface IncomeChartProps {
  rows: IncomeYearRow[]
  layers: IncomeLayers
  spending: number
  variant: IncomeChartVariant
  /** Show the "Just added: …" line for the newest layer under the chart. */
  justAdded?: boolean
}

const SEGMENTS = [
  ['dividends', 'Dividends'],
  ['muni', 'Muni coupons'],
  ['taxable', 'Taxable interest'],
  ['social', 'Social Security'],
  ['gap', 'Sold to cover'],
  ['tax', 'Tax'],
] as const

/** Which layer turns each segment on. */
const LAYER_OF: Record<(typeof SEGMENTS)[number][0], number> = { dividends: 1, muni: 2, taxable: 2, social: 4, gap: 4, tax: 3 }

/** Readout money to the nearest $100, as the year-by-year ledger writes it. */
const money = (v: number) => currency(Math.round(v / 100) * 100)

/** The readout's swatch for a row: the bar's own segment; none for spending and reinvested. */
const KEY_OF: Record<string, string | undefined> = { dividends: 'dividends', muni: 'muni', taxable: 'taxable', social: 'social', tax: 'tax', gap: 'gap' }

export function IncomeChart({ rows, layers, spending, variant, justAdded }: IncomeChartProps) {
  const uid = useId().replace(/:/g, '')
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const phone = variant === 'phone-ask' || variant === 'phone-results'
  const results = variant === 'results' || variant === 'phone-results'

  const height =
    variant === 'phone-ask' ? 150 : variant === 'phone-results' ? 170 : variant === 'ask' ? Math.round(Math.min(420, Math.max(260, width * 0.62))) : Math.round(Math.min(360, Math.max(240, width * 0.3)))
  // Desktop y labels sit in a right gutter, clear of the bars.
  const m = { t: phone ? 6 : 24, r: phone ? 0 : 40, b: 24, l: 0 }
  const iw = Math.max(10, width - m.l - m.r)
  const ih = height - m.t - m.b

  const yMax = yMaxFor(rows, spending)
  const y = scaleLinear().domain([0, yMax]).range([m.t + ih, m.t])
  const x = bandX(rows, m.l, iw, rows.length > 40 ? 0.1 : phone ? 0.12 : 0.18)
  const stacks = stackRows(rows, layers)
  const showSpend = layers >= 4
  const spendY = Math.round(y(spending)) + 0.5
  const yTicks = phone ? [] : y.ticks(4).filter((v) => v > 0)
  const xTicks = phone ? (rows.length ? [rows[0].age, rows[rows.length - 1].age] : []) : ageTicks(rows, rows.length > 24 ? 10 : 5)
  const summary = chartSummary(rows, layers, spending)
  const added = justAdded ? justAddedLine(rows, layers) : ''
  const hasSocial = rows.some((r) => r.otherIncome > 0)
  // The year readout: everywhere but the 150px phone chart while asking.
  const interactive = variant !== 'phone-ask' && layers >= 1 && rows.length > 0
  const ch = useCrosshair(rows.length, (clientX, r) => bandIndexAt(clientX - r.left, rows.length, m.l, x.step(), x.bandwidth()))
  const hi = interactive && ch.index !== null && ch.index < rows.length ? ch.index : null
  const hx = hi !== null ? (x(rows[hi].age) ?? 0) + x.bandwidth() / 2 : 0
  const rect = (s: Span) => {
    const y0 = y(s[0])
    const y1 = y(s[1])
    return { y: y1, height: Math.max(0, y0 - y1) }
  }

  return (
    <figure className={cx('ic', `ic--${variant}`)}>
      <div className="ic__plot" ref={wrap} style={{ height }}>
        {width > 0 && (
          <svg
            className="ic__svg"
            width={width}
            height={height}
            role="img"
            aria-label={summary}
            {...(interactive ? { tabIndex: 0, 'aria-describedby': `${uid}-read`, ...ch.handlers } : {})}
          >
            <defs>
              <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" className="ic__hatch-bg" />
                <line x1="0" y1="0" x2="0" y2="6" className="ic__hatch-line" />
              </pattern>
            </defs>

            <g className="ic__grid" aria-hidden="true">
              {yTicks.map((v) => (
                <line key={v} x1={m.l} x2={m.l + iw} y1={Math.round(y(v)) + 0.5} y2={Math.round(y(v)) + 0.5} />
              ))}
            </g>

            <g className={cx('ic__bars', hi !== null && 'is-hovering')}>
              {stacks.map((s, i) => {
                const bx = x(s.age) ?? 0
                const bw = x.bandwidth()
                return (
                  <g key={s.age} transform={`translate(${bx},0)`} className={cx('ic__bar', i === hi && 'is-active')}>
                    {SEGMENTS.map(([k]) => (
                      <rect
                        key={k}
                        className={cx('ic__seg', `ic__seg--${k}`, layers === LAYER_OF[k] && justAdded && 'is-new')}
                        width={bw}
                        {...rect(s[k])}
                        fill={k === 'tax' ? `url(#${uid}-hatch)` : undefined}
                      />
                    ))}
                  </g>
                )
              })}
            </g>

            {/* the spending line: a faint placeholder while asking, the real line from layer 4 */}
            {spending > 0 && (showSpend || variant === 'ask') && (
              <g className={cx('ic__spend', !showSpend && 'is-ghost')} aria-hidden="true">
                <line x1={m.l} x2={m.l + iw} y1={spendY} y2={spendY} />
                {!phone && (
                  <text x={showSpend ? m.l : m.l + iw} y={spendY - 7} textAnchor={showSpend ? 'start' : 'end'} className="ic__spend-label">
                    {showSpend ? `${currencyCompact(spending)} a year, today's dollars` : 'spending appears at question 6'}
                  </text>
                )}
              </g>
            )}

            <g aria-hidden="true">
              {yTicks.map((v) => (
                <text key={v} x={width} y={Math.round(y(v)) + 4} textAnchor="end" className="ic__tick">
                  {moneyTick(v)}
                </text>
              ))}
            </g>

            <g transform={`translate(0, ${m.t + ih})`} aria-hidden="true">
              <line x1={m.l} x2={m.l + iw} className="ic__axis" />
              {xTicks.map((a, i) => (
                <text
                  key={a}
                  x={(x(a) ?? 0) + x.bandwidth() / 2}
                  y={17}
                  textAnchor={i === 0 ? 'start' : a === rows[rows.length - 1]?.age && phone ? 'end' : 'middle'}
                  dx={i === 0 ? -x.bandwidth() / 2 : a === rows[rows.length - 1]?.age && phone ? x.bandwidth() / 2 : 0}
                  className="ic__tick"
                >
                  {i === 0 ? `age ${a}` : a}
                </text>
              ))}
            </g>
          </svg>
        )}
        {interactive && width > 0 && (
          <ChartReadout id={`${uid}-read`} x={hx} width={width} top={m.t + 6} on={hi !== null}>
            {hi !== null && (
              <>
                <ReadoutHead age={rows[hi].age} note={`year ${rows[hi].year}`} />
                {readoutRows(rows[hi], layers, hasSocial).map((l) => {
                  const k = KEY_OF[l.key]
                  return (
                    <ReadoutRow
                      key={l.key}
                      keyClass={k ? cx('ic__seg', `ic__seg--${k}`) : undefined}
                      keyFill={k === 'tax' ? `url(#${uid}-hatch)` : undefined}
                      label={l.label}
                      value={money(l.value)}
                      total={l.key === 'spending'}
                    />
                  )
                })}
              </>
            )}
          </ChartReadout>
        )}
      </div>

      {results && layers >= 1 && (
        <ul className="ic__legend" aria-hidden="true">
          {SEGMENTS.filter(([k]) => layers >= LAYER_OF[k] && (k !== 'social' || hasSocial)).map(([k, label]) => (
            <li key={k}>
              <svg className="ic__key" width="10" height="10" aria-hidden="true">
                <rect width="10" height="10" rx="2" className={cx('ic__seg', `ic__seg--${k}`)} fill={k === 'tax' ? `url(#${uid}-hatch)` : undefined} />
              </svg>
              {label}
            </li>
          ))}
          {layers >= 4 && spending > 0 && (
            <li>
              <span className="ic__key ic__key--line" aria-hidden="true" />
              Spending
            </li>
          )}
        </ul>
      )}
      {results && layers >= 4 && (
        <p className="ic__note" aria-hidden="true">
          {MEDIAN_NOTE}
        </p>
      )}

      {added && (
        <figcaption className="ic__added" aria-live="polite">
          {added}
        </figcaption>
      )}

      <div className="sr-only">
      <table>
        <caption>Median income by year, today's dollars. {MEDIAN_NOTE}</caption>
        <thead>
          <tr>
            <th scope="col">Age</th>
            {layers >= 1 && <th scope="col">Dividends</th>}
            {layers >= 2 && <th scope="col">Muni coupons</th>}
            {layers >= 2 && <th scope="col">Taxable interest</th>}
            {layers >= 4 && hasSocial && <th scope="col">Social Security</th>}
            {layers >= 3 && <th scope="col">Tax</th>}
            {layers >= 4 && <th scope="col">Sold to cover</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.age}>
              <th scope="row">{r.age}</th>
              {layers >= 1 && <td>{currency(r.dividends)}</td>}
              {layers >= 2 && <td>{currency(r.muniInterest)}</td>}
              {layers >= 2 && <td>{currency(taxableOf(r))}</td>}
              {layers >= 4 && hasSocial && <td>{currency(r.otherIncome)}</td>}
              {layers >= 3 && <td>{currency(stacks[i].tax[1] - stacks[i].tax[0])}</td>}
              {layers >= 4 && <td>{currency(r.gapSold)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  )
}
