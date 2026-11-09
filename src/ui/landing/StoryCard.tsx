import { memo, useId, useLayoutEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { BEATS, COPY, DEST, HOME, pct, type StoryCity } from './story'
import {
  frameCopy,
  frameGeometry,
  NARROW,
  REST_FRAME,
  sliceLabelLines,
  staticGeometry,
  WIDE,
  type StoryFrame,
  type StoryLayout,
} from './storyLayout'
import './storyCard.css'

/** Below this plot width the phone layout is drawn, so chart text stays at 11px or more. */
const NARROW_BELOW = 490

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const op = (v: number) => clamp(v).toFixed(3)
/** SVG presentation for a part faded by opacity: hidden outright at 0 so it leaves the rendering and accessibility trees. */
const fade = (v: number) => ({ opacity: op(v), visibility: v <= 0 ? ('hidden' as const) : undefined })
/** The same for HTML (the key): keeps its place in the layout but leaves the accessibility tree at 0. */
const fadeStyle = (v: number): CSSProperties => ({ opacity: clamp(v), visibility: v <= 0 ? 'hidden' : undefined })

export interface StoryCardProps {
  frame?: StoryFrame
  playing?: boolean
  /** Text for the card's aria-live region. */
  live?: string
  onTogglePlay?: () => void
  onReplay?: () => void
  /** The card's root element (playback watches it to play only while in view). */
  cardRef?: Ref<HTMLElement>
}

/**
 * The landing hero's story card (variation A): one illustrative plan told as Buy / Borrow / Live
 * anywhere / Die, St. Louis to Bangkok. A pure render of the model at a frame (storyTimeline.ts's
 * `frameAt(t)`); with no frame it draws the finished resting frame (the Die state). One SVG, the
 * wide or the phone layout by the plot's width, so chart text stays legible and only the visible
 * chart is drawn each frame.
 */
export const StoryCard = memo(function StoryCard({ frame = REST_FRAME, playing = false, live = '', onTogglePlay, onReplay, cardRef }: StoryCardProps) {
  const c = frameCopy(frame)
  const loanKey = frame.margin
  const plotRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<StoryLayout>(WIDE)
  useLayoutEffect(() => {
    const el = plotRef.current
    if (!el) return
    const pick = () => setLayout(el.clientWidth < NARROW_BELOW ? NARROW : WIDE)
    pick()
    const ro = new ResizeObserver(pick)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <figure className="story" ref={cardRef}>
      <div className="story__head">
        <div className="story__plan">
          <span className="landing__eyebrow">{COPY.eyebrow}</span>
          <span className="story__sub">{COPY.sub}</span>
        </div>
        <div className="story__odds" aria-hidden="true">
          <span className="story__odds-num" data-band={c.oddsBand}>
            {pct(c.odds)}
          </span>
          <span className="story__odds-unit">
            <OddsUnit city={c.oddsCity} />
          </span>
        </div>
      </div>

      <div className="story__plot" ref={plotRef}>
        <StoryChart layout={layout} frame={frame} />
      </div>

      <ul className="story__key" aria-label={COPY.keyLabel}>
        <li>
          <span className={`story__sw story__sw--gains${frame.stepUp > 0.5 ? ' is-stepped' : ''}`} aria-hidden="true" />
          <span>{c.gains}</span>
        </li>
        <li>
          <span className="story__sw story__sw--paid" aria-hidden="true" />
          <span>{COPY.key.paid}</span>
        </li>
        <li style={fadeStyle(loanKey)}>
          <span className="story__sw story__sw--loan" aria-hidden="true" />
          <span>{c.loan}</span>
        </li>
        <li style={fadeStyle(frame.move)}>
          <span className="story__sw story__sw--ghost" aria-hidden="true" />
          <span>{COPY.key.ghost}</span>
        </li>
        <li style={fadeStyle(loanKey)}>
          <span className="story__sw story__sw--margin" aria-hidden="true" />
          <span>{COPY.key.margin}</span>
        </li>
      </ul>

      {/* All four captions share one grid cell, so the card keeps the longest one's height and the
          steps below never jump; only the beat on show is visible (and named, and read). */}
      <figcaption className="story__cap">
        {BEATS.map((b) => {
          const on = b.id === frame.beat
          return (
            <span key={b.id} className="story__cap-beat" style={on ? undefined : { visibility: 'hidden' }} aria-hidden={on ? undefined : true}>
              <span className="story__cap-lead">{b.lead}</span>
              <span className="story__cap-detail">{b.detail}</span>
            </span>
          )
        })}
      </figcaption>

      <div className="story__foot">
        {onTogglePlay && onReplay && (
          <div className="story__ctrl" role="group" aria-label={COPY.controls.group}>
            <button type="button" className="story__btn" aria-label={playing ? COPY.controls.pause : COPY.controls.play} onClick={onTogglePlay}>
              {playing ? (
                <svg className="story__ic" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" />
                </svg>
              ) : (
                <svg className="story__ic" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5 3.5v9l7.5-4.5z" />
                </svg>
              )}
            </button>
            <button type="button" className="story__btn" aria-label={COPY.controls.replay} onClick={onReplay}>
              <svg className="story__ic story__ic--stroke" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.2 8a4.8 4.8 0 1 0 1.4-3.4" />
                <path d="M3 2.6v3h3" />
              </svg>
            </button>
          </div>
        )}
        <span>{COPY.note}</span>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </figure>
  )
})

/** "of futures hold in St. Louis", with the city name kept on one line. */
function OddsUnit({ city }: { city: StoryCity }) {
  const unit = COPY.oddsUnit(city)
  const i = unit.lastIndexOf(city.name)
  if (i < 0) return <>{unit}</>
  return (
    <>
      {unit.slice(0, i)}
      <span className="story__nowrap">{city.name}</span>
      {unit.slice(i + city.name.length)}
    </>
  )
}

/** The parts that never move, drawn once per layout. */
const StaticBack = memo(function StaticBack({ layout: L }: { layout: StoryLayout }) {
  const s = staticGeometry(L)
  return (
    <>
      <rect className="story__map-bg" x={L.map.x} y={L.map.y} width={L.map.w} height={L.map.h} rx="10" />
      <g className="story__map-dots">
        {s.dots.map((p) => (
          <circle key={`${p.x},${p.y}`} cx={p.x} cy={p.y} r="1.3" />
        ))}
      </g>
      <path className="story__arc-track" d={s.arc} />
    </>
  )
})

const StaticAxes = memo(function StaticAxes({ layout: L }: { layout: StoryLayout }) {
  const s = staticGeometry(L)
  return (
    <g>
      {s.yTicks.map((t) => (
        <g key={t.label}>
          <line className="story__grid" x1={s.gridX[0]} x2={s.gridX[1]} y1={t.y} y2={t.y} />
          <text className="story__t story__t--tick" x={L.tickX} y={t.y + 4} textAnchor="end">
            {t.label}
          </text>
        </g>
      ))}
      <line className="story__baseline" x1={s.baselineX[0]} x2={s.baselineX[1]} y1={L.YB} y2={L.YB} />
      {s.xTicks.map((t) => (
        <text key={t.label} className="story__t story__t--tick" x={t.x} y={L.xTickY} textAnchor={t.anchor}>
          {t.label}
        </text>
      ))}
    </g>
  )
})

function StoryChart({ layout: L, frame: f }: { layout: StoryLayout; frame: StoryFrame }) {
  const hatchId = `story-hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const s = staticGeometry(L)
  const g = frameGeometry(L, f)
  const { map } = L
  const homePin = COPY.pin(HOME)
  const destPin = COPY.pin(DEST)
  const loanOn = f.loanYears > 0 ? 1 : 0
  const sliceLines = sliceLabelLines(L)
  return (
    <svg className={`story__svg story__svg--${L.id}`} viewBox={`0 0 ${L.width} ${L.height}`} role="img" aria-label={COPY.svgLabel}>
      <defs>
        <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line className="story__hatch-line" x1="0" y1="0" x2="0" y2="5" />
        </pattern>
      </defs>

      {/* Map strip: home pin and spending chip, the flight, the destination pin and chip. */}
      <g className="story__map">
        <StaticBack layout={L} />
        <path className="story__arc" d={s.arc} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - f.flight} {...fade(f.flight)} />
        <g opacity={op(1 - 0.35 * f.move)}>
          <circle className="story__pin story__pin--home" cx={map.home.x} cy={map.home.y} r="5" />
          <text className="story__t story__t--pin" x={map.home.x} y={map.labelY} textAnchor="middle">
            {homePin.name} <tspan className="story__t--bruised">{homePin.odds}</tspan>
          </text>
          <g {...fade(f.homeChip)}>
            <circle className="story__coin" cx={map.home.x + map.homeCoin} cy={map.home.y} r="7" />
            <text className="story__t story__t--coin" x={map.home.x + map.homeCoin - 12} y={map.home.y + 4} textAnchor="end">
              {COPY.spendChip(HOME)}
            </text>
          </g>
        </g>
        <g opacity={op(0.35 + 0.65 * f.arrive)}>
          <circle className="story__pin story__pin--dest" cx={map.dest.x} cy={map.dest.y} r="5" />
          {f.pulse > 0 && f.pulse < 1 && <circle className="story__pulse" cx={map.dest.x} cy={map.dest.y} r={(6 + 10 * f.pulse).toFixed(1)} opacity={op((1 - f.pulse) * 0.8)} />}
          <text className="story__t story__t--pin" x={map.dest.x} y={map.labelY} textAnchor="middle">
            {destPin.name} <tspan className="story__t--holds">{destPin.odds}</tspan>
          </text>
          <g {...fade(f.destChip)}>
            <circle className="story__coin" cx={map.dest.x + map.destCoin} cy={map.dest.y} r="4.5" />
            <text className="story__t story__t--coin" x={map.dest.x + map.destCoin + 9} y={map.dest.y + 4}>
              {COPY.spendChip(DEST)}
            </text>
          </g>
        </g>
        {g.travel && <circle className="story__coin" cx={g.travel.x.toFixed(1)} cy={g.travel.y.toFixed(1)} r={g.travel.r.toFixed(2)} />}
      </g>

      <StaticAxes layout={L} />

      {/* Portfolio: what you paid, then the gains (hatched; plain once stepped up). */}
      <g opacity={op(1 - 0.55 * f.estate)}>
        {g.bars.map((b) =>
          b.paid.height <= 0 && b.gains.height <= 0 ? null : (
            <g key={b.k}>
              <rect className="story__bar-soft" {...b.gains} {...fade(1 - f.stepUp)} />
              <rect {...b.gains} fill={`url(#${hatchId})`} {...fade(1 - f.stepUp)} />
              <rect className="story__bar-stepped" {...b.gains} {...fade(f.stepUp)} />
              <rect className="story__bar-paid" {...b.paid} />
            </g>
          ),
        )}
      </g>

      {/* Loans and the margin-call line */}
      <path className="story__margin" d={s.margin} {...fade(0.9 * f.margin)} />
      {loanOn > 0 && <path className="story__loan-area" d={g.loanArea} />}
      <path className="story__ghost" d={s.ghost} {...fade(0.75 * f.move)} />
      {loanOn > 0 && <path className="story__loan" d={g.loan} />}
      {g.loanHead && <circle className="story__loan-head" cx={g.loanHead.x} cy={g.loanHead.y} r="3.5" {...fade(1 - f.estate)} />}

      {/* Borrow: each year's draw falls from the loan to the person walking under it. */}
      {g.coins.map((cn) => (
        <circle key={cn.k} className="story__coin" cx={cn.x} cy={cn.y} r={L.coinR} opacity={op(cn.opacity)} />
      ))}
      <g className="story__person" transform={`translate(${g.personX.toFixed(1)} ${L.personY})`} {...fade(f.person)}>
        <circle r="3.8" />
        <path d="M-6.5 17 C-6.5 8 6.5 8 6.5 17 Z" />
        <text className="story__t story__t--coin" x="10" y="13">
          {COPY.personChip}
        </text>
      </g>

      {/* Die: the estate column, the loan repaid off the top, the rest to heirs. */}
      <g {...fade(f.estate)}>
        <text className="story__t story__t--estate" x={s.estate.topLabel.x} y={s.estate.topLabel.y} textAnchor="middle">
          {COPY.estate.top}
        </text>
        <rect className="story__heirs-soft" {...s.estate.heirs} />
        <rect className="story__heirs" {...s.estate.heirs} {...fade(f.heirs)} />
        <rect className="story__slice-soft" {...g.slice} />
        <rect className="story__slice" {...g.slice} {...fade(f.slice)} />
        <g {...fade(f.sliceLabel)}>
          {sliceLines.map((text, i) => (
            <text
              key={i}
              className={`story__t ${i === sliceLines.length - 1 ? 'story__t--mono' : 'story__t--estate story__t--slice'}`}
              x={g.sliceLabel[i].x}
              y={g.sliceLabel[i].y}
              textAnchor="middle"
            >
              {text}
            </text>
          ))}
        </g>
        <g {...fade(f.heirs)}>
          <text className="story__t story__t--inv" x={s.estate.heirsLabel[0].x} y={s.estate.heirsLabel[0].y} textAnchor="middle">
            {COPY.estate.heirsLabel}
          </text>
          <text className="story__t story__t--inv story__t--inv-mono" x={s.estate.heirsLabel[1].x} y={s.estate.heirsLabel[1].y} textAnchor="middle">
            {COPY.estate.heirs}
          </text>
          <g className="story__glyph">
            <g transform={`translate(${s.estate.glyphs[0].x} ${s.estate.glyphs[0].y})`}>
              <circle r="3.4" />
              <path d="M-5.8 15 C-5.8 7 5.8 7 5.8 15 Z" />
            </g>
            <g transform={`translate(${s.estate.glyphs[1].x} ${s.estate.glyphs[1].y})`}>
              <circle r="2.8" />
              <path d="M-4.8 12 C-4.8 5.5 4.8 5.5 4.8 12 Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
