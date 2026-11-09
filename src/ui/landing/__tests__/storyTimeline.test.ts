import { describe, expect, it } from 'vitest'
import { BEATS, YEARS, type BeatId } from '../story'
import {
  AT_REST,
  autoplay,
  BEAT_DURATION,
  BEAT_IDS,
  beatAt,
  beatFinish,
  beatIndex,
  beatStart,
  END_HOLD,
  frameAt,
  GROW_END,
  jump,
  pause,
  play,
  replay,
  REST_FRAME,
  setReduced,
  tick,
  TOTAL,
  type Playback,
  type StoryFrame,
} from '../storyTimeline'

const run = (s: Playback, seconds: number, reduced = false, dt = 1 / 60) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) s = tick(s, dt, reduced)
  return s
}
const PROGRESS: (keyof StoryFrame)[] = ['grow', 'loanYears', 'margin', 'flight', 'move', 'arrive', 'destChip', 'stepUp', 'estate', 'slice', 'sliceLabel', 'heirs']

describe('story timeline: beats', () => {
  it('has one beat id type, in the step order', () => {
    const ids: readonly BeatId[] = BEAT_IDS
    expect(ids).toEqual(BEATS.map((b) => b.id))
    expect(ids).toEqual(['buy', 'borrow', 'live', 'die'])
    expect(TOTAL).toBe(16)
    for (const [i, id] of ids.entries()) expect(beatIndex(id)).toBe(i)
  })

  it('starts each beat every four seconds and shows it until the next', () => {
    expect(BEAT_IDS.map(beatStart)).toEqual([0, 4, 8, 12])
    for (const id of BEAT_IDS) {
      expect(beatAt(beatStart(id))).toBe(id)
      expect(beatAt(beatFinish(id))).toBe(id)
      expect(frameAt(beatStart(id)).beat).toBe(id)
      expect(frameAt(beatFinish(id)).beat).toBe(id)
    }
    expect(beatFinish('die')).toBe(TOTAL)
    expect(beatAt(-5)).toBe('buy')
    expect(beatAt(99)).toBe('die')
  })
})

describe('story timeline: frameAt', () => {
  it('starts empty and ends on the resting (Die) frame', () => {
    const f = frameAt(0)
    expect(f).toMatchObject({ beat: 'buy', grow: 0, loanYears: 0, move: 0, flight: 0, stepUp: 0, estate: 0, slice: 0, heirs: 0, person: 0 })
    expect(REST_FRAME).toMatchObject({ beat: 'die', grow: GROW_END, loanYears: YEARS, move: 1, flight: 1, stepUp: 1, estate: 1, slice: 1, heirs: 1, person: 0 })
    expect(frameAt(-3)).toEqual(frameAt(0))
    expect(frameAt(1000)).toEqual(REST_FRAME)
    expect(frameAt(NaN)).toEqual(REST_FRAME)
  })

  it('never runs a part of the story backwards', () => {
    let prev = frameAt(0)
    for (let i = 1; i <= TOTAL * 50; i++) {
      const f = frameAt(i / 50)
      for (const k of PROGRESS) expect(f[k] as number, `${k} at ${i / 50}`).toBeGreaterThanOrEqual((prev[k] as number) - 1e-12)
      prev = f
    }
  })

  it('finishes each beat inside it: Buy fills, Borrow draws the St. Louis loan, Live anywhere moves, Die splits the estate', () => {
    const buy = frameAt(beatFinish('buy'))
    expect(buy.grow).toBeCloseTo(GROW_END, 6)
    expect(buy.loanYears).toBe(0)

    const borrow = frameAt(beatFinish('borrow'))
    expect(borrow.loanYears).toBe(YEARS)
    expect(borrow.margin).toBe(1)
    expect(borrow.move).toBe(0)
    expect(borrow.flight).toBe(0)
    expect(borrow.coins.every((q) => q === 1)).toBe(true)

    const live = frameAt(beatFinish('live'))
    expect(live.flight).toBe(1)
    expect(live.move).toBe(1)
    expect(live.person).toBe(0)
    expect(live.pulse).toBe(1)
    expect(live.stepUp).toBe(0)
    expect(live.estate).toBe(0)

    expect(frameAt(beatFinish('die'))).toEqual(REST_FRAME)
  })

  it('stages each beat as the mockup does', () => {
    // Buy: half-way, the bars are part grown, no loan.
    expect(frameAt(2).grow).toBeGreaterThan(0)
    expect(frameAt(2).grow).toBeLessThan(GROW_END)
    // Borrow: the person walks while coins drop.
    const b = frameAt(6)
    expect(b.person).toBe(1)
    expect(b.loanYears).toBeGreaterThan(0)
    expect(b.loanYears).toBeLessThan(YEARS)
    expect(b.coins.some((q) => q > 0 && q < 1)).toBe(true)
    // Live anywhere: the flight comes before the move.
    expect(frameAt(9).flight).toBeGreaterThan(0)
    expect(frameAt(9).move).toBe(0)
    // Die: the step-up, then the estate, the slice lifts off, then the heirs.
    expect(frameAt(12.6).stepUp).toBeGreaterThan(frameAt(12.6).estate)
    expect(frameAt(13.5).heirs).toBe(0)
    expect(frameAt(13.5).slice).toBeGreaterThan(0)
  })
})

