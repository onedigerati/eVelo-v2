# Stage 4 · The door — evidence
Verified 2026-11-18 on 4ecfd8e, plus the review's uncommitted fixes

| Check | Result | Evidence |
|---|---|---|
| Label click → plan at once; one or two quick arrow clicks → plan after a 300 ms wait; five quick clicks → coupon, which opens the mode and stays for the visit (sessionStorage) | pass | [verify-run.txt](verify-run.txt) (label 45/29 ms; 1 click 318/308 ms; 2 clicks 385/397 ms; 3–4 hold; 5 → coupon; kept on reload, gone in a new context; mouse at 1280, taps at 390); [e2e-door.txt](e2e-door.txt); door-{desktop,phone}-{coupon,after-4}.png (local) |
| `#income` opens the mode, and nothing on the main site links to or names it; keyboard and screen-reader users still reach the plan through the label | pass | [name-scan.json](name-scan.json) (no link, no "Admit"; "income" hits are eVelo's own wording: "Income starts", tax notes, Method's other income); [verify-run.txt](verify-run.txt) (Tab×7, Enter → #plan in 30 ms); [tests-stage4-units.txt](tests-stage4-units.txt) (incomeRoute.test.ts) |
| Mode in its own chunk, fetched only on `#income`; main chunk grows ≤ 3 KB gzipped | pass | [network-log.txt](network-log.txt); [chunk-size.txt](chunk-size.txt) (main −549 B, eager JS +1,016 B, CSS +372 B vs 544668b) |
| State under `evelo:v2:income` parsed like `sanitizeInputs` (falls back or clamps); the error boundary's Reset clears it | pass | [verify-run.txt](verify-run.txt) (9 stored-value cases, sentences shown; the real boundary forced by blocking a chunk, Reset removes the key); error-boundary.png (local); [tests-stage4-units.txt](tests-stage4-units.txt) (incomeState, resetPlan) |
| The mode shell runs the `income` request and shows the "money lasts" rate on desktop and phone, in brass, with a way back | pass | [verify-run.txt](verify-run.txt) (brass = `--bruised` at 1280/390, no horizontal scroll, back → #plan; three worker failures → error message in ~230 ms); mode-{desktop,phone,worker-failed}.png (local); [e2e-income.txt](e2e-income.txt) |

Project checks: typecheck pass ([typecheck.txt](typecheck.txt)) · lint none configured · tests 1316/1316 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt)) · e2e smoke pass ([e2e-smoke.txt](e2e-smoke.txt))
Audit: `npm audit --omit=dev`: 0 high, 0 critical ([audit.txt](audit.txt))

Verified by a fresh agent that built none of it; this table written to the file by the main session. Script: [verify-script.mjs](verify-script.mjs).
