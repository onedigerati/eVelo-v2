# Stage 3 · Below the card — evidence
Verified 2026-11-24 on 1b85a7b, plus uncommitted changes (holdings.ts, IncomeCompare.tsx, Walkthrough.tsx, SameStorm.tsx, css, belowCard tests, e2e/income-compare.mjs)

Released 2026-11-24: pushed f5d0853, deployed and checked on the live site.

All e2e runs use `reducedMotion: 'reduce'` against the built app, at 1280 and 390.

| Check | Result | Evidence |
|---|---|---|
| The walkthrough (chapters, overview chart, twin ledgers, Play story) follows the Holdings switch: on a shared mix it reads the swapped pair's per-year results, and on "Each its own" it is unchanged | pass | [below-tests.txt](below-tests.txt): `the walkthrough reads the swapped pair's per-year results; "Each its own" is unchanged`; [e2e-income-compare.txt](e2e-income-compare.txt): `below-* eVelo's mix / mode's mix / back to each its own: walkthrough chapters, story figure, overview chart, twin ledgers … (node …)`, `Play story stops at the chapter's end with the swapped eVelo's figure` |
| Same storm follows the switch: it gets the swapped plan, shows the same sample futures (same path indices) and each plan's path on the shared mix, and its "same futures" gate still holds | pass | [below-tests.txt](below-tests.txt): `Same storm gets the swapped plan: same path indices, each plan's path on the shared mix, gate holds`, `the gate still holds on a shared mix`; [e2e-income-compare.txt](e2e-income-compare.txt): `node: the swapped pairs pick the same path indices as the own pair` (663/251/934/664), `storm caption is node's for Typical` on each mix, `storm caption for Early crash is node's on the mode's mix`; [storm, eVelo's mix, 1280](income-compare-below-1280-evelo-mix-storm.png) (local) |
| On a shared mix the walkthrough and Same storm say which mix they're on (the borrowed one), consistent with the card's line | pass | [e2e-income-compare.txt](e2e-income-compare.txt): `walkthrough and Same storm say which mix`, `on the mode's mix the lines are the card's`, `no mix line below the card` (own); [walkthrough, mode's mix, 390](income-compare-below-390-mode-mix-walkthrough.png) (local), [walkthrough, eVelo's mix, 1280](income-compare-below-1280-evelo-mix-walkthrough.png) (local) |
| The full suite is green and the earlier stages' checks still pass in the built app at 1280 and 390 | pass | [tests.txt](tests.txt) 1680 passed, 1 skipped; [e2e-income-compare.txt](e2e-income-compare.txt) 262 ok / 0 fail, [e2e-income.txt](e2e-income.txt) 269 ok, [e2e-income-sync.txt](e2e-income-sync.txt) 61 ok, [e2e-door.txt](e2e-door.txt) 31 ok, [e2e-smoke.txt](e2e-smoke.txt) passed |
| It's live: pushed to main and the GitHub Pages deploy serves the switch | pass | [deploy-run.json](deploy-run.json): Deploy to GitHub Pages run 45478131037 succeeded on f5d0853 (pushed at the user's "deploy"); [live-income-compare.txt](live-income-compare.txt): the income-compare e2e run against https://onedigerati.github.io/eVelo-v2/, 262 ok, 0 failed, holdings and below-card blocks included |
| Re-run of stage 1: all four checks (proof: test) | pass | [tests.txt](tests.txt): swap.test.ts and swapRuns.test.ts in the green suite |
| Re-run of stage 2: all five checks (e2e `holdings-1280` / `holdings-390` block) | pass | [e2e-income-compare.txt](e2e-income-compare.txt): 60 `holdings-*` lines, all ok |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1680 passed, 1 skipped ([tests.txt](tests.txt)) · build pass (in [e2e-smoke.txt](e2e-smoke.txt)) · e2e: income-compare, income, income-sync, door, smoke all pass
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
