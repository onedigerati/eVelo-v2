// The floating readout box the mode's charts show beside their crosshair, styled like eVelo's fan
// readout (glass card, age heading, keyed rows) in the mode's brass. It measures itself and is
// placed by readoutLeft(), so it stays inside the plot at either end and on a 390px phone.
//
// Usage: render inside the chart's `position: relative` plot, after the SVG.
//   <ChartReadout id={…} x={hx} width={width} top={m.t + 6} on={hi !== null}>
//     <ReadoutHead age={…} note="year 3" />
//     <ReadoutRow keyClass="ic__seg ic__seg--dividends" label="Dividends" value="$12,400" />
//   </ChartReadout>

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '../primitives'
import { readoutLeft } from './chartReadout'
import './chartReadout.css'

export interface ChartReadoutProps {
  /** For the chart's `aria-describedby`. */
  id: string
  /** The crosshair's x in the plot, px. */
  x: number
  /** The plot's width, px. */
  width: number
  /** Top edge, px from the plot's top. */
  top: number
  /** Shown (a hovered or focused index). */
  on: boolean
  children?: ReactNode
}

export function ChartReadout({ id, x, width, top, on, children }: ChartReadoutProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const w = el.offsetWidth
    if (Math.abs(w - box) >= 0.5) setBox(w)
  })
  const left = readoutLeft(x, width, box)
  return (
    <div
      ref={ref}
      id={id}
      className={cx('cread', on && 'is-on')}
      style={{ transform: `translate(${Math.round(left)}px, ${Math.round(top)}px)`, maxWidth: width > 0 ? width : undefined }}
      aria-live="polite"
      data-testid="chart-readout"
    >
      {on && children}
    </div>
  )
}

/** The readout's heading: "Age 67" with a faint note on the right. */
export function ReadoutHead({ age, note }: { age: number; note?: ReactNode }) {
  return (
    <div className="cread__age">
      Age <b>{age}</b>
      {note != null && <span>{note}</span>}
    </div>
  )
}

export interface ReadoutRowProps {
  /** Classes for the 10×10 key swatch (e.g. the chart's own segment class); none for no swatch. */
  keyClass?: string
  /** An SVG fill for the swatch (e.g. a hatch pattern url). */
  keyFill?: string
  label: ReactNode
  value: ReactNode
  /** Faint row (a secondary figure). */
  faint?: boolean
  /** Total row: a hairline above, bold label. */
  total?: boolean
}

export function ReadoutRow({ keyClass, keyFill, label, value, faint, total }: ReadoutRowProps) {
  return (
    <div className={cx('cread__row', faint && 'is-faint', total && 'is-total')}>
      {keyClass ? (
        <svg className="cread__key" width="10" height="10" aria-hidden="true">
          <rect width="10" height="10" rx="2" className={keyClass} fill={keyFill} />
        </svg>
      ) : (
        <span className="cread__key cread__key--none" aria-hidden="true" />
      )}
      <span className="cread__label">{label}</span>
      <b>{value}</b>
    </div>
  )
}
