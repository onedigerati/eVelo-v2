// The landing story card's timeline (variation A): the whole four-beat story as a pure function of
// time, plus the playback state machine the card's hook drives. Timings, easing and orchestration
// follow the mockup's script (docs/research/landing-hero/variation-a.html), re-cast for St. Louis →
// Bangkok. No DOM: `frameAt(t)` gives how far each part of the story has played at t seconds, and
// storyLayout.ts turns that into SVG geometry.

import { BEATS, YEARS, type BeatId } from './story'

/* ---------- Beats and times ---------- */

/** Seconds per beat; the story runs 0..TOTAL. */
export const BEAT_DURATION = 4
export const TOTAL = BEATS.length * BEAT_DURATION
/** Seconds the finished frame holds before the second pass starts. */
export const END_HOLD = 3.5
/** Passes autoplay makes before it rests on the finished frame. */
export const PASSES = 2

/** The beat ids in order (Buy, Borrow, Live anywhere, Die): the one beat id type, shared by frames and step buttons. */
export const BEAT_IDS: readonly BeatId[] = BEATS.map((b) => b.id)

export function beatIndex(id: BeatId): number {
  const i = BEAT_IDS.indexOf(id)
  if (i < 0) throw new Error(`storyTimeline: unknown beat ${id}`)
  return i
}

/** When a beat starts playing. */
export const beatStart = (id: BeatId) => beatIndex(id) * BEAT_DURATION

/**
 * When a beat's finished frame shows: the last moment of the beat, every motion of that beat done.
 * Die's is the end of the story (TOTAL); the others are just before the next beat starts.
 */
export const beatFinish = (id: BeatId) => (id === 'die' ? TOTAL : beatStart(id) + BEAT_DURATION - FINISH_EPS)
const FINISH_EPS = 1e-3

/** The beat on show at time t. */
export function beatAt(t: number): BeatId {
  const i = Math.min(BEAT_IDS.length - 1, Math.max(0, Math.floor(clampT(t) / BEAT_DURATION)))
  return BEAT_IDS[i]
}

const clampT = (t: number) => (t < 0 ? 0 : t > TOTAL ? TOTAL : Number.isFinite(t) ? t : TOTAL)

/* ---------- Easing (the mockup's) ---------- */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Cubic ease in-out. */
export const ease = (v: number) => {
  v = clamp01(v)
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2
}
/** Cubic ease-out (each bar's own fill). */
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3)
/** Progress through a segment starting at `a` lasting `d` seconds, 0..1. */
const seg = (t: number, a: number, d: number) => clamp01((t - a) / d)

/* ---------- Frame ---------- */

/** Coins drop one every two years of the loan (15 coins, years 0, 2, .., 28). */
export const COIN_YEARS: readonly number[] = Array.from({ length: YEARS / 2 }, (_, i) => i * 2)
/** The bars' fill runs past the last bar so its ease-out finishes too. */
export const GROW_END = YEARS + 1.6

export interface StoryFrame {
  /** Time this frame shows, 0..TOTAL seconds. */
  t: number
  /** The beat on show (caption, step buttons, announcements). */
  beat: BeatId
  /** Portfolio bars filled: bar k is drawn at easeOut(grow − k) of its height. 0..GROW_END. */
  grow: number
  /** Years of loan drawn, 0..YEARS (fractional). */
  loanYears: number
  /** The margin-call line and the loan and margin key entries fade in, 0..1. */
  margin: number
  /** The person by the loan head (Borrow only), 0..1. */
  person: number
  /** Each coin's fall from the loan to the person, 0..1 (0 or 1 = not shown). One per COIN_YEARS. */
  coins: number[]
  /** St. Louis's spending chip on the map, 0..1. */
  homeChip: number
  /** The flight arc drawn, 0..1. */
  flight: number
  /** 0 = living in the home city, 1 = moved to the destination (the loan bends flatter). */
  move: number
  /** The destination pin brightens, 0..1. */
  arrive: number
  /** Bangkok's spending chip on the map, 0..1. */
  destChip: number
  /** The arrival pulse ring around the destination pin, 0..1 (0 or 1 = not shown). */
  pulse: number
  /** Step-up in basis: hatched gains give way to the plain stepped-up fill, 0..1. */
  stepUp: number
  /** The estate column appears, 0..1 (the bars fade behind it). */
  estate: number
  /** The loan slice lifts off the top of the estate, 0..1. */
  slice: number
  /** The "Loan repaid" label beside the lifted slice, 0..1. */
  sliceLabel: number
  /** The heirs' share fills in, 0..1. */
  heirs: number
}

