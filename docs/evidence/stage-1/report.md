# Stage 1 · Method and Portugal pilot — evidence
Verified 2026-11-15 on 7f833cf, plus uncommitted changes (the stage's own work)

| Check | Result | Evidence |
|---|---|---|
| The ledger in `docs/research/fact-check-2026-11/` holds the claims shared by many profiles (the US estate exemption, the US estate-treaty list, IBKR and Schwab International terms for residents abroad, the EU PRIIPs rule) and every claim in the five facts of the 6 Portugal profiles, each with a verdict, a source URL and the date it was read; none is left pending | pass | [ledger-tests.txt](ledger-tests.txt): 30/30, including the five shared topics, Portugal's city × fact coverage, and verdict, URL, read date and `says` on every claim. 16 shared claims, 54 Portugal claims (38 confirmed, 7 corrected, 9 can't confirm) |
| For every corrected claim, the old wording is gone from the Portugal profiles and the new wording is in them | pass | [ledger-tests.txt](ledger-tests.txt): "old wording gone, new wording present" on the real ledger, with fixture cases that fail on bad input |
| A fresh re-read of 8 ledger sources, spread across the five facts, finds each page says what the ledger says it says | pass | [source-reread.md](source-reread.md): 8 of 8 match (visa 1, tax 2, estate 3, lending 1, healthcare 2). One further source, the Madeira tax authority's PDF, could not be re-read |
| An open Portugal profile in the running build shows the corrected facts, with scores, summary and drawbacks that agree with them | pass | [preview-run.txt](preview-run.txt): Madeira, Algarve and Lisbon in the production build show the corrected facts, Lending 2, the borrow-step sentence in the summary and the reworded drawback; no console errors. [desktop-madeira-facts.png](desktop-madeira-facts.png) (local), [desktop-algarve-facts.png](desktop-algarve-facts.png) (local), [phone-lisbon-facts.png](phone-lisbon-facts.png) (local); script [verify1.mjs](verify1.mjs) |

Project checks: type check pass · tests 1012/1012 ([tests.txt](tests.txt); baseline 982 + 30 new) · build pass (no lint script)
Audit: `npm audit --omit=dev`: 0 vulnerabilities

## Limits of this evidence
- IBKR's and Schwab's own sites returned 403 to every read, so every broker claim rests on secondary pages or on IBKR Ireland documents hosted by LYNX, and stays worded "reportedly".
- The two Madeira tax corrections rest on one read of the AT-RAM PDF by the builder; the re-read could not open it.
- Several healthcare claims are confirmed only on secondary or older pages (each has a note in the ledger).
