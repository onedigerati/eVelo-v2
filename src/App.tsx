import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { OPENED_FROM_LINK } from './state/store'
import { useHashRoute, useThemeEffect } from './ui/hooks'
import { toast } from './ui/primitives'
import { AppShell } from './ui/shell/AppShell'

let announced = false

export function App() {
  useThemeEffect()
  useHashRoute()

  useEffect(() => {
    if (!OPENED_FROM_LINK || announced) return
    announced = true
    // The plan is now in the store (and localStorage); drop the payload from the URL so later
    // edits aren't shadowed by a stale link on reload.
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`)
    toast('Opened a shared plan', { tone: 'holds', detail: 'Changes you make stay on this device.' })
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AppShell />
    </MotionConfig>
  )
}
