import { memo, useId } from 'react'
import { COPY, DEST, HOME, pct } from './story'
import { chartGeometry, frameCopy, mapDots, NARROW, REST_FRAME, WIDE, type StoryFrame, type StoryLayout } from './storyLayout'
import './storyCard.css'

/**
 * The landing hero's story card (variation A): one illustrative plan told as Buy / Borrow / Live
 * anywhere / Die, St. Louis to Bangkok. A pure render of the model in story.ts at a frame; with no
 * frame it draws the finished resting frame (the Die state). Two SVGs, one per layout: CSS shows
 * the wide one on a wide card and the narrow one on a phone-width card, so chart text stays legible.
 */
export const StoryCard = memo(function StoryCard({ frame = REST_FRAME }: { frame?: StoryFrame }) {
  const c = frameCopy(frame)
  const keyOn = (v: number) => ({ opacity: Math.min(1, Math.max(0, v)) })
  const loanShown = frame.loanYears > 0 ? 1 : 0
  return (
    <figure className="story">
      <div className="story__head">
        <div className="story__plan">
          <span className="landing__eyebrow">{COPY.eyebrow}</span>
          <span className="story__sub">{COPY.sub}</span>
        </div>
        <div className="story__odds" aria-hidden="true">
          <span className={`story__odds-num${c.odds < 75 ? ' is-mid' : ''}`}>{pct(c.odds)}</span>
          <span className="story__odds-unit">{COPY.oddsUnit(c.oddsCity)}</span>
        </div>
      </div>

      <div className="story__plot">
        <StoryChart layout={WIDE} frame={frame} />
        <StoryChart layout={NARROW} frame={frame} />
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
        <li style={keyOn(loanShown)}>
          <span className="story__sw story__sw--loan" aria-hidden="true" />
          <span>{c.loan}</span>
        </li>
        <li style={keyOn(frame.move)}>
          <span className="story__sw story__sw--ghost" aria-hidden="true" />
          <span>{COPY.key.ghost}</span>
        </li>
        <li style={keyOn(loanShown)}>
          <span className="story__sw story__sw--margin" aria-hidden="true" />
          <span>{COPY.key.margin}</span>
        </li>
      </ul>

      <figcaption className="story__cap">
        <span className="story__cap-lead">{c.lead}</span>
        <span className="story__cap-detail">{c.detail}</span>
      </figcaption>

      <div className="story__foot">
        <span>{COPY.note}</span>
      </div>
    </figure>
  )
})

