import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks'
import { COPY, type BeatId } from './story'
import {
  AT_REST,
  autoplay,
  beatAt,
  beatIndex,
  frameAt,
  jump as jumpTo,
  pause as pauseAt,
  play as playFrom,
  replay as replayFrom,
  setReduced,
  tick,
  type Playback,
  type StoryFrame,
} from './storyTimeline'

/** Share of the card that must be on screen for it to play (the mockup's). */
const IN_VIEW = 0.35
/** Longest step per animation frame, so a stalled tab doesn't skip a beat. */
const MAX_DT = 0.05

interface StoryPlayback {
  frame: StoryFrame
  beat: BeatId
  playing: boolean
  reduced: boolean
  /** Text for the aria-live region: each beat once per run, plus play/pause. */
  live: string
  /** Attach to the card: it plays only while this element is in view. */
  ref: (el: HTMLElement | null) => void
  /** The card element, once attached. */
  el: HTMLElement | null
  togglePlay: () => void
  replay: () => void
  jump: (id: BeatId) => void
}

interface View {
  t: number
  playing: boolean
}

/**
 * Playback for the landing story card. The card rests on the finished (Die) frame; the first time
 * it is in view it plays the story twice and rests again (not with reduced motion). Time advances
 * with requestAnimationFrame only while playing and in view. With `prefers-reduced-motion` nothing
 * moves: play steps through each beat's finished frame, and jumps show finished frames.
 *
 * The full playback state (including the hold timers) lives in a ref; React state holds only what
 * is drawn (t and playing), so holding a finished frame or the pause between passes doesn't render.
 */
export function useStoryPlayback(): StoryPlayback {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const pbRef = useRef<Playback>(AT_REST)
  const [view, setView] = useState<View>({ t: AT_REST.t, playing: AT_REST.playing })
  const commit = useCallback((next: Playback) => {
    pbRef.current = next
    setView((v) => (v.t === next.t && v.playing === next.playing ? v : { t: next.t, playing: next.playing }))
  }, [])

  const [el, setEl] = useState<HTMLElement | null>(null)
  const elRef = useRef<HTMLElement | null>(null)
  elRef.current = el
  const [inView, setInViewState] = useState(false)
  const inViewRef = useRef(false)
  const setInView = useCallback((v: boolean) => {
    inViewRef.current = v
    setInViewState(v)
  }, [])
  /** A press while the card is only partly on screen counts as in view until the card next leaves view. */
  const pressedInView = useRef(false)
  const started = useRef(false)

  // Announcements: each beat once since the last user action; an alternating no-break space makes
  // a repeat of the same text (a step pressed twice) a change the screen reader still reads.
  const [live, setLiveText] = useState('')
  const announced = useRef<Set<BeatId>>(new Set())
  const flip = useRef(false)
  const say = useCallback((text: string) => {
    flip.current = !flip.current
    setLiveText(flip.current ? text : `${text} `)
  }, [])

  // In view: autoplay the first time. Thresholds at 0 too, so leaving the screen entirely is seen.
  useEffect(() => {
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        const enough = e.isIntersecting && e.intersectionRatio >= IN_VIEW - 1e-3
        if (enough || !e.isIntersecting) pressedInView.current = false
        setInView(enough || (e.isIntersecting && pressedInView.current))
        if (enough && !started.current) {
          started.current = true
          commit(autoplay(pbRef.current, reducedRef.current))
        }
      },
      { threshold: [0, IN_VIEW] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el, commit, setInView])

  // Reduced motion switched either way: drop any hold; switched on mid-beat, show the finished frame.
  useEffect(() => {
    commit(setReduced(pbRef.current, reduced))
  }, [reduced, commit])

  // The clock. It renders only when t or playing changes (not while a frame is held).
  const running = view.playing && inView
  useEffect(() => {
    if (!running) return
    let raf = 0
    let prev = performance.now()
    const step = (now: number) => {
      const dt = Math.max(0, Math.min(MAX_DT, (now - prev) / 1000))
      prev = now
      const next = tick(pbRef.current, dt, reducedRef.current)
      if (next !== pbRef.current) commit(next)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [running, commit])

  // Each beat announced once as it comes on; the beat shown at load is not announced.
  const beat = beatAt(view.t)
  const prevBeat = useRef(beat)
  useEffect(() => {
    if (beat === prevBeat.current) return
    prevBeat.current = beat
    if (announced.current.has(beat)) return
    announced.current.add(beat)
    say(COPY.announce(beatIndex(beat)))
  }, [beat, say])

  /** A user press: it starts things (no autoplay later) and counts the card as in view if any of it shows. */
  const pressed = useCallback(() => {
    started.current = true
    const card = elRef.current
    if (!card || inViewRef.current) return
    const r = card.getBoundingClientRect()
    if (r.bottom > 0 && r.top < window.innerHeight) {
      pressedInView.current = true
      setInView(true)
    }
  }, [setInView])

  const userAct = useCallback(
    (next: Playback, prefix: string) => {
      pressed()
      const b = beatAt(next.t)
      announced.current = new Set([b])
      say(`${prefix} ${COPY.announce(beatIndex(b))}`)
      commit(next)
    },
    [pressed, say, commit],
  )

  const togglePlay = useCallback(() => {
    const s = pbRef.current
    if (s.playing) {
      started.current = true
      commit(pauseAt(s))
      say(COPY.controls.paused)
      return
    }
    userAct(playFrom(s, reducedRef.current), COPY.controls.playing)
  }, [commit, say, userAct])

  const replay = useCallback(() => userAct(replayFrom(pbRef.current, reducedRef.current), COPY.controls.playing), [userAct])

  const jump = useCallback(
    (id: BeatId) => {
      pressed()
      announced.current = new Set([id])
      say(COPY.announce(beatIndex(id)))
      commit(jumpTo(pbRef.current, id, reducedRef.current))
    },
    [pressed, say, commit],
  )

  const frame = useMemo(() => frameAt(view.t), [view.t])
  return { frame, beat, playing: view.playing, reduced, live, ref: setEl, el, togglePlay, replay, jump }
}
