# Stage 1 · Pick reasons — evidence
Verified 2026-11-15 on 0d0100d, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| For every `rankFlag` claim, the flagged wording is gone from its pick's `why` (or summary) and the line agrees with the ledger's verdict; each flag records how it was resolved in the ledger | pass | [tests.txt](tests.txt): `pickReasons.test.ts`. All 27 flags (the fact check's 25, plus Las Terrenas and Santiago from its questions) carry `rankResolved`, and the wording each quotes is in the pick's `why`, its summary or the rubric. The old phrases, listed per city, are gone, and Nice's summary says "58th of the 75". `factCheck.test.ts` allows `rankResolved` only with a `rankFlag` |
| Every ranked pick that scores lending 2 says in its `why` that the borrow step is in doubt, and the ranked 75's order is unchanged | pass | [tests.txt](tests.txt): `pickReasons.test.ts`. All 27 lending-2 picks carry "borrowing cash against the portfolio is reportedly blocked for residents" and no other pick does. The 75 ids are in the order pinned from HEAD, and every `why` is still one sentence. The builder broke each guard once and the matching test failed |
| Three rewritten reasons read correctly in the running build: a Portugal pick, Tbilisi and Asunción on the Top picks list | pass | [preview-run.txt](preview-run.txt), production build, desktop and phone, "Also worth a look" rows: Madeira (16, Portugal; the top 15 cards show taglines, not reasons) with the borrow warning, Tbilisi (23) with "no US estate treaty, only the old 1973 US–USSR income tax treaty", and Asunción (50) with the July 2026 residence rule. No console errors. [desktop-also-tbilisi.png](desktop-also-tbilisi.png) (local), [phone-also-tbilisi.png](phone-also-tbilisi.png) (local); script [verify1.mjs](verify1.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1111/1111 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## History
- 2026-11-15 · The first browser run timed out on Asunción: the script's "show more" button pattern missed the list's "Show 26–75" toggle. Fixed the script (not the product) and reran.
