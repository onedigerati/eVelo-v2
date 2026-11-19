# Stage 5 · The reveal — evidence
Verified 2026-11-18 on 64dc7f0, plus the uncommitted question flow and the review's fixes

| Check | Result | Evidence |
|---|---|---|
| Six questions, progress mark, Back/Next, saved to `evelo:v2:income`, Edit answers; desktop split, small phone chart | pass | [verify-own.txt](verify-own.txt) (the verifier's own answers: $1.5M, 40% basis, $70k, 66, 25 years, 40% stocks, 80% munis, Chicago, jointly, $36k Social Security from 70; reload mid-flow resumes at Q3, after the end on results; Edit answers keeps $1,500,000); [e2e-income.txt](e2e-income.txt) (269 ok); screenshots v-*-q1..q6.png (local) |
| The chart is the median by year, one layer per question in order, naming what it just added in dollars | pass | [verify-own.txt](verify-own.txt): `data-layers` 0,0,1,2,3,4,5; every "Just added" amount equals year 1 of the verifier's own `runIncomePaths` ([expected-runIncomePaths.json](expected-runIncomePaths.json)) |
| One-line summary, chart with legend, three measures from the engine, the lasts card brass and "Same test as eVelo" | pass | [verify-own.txt](verify-own.txt): 100/0/47% = node 1/0/0.46625; "about half" (34,842 / 70,000 = 0.498); chart's sold to cover = engine median gapSold in 25/25 rows |
| Year-by-year ledger, scrolls on phone; "How this is worked out" lists what's left out | pass | [verify-own.txt](verify-own.txt): rows 1, 9, 25 match in all 7 money columns; box scrolls 896 > 306 px, page overflow 0; AMT, IRMAA, state simplifications, foreign home federal only, historical months only all present |
| Keyboard and screen reader, no horizontal scroll at 390, main site unchanged, suite green | pass | [verify-own.txt](verify-own.txt): keyboard-only walk, axe 0 violations, focus moves, chart aria-label + hidden table; overflow 0 at 390 and 320; "Updating…" shows and clears; blocked worker → out-of-date label and dimmed figures; [e2e-main.txt](e2e-main.txt) (17 ok); [e2e-door.txt](e2e-door.txt) (31 ok) |

Project checks: typecheck pass ([typecheck.txt](typecheck.txt)) · lint none configured · tests 1391 passed, 1 skipped (fixture writer, env-gated) ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

Verified by a fresh agent that built none of it; this table written to the file by the main session.

After the verify: the results page's out-of-date label was grey (a later `.ires__status` rule won the cascade); the main session raised the stale selectors' specificity and re-ran the verifier's colour script on a fresh build: brass on both screens at 1280/390, light and dark ([stale-colour-after-fix.txt](stale-colour-after-fix.txt)). The large gap on phone question screens is the mockup's layout (sentence centred, Next at the bottom).
