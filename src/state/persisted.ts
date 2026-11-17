// The stored `evelo:v2` value (plan inputs + theme), parsed defensively. Pure, so it can be tested
// without a window and shared by the store and the reset.

export interface Persisted {
  inputs?: unknown
  theme?: unknown
  themeV?: unknown
}

/** Stored text -> a plain object, or `{}` for anything else (missing, malformed, `null`, a number,
 *  an array, a string), so a corrupt value can't crash the app before it renders. */
export function parsePersisted(raw: string | null | undefined): Persisted {
  if (!raw) return {}
  try {
    const v: unknown = JSON.parse(raw)
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Persisted) : {}
  } catch {
    return {}
  }
}
