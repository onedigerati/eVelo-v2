/**
 * The wide profile's pinned photo banner (above 1440px): it shrinks to a strip once the sheet is
 * scrolled and grows back at the top. Pure logic here; the hook in ProfileSheet wires it up.
 *
 * No flicker, two ways. Hysteresis: it shrinks past COMPACT_AT but only grows back at EXPAND_AT
 * (the very top). And shrinking takes height out of the scroller, which could clamp scrollTop
 * back to the top and grow it again; so while it's a strip, a spacer under the content keeps at
 * least COMPACT_AT of scroll. A profile that overflows by COMPACT_AT or less never shrinks.
 */

/** Wide layout: the same breakpoint as the CSS (`@media (min-width: 1441px)`). */
export const WIDE_PROFILE_QUERY = '(min-width: 1441px)'
/** Shrink once scrolled past this (px). */
export const COMPACT_AT = 60
/** Grow back only at or above this (px): the top, give or take a wheel tick's rounding. */
export const EXPAND_AT = 4

/** The strip's photo height at a viewport width; mirrors `--pgal-strip` in atlas.css. */
export function stripHeight(viewportWidth: number): number {
  return Math.min(210, Math.max(170, viewportWidth * 0.09))
}

/** Whether the banner should be a strip at this scrollTop, given whether it is one now. */
export function nextCompact(compact: boolean, scrollTop: number): boolean {
  return compact ? scrollTop > EXPAND_AT : scrollTop > COMPACT_AT
}

/**
 * Spacer (px) under the content while the banner is a strip, so the scroll range left after
 * shrinking is at least COMPACT_AT: `maxScroll` is the full banner's scroll range and `saved`
 * the height the banner gives up. Zero when the content overflows enough on its own.
 */
export function compactSpacer(maxScroll: number, saved: number): number {
  return Math.max(0, Math.ceil(saved + COMPACT_AT - maxScroll))
}
