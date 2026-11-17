// Lighthouse against the built app, using Playwright's Chromium.
// `npm run lighthouse [-- <route-hash>]` writes lighthouse-report.html/.json to ./lighthouse/ (git-ignored).
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { withPreview } from './serve-preview.mjs'

const hash = process.argv[2] ?? ''
mkdirSync('lighthouse', { recursive: true })
const status = await withPreview(async (base) => {
  const r = spawnSync('npx', [
    'lighthouse', base + hash,
    '--quiet', '--chrome-flags=--headless=new --no-sandbox',
    '--output=html', '--output=json', '--output-path=lighthouse/lighthouse',
  ], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromium.executablePath() } })
  return r.status
})
process.exit(status ?? 1)
