# Stage 5 · South America and Canada — evidence
Verified 2026-11-15 on 95ed183, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 12 profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names all eight countries | pass | [tests.txt](tests.txt): factCheck + expatPicks 90/90, a coverage case per country. 183 claims across 8 country files: 133 confirmed, 11 corrected, 39 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [tests.txt](tests.txt): the wording case on the real ledger |
| A fresh re-read of 8 ledger sources, one per country and spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 8 of 8 match (tax 2, estate 1, lending 1, visa 3, healthcare 1), two of them backing corrections |
| Three open profiles in the running build, from three of these countries, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): Lima (Peru: +Salud "closed to new members until the end of 2027", Schwab "reportedly lists Peru", Lending 4), Santiago (Chile: "24 months of temporary residence", "led by Clínica Alemana", Lending 4) and Montevideo on a phone (Uruguay: the 7% option "reportedly closed to new residents", "large qualifying investment") show the new wording and none of the old ("has long waits", "was not checked", "one source says 7%", "a 2026 bill is pending", "among Latin America's best"). No console errors. [desktop-lima-facts.png](desktop-lima-facts.png) (local), [desktop-santiago-facts.png](desktop-santiago-facts.png) (local), [phone-montevideo-facts.png](phone-montevideo-facts.png) (local); script [verify5.mjs](verify5.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1050/1050 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Limits of this evidence
- IBKR's sites (and interactivebrokers.ca, CIRO, CIPF) returned 403 or 404; broker claims stay "reportedly". Schwab's acceptance rests on one dated secondary check (Your Tax Base, 23 Oct 2026).
- Lower in the source order: Quebec probate (Willful, undated), Peru's $1,000 rentista amount, Ecuador's IESS minimum, Chile's FONASA and Isapre rules (Rio Times). Peru's no-wealth-tax verdict rests on PwC listing none.