describe('story timeline: playback', () => {
  it('rests on the finished frame before anything plays', () => {
    expect(AT_REST).toEqual({ t: TOTAL, playing: false, passesLeft: 0, hold: 0 })
    expect(tick(AT_REST, 1, false)).toBe(AT_REST)
  })

  it('autoplays twice, then rests on the finished Die frame', () => {
    let s = autoplay(AT_REST, false)
    expect(s).toMatchObject({ t: 0, playing: true })
    s = run(s, TOTAL + 0.1)
    expect(s.t).toBe(TOTAL)
    expect(s.playing).toBe(true)
    s = run(s, END_HOLD + 0.1)
    expect(s.t).toBeLessThan(1) // second pass
    expect(s.playing).toBe(true)
    s = run(s, TOTAL + END_HOLD + 0.5)
    expect(s).toEqual(AT_REST)
  })

  it('does not autoplay with reduced motion', () => {
    expect(autoplay(AT_REST, true)).toBe(AT_REST)
  })

  it('pauses where it is and plays on from there', () => {
    let s = run(autoplay(AT_REST, false), 5)
    const t = s.t
    s = pause(s)
    expect(s.playing).toBe(false)
    expect(run(s, 3).t).toBe(t)
    s = play(s, false)
    expect(s.t).toBe(t)
    expect(s.playing).toBe(true)
  })

  it('play from the finished frame starts over and plays one pass', () => {
    let s = play(AT_REST, false)
    expect(s.t).toBe(0)
    s = run(s, TOTAL + END_HOLD + 0.5)
    expect(s).toEqual(AT_REST)
  })

  it('replay starts over from anywhere', () => {
    const s = replay(run(autoplay(AT_REST, false), 9), false)
    expect(s).toMatchObject({ t: 0, playing: true })
  })

  it('a step jumps to its beat: the start while playing, the finished frame when paused or at rest', () => {
    const playing = run(autoplay(AT_REST, false), 2)
    for (const id of BEAT_IDS) {
      expect(jump(playing, id, false)).toMatchObject({ t: beatStart(id), playing: true })
      expect(jump(pause(playing), id, false)).toMatchObject({ t: beatFinish(id), playing: false })
      expect(jump(AT_REST, id, false)).toMatchObject({ t: beatFinish(id), playing: false })
    }
  })

  it('play after a step chosen while paused plays that beat from its start, then on to the end', () => {
    const paused = pause(run(autoplay(AT_REST, false), 2))
    const chosen = jump(paused, 'borrow', false)
    expect(chosen.t).toBe(beatFinish('borrow'))
    let s = play(chosen, false)
    expect(s).toEqual({ t: beatStart('borrow'), playing: true, passesLeft: 0, hold: 0 })
    s = run(s, 2)
    expect(beatAt(s.t)).toBe('borrow')
    expect(frameAt(s.t).loanYears).toBeGreaterThan(0)
    expect(frameAt(s.t).loanYears).toBeLessThan(YEARS)
    s = run(s, TOTAL + END_HOLD)
    expect(s).toEqual(AT_REST)
    // From rest too: choosing Die then Play animates Die, not the whole story.
    expect(play(jump(AT_REST, 'die', false), false).t).toBe(beatStart('die'))
    // Pausing and playing again without choosing a step resumes where it was.
    const mid = run(play(chosen, false), 1)
    expect(play(pause(mid), false).t).toBe(mid.t)
    // With reduced motion: the chosen beat's finished frame, held, then the next.
    const r = play(jump(AT_REST, 'borrow', true), true)
    expect(r.t).toBe(beatFinish('borrow'))
    expect(run(r, BEAT_DURATION + 0.1, true).t).toBe(beatFinish('live'))
  })

  describe('with reduced motion', () => {
    it('shows only finished frames: play steps one beat at a time, then rests', () => {
      let s = play(AT_REST, true)
      expect(s.t).toBe(beatFinish('buy'))
      const shown: number[] = []
      for (let i = 0; i < 60 * BEAT_DURATION * 5; i++) {
        s = tick(s, 1 / 60, true)
        if (shown[shown.length - 1] !== s.t) shown.push(s.t)
      }
      expect(shown).toEqual([beatFinish('buy'), beatFinish('borrow'), beatFinish('live'), beatFinish('die')])
      expect(s).toEqual(AT_REST)
    })

    it('steps and replay go to finished frames, even while playing', () => {
      const s = play(AT_REST, true)
      for (const id of BEAT_IDS) expect(jump(s, id, true).t).toBe(beatFinish(id))
      expect(replay(s, true).t).toBe(beatFinish('buy'))
    })
  })
})

describe('story timeline: reduced motion switched mid-play', () => {
  it('drops any hold in either direction', () => {
    const held = { t: beatFinish('borrow'), playing: true, passesLeft: 0, hold: 3 }
    expect(setReduced(held, false).hold).toBe(0)
    expect(setReduced(held, true).hold).toBe(0)
    const between = { t: TOTAL, playing: true, passesLeft: 1, hold: 3 }
    expect(setReduced(between, false)).toEqual({ ...between, hold: 0 })
    // Switched on mid-beat: that beat's finished frame.
    expect(setReduced({ t: 6, playing: true, passesLeft: 0, hold: 0 }, true).t).toBe(beatFinish('borrow'))
    // Nothing to change: the same object (no re-render).
    expect(setReduced(AT_REST, false)).toBe(AT_REST)
    expect(setReduced(AT_REST, true)).toBe(AT_REST)
  })

  it('a held finished beat, switched to full motion, plays on from that moment', () => {
    let s = play(jump(AT_REST, 'borrow', true), true)
    s = run(s, 3, true)
    s = setReduced(s, false)
    expect(s.hold).toBe(0)
    s = tick(s, 0.5, false)
    expect(s.t).toBeGreaterThan(beatFinish('borrow'))
    expect(beatAt(s.t)).toBe('live')
  })
})
