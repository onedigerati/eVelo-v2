// Lighthouse against the built app, using Playwright's Chromium.
// `npm run lighthouse [-- <route-hash>]` writes lighthouse-report.html/.json to ./lighthouse/ (git-ignored).
// Lighthouse runs from a fresh temp dir: on WSL, chrome-launcher creates its profile folder (named like
// `C:\Users\…\lighthouse.XXXX`) in the cwd, which would otherwise land in the repo root.
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { withPreview } from './serve-preview.mjs'

const hash = process.argv[2] ?? ''
const outDir = resolve('lighthouse')
mkdirSync(outDir, { recursive: true })
const cwd = mkdtempSync(join(tmpdir(), 'evelo-lh-'))
let status
try {
  status = await withPreview(async (base) => {
    // The repo's own binary: npx from the temp dir wouldn't find ./node_modules.
    const r = spawnSync(resolve('node_modules/.bin/lighthouse'), [
      base + hash,
      '--quiet', '--chrome-flags=--headless=new --no-sandbox',
      '--output=html', '--output=json', `--output-path=${join(outDir, 'lighthouse')}`,
    ], { cwd, stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromium.executablePath() } })
    return r.status
  })
} finally {
  rmSync(cwd, { recursive: true, force: true })
}
process.exit(status ?? 1)
