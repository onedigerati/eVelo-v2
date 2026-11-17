import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import './styles/tokens.css'
import './styles/global.css'

import './ui/primitives/primitives.css'

import { App } from './App'
import { ErrorBoundary } from './ui/shell/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
