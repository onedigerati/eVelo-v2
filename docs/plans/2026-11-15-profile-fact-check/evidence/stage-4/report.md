# Stage 4 · Mexico, Central America, Caribbean — evidence
Verified 2026-11-15 on 329b572, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 24 profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names all seven countries | pass | [tests.txt](tests.txt): factCheck + expatPicks 82/82, a coverage case per country. 198 claims across 7 country files: 130 confirmed, 16 corrected, 52 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [tests.txt](tests.txt): the wording case on the real ledger |
| A fresh re-read of 10 ledger sources, at least one per country and spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 10 of 10 match (tax 2, estate 2, lending 1, visa 3, healthcare 2), four of them backing corrections |
| Three open profiles in the running build, from three of these countries, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): San Miguel de Allende (Mexico: the MXN 600,000 loan-reporting rule, "Hospital Joya and MAC; the H+ hospital closed in 2020"), Roatán (Honduras: Hospital Satuyé, Schwab "does not accept Honduras", summary "reportedly replaced only in 2025" with Healthcare 1) and Panama City on a phone (Decree 17, "the US is on the list", Law 562, "internationally trained") show the new wording and none of the old ("18 months", "US-trained", "list is unverified", "including H+"). No console errors. [desktop-san-facts.png](desktop-san-facts.png) (local), [desktop-roatan-facts.png](desktop-roatan-facts.png) (local), [phone-panama-facts.png](phone-panama-facts.png) (local); script [verify4.mjs](verify4.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1042/1042 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Limits of this evidence
- IBKR's, Schwab's and Fidelity's own sites still return 403; broker claims stay "reportedly".
- Panama's Decree 17 text was not found; the new Qualified Investor thresholds rest on Kraemer & Kraemer and Fragomen. Costa Rica's Inversionista amount is split between sources ($150k vs a reported $200k), and the profile says so. PwC has no Belize summary; Belize's no-wealth-tax rests on TaxAtlas.

## History
- 2026-11-15 · The first browser run failed on a syntax error in the copied script (a line edit hit the wrong line). Fixed the script and reran.
