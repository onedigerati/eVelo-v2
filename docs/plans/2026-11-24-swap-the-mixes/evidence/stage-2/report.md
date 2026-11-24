# Stage 2 · The switch — evidence
Verified 2026-11-24 on a51c167, plus uncommitted changes (holdings.ts, IncomeCompare.tsx, compare.css, e2e/income-compare.mjs, holdings tests)

All e2e runs use `reducedMotion: 'reduce'` (`open()` in e2e/income-compare.mjs) against the built app, at 1280 and 390.

| Check | Result | Evidence |
|---|---|---|
| The comparison card has a "Holdings" switch with three choices (Each its own · Both on eVelo's mix · Both on this mode's mix), a radio group reachable and operable by keyboard; "Each its own" is the default and the default view is unchanged from before this plan | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `holdings-1280: three choices`, `"Each its own" is the default`, `the default view is unchanged`, `Tab enters the group on the checked choice`, `focus follows the arrow`; the earlier compare blocks (pre-plan checks) still pass |
| Picking a shared mix re-runs the borrowing plan (via `useSwapPair`) and the columns and the comparison chart show the swapped pair's results; switching back to a seen choice is instant (no loading state) | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `on eVelo's mix 99% \| 86% (node 99% \| 86%)`, tax/sold/estate match node, `the chart shows the swapped mode's median`, `on the mode's mix 100% \| 89% (node …)`, `switching back to eVelo's mix is instant` |
| The borrowing plan's mix bar shows the borrowed mix with a "borrowed" tag; a line says what's being compared; on "Both on eVelo's mix" a note says the mode's run is approximate (mapped onto its stock and muni shares) | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `tagged borrowed`, `what's compared`, `the approximate note`; [holdings-1280-mode-mix](income-compare-holdings-1280-mode-mix.png) (local), [holdings-390-evelo-mix](income-compare-holdings-390-evelo-mix.png) (local) |
| The switch goes back to "Each its own" on leaving the results and coming back, and neither saved plan changes (storage and share link unchanged) | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `neither saved plan nor the link changed`, `back to "Each its own" after leaving`, `still nothing saved after leaving` |
| It works at a 390px phone width with no horizontal scroll, and with reduced motion | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `holdings-390: …` (all ok), `no horizontal scroll` on both mixes; [holdings-390-evelo-mix](income-compare-holdings-390-evelo-mix.png) (local), [holdings-390-mode-mix](income-compare-holdings-390-mode-mix.png) (local) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1670 passed, 1 skipped ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt)) · income-compare e2e pass ([e2e-income-compare.txt](e2e-income-compare.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

Note: on eVelo's mix the mode's lifetime tax reads $167K as on its own mix; checked in node — $166,836 vs $167,062 (fewer taxable dividends vs no munis roughly cancel in this scenario); the e2e pins all three figures to node.
