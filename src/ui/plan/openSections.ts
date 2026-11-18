// Which plan sections are open, as stored per device (planUi.ts keeps it). Pure, so it's tested.

/** The plan's collapsible sections, in order. Each starts collapsed until the visitor opens it. */
export const PLAN_SECTIONS = ['portfolio', 'life', 'place', 'borrowing', 'model'] as const
export type PlanSectionId = (typeof PLAN_SECTIONS)[number]
export type OpenSections = Partial<Record<PlanSectionId, boolean>>

/** Stored open flags, keeping only known section ids with boolean values. */
export function sanitizeOpenSections(raw: unknown): OpenSections {
  const out: OpenSections = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const id of PLAN_SECTIONS) {
    if (!Object.hasOwn(raw, id)) continue
    const v = (raw as Record<string, unknown>)[id]
    if (typeof v === 'boolean') out[id] = v
  }
  return out
}
