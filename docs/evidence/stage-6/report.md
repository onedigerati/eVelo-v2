# Stage 6 · Asia-Pacific — evidence
Verified 2026-11-15 on 37153e7, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 22 profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names all eleven countries | pass | [tests.txt](tests.txt): factCheck + expatPicks 101/101, a coverage case per country. 245 claims across 11 country files: 173 confirmed, 13 corrected, 59 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [tests.txt](tests.txt): the wording case on the real ledger |
| A fresh re-read of 11 ledger sources, one per country and spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 11 of 11 match (tax 3, estate 2, lending 1, visa 3, healthcare 2), five of them backing corrections |
| Three open profiles in the running build, from three of these countries, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): Bali (Indonesia: E33 "USD 130,000", "10 in all", E33F "USD 3,000/month", evacuation "Singapore or Bangkok" in the fact and drawback 2), Taipei (Taiwan: NHI "5.17%", "trips abroad of under 6 months") and Sydney on a phone (Australia: CGT change "under a law passed in June 2026") show the new wording and none of the old ("IDR 2bn", "1,500 or 3,000", "Jakarta or Singapore", "4.69%", "as proposed in the 2026 budget"). No console errors. [desktop-bali-facts.png](desktop-bali-facts.png) (local), [desktop-taipei-facts.png](desktop-taipei-facts.png) (local), [phone-sydney-facts.png](phone-sydney-facts.png) (local); script [verify6.mjs](verify6.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1061/1061 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Limits of this evidence
- Every IBKR site, schwab.com.sg, mofa.go.jp, immi.homeaffairs.gov.au, ato.gov.au, health.govt.nz and nhi.gov.tw returned 403; those claims rest on PwC or dated secondary pages, noted in the ledger. MM2H amounts rest on a dated magazine page (the official page puts them in images).

## History
- 2026-11-15 · The first browser run timed out: Bali's list name is "Bali (Denpasar / Canggu)", which the script's button pattern didn't allow. Fixed the script (not the product) and reran.
