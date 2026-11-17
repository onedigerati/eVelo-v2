// Starts `vite preview` on a port, runs a callback with its URL, then stops it (and its children).
// Readiness is checked by fetching the URL: vite's banner bolds the port, so matching its text is unreliable.
import { spawn } from 'node:child_process'

export async function withPreview(fn, port = 4173) {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true })
  let exited = false
  proc.on('exit', () => { exited = true })
  const base = `http://localhost:${port}/`
  try {
    const until = Date.now() + 30000
    for (;;) {
      if (exited) throw new Error(`vite preview exited before it was ready (is port ${port} in use?)`)
      try { if ((await fetch(base)).ok) break } catch { /* not up yet */ }
      if (Date.now() > until) throw new Error('vite preview did not start in 30 s')
      await new Promise((r) => setTimeout(r, 250))
    }
    return await fn(base)
  } finally {
    try { process.kill(-proc.pid) } catch { /* already gone */ }
  }
}
