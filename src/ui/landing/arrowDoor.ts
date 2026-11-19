// The landing arrow's click sequence. Pure (the timer is injected), so it's tested.
// One or two clicks on the arrow go to the plan after a short wait (a double-click is still a
// click); quick clicks count up instead, and the fifth gives up the arrow for a coupon. Three or
// four clicks that then stop go nowhere.

/** How long a click waits for the next one before it counts as the last. */
export const DOOR_WINDOW_MS = 300
/** Quick clicks that turn the arrow into a coupon. */
export const DOOR_CLICKS = 5
/** Up to this many quick clicks still go to the plan. */
export const DOOR_GO_MAX = 2

export type DoorState = { clicks: number }
export type DoorEvent = 'click' | 'timeout'
/** What a step asks for: `wait` (start or restart the window), `go` (follow the link), `stay`, `coupon`. */
export type DoorEffect = 'wait' | 'go' | 'stay' | 'coupon'

export const DOOR_IDLE: DoorState = { clicks: 0 }

export function stepDoor(state: DoorState, event: DoorEvent): { state: DoorState; effect: DoorEffect } {
  if (event === 'click') {
    const clicks = state.clicks + 1
    return clicks >= DOOR_CLICKS ? { state: DOOR_IDLE, effect: 'coupon' } : { state: { clicks }, effect: 'wait' }
  }
  if (state.clicks === 0) return { state, effect: 'stay' }
  return { state: DOOR_IDLE, effect: state.clicks <= DOOR_GO_MAX ? 'go' : 'stay' }
}

type Timers = {
  setTimeout: (fn: () => void, ms: number) => unknown
  clearTimeout: (id: unknown) => void
}

const realTimers: Timers = {
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (id) => globalThis.clearTimeout(id as ReturnType<typeof setTimeout>),
}

/**
 * Runs `stepDoor` against the timers. `onClicks` reports the running count (0 when a sequence
 * ends), so the arrow can droop a little more with each click.
 */
export function createDoor(
  handlers: { onGo: () => void; onCoupon: () => void; onClicks?: (clicks: number) => void },
  timers: Timers = realTimers,
) {
  let state = DOOR_IDLE
  let timer: unknown = null
  const clear = () => {
    if (timer !== null) timers.clearTimeout(timer)
    timer = null
  }
  const run = (event: DoorEvent) => {
    const next = stepDoor(state, event)
    state = next.state
    handlers.onClicks?.(state.clicks)
    clear()
    if (next.effect === 'wait')
      timer = timers.setTimeout(() => {
        timer = null
        run('timeout')
      }, DOOR_WINDOW_MS)
    else if (next.effect === 'go') handlers.onGo()
    else if (next.effect === 'coupon') handlers.onCoupon()
  }
  return {
    click: () => run('click'),
    /** Drops a pending wait without acting on it (unmount). */
    dispose: () => {
      clear()
      state = DOOR_IDLE
    },
  }
}

const COUPON_KEY = 'evelo:v2:coupon'

/** Whether the coupon was won earlier in this visit (this tab's sessionStorage). */
export function readCoupon(): boolean {
  try {
    return sessionStorage.getItem(COUPON_KEY) === '1'
  } catch {
    return false
  }
}

export function saveCoupon(): void {
  try {
    sessionStorage.setItem(COUPON_KEY, '1')
  } catch {
    /* storage blocked: the coupon lasts until the page is left */
  }
}
