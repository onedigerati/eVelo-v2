# Stage 2 · Western Europe — evidence
Verified 2026-11-15 on bac52cc, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 19 Western Europe profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names all ten countries | pass | [ledger-tests.txt](ledger-tests.txt): 40/40, a coverage case per country (Spain, France, Italy, Ireland, United Kingdom, Netherlands, Germany, Switzerland, Austria, Malta). 311 claims: 234 confirmed, 32 corrected, 45 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [ledger-tests.txt](ledger-tests.txt): the wording case on the real ledger |
| A fresh re-read of 10 ledger sources, at least one per country and spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 11 of 11 match, one or more per country (tax 3, estate 2, visa 3, healthcare 2, lending 1) |
| Three open Western Europe profiles in the running build, from three countries, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): Valencia (Spain), Vienna (Austria) and Sliema (Malta) in the production build show the corrected facts, Lending 2 and the borrow-step sentence in the summary; no console errors. [desktop-valencia-facts.png](desktop-valencia-facts.png) (local), [desktop-vienna-facts.png](desktop-vienna-facts.png) (local), [phone-sliema-facts.png](phone-sliema-facts.png) (local); script [verify2.mjs](verify2.mjs) |

Project checks: type check pass · tests 1022/1022 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities

## Limits of this evidence
- IBKR's and Schwab's own sites still return 403, so every broker claim stays "reportedly"; London's and Zurich's margin cash-out rests on one 2024 forum thread with mixed reports.
- Several official pages could not be read (Spain's inclusion.gob.es, Ireland's immigration and citizens' information pages, Swiss fedlex, Austria's migration.gv.at); the claims they would settle rest on consulate pages, PwC or dated secondary pages, each noted in the ledger.
- The US estate treaty texts with France, Italy, the UK, Switzerland and Austria were not read; the profiles' treaty detail rests on secondary pages.

## History
- 2026-11-15 · The first two browser runs timed out: the script didn't expand the collapsed pick tiers. Fixed the script (not the product) and reran.
