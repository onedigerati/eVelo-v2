import { AnimatePresence, m as motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { navigate } from '../../state/router'
import { useStore } from '../../state/store'
import { useBreakpoint, type Breakpoint } from '../hooks'
import { LandingView } from '../landing/LandingView'
import { ease } from '../motion'
import { OutlookCanvas } from '../outlook/OutlookCanvas'
import { PlanRail } from '../plan/PlanRail'
import { Sheet, Toaster } from '../primitives'
import { TabBar } from './TabBar'
import { TopBar } from './TopBar'
import { VerdictPill } from './VerdictPill'
import './shell.css'

// Atlas (map + geo), Method (long-form) and the styleguide load on first visit.
const AtlasView = lazy(() => import('../atlas/AtlasView').then((m) => ({ default: m.AtlasView })))
const MethodView = lazy(() => import('../method/MethodView').then((m) => ({ default: m.MethodView })))
const Styleguide = lazy(() => import('../styleguide/Styleguide').then((m) => ({ default: m.Styleguide })))

/** Warm the lazy views once the app is idle so tab switches stay instant. */
export function prefetchViews() {
  void import('../atlas/AtlasView')
  void import('../method/MethodView')
}

function ViewFallback() {
  return <div className="view-fallback" role="status" aria-label="Loading" />
}

/** Plan + Outlook. Desktop: sticky rail + canvas. Tablet: canvas + plan drawer. Phone: one tab at a time. */
function Workspace({ bp }: { bp: Breakpoint }) {
  const route = useStore((s) => s.route)
  const rail = useRef<HTMLElement>(null)

  // Desktop: "Plan" in the nav brings the rail into focus.
  useEffect(() => {
    if (bp === 'desktop' && route === 'plan') rail.current?.focus({ preventScroll: true })
  }, [bp, route])

  if (bp === 'phone') {
    return route === 'plan' ? (
      <div className="phone-plan">
        <VerdictPill />
        <PlanRail />
      </div>
    ) : (
      <div className="canvas">
        <OutlookCanvas onEditPlan={() => navigate('plan')} />
      </div>
    )
  }

  if (bp === 'tablet') {
    return (
      <>
        <div className="canvas">
          <OutlookCanvas onEditPlan={() => navigate('plan')} />
        </div>
        <Sheet open={route === 'plan'} onClose={() => navigate('outlook')} side="left" title="Your terms" hideTitle>
          <PlanRail />
        </Sheet>
      </>
    )
  }

  return (
    <div className="workspace">
      <aside className="rail" aria-label="Plan inputs" ref={rail} tabIndex={-1}>
        <PlanRail />
      </aside>
      <div className="canvas">
        <OutlookCanvas />
      </div>
    </div>
  )
}

export function AppShell() {
  const bp = useBreakpoint()
  const route = useStore((s) => s.route)
  // Plan/Outlook share one view key on desktop+tablet so switching doesn't remount.
  const view = route === 'plan' || route === 'outlook' ? (bp === 'phone' ? route : 'workspace') : route

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [view])

  // The landing is full-bleed with its own header: no top bar, no phone tab bar.
  if (route === 'home') {
    return (
      <>
        <LandingView bp={bp} />
        <Toaster />
      </>
    )
  }

  return (
    <div className={`app app--${bp}`}>
      <a href="#main" className="skip-link" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        Skip to content
      </a>
      <TopBar bp={bp} />
      <main id="main" tabIndex={-1} className="main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease }}
          >
            <Suspense fallback={<ViewFallback />}>
              {view === 'atlas' ? (
                <AtlasView />
              ) : view === 'method' ? (
                <MethodView />
              ) : view === 'styleguide' ? (
                <Styleguide />
              ) : (
                <Workspace bp={bp} />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {bp === 'phone' && <TabBar />}
      <Toaster />
    </div>
  )
}
