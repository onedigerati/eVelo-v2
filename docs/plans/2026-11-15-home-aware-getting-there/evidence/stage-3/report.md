# Stage 3 · Home-aware card — evidence
Verified 2026-11-14 on d334193, plus uncommitted changes (stage 3 work)

| Check | Result | Evidence |
|---|---|---|
| A city profile's Getting there shows the computed route line for the current home city, with the city's local note under it, at desktop and phone width (proof: screenshots) | pass | [preview-run.txt](preview-run.txt); [desktop-lisbon-from-sandiego.png](desktop-lisbon-from-sandiego.png) (local), [phone-lisbon-from-sandiego.png](phone-lisbon-from-sandiego.png) (local) |
| Changing the home city updates the open profile's line with no reload, e.g. San Diego → London turns Lisbon from "one stop" to "nonstop" (proof: scripted run with screenshots) | pass | [live-run.txt](live-run.txt): the sheet stays open while home changes in the store, and the line goes from one stop to nonstop; [live-1-sandiego.png](live-1-sandiego.png), [live-2-london.png](live-2-london.png) (local). In the production build, home is set on the Plan page by hash navigation without a reload: [preview-run.txt](preview-run.txt), [desktop-lisbon-from-london.png](desktop-lisbon-from-london.png), [phone-lisbon-from-london.png](phone-lisbon-from-london.png) (local) |
| The home city's own profile shows no route line, only the local note (proof: screenshot) | pass | [preview-run.txt](preview-run.txt) "London own"; [desktop-london-home-own.png](desktop-london-home-own.png), [phone-london-home-own.png](phone-london-home-own.png) (local); `homeRoute.test.ts` in [notes-tests.txt](notes-tests.txt) |
| All 133 local notes are home-independent: none mentions the US, Americans or a US airport/airline as the reader's origin, and none lists nonstop routes (proof: test) | pass | [notes-tests.txt](notes-tests.txt): `accessNotes.test.ts`, 133 cases |
| Re-run of stage 2: Ten routes picked at random match the airport's published route list | pass | [rerun-stage2-sample.txt](rerun-stage2-sample.txt): route data is unchanged since d334193, and the same seed draws the same ten routes, checked against Wikipedia today ([stage 2 sample](../stage-2/route-sample.md)) |

Stage 1's checks are all tests, and so is the rest of stage 2's; the full suite below covers them.

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · no lint script · tests 982/982 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt)) · no console errors in either run
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
Script: [verify3.mjs](verify3.mjs). It needs Playwright, borrowed from a sibling repo: eVelo doesn't install it.