function StoryChart({ layout: L, frame: f }: { layout: StoryLayout; frame: StoryFrame }) {
  const hatchId = `story-hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const g = chartGeometry(L, f)
  const { map } = L
  const homePin = COPY.pin(HOME)
  const destPin = COPY.pin(DEST)
  const op = (v: number) => Math.min(1, Math.max(0, v)).toFixed(3)
  const loanOn = f.loanYears > 0 ? 1 : 0
  return (
    <svg
      className={`story__svg story__svg--${L.id}`}
      viewBox={`0 0 ${L.width} ${L.height}`}
      role="img"
      aria-label={COPY.svgLabel}
    >
      <defs>
        <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line className="story__hatch-line" x1="0" y1="0" x2="0" y2="5" />
        </pattern>
      </defs>

      {/* Map strip: home pin and spending chip, the flight, the destination pin and chip. */}
      <g className="story__map">
        <rect className="story__map-bg" x={map.x} y={map.y} width={map.w} height={map.h} rx="10" />
        <g className="story__map-dots">
          {mapDots(L).map((p) => (
            <circle key={`${p.x},${p.y}`} cx={p.x} cy={p.y} r="1.3" />
          ))}
        </g>
        <path className="story__arc-track" d={g.arc} />
        <path className="story__arc" d={g.arc} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - f.flight} opacity={f.flight > 0 ? 1 : 0} />
        <g opacity={op(1 - 0.35 * f.move)}>
          <circle className="story__pin story__pin--home" cx={map.home.x} cy={map.home.y} r="5" />
          <text className="story__t story__t--pin" x={map.home.x} y={map.labelY} textAnchor="middle">
            {homePin.name} <tspan className="story__t--bruised">{homePin.odds}</tspan>
          </text>
          <g opacity={op(loanOn * (1 - 0.5 * f.flight))}>
            <circle className="story__coin" cx={map.home.x + map.homeCoin} cy={map.home.y} r="7" />
            <text className="story__t story__t--coin" x={map.home.x + map.homeCoin - 12} y={map.home.y + 4} textAnchor="end">
              {COPY.spendChip(HOME)}
            </text>
          </g>
        </g>
        <g opacity={op(0.35 + 0.65 * f.move)}>
          <circle className="story__pin story__pin--dest" cx={map.dest.x} cy={map.dest.y} r="5" />
          <text className="story__t story__t--pin" x={map.dest.x} y={map.labelY} textAnchor="middle">
            {destPin.name} <tspan className="story__t--holds">{destPin.odds}</tspan>
          </text>
          <g opacity={op(f.move)}>
            <circle className="story__coin" cx={map.dest.x + map.destCoin} cy={map.dest.y} r="4.5" />
            <text className="story__t story__t--coin" x={map.dest.x + map.destCoin + 9} y={map.dest.y + 4}>
              {COPY.spendChip(DEST)}
            </text>
          </g>
        </g>
      </g>

      {/* Axes */}
      <g>
        {g.yTicks.map((t) => (
          <g key={t.label}>
            <line className="story__grid" x1={g.gridX[0]} x2={g.gridX[1]} y1={t.y} y2={t.y} />
            <text className="story__t story__t--tick" x={L.tickX} y={t.y + 4} textAnchor="end">
              {t.label}
            </text>
          </g>
        ))}
        <line className="story__baseline" x1={g.baselineX[0]} x2={g.baselineX[1]} y1={L.YB} y2={L.YB} />
        {g.xTicks.map((t) => (
          <text key={t.label} className="story__t story__t--tick" x={t.x} y={L.xTickY} textAnchor={t.anchor}>
            {t.label}
          </text>
        ))}
      </g>

      {/* Portfolio: what you paid, then the gains (hatched; plain once stepped up). */}
      <g opacity={op(1 - 0.55 * f.estate)}>
        {g.bars.map((b) => (
          <g key={b.k}>
            <rect className="story__bar-soft" {...b.gains} opacity={op(1 - f.stepUp)} />
            <rect {...b.gains} fill={`url(#${hatchId})`} opacity={op(1 - f.stepUp)} />
            <rect className="story__bar-stepped" {...b.gains} opacity={op(f.stepUp)} />
            <rect className="story__bar-paid" {...b.paid} />
          </g>
        ))}
      </g>

      {/* Loans and the margin-call line */}
      <path className="story__margin" d={g.margin} opacity={0.9 * loanOn} />
      <path className="story__loan-area" d={g.loanArea} />
      <path className="story__ghost" d={g.ghost} opacity={op(0.75 * f.move)} />
      <path className="story__loan" d={g.loan} />
      {g.loanHead && <circle className="story__loan-head" cx={g.loanHead.x} cy={g.loanHead.y} r="3.5" opacity={op(1 - f.estate)} />}

      {/* Die: the estate column, the loan repaid off the top, the rest to heirs. */}
      <g opacity={op(f.estate)}>
        <text className="story__t story__t--estate" x={g.estate.topLabel.x} y={g.estate.topLabel.y} textAnchor="middle">
          {COPY.estate.top}
        </text>
        <rect className="story__heirs-soft" {...g.estate.heirs} />
        <rect className="story__heirs" {...g.estate.heirs} opacity={op(f.heirs)} />
        <rect className="story__slice-soft" {...g.estate.slice} />
        <rect className="story__slice" {...g.estate.slice} opacity={op(f.slice)} />
        <g opacity={op(f.slice)}>
          <text className="story__t story__t--estate story__t--slice" x={g.estate.sliceLabel[0].x} y={g.estate.sliceLabel[0].y} textAnchor="middle">
            {COPY.estate.loanLabel}
          </text>
          <text className="story__t story__t--mono" x={g.estate.sliceLabel[1].x} y={g.estate.sliceLabel[1].y} textAnchor="middle">
            {COPY.estate.loan}
          </text>
        </g>
        <g opacity={op(f.heirs)}>
          <text className="story__t story__t--inv" x={g.estate.heirsLabel[0].x} y={g.estate.heirsLabel[0].y} textAnchor="middle">
            {COPY.estate.heirsLabel}
          </text>
          <text className="story__t story__t--inv story__t--inv-mono" x={g.estate.heirsLabel[1].x} y={g.estate.heirsLabel[1].y} textAnchor="middle">
            {COPY.estate.heirs}
          </text>
          <g className="story__glyph">
            <g transform={`translate(${g.estate.glyphs[0].x} ${g.estate.glyphs[0].y})`}>
              <circle r="3.4" />
              <path d="M-5.8 15 C-5.8 7 5.8 7 5.8 15 Z" />
            </g>
            <g transform={`translate(${g.estate.glyphs[1].x} ${g.estate.glyphs[1].y})`}>
              <circle r="2.8" />
              <path d="M-4.8 12 C-4.8 5.5 4.8 5.5 4.8 12 Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
