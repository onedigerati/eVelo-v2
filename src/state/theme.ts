// The starting theme. Dark is the default. Saved themes from before dark became the default carry
// no `themeV`; a System saved then was usually never chosen (every save writes the theme), so it
// reads as Dark, once. Saves now write `themeV: 2`, after which a saved System is kept.
// index.html's pre-paint script applies the same rule — keep the two in step.

export type ThemePref = 'system' | 'light' | 'dark'

export const DEFAULT_THEME: ThemePref = 'dark'
/** Written with every save; marks a saved theme as chosen after the switch to dark. */
export const THEME_VERSION = 2

export function themeFromSaved(saved: { theme?: unknown; themeV?: unknown }): ThemePref {
  const t = saved.theme
  if (t === 'light' || t === 'dark') return t
  if (t === 'system' && saved.themeV === THEME_VERSION) return 'system'
  return DEFAULT_THEME
}

/** What a save writes: the plan and theme, marked as saved after the switch. */
export function withThemeVersion<T extends object>(p: T): T & { themeV: number } {
  return { ...p, themeV: THEME_VERSION }
}
