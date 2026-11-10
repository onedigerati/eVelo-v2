import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { CityPhoto } from '../../data/photos'
import { ease } from '../motion'
import { Skeleton, cx } from '../primitives'
import { classifyTouch, type TouchIntent } from '../primitives/sliderGesture'
import { photoCredit, sourceLabel, type OddsBadgeModel } from './gallery'
import { leadSizes, photoSrcSet, smallSizes } from './photoLoad'

/**
 * Design A, the cover mosaic: one large photo and four small ones above the profile, the odds
 * badge on the large photo, and a full-size view. On phones it becomes one swipeable cover.
 * Both layouts are rendered; CSS shows one (see `.pgal` in atlas.css).
 */
export function PhotoGallery({ cityName, photos, badge }: { cityName: string; photos: CityPhoto[]; badge: OddsBadgeModel }) {
  const [viewing, setViewing] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [slide, setSlide] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const n = photos.length

  const open = (i: number, el: HTMLElement) => {
    opener.current = el
    setViewing(i)
  }
  const close = useCallback(() => {
    setViewing(null)
    // Back to the photo (or button) that opened the view.
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }))
  }, [])

  const onTrackScroll = () => {
    const el = track.current
    if (!el || !el.clientWidth) return
    setSlide(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / el.clientWidth))))
  }
  const goSlide = (i: number) => {
    const el = track.current
    el?.scrollTo({
      left: i * el.clientWidth,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  // Tiles and slides load the 640px copy or the 1280px original, whichever the tile needs at this
  // viewport and DPR (see photoLoad.ts); the full-size view always shows the original.
  const tile = (p: CityPhoto, i: number, cls: string, lazy: boolean, sizes: string) => (
    <button
      key={p.file}
      type="button"
      className={cls}
      aria-label={`Open photo ${i + 1} of ${n}: ${p.caption}`}
      onClick={(e) => open(i, e.currentTarget)}
    >
      <img
        src={p.src}
        srcSet={photoSrcSet(p)}
        sizes={photoSrcSet(p) ? sizes : undefined}
        alt={p.alt}
        width={p.width}
        height={p.height}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        style={p.focus ? { objectPosition: p.focus } : undefined}
      />
    </button>
  )

  const cur = photos[slide] ?? photos[0]

  return (
    <section className="pgal" aria-label={`Photos of ${cityName}`}>
      {/* Desktop and tablet: the mosaic */}
      <div className="pgal__mosaic">
        {photos.slice(0, 5).map((p, i) => tile(p, i, cx('pgal__tile', i === 0 && 'is-lead'), i > 0, i === 0 ? leadSizes(p) : smallSizes(p)))}
        <OddsCard badge={badge} />
        <button type="button" className="pgal__all" onClick={(e) => open(0, e.currentTarget)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          All {n} photos
        </button>
      </div>
      <p className="pgal__credit">{photoCredit(photos)}</p>

      {/* Phones: one swipeable cover */}
      <div className="pgal__cover">
        <div className="pgal__track" ref={track} onScroll={onTrackScroll}>
          {photos.map((p, i) => tile(p, i, 'pgal__slide', i > 0, leadSizes(p)))}
        </div>
        <OddsCard badge={badge} compact />
        <span className="pgal__count num" aria-hidden="true">
          {slide + 1} / {n}
        </span>
      </div>
      <div className="pgal__under">
        <div className="pgal__dots" role="group" aria-label="Choose a photo">
          {photos.map((p, i) => (
            <button
              key={p.file}
              type="button"
              className={cx(i === slide && 'is-on')}
              aria-label={`Show photo ${i + 1} of ${n}`}
              aria-current={i === slide ? 'true' : undefined}
              onClick={() => goSlide(i)}
            >
              <i />
            </button>
          ))}
        </div>
        {cur && (
          <p className="pgal__cap">
            <span>{cur.caption}</span>
            <span className="pgal__credit">
              {cur.author} · {cur.license}
            </span>
          </p>
        )}
      </div>

      <PhotoViewer cityName={cityName} photos={photos} index={viewing} onIndex={setViewing} onClose={close} badge={badge} />
    </section>
  )
}

/** The paper card on the cover photo: "Your plan here", the odds, a bar with the home tick. */
function OddsCard({ badge, compact }: { badge: OddsBadgeModel; compact?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <div className={cx('podds', compact && 'podds--compact')} role="group" aria-label={badge.label}>
      <span className="podds__eyebrow" aria-hidden="true">
        Your plan here
      </span>
      {badge.ready ? (
        <>
          <span className="podds__row" aria-hidden="true">
            <span className="podds__big num" style={{ color: badge.tone }}>
              {badge.pct}
              <i>%</i>
            </span>
            <span className="podds__l">plan holds</span>
          </span>
          <span className="podds__bar" aria-hidden="true">
            <motion.i
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${badge.rate * 100}%` }}
              transition={{
                duration: reduce ? 0 : 0.8,
                ease,
                delay: reduce ? 0 : 0.15,
              }}
              style={{ background: badge.fill }}
            />
            {badge.home && <span className="podds__home" style={{ left: `${badge.home.rate * 100}%` }} />}
          </span>
          {badge.home && (
            <span className="podds__vs" aria-hidden="true">
              <b className={badge.home.deltaClass}>{badge.home.delta}</b> {badge.home.text}
            </span>
          )}
        </>
      ) : (
        <span className="podds__skel" aria-hidden="true">
          <Skeleton width={compact ? 64 : 92} height={compact ? 28 : 38} radius={8} />
          <Skeleton width="100%" height={6} radius={3} />
          {!compact && <Skeleton width="80%" height={10} radius={4} />}
        </span>
      )}
    </div>
  )
}

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
const SWIPE_PX = 40

/**
 * Full-size view over the profile sheet (always dark). ←/→ keys, arrows and horizontal swipes
 * move through the photos; Esc closes only this view — its keydown listener runs in the capture
 * phase on window and stops the event, so the Sheet's document listener never sees it.
 */
function PhotoViewer({
  cityName,
  photos,
  index,
  onIndex,
  onClose,
  badge,
}: {
  cityName: string
  photos: CityPhoto[]
  index: number | null
  onIndex: (i: number) => void
  onClose: () => void
  badge: OddsBadgeModel
}) {
  const uid = useId()
  const root = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const n = photos.length
  const isOpen = index !== null
  const i = index ?? 0
  const step = useCallback((d: number) => onIndex(((((index ?? 0) + d) % n) + n) % n), [index, n, onIndex])

  useEffect(() => {
    if (!isOpen) return
    const raf = requestAnimationFrame(() => root.current?.focus({ preventScroll: true }))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.stopPropagation()
        e.preventDefault()
        step(e.key === 'ArrowLeft' ? -1 : 1)
      } else if (e.key === 'Tab' && root.current) {
        e.stopPropagation()
        const els = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
        if (!els.length) return e.preventDefault()
        const first = els[0]
        const last = els[els.length - 1]
        const at = document.activeElement
        const inside = root.current.contains(at)
        if (e.shiftKey && (at === first || at === root.current || !inside)) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && (at === last || !inside)) (e.preventDefault(), first.focus())
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [isOpen, onClose, step])

  // Horizontal swipe on touch (same intent rule as the sliders and the map); vertical moves do nothing.
  const gesture = useRef<{
    id: number
    x: number
    y: number
    intent: TouchIntent
  } | null>(null)
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') return
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      intent: 'pending',
    }
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId || g.intent !== 'pending') return
    g.intent = classifyTouch(e.clientX - g.x, e.clientY - g.y)
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== e.pointerId) return
    const dx = e.clientX - g.x
    if (g.intent === 'drag' && Math.abs(dx) >= SWIPE_PX) step(dx < 0 ? 1 : -1)
  }

  const p = photos[i]
  const fade = { duration: reduce ? 0 : 0.22, ease }

  return createPortal(
    <AnimatePresence>
      {isOpen && p && (
        <motion.div
          ref={root}
          className="pview"
          data-theme="dark"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-t`}
          tabIndex={-1}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          <div className="pview__top">
            <h2 className="pview__title" id={`${uid}-t`}>
              {cityName}{' '}
              <span className="pview__n num">
                <span aria-hidden="true">·</span> {i + 1} of {n}
              </span>
            </h2>
            <span className="pview__tools">
              <OddsPill badge={badge} />
              <button type="button" className="pview__btn" aria-label="Close photos" onClick={onClose}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </span>
          </div>

          <div
            className="pview__stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (gesture.current = null)}
          >
            <button type="button" className="pview__btn pview__prev" aria-label="Previous photo" onClick={() => step(-1)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <div className="pview__frame">
              <AnimatePresence initial={false}>
                <motion.img
                  key={p.file}
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  draggable={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                />
              </AnimatePresence>
            </div>
            <button type="button" className="pview__btn pview__next" aria-label="Next photo" onClick={() => step(1)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="pview__cap">
            <div className="pview__text" aria-live="polite">
              <span className="pview__caption">{p.caption}</span>
              <span className="pview__credit">
                Photo: {p.author} ·{' '}
                <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer license">
                  {p.license}
                </a>{' '}
                ·{' '}
                <a href={p.source} target="_blank" rel="noopener noreferrer">
                  {sourceLabel(p.source)}
                </a>{' '}
                · resized
              </span>
            </div>
            <span className="pview__hint" aria-hidden="true">
              ← → keys · swipe on touch
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** "Plan holds 82% | +6 pts vs 76% in Austin" in the full-size view's top bar. */
function OddsPill({ badge }: { badge: OddsBadgeModel }) {
  return (
    <span className="ppill" role="group" aria-label={badge.label}>
      <span className="ppill__l" aria-hidden="true">
        Plan holds
      </span>
      {badge.ready ? (
        <>
          <span className="ppill__big num" style={{ color: badge.tone }} aria-hidden="true">
            {badge.pct}%
          </span>
          {badge.home && (
            <>
              <span className="ppill__sep" aria-hidden="true" />
              <span className="ppill__vs" aria-hidden="true">
                <b className={badge.home.deltaClass}>{badge.home.delta}</b> {badge.home.text}
              </span>
            </>
          )}
        </>
      ) : (
        <Skeleton width={56} height={22} radius={6} />
      )}
    </span>
  )
}
