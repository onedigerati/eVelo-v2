# Stage 1 · Swapped runs — evidence
Verified 2026-11-24 on e382030, plus uncommitted changes (src/ui/income/swap.ts, swapRuns.ts and their tests)

| Check | Result | Evidence |
|---|---|---|
| eVelo's mix maps onto the mode's shares by asset class: equity, real estate, commodity and crypto count as stocks; bonds count as bonds; MUB and VWITX count as munis within the bonds; a plan with no bonds gives muni share 0 | pass | [swap-tests.txt](swap-tests.txt): `mixShares › equity, real estate, commodity and crypto count as stocks; bonds as bonds; MUB and VWITX as munis within the bonds`, `› a plan with no bonds gives muni share 0` |
| The swapped eVelo plan is the saved plan with holdings = the mode's four funds at its weights, built without the sanitizer (which drops the bond funds), and it simulates over the same months as the unswapped plan | pass | [swap-tests.txt](swap-tests.txt): `the swapped eVelo plan › is the saved plan with holdings = the mode's four funds at its weights, built without the sanitizer`, `› simulates over the same months as the unswapped plan` (month count, CPI and every drawn month index match, default and young-holdings plans) |
| Each swapped run is paired with the inputs it ran for and cached for the session by its key, so switching back is instant, and a swapped run never cancels the plan's own run | pass | [swap-tests.txt](swap-tests.txt): `SwapRuns › pairs each swapped run with the inputs it ran for and caches it for the session by its key`, `› a swapped run never cancels the plan's own runs`, `› a newer swapped run supersedes only an older swapped run of its kind` |
| The sample futures Same storm picks are the same path indices with eVelo on the mode's mix as on its own | pass | [swap-tests.txt](swap-tests.txt): `Same storm under the swap › picks the same path indices with eVelo on the mode's mix as on its own (real engine calls)` |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1656 passed, 1 skipped ([tests.txt](tests.txt)) · build: not run (no UI wired this stage; stage 2 builds)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
