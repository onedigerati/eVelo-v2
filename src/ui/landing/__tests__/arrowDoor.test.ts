import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDoor, DOOR_IDLE, DOOR_WINDOW_MS, stepDoor } from '../arrowDoor'

describe('stepDoor', () => {
  it('waits on each click and gives a coupon on the fifth', () => {
    let s = DOOR_IDLE
    const effects: string[] = []
    for (let i = 0; i < 5; i++) {
      const r = stepDoor(s, 'click')
      s = r.state
      effects.push(r.effect)
    }
    expect(effects).toEqual(['wait', 'wait', 'wait', 'wait', 'coupon'])
    expect(s).toEqual(DOOR_IDLE)
  })

  it('goes after one or two clicks, stays after three or four, and ignores a stray timeout', () => {
    for (const clicks of [1, 2]) expect(stepDoor({ clicks }, 'timeout')).toEqual({ state: DOOR_IDLE, effect: 'go' })
    for (const clicks of [3, 4]) expect(stepDoor({ clicks }, 'timeout')).toEqual({ state: DOOR_IDLE, effect: 'stay' })
    expect(stepDoor(DOOR_IDLE, 'timeout').effect).toBe('stay')
  })
})

describe('createDoor', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const setup = () => {
    const onGo = vi.fn()
    const onCoupon = vi.fn()
    const onClicks = vi.fn()
    return { onGo, onCoupon, onClicks, door: createDoor({ onGo, onCoupon, onClicks }) }
  }

  it('one click goes to the plan after the window, not before', () => {
    const { door, onGo, onCoupon } = setup()
    door.click()
    vi.advanceTimersByTime(DOOR_WINDOW_MS - 1)
    expect(onGo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onGo).toHaveBeenCalledTimes(1)
    expect(onCoupon).not.toHaveBeenCalled()
  })

  it('a quick double-click goes to the plan after the window', () => {
    const { door, onGo, onCoupon, onClicks } = setup()
    door.click()
    vi.advanceTimersByTime(80)
    door.click()
    vi.advanceTimersByTime(DOOR_WINDOW_MS - 1)
    expect(onGo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onGo).toHaveBeenCalledTimes(1)
    expect(onCoupon).not.toHaveBeenCalled()
    expect(onClicks).toHaveBeenLastCalledWith(0)
  })

  it('three or four quick clicks go nowhere', () => {
    for (const n of [3, 4]) {
      const { door, onGo, onCoupon, onClicks } = setup()
      for (let i = 0; i < n; i++) {
        door.click()
        vi.advanceTimersByTime(DOOR_WINDOW_MS - 50)
      }
      vi.advanceTimersByTime(1000)
      expect(onGo).not.toHaveBeenCalled()
      expect(onCoupon).not.toHaveBeenCalled()
      expect(onClicks).toHaveBeenLastCalledWith(0)
    }
  })

  it('five quick clicks give the coupon at once and never go', () => {
    const { door, onGo, onCoupon, onClicks } = setup()
    for (let i = 0; i < 5; i++) {
      door.click()
      vi.advanceTimersByTime(200)
    }
    expect(onCoupon).toHaveBeenCalledTimes(1)
    expect(onClicks.mock.calls.map((c) => c[0])).toEqual([1, 2, 3, 4, 0])
    vi.advanceTimersByTime(1000)
    expect(onGo).not.toHaveBeenCalled()
  })

  it('slow clicks each count as one and go', () => {
    const { door, onGo, onCoupon } = setup()
    door.click()
    vi.advanceTimersByTime(DOOR_WINDOW_MS + 10)
    door.click()
    vi.advanceTimersByTime(DOOR_WINDOW_MS + 10)
    expect(onGo).toHaveBeenCalledTimes(2)
    expect(onCoupon).not.toHaveBeenCalled()
  })

  it('dispose drops a pending go', () => {
    const { door, onGo } = setup()
    door.click()
    door.dispose()
    vi.advanceTimersByTime(1000)
    expect(onGo).not.toHaveBeenCalled()
  })
})
