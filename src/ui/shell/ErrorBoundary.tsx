import { Component, type ErrorInfo, type ReactNode } from 'react'
import { resetPlanInBrowser } from '../../state/resetPlan'

interface State {
  failed: boolean
}

/**
 * App-root boundary: if anything below throws while drawing, show a way out instead of a blank
 * page. The error itself goes to the console only — never to the screen.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('eVelo: a screen failed to draw', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="app-recover" role="alert">
        <div className="app-recover__card">
          <h1 className="app-recover__title">Something went wrong drawing this plan.</h1>
          <p className="app-recover__body">Resetting the plan brings back the defaults; your saved portfolios are kept.</p>
          <button type="button" className="btn btn--primary btn--md" onClick={resetPlanInBrowser}>
            <span className="btn__label">Reset plan</span>
          </button>
        </div>
      </main>
    )
  }
}
