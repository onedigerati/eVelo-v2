// UI-only plan state (not part of PlanInputs): weight locks, stable holding colours, which plan
// sections are open, and the ticker palette's open flag. Locks and open sections persist per
// device; colours are assigned per session.

import { useEffect } from 'react'
import { create } from 'zustand'
import { useStore } from '../../state/store'
import { sanitizeOpenSections, type OpenSections, type PlanSectionId } from './openSections'

const LS_LOCKS = 'evelo:v2:locks'
const LS_SECTIONS = 'evelo:v2:sections'
export const PALETTE_SLOTS = 10

function readLocks(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(LS_LOCKS) ?? '[]')
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 20) : []
  } catch {
    return []
  }
}

function readOpenSections(): OpenSections {
  try {
    return sanitizeOpenSections(JSON.parse(window.localStorage.getItem(LS_SECTIONS) ?? '{}'))
  } catch {
    return {}
  }
}

interface PlanUi {
  locked: string[]
  /** symbol -> categorical slot (0..9). A holding keeps its colour while it stays in the list. */
  slots: Record<string, number>
  paletteOpen: boolean
  openSections: OpenSections
  setSectionOpen: (id: PlanSectionId, open: boolean) => void
  toggleLock: (symbol: string) => void
  setPaletteOpen: (open: boolean) => void
}

export const usePlanUi = create<PlanUi>()((set) => ({
  locked: readLocks(),
  slots: {},
  paletteOpen: false,
  openSections: readOpenSections(),
  setSectionOpen: (id, open) =>
    set((s) => {
      const openSections = { ...s.openSections, [id]: open }
      try {
        window.localStorage.setItem(LS_SECTIONS, JSON.stringify(openSections))
      } catch {
        /* fine without */
      }
      return { openSections }
    }),
  toggleLock: (symbol) =>
    set((s) => {
      const locked = s.locked.includes(symbol) ? s.locked.filter((x) => x !== symbol) : [...s.locked, symbol]
      try {
        window.localStorage.setItem(LS_LOCKS, JSON.stringify(locked))
      } catch {
        /* fine without */
      }
      return { locked }
    }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}))

/** Keep colour slots and locks in step with the current holdings (call once, high in the tree). */
export function useSyncPlanUi() {
  const holdings = useStore((s) => s.inputs.holdings)
  useEffect(() => {
    const syms = holdings.map((h) => h.symbol)
    usePlanUi.setState((s) => {
      const slots: Record<string, number> = {}
      for (const sym of syms) if (Object.hasOwn(s.slots, sym)) slots[sym] = s.slots[sym]
      const used = new Set(Object.values(slots))
      for (const sym of syms) {
        if (Object.hasOwn(slots, sym)) continue
        let k = 0
        while (used.has(k) && k < PALETTE_SLOTS - 1) k++
        slots[sym] = k
        used.add(k)
      }
      const locked = s.locked.filter((x) => syms.includes(x))
      return { slots, locked: locked.length === s.locked.length ? s.locked : locked }
    })
  }, [holdings])
}

/** Props for a plan Section: open as the visitor last left it (collapsed at first), remembered on toggle. */
export function useSectionOpen(id: PlanSectionId) {
  const open = usePlanUi((s) => s.openSections[id] ?? false)
  const setSectionOpen = usePlanUi((s) => s.setSectionOpen)
  return { open, onOpenChange: (next: boolean) => setSectionOpen(id, next) }
}

export const lockedSet = (locked: string[]) => new Set(locked)
export const slotColor = (slot: number | undefined) => `var(--cat-${((slot ?? 0) % PALETTE_SLOTS) + 1})`
