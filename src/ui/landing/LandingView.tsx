import { memo, useState, type MouseEvent } from 'react'
import { hrefFor } from '../../state/router'
import type { Breakpoint } from '../hooks'
import { ThemeCycleButton, ThemeToggle } from '../shell/ThemeToggle'
import { Wordmark } from '../shell/TopBar'
import { AUSTIN, CITIES, FAN, FAN_H, FAN_W, LISBON, MAP_LABELS, MAP_VIEWBOX, MERIDIANS, PARALLELS, PHONE_LABELS, type MapLabel } from './atlasCard'
import { StepButtons } from './StepButtons'
import { COPY, type BeatId } from './story'
import './landing.css'

const STEPS_ID = 'how'

/**
 * Scroll to the steps without touching the hash: `#how` would be read by the router as an unknown
 * route. Jumps (no smooth scroll) when the visitor prefers reduced motion; focus follows.
 */
function scrollToSteps(e: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(STEPS_ID)
  if (!target) return
  e.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

/**
 * The landing page (`#home`), study G "The Atlas is the chart". Full-bleed, with its own header in
 * place of the app's top bar: the hero copy beside a map card (one illustrative plan's odds city by
 * city, Lisbon highlighted with its fan chart), then the four steps. Colours are theme tokens
 * (landing.css), so the site theme and the landing's toggle restyle it live.
 */
export function LandingView({ bp }: { bp: Breakpoint }) {
  // The beat the story card shows; rests on 'die' (the finished frame). Stage 2 drives it from the timeline.
  const [beat, setBeat] = useState<BeatId>('die')
  return (
    <div className={`landing landing--${bp}`}>
      <div className="landing__frame">
        <header className="landing__header">
          <Wordmark />
          <nav className="landing__nav" aria-label="Primary">
            <a href={`#${STEPS_ID}`} onClick={scrollToSteps}>
              How it works
            </a>
            <a href={hrefFor('atlas')}>Atlas</a>
            <a href={hrefFor('method')}>Method</a>
          </nav>
          <div className="landing__actions">
            {bp === 'desktop' ? <ThemeToggle /> : <ThemeCycleButton />}
            <a href={hrefFor('plan')} className="landing__open">
              Open the planner
            </a>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="landing__main">
          <section className="landing__hero" aria-labelledby="landing-title">
            <div className="landing__copy">
              <p className="landing__eyebrow">Buy · Borrow · Die — anywhere in the world</p>
              <h1 id="landing-title" className="landing__headline">
                Live off your portfolio <em>without ever selling it.</em>
              </h1>
              <p className="landing__body">
                Borrow against your shares for living money, let them keep compounding, and pass them on with the
                gains never taxed. eVelo replays your plan through thousands of real market histories, then
                re-prices it city by city to show where in the world it holds best.
              </p>
              <div className="landing__ctas">
                <a href={hrefFor('plan')} className="landing__cta landing__cta--primary">
                  Stress-test my plan
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <a href={hrefFor('atlas')} className="landing__cta landing__cta--ghost">
                  Explore the Atlas
                </a>
              </div>
              <p className="landing__fine">Free · No sign-up · Runs in your browser, nothing leaves your device</p>
            </div>
            <AtlasCard />
          </section>

          <section id={STEPS_ID} tabIndex={-1} className="landing__steps" aria-label={COPY.stepsLabel}>
            <StepButtons active={beat} onSelect={setBeat} />
          </section>
        </main>
      </div>
    </div>
  )
}

/** The map card. Static (data computed once in atlasCard.ts), so it never re-renders. */
const AtlasCard = memo(function AtlasCard() {
  const clipId = 'landing-fan-clip'
  const { x, y, width, height } = MAP_VIEWBOX
  return (
    <figure className="landing__card">
      <div className="landing__card-head">
        <span className="landing__eyebrow">One plan · every city</span>
        <span className="landing__card-plan">$2.5M · $80k/yr in Austin</span>
      </div>
      <svg
        className="landing__map"
        viewBox={`${x} ${y} ${width} ${height}`}
        role="img"
        aria-label="Map of cities coloured by how often the same illustrative plan holds there; Lisbon is highlighted at 88 percent"
      >
        <g className="landing__grid">
          {MERIDIANS.map((m) => (
            <line key={`m${m}`} x1={m} y1={y} x2={m} y2={y + height} />
          ))}
          {PARALLELS.map((p) => (
            <line key={`p${p}`} x1={x} y1={p} x2={x + width} y2={p} />
          ))}
        </g>
        <circle className="landing__pulse" cx={LISBON.x} cy={LISBON.y} r="9" />
        {CITIES.map((c) => (
          <circle key={c.name} className={`landing__dot landing__dot--${c.band}`} cx={c.x} cy={c.y} r={c.r} />
        ))}
        {/* Two label sets; CSS shows one: all six as drawn, or the narrow-card set (larger type). */}
        <MapLabels labels={MAP_LABELS} variant="wide" />
        <MapLabels labels={PHONE_LABELS} variant="narrow" />
      </svg>
      <div className="landing__read">
        <div className="landing__read-text">
          <span className="landing__eyebrow">Lisbon, Portugal</span>
          <span className="landing__read-pct">
            {LISBON.pct}% <span className="landing__read-unit">of futures hold</span>
          </span>
          <span className="landing__read-note">
            vs {AUSTIN.pct}% staying in Austin. The same life costs about 38% less, so you borrow less.
          </span>
        </div>
        <svg
          className="landing__fan"
          viewBox={`0 0 ${FAN_W} ${FAN_H}`}
          role="img"
          aria-label="Lisbon fan chart: the portfolio stays well above the loan and the margin-call line"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={FAN_W} height={FAN_H} />
            </clipPath>
          </defs>
          <line className="landing__fan-base" x1="0" y1={FAN_H} x2={FAN_W} y2={FAN_H} />
          <g clipPath={`url(#${clipId})`}>
            <path className="landing__fan-band1" d={FAN.band1} />
            <path className="landing__fan-band2" d={FAN.band2} />
            <path className="landing__fan-median" d={FAN.median} />
            <path className="landing__fan-margin" d={FAN.margin} />
            <path className="landing__fan-loan" d={FAN.loan} />
          </g>
        </svg>
      </div>
      <div className="landing__card-foot">
        <span className="landing__key">
          Breaks <span className="landing__ramp" aria-hidden="true" /> Holds
        </span>
        <span>Illustrative numbers</span>
      </div>
    </figure>
  )
})

function MapLabels({ labels, variant }: { labels: readonly MapLabel[]; variant: 'wide' | 'narrow' }) {
  return (
    <g className={`landing__labels landing__labels--${variant}`}>
      {labels.map((l) => (
        <text key={l.name} className="landing__label" x={l.x} y={l.y} textAnchor={l.anchor}>
          {l.name} <tspan className={`landing__label-pct landing__label-pct--${l.band}`}>{l.pct}%</tspan>
        </text>
      ))}
    </g>
  )
}