/** The whole story at time t (seconds, clamped to 0..TOTAL). */
export function frameAt(time: number): StoryFrame {
  const t = clampT(time)
  // Beat 1, Buy: the portfolio fills, year by year.
  const grow = ease(seg(t, 0.2, 3.2)) * GROW_END
  // Beat 2, Borrow: the loan draws, coins drop to the person, the margin line appears.
  const loanP = seg(t, 4.2, 3.2)
  // Beat 3, Live anywhere: the flight, then the move (flatter loan, the ghost of the home loan).
  const flight = ease(seg(t, 8.2, 1.5))
  const move = ease(seg(t, 9.4, 2.1))
  return {
    t,
    beat: beatAt(t),
    grow,
    loanYears: loanP * YEARS,
    margin: seg(t, 4.0, 0.6),
    person: seg(t, 4.0, 0.3) * (1 - seg(t, 8.0, 0.5)),
    coins: COIN_YEARS.map((yr) => seg(t, 4.2 + (yr / YEARS) * 3.2, 0.55)),
    homeChip: seg(t, 4.0, 0.4) * (1 - 0.5 * flight),
    flight,
    move,
    arrive: seg(t, 9.4, 0.5),
    destChip: seg(t, 9.5, 0.5),
    pulse: seg(t, 9.4, 1.4),
    // Beat 4, Die: step-up, the estate column, the loan lifts off, the heirs' share.
    stepUp: ease(seg(t, 12.1, 1.0)),
    estate: ease(seg(t, 12.4, 0.8)),
    slice: ease(seg(t, 13.3, 1.1)),
    sliceLabel: seg(t, 14.0, 0.5),
    heirs: ease(seg(t, 14.2, 0.9)),
  }
}

/** The finished frame: every beat played to its end (the Die state). The card rests here. */
export const REST_FRAME: StoryFrame = frameAt(TOTAL)

/* ---------- Playback (pure; the card's hook drives it with requestAnimationFrame) ---------- */

export interface Playback {
  /** Time on show, 0..TOTAL. */
  t: number
  playing: boolean
  /** Passes left after this one (autoplay starts with PASSES − 1; a press of play or replay gives none). */
  passesLeft: number
  /** Seconds spent holding: on the finished frame between passes, or on a finished beat in reduced motion. */
  hold: number
  /** A step chosen while paused or at rest: play then starts that beat over instead of rolling into the next. */
  chosen?: BeatId
}

/** Before anything plays: the finished frame, at rest. */
export const AT_REST: Playback = { t: TOTAL, playing: false, passesLeft: 0, hold: 0 }

/**
 * Where playback starts: the story's start, or with reduced motion Buy's finished frame (no
 * movement, so each beat shows only its finished frame).
 */
const startT = (reduced: boolean) => (reduced ? beatFinish('buy') : 0)

/** The first time the card comes into view: play the story twice, then rest. Not with reduced motion. */
export function autoplay(s: Playback, reduced: boolean): Playback {
  if (reduced) return s
  return { t: 0, playing: true, passesLeft: PASSES - 1, hold: 0 }
}

/**
 * Play from where it is (one pass). After a step chosen while paused, play that beat from its start
 * (its finished frame with reduced motion); from the finished frame otherwise, start over.
 */
export function play(s: Playback, reduced: boolean): Playback {
  const t = s.chosen ? (reduced ? beatFinish(s.chosen) : beatStart(s.chosen)) : s.t >= TOTAL ? startT(reduced) : s.t
  return { t, playing: true, passesLeft: 0, hold: 0 }
}

export const pause = (s: Playback): Playback => ({ t: s.t, playing: false, passesLeft: s.passesLeft, hold: 0 })

/** Start over from the beginning and play one pass. */
export const replay = (_s: Playback, reduced: boolean): Playback => ({ t: startT(reduced), playing: true, passesLeft: 0, hold: 0 })

/**
 * A step button: while playing (with motion) go to the beat's start and keep playing; paused, at
 * rest or with reduced motion, show the beat's finished frame.
 */
export function jump(s: Playback, id: BeatId, reduced: boolean): Playback {
  if (s.playing) return { t: reduced ? beatFinish(id) : beatStart(id), playing: true, passesLeft: s.passesLeft, hold: 0 }
  return { t: beatFinish(id), playing: false, passesLeft: s.passesLeft, hold: 0, chosen: id }
}

/**
 * Reduced motion switched on or off: any hold so far is dropped (a held finished beat or the pause
 * between passes starts over), and switched on mid-beat, the beat's finished frame shows.
 */
export function setReduced(s: Playback, reduced: boolean): Playback {
  const t = reduced ? beatFinish(beatAt(s.t)) : s.t
  return t === s.t && s.hold === 0 ? s : { ...s, t, hold: 0 }
}

/**
 * Advance by dt seconds. With motion: time runs to the end, holds END_HOLD, then starts the next
 * pass or rests. With reduced motion: each beat's finished frame holds BEAT_DURATION, then the
 * next beat's finished frame shows (no frame in between); after Die it rests.
 */
export function tick(s: Playback, dt: number, reduced: boolean): Playback {
  if (!s.playing || !(dt > 0)) return s
  if (reduced) {
    const hold = s.hold + dt
    if (hold < BEAT_DURATION) return { ...s, hold }
    const next = beatIndex(beatAt(s.t)) + 1
    if (next >= BEAT_IDS.length || s.t >= TOTAL) return { ...AT_REST }
    const id = BEAT_IDS[next]
    return { ...s, t: beatFinish(id), hold: 0, playing: id !== 'die' }
  }
  if (s.t < TOTAL) return { ...s, t: Math.min(TOTAL, s.t + dt) }
  const hold = s.hold + dt
  if (hold <= END_HOLD) return { ...s, hold }
  if (s.passesLeft > 0) return { t: 0, playing: true, passesLeft: s.passesLeft - 1, hold: 0 }
  return { ...AT_REST }
}
