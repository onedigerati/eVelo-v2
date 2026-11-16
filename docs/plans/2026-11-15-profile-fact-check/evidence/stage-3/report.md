# Stage 3 · Eastern Europe, Mediterranean, Middle East, Africa — evidence
Verified 2026-11-15 on 6a39a68, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 17 profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names all thirteen countries | pass | [tests.txt](tests.txt): factCheck + expatPicks 75/75, a coverage case per country. 302 claims across 13 country files: 203 confirmed, 25 corrected, 74 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [tests.txt](tests.txt): the wording case on the real ledger |
| A fresh re-read of 13 ledger sources, one per country and spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 13 of 13 match (tax 3, estate 3, lending 2, visa 3, healthcare 2) |
| Three open profiles in the running build, from three of these countries, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): Dubai (UAE), Cape Town (South Africa) and Kotor (Montenegro) in the production build show the corrected wording (Dubai's AED 25,000 basic policy for a 67-year-old and "reportedly JCI-accredited"; Cape Town's R16,000–17,000 late-joiner premium, $2,200 and the White Paper; Kotor's "capital gains at 15% of the gain" and "should not apply, though") and none of the old (R17,500, Western-trained, Kotor General); Cape Town's summary (estate duty, deemed sale, exit tax) agrees with Estate 2 / Tax 3. No console errors. [desktop-dubai-facts.png](desktop-dubai-facts.png) (local), [desktop-cape-facts.png](desktop-cape-facts.png) (local), [phone-kotor-facts.png](phone-kotor-facts.png) (local); script [verify3.mjs](verify3.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1035/1035 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Limits of this evidence
- IBKR's and Schwab's own sites still return 403, so every broker claim stays "reportedly".
- Official pages that could not be read: aade.gr, Cyprus's Migration Department, lex.bg, en.goc.gov.tr, gov.me, elaws.moj.gov.ae, mb.gov.al; the claims they would settle rest on PwC or dated secondary pages, each noted in the ledger. Montenegro's inheritance statute, the UAE's non-Muslim estate law and the US–South Africa estate treaty text were not read.

## History
- 2026-11-15 · The browser script timed out finding Dubai through region chips and "Show more" (Middle East and Africa sit under the "Other" chip). Fixed the script (not the product) to use the search box, and reran.
