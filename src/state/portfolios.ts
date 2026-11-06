// Saved portfolios: named holdings mixes kept in this browser, separate from the plan.
// Pure list operations (tested) + a small zustand store that persists them to localStorage.

import { create } from 'zustand'
import type { Holding } from '../engine/types'
import { sanitizeHoldings } from './share'

export interface SavedPortfolio {
  id: string
  name: string
  holdings: Holding[]
  /** ms epoch of the last save */
  savedAt: number
}

export const MAX_SAVED = 30
export const MAX_NAME = 40
const LS_KEY = 'evelo:v2:portfolios'

/** Trimmed, single-spaced, at most MAX_NAME characters. */
export function cleanName(s: string): string {
  return s.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME).trim()
}

const key = (name: string) => cleanName(name).toLocaleLowerCase()

export function findByName(list: SavedPortfolio[], name: string): SavedPortfolio | undefined {
  const k = key(name)
  return k ? list.find((p) => key(p.name) === k) : undefined
}

let seq = 0
export function newId(now = Date.now()): string {
  return `p${now.toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Whatever is in storage → a clean list: bad entries, unknown tickers and duplicate names are dropped. */
export function sanitizeSaved(raw: unknown): SavedPortfolio[] {
  if (!Array.isArray(raw)) return []
  const out: SavedPortfolio[] = []
  const ids = new Set<string>()
  for (const r of raw) {
    if (out.length >= MAX_SAVED) break
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    const name = typeof o.name === 'string' ? cleanName(o.name) : ''
    if (!name || findByName(out, name)) continue
    const holdings = sanitizeHoldings(o.holdings)
    if (!holdings.length) continue
    let id = typeof o.id === 'string' && o.id.length > 0 && o.id.length <= 64 ? o.id : newId()
    if (ids.has(id)) id = newId()
    ids.add(id)
    const savedAt = typeof o.savedAt === 'number' && Number.isFinite(o.savedAt) ? o.savedAt : 0
    out.push({ id, name, holdings, savedAt })
  }
  return out
}

export type SaveResult = { ok: true; list: SavedPortfolio[]; saved: SavedPortfolio } | { ok: false; reason: 'empty-name' | 'no-holdings' | 'full' }

/** Save under a name: an existing name (any case) is overwritten in place, otherwise appended. */
export function savePortfolio(list: SavedPortfolio[], name: string, holdings: Holding[], now = Date.now()): SaveResult {
  const n = cleanName(name)
  if (!n) return { ok: false, reason: 'empty-name' }
  const hs = sanitizeHoldings(holdings)
  if (!hs.length) return { ok: false, reason: 'no-holdings' }
  const existing = findByName(list, n)
  if (existing) {
    const saved = { ...existing, name: n, holdings: hs, savedAt: now }
    return { ok: true, saved, list: list.map((p) => (p.id === existing.id ? saved : p)) }
  }
  if (list.length >= MAX_SAVED) return { ok: false, reason: 'full' }
  const saved = { id: newId(now), name: n, holdings: hs, savedAt: now }
  return { ok: true, saved, list: [...list, saved] }
}

export type RenameResult = { ok: true; list: SavedPortfolio[] } | { ok: false; reason: 'empty-name' | 'taken' | 'missing' }

export function renamePortfolio(list: SavedPortfolio[], id: string, name: string): RenameResult {
  const n = cleanName(name)
  if (!n) return { ok: false, reason: 'empty-name' }
  if (!list.some((p) => p.id === id)) return { ok: false, reason: 'missing' }
  const clash = findByName(list, n)
  if (clash && clash.id !== id) return { ok: false, reason: 'taken' }
  return { ok: true, list: list.map((p) => (p.id === id ? { ...p, name: n } : p)) }
}

export function deletePortfolio(list: SavedPortfolio[], id: string): SavedPortfolio[] {
  return list.filter((p) => p.id !== id)
}

/** Same tickers in the same order with the same weights (to 0.1%). */
export function sameMix(a: Holding[], b: Holding[]): boolean {
  return a.length === b.length && a.every((h, i) => h.symbol === b[i].symbol && Math.abs(h.weight - b[i].weight) < 0.001)
}

// ---------- Store ----------

function read(): SavedPortfolio[] {
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? sanitizeSaved(JSON.parse(raw)) : []
  } catch {
    return []
  }
}
function write(list: SavedPortfolio[]) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* storage blocked or full — saved portfolios last for this visit only */
  }
}

interface PortfoliosState {
  saved: SavedPortfolio[]
  save: (name: string, holdings: Holding[]) => SaveResult
  rename: (id: string, name: string) => RenameResult
  remove: (id: string) => void
}

export const usePortfolios = create<PortfoliosState>()((set, get) => ({
  saved: typeof window === 'undefined' ? [] : read(),
  save: (name, holdings) => {
    const r = savePortfolio(get().saved, name, holdings)
    if (r.ok) {
      set({ saved: r.list })
      write(r.list)
    }
    return r
  },
  rename: (id, name) => {
    const r = renamePortfolio(get().saved, id, name)
    if (r.ok) {
      set({ saved: r.list })
      write(r.list)
    }
    return r
  },
  remove: (id) => {
    const list = deletePortfolio(get().saved, id)
    set({ saved: list })
    write(list)
  },
}))

// Keep other open tabs in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) usePortfolios.setState({ saved: read() })
  })
}
