# Stage 7 · United States — evidence
Verified 2026-11-15 on 131d73a, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger holds every claim in the five facts of the 33 profiles, each with a verdict, a source URL and the date it was read; none is left pending, and `CHECKED_COUNTRIES` names the United States | pass | [tests.txt](tests.txt): factCheck + expatPicks 102/102, including the United States coverage case. `united-states.json` holds 240 claims: 219 confirmed, 17 corrected, 4 can't confirm |
| For every corrected claim, the old wording is gone from those profiles and the new wording is in them | pass | [tests.txt](tests.txt): the wording case on the real ledger |
| A fresh re-read of 12 ledger sources, from 12 different states and spread across tax, estate and healthcare, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 12 of 12 match (tax 5, estate 4, healthcare 3), seven of them backing corrections |
| Three open profiles in the running build, from three states, show the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt), production build. **Denver (CO):** summary, tax fact and drawback all say Amendment 87 "passed on the AP's call … not yet certified"; "narrowly ahead" is gone. **Las Vegas (NV):** "University Medical Center and Sunrise Hospital (since April 2026) are Nevada's two Level 1 trauma centres"; "only Level 1" is gone. **Miami (FL), on a phone:** the property-tax drawback says "about 62%, unofficial results; the state certifies on 17 November"; "61%" is gone. No score changed in the stage, and none of the three pages disagrees with its scores. No console errors. Screenshots: [desktop-denver-facts.png](desktop-denver-facts.png) (local), [desktop-las-facts.png](desktop-las-facts.png) (local), [phone-miami-facts.png](phone-miami-facts.png) (local). Script: [verify7.mjs](verify7.mjs) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · tests 1062/1062 ([tests.txt](tests.txt)) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Limits of this evidence
- Colorado's Amendment 87 and Florida's Amendment 3 rest on AP calls and unofficial results. Colorado certifies by 30 November and Florida on 17 November 2026; both profiles say a result is pending certification.
- The FTB, State Controller and mass.gov pages returned 403. California's rates rest on Tax Foundation's February 2026 table, and Massachusetts's on the statutes, Bloomberg Tax and dated 2026 pages.
- Becker's returned 403, so the two KFF clinician-supply claims (Nevada, Idaho) remain can't-confirm, hedged with "reportedly".
