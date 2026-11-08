import { useEffect, useState } from 'react'

/** Visual viewport shrinkage (px) beyond which an on-screen keyboard is assumed open. */
export const KEYBOARD_MIN_PX = 120

export interface ViewportSample {
  /** window.innerHeight: the layout viewport. */
  layoutHeight: number
  /** visualViewport.height: what the user can actually see. */
  visualHeight: number
  /** visualViewport.offsetTop: how far the visible area is panned down inside the layout viewport. */
  visualTop: number
  /** visualViewport.scale: above 1 the user has pinch-zoomed, which also shrinks the visual viewport. */
  scale: number
  /** A text-entry control has focus. */
  editing: boolean
}

/**
 * Where to dock the verdict pill while typing, or null to leave it sticky in the page.
 *
 * Browsers that resize the layout viewport for the keyboard (Android Chrome with
 * interactive-widget=resizes-content) keep sticky elements on screen, so nothing to do. Browsers
 * that only shrink the visual viewport (iOS Safari) pan it down to the focused field, which
 * scrolls the sticky top bar and pill out of sight: there the pill is pinned to the top of the
 * visible area instead.
 */
export function keyboardDockTop(s: ViewportSample): number | null {
  if (!s.editing || s.scale > 1.01) return null
  if (s.layoutHeight - s.visualHeight < KEYBOARD_MIN_PX) return null
  return Math.max(0, s.visualTop)
}

const TEXT_INPUT = /^(text|search|tel|url|email|number|password|)$/

function isEditable(el: Element | null): boolean {
  if (!el) return false
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) return TEXT_INPUT.test(el.type)
  return el instanceof HTMLElement && el.isContentEditable
}

/** Top offset (px) at which to pin the pill while the keyboard hides the page top, else null. */
export function useKeyboardDock(): number | null {
  const [top, setTop] = useState<number | null>(null)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        setTop(
          keyboardDockTop({
            layoutHeight: window.innerHeight,
            visualHeight: vv.height,
            visualTop: vv.offsetTop,
            scale: vv.scale,
            editing: isEditable(document.activeElement),
          }),
        ),
      )
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    update()
    return () => {
      cancelAnimationFrame(frame)
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
    }
  }, [])
  return top
}
