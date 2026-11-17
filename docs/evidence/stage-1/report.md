# Stage 1 · Safe plan loading — verification report

Date: 2026-11-16 · Verified by a fresh verifier agent on 8f39382 (built none of the stage), then re-run by the PM on the merged review fixes (26cc43f) with the verifier's own script.

## Project checks
| Check | Result | Output |
|---|---|---|
| Tests | 1139/1139 pass, 71 files (baseline 1111) | [tests-after-fixes.txt](tests-after-fixes.txt) · before fixes: [tests.txt](tests.txt) |
| Typecheck | clean | [typecheck-after-fixes.txt](typecheck-after-fixes.txt) |
| Build | ok (usual chunk-size warning) | [build.txt](build.txt), rebuilt by `npm run e2e` |
| Dependency audit | 0 vulnerabilities (all, and `--omit=dev`) | [audit-after-fixes.txt](audit-after-fixes.txt) · [audit.txt](audit.txt) |
| e2e smoke (headless Chromium) | pass, incl. crafted `constructor`/`__proto__`/holding/stay-home links + reload | [e2e-after-fixes.txt](e2e-after-fixes.txt) |
| Lint | no lint script in the project | — |

## Acceptance checks
| # | Check | Result | Proof |
|---|---|---|---|
| 1 | A plan with no destination (stay home) survives a save/reload and a share-link round trip as stay home, and its odds match the stay-home run (proof: test) | pass | `shareCities.test.ts` › "stay home survives…" (4 tests, one compares `simulate` successRate) — [test-share-cities.txt](test-share-cities.txt); in the browser the stay-home link shows staying in St. Louis after reload: [link-stay-home-desktop-dark-reloaded.png](link-stay-home-desktop-dark-reloaded.png) |
| 2 | A link or stored plan with a home or destination id that isn't a known city (`constructor`, `__proto__`, `nowhere`) loads: an unknown home falls back to the default home, an unknown destination to stay home (proof: test) | pass | `shareCities.test.ts` › "hostile or unknown city ids" (8 ids, link + stored plan); the same file fails 11 of 14 against the old `share.ts`: [test-share-cities-before-fix.txt](test-share-cities-before-fix.txt) |
| 3 | The engine is never run with a home it can't resolve while the page names a destination (proof: test) | pass | `shareCities.test.ts` › invariant sweep over every home×destination pair of 25 values through all three load paths, and "a hostile plan simulates without throwing" — [test-share-cities.txt](test-share-cities.txt) |
| 4 | If a screen still throws while drawing, the app shows a recovery message with a "Reset plan" button instead of a blank page, and the reset clears the stored plan (proof: test for the reset; screenshot) | pass | `resetPlan.test.ts` (plan gone, theme kept, portfolios kept, share hash stripped) — [tests-after-fixes.txt](tests-after-fixes.txt); render error forced in the test harness only: [recover-desktop-dark.png](recover-desktop-dark.png), [recover-phone-dark.png](recover-phone-dark.png), after Reset: [after-reset-desktop-dark.png](after-reset-desktop-dark.png), [after-reset-plan-phone-dark.png](after-reset-plan-phone-dark.png) |
| 5 | Opening a crafted `#p=…` link with `constructor` as a city in the running app shows the app, not a blank page, and a reload still works (proof: run the product) | pass | [verify.mjs](verify.mjs) on the built app: 7 links (`constructor`, `__proto__`, `nowhere` as home and destination, plus stay home) at 1440 and 390 px, dark, loaded and reloaded — 98/98 assertions, no page errors: [run-product-after-fixes.txt](run-product-after-fixes.txt) (first run: [run-product.txt](run-product.txt)); e.g. [link-home-constructor-phone-dark.png](link-home-constructor-phone-dark.png) |

## Notes
- The re-run first failed 2 assertions that expected the whole `evelo:v2` key gone after Reset; review fix 3 keeps the theme there by design (`{"theme":"dark","themeV":2}`, no plan). The assertion was updated to "plan cleared, theme kept" and passes.
- Review (correctness + security, in parallel) found: holdings accepted prototype names (`constructor` crashed the plan rail and simulated as 100%), a stored `null` crashed before the error boundary, Reset dropped the theme, dead code, and Lighthouse leaving a Chrome profile in the repo root on WSL. All fixed in 26cc43f with tests (`shareHoldings.test.ts`, `persisted.test.ts`, `resetPlan.test.ts`) and e2e cases.
- Resetting from a `#p=` URL lands on the landing page (`/`), since the whole share hash is dropped.
