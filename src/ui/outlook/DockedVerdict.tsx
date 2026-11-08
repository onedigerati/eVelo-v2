import { AnimatePresence, m as motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { selectSuccess, useStore } from '../../state/store'
import { useBreakpoint } from '../hooks'
import { IconArrowRight } from '../icons'
import { ease } from '../motion'
import { outcomeTextColor } from '../outcomeScale'
import { AnimatedNumber, cx } from '../primitives'
import { PillRing } from '../shell/PillRing'
import { deltaLabel, usePillDelta } from '../shell/pillDelta'
import { toneFor } from '../verdict'

/** Ids VerdictHero puts on its headline (focus target) and its number (what the observer watches). */
export const VERDICT_HEADLINE_ID = 'verdict-h'
export const VERDICT_NUMBER_ID = 'verdict-number'

/** Every chart's plot (the box its crosshair and readout live in). */
const PLOT = '.chart-frame__plot'

/** Bottom edge of the sticky top bar in viewport px (top bar height + safe area), kept current on resize. */
function useTopBarBottom(): number {
  const [bottom, setBottom] = useState(64)
  useEffect(() => {
    const measure = () => setBottom(document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return bottom
}

/** True once the element has scrolled up behind the top bar; false while any of it shows below the bar. */
function useScrolledPast(id: string, topBar: number, enabled: boolean): boolean {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const el = enabled ? document.getElementById(id) : null
    if (!el) return setPast(false)
    const io = new IntersectionObserver(
      ([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? topBar)),
      { rootMargin: `${-Math.round(topBar)}px 0px 0px 0px` },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [id, topBar, enabled])
  return past
}

/**
 * True while the pointer is over, or keyboard focus is in, a chart plot that reaches into the
 * band the pill covers. Chart readouts sit inside their card (not portalled), so they can't be
 * layered above a sticky pill; the pill steps aside instead. The crosshair spans the whole plot
 * height, so any plot overlapping the band counts.
 */
function useChartYield(band: () => { top: number; bottom: number }, enabled: boolean): boolean {
  const [yieldTo, setYield] = useState(false)
  useEffect(() => {
    if (!enabled) return setYield(false)
    let hovered: Element | null = null
    let focused: Element | null = null
    let px = -1
    let py = -1
    const under = (el: Element | null) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const b = band()
      return r.top < b.bottom && r.bottom > b.top
    }
    const update = () => setYield(under(hovered) || under(focused))
    const plotOf = (t: EventTarget | null) => (t instanceof Element ? t.closest(PLOT) : null)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      px = e.clientX
      py = e.clientY
      hovered = plotOf(e.target)
      update()
    }
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) (hovered = null), update()
    }
    // Wheel scrolling moves the charts under a still pointer; re-hit-test from its last position.
    const onScroll = () => {
      if (px >= 0) hovered = plotOf(document.elementFromPoint(px, py))
      update()
    }
    const onFocus = (e: FocusEvent) => {
      focused = plotOf(e.target)
      update()
    }
    const onBlur = () => {
      focused = null
      update()
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      window.removeEventListener('scroll', onScroll)
    }
  }, [band, enabled])
  return yieldTo
}

/**
 * Desktop and tablet: once the verdict's number scrolls behind the top bar, a glass pill docks at
 * the top of the results column with the live odds; it takes you back to the verdict. Phone keeps
 * its own pill on the Plan tab, so this renders nothing there.
 */
export function DockedVerdict() {
  const bp = useBreakpoint()
  const on = bp !== 'phone'
  const hasResult = useStore((s) => s.result !== null)
  const success = useStore(selectSuccess)
  const running = useStore((s) => s.status === 'running')
  const delta = usePillDelta(hasResult ? success : null)
  const topBar = useTopBarBottom()
  const past = useScrolledPast(VERDICT_NUMBER_ID, topBar, on)
  const show = on && hasResult && past

  const pill = useRef<HTMLButtonElement>(null)
  const band = useCallback(() => {
    const r = pill.current?.getBoundingClientRect()
    return r ? { top: r.top - 8, bottom: r.bottom + 8 } : { top: topBar, bottom: topBar + 72 }
  }, [topBar])
  const yielding = useChartYield(band, show)
  // Fades out while yielding; only leaves the accessibility tree if it isn't holding focus.
  const [focused, setFocused] = useState(false)
  const gone = yielding && !focused

  const back = () => {
    const h = document.getElementById(VERDICT_HEADLINE_ID)
    if (!h) return
    const top = (h.closest('section') ?? h).getBoundingClientRect().top + window.scrollY - topBar - 24
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
    h.focus({ preventScroll: true })
  }

  if (!on) return null
  const pct = Math.round(success * 100)
  return (
    <div className="docked-verdict">
      <AnimatePresence>
        {show && (
          <motion.div
            key="pill"
            className="docked-verdict__slot"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.32, ease }}
          >
            <button
              ref={pill}
              type="button"
              className={cx('verdict-pill', `verdict-pill--${toneFor(success)}`, 'docked-verdict__pill', running && 'is-running', yielding && 'is-yielding')}
              style={{ ['--tone' as string]: outcomeTextColor(success) }}
              aria-label={`Holds in ${pct}% of futures. Back to the verdict.`}
              aria-hidden={gone || undefined}
              inert={gone}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onClick={back}
            >
              <PillRing success={success} />
              <span className="verdict-pill__text">
                Holds in <AnimatedNumber className="verdict-pill__num" value={success} format="percent" /> of futures
              </span>
              <AnimatePresence initial={false}>
                {delta !== null && (
                  <motion.span
                    key="delta"
                    className={cx('docked-verdict__delta num', delta > 0 ? 'is-up' : 'is-down')}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.24, ease }}
                  >
                    {deltaLabel(delta)}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="docked-verdict__back" aria-hidden="true">
                <IconArrowRight size={16} />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
