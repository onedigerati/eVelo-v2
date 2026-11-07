import { useRef, useState, type PointerEvent } from 'react'
import { classifyTouch, valueAtPointer, type TouchIntent } from './sliderGesture'

interface Gesture {
  id: number
  x0: number
  y0: number
  intent: TouchIntent
}

export interface SliderPointerOptions {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  disabled?: boolean
}

/**
 * Pointer handling for a `.slider__control` wrapping a native range input (which itself takes no
 * pointer input — see primitives.css). A native range jumps to the finger on touch-down, so
 * scrolling a phone page past a slider used to change it. Here a touch changes nothing until its
 * first few pixels of movement show a horizontal drag; a vertical swipe is left to the page
 * (`touch-action: pan-y`), and a plain tap commits on lift. Mouse and pen act at once, like a
 * native range, and focus the input so the arrow keys work next.
 */
export function useSliderPointer({ value, min, max, step, onChange, disabled }: SliderPointerOptions) {
  const [active, setActive] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gesture = useRef<Gesture | null>(null)
  // Latest value, so several moves between renders don't re-send the same value.
  const current = useRef(value)
  current.current = value

  const setFromX = (clientX: number) => {
    const el = controlRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const thumb = parseFloat(getComputedStyle(el).getPropertyValue('--thumb')) || 22
    const v = valueAtPointer(clientX, r.left, r.width, thumb, min, max, step)
    if (v !== current.current) {
      current.current = v
      onChange(v)
    }
  }

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* pointer already gone */
    }
    setActive(true)
    setFromX(e.clientX)
  }

  const end = () => {
    gesture.current = null
    setActive(false)
  }

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLDivElement>) {
      if (disabled || gesture.current || (e.pointerType === 'mouse' && e.button !== 0)) return
      const touch = e.pointerType === 'touch'
      gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, intent: touch ? 'pending' : 'drag' }
      if (touch) return // nothing changes until the finger shows what it means
      e.preventDefault() // no text selection while dragging
      inputRef.current?.focus({ preventScroll: true })
      startDrag(e)
    },
    onPointerMove(e: PointerEvent<HTMLDivElement>) {
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      if (g.intent === 'pending') {
        g.intent = classifyTouch(e.clientX - g.x0, e.clientY - g.y0)
        if (g.intent === 'scroll') gesture.current = null
        else if (g.intent === 'drag') startDrag(e)
        return
      }
      setFromX(e.clientX)
    },
    onPointerUp(e: PointerEvent<HTMLDivElement>) {
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      if (g.intent === 'pending') setFromX(e.clientX) // a tap: commit on lift
      end()
    },
    onPointerCancel(e: PointerEvent<HTMLDivElement>) {
      if (gesture.current?.id === e.pointerId) end()
    },
  }

  return { active, controlRef, inputRef, handlers }
}
