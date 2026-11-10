import { animate, type MotionValue } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { classifySheetTouch, releaseVelocity, sheetOffset, shouldCloseSheet, type SheetTouchIntent, type TouchSample } from './sheetGesture'

/** The spring the sheet uses to open; a cancelled swipe settles back with it too. */
export const SHEET_SPRING = { type: 'spring', stiffness: 380, damping: 40 } as const

/** True when no scroller between the touched element and the panel is scrolled down. */
function scrolledToTop(target: EventTarget | null, panel: HTMLElement): boolean {
  for (let el = target instanceof Element ? target : null; el && el !== panel; el = el.parentElement) {
    if (el.scrollTop > 0) return false
  }
  return true
}

interface Gesture {
  id: number
  x0: number
  y0: number
  intent: SheetTouchIntent
  samples: TouchSample[]
}

/**
 * Swipe down anywhere on a bottom sheet to close it (see `sheetGesture` for the rules). Uses
 * touch events, so mice and desktop are unaffected; the handle keeps its own drag. Drives the
 * sheet's `y` motion value while the finger is down, then closes or springs back on release.
 */
export function useSheetSwipe(panel: RefObject<HTMLElement | null>, enabled: boolean, y: MotionValue<number>, onClose: () => void) {
  const close = useRef(onClose)
  useLayoutEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    const el = panel.current
    if (!enabled || !el) return
    let g: Gesture | null = null

    const find = (list: TouchList, id: number) => {
      for (let i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i]
      return null
    }

    const onStart = (e: TouchEvent) => {
      if (g) {
        // A second finger: a pinch or a fumble, not a swipe. Abandon a pending one.
        if (g.intent === 'pending') g = null
        return
      }
      if (e.touches.length !== 1) return
      if (e.target instanceof Element && e.target.closest('.sheet__grabber')) return
      const t = e.touches[0]
      g = { id: t.identifier, x0: t.clientX, y0: t.clientY, intent: 'pending', samples: [] }
    }

    const onMove = (e: TouchEvent) => {
      if (!g) return
      const t = find(e.changedTouches, g.id)
      if (!t) return
      const dy = t.clientY - g.y0
      if (g.intent === 'pending') {
        g.intent = classifySheetTouch(t.clientX - g.x0, dy, scrolledToTop(e.target, el))
        if (g.intent === 'pending') return
        if (g.intent !== 'sheet') {
          g = null
          return
        }
        y.stop()
      }
      // A sheet drag for the rest of this touch: the content must not scroll or overscroll.
      if (e.cancelable) e.preventDefault()
      g.samples.push({ t: e.timeStamp, y: t.clientY })
      if (g.samples.length > 20) g.samples.shift()
      y.set(sheetOffset(dy))
    }

    const onEnd = (e: TouchEvent) => {
      if (!g) return
      const t = find(e.changedTouches, g.id)
      if (!t) return
      const done = g
      g = null
      if (done.intent !== 'sheet') return
      // The finger moved the sheet: no click on whatever it lifted over.
      if (e.cancelable) e.preventDefault()
      const lifted = e.type === 'touchend'
      if (lifted) done.samples.push({ t: e.timeStamp, y: t.clientY })
      if (lifted && shouldCloseSheet(t.clientY - done.y0, releaseVelocity(done.samples))) close.current()
      else animate(y, 0, SHEET_SPRING)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [panel, enabled, y])
}
