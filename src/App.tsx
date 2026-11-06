import { LazyMotion, MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { loadLiveFx } from './state/fx'
import { useSimulationSync } from './state/sim'
import { hrefFor } from './state/router'
import { OPENED_FROM_LINK, useStore } from './state/store'
import { useHashRoute, useThemeEffect } from './ui/hooks'
import { toast } from './ui/primitives'
import { AppShell, prefetchViews } from './ui/shell/AppShell'

let announced = false
const loadMotionFeatures = () => import('./ui/motionFeatures').then((m) => m.default)

export function App() {
  useThemeEffect()
  useHashRoute()
  useSimulationSync()

  useEffect(() => {
    void loadLiveFx()
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    idle(() => prefetchViews())
  }, [])

  useEffect(() => {
    if (!OPENED_FROM_LINK || announced) return
    announced = true
    // The plan is now in the store (and localStorage); drop the payload from the URL so later
    // edits aren't shadowed by a stale link on reload.
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hrefFor(useStore.getState().route)}`)
    toast('Opened a shared plan', { tone: 'holds', detail: 'Changes you make stay on this device.' })
  }, [])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <AppShell />
      </MotionConfig>
    </LazyMotion>
  )
}
