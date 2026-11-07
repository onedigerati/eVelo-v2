# Stage 8 evidence: profiles 51–75 and ship (2026-11-06)

## Check 1: 75 picks in the doc's order, each with a reason
`src/data/__tests__/expatPicks.test.ts` (75 picks ranked 1..75, inserted ranks pinned: Tavira 14, Grand Baie 20, Torrevieja 33, La Paz 37, Hopkins 40, Nice 58; last Vienna) and `localTaxes.test.ts` (EXPAT_PICKS equals the TOP75 list in full order). The fresh review re-checked the order and every `why` against the doc.

## Check 2: all 75 have full profiles
Tests: 9 scores 1–5, every fact, drawbacks, ≥3 http sources, no TODO, a file for every pick. Spot-read against the doc: the reviewer read 20 of the 25 new profiles (incl. Vienna, Roatán, Split, Cartagena, Grand Baie, Torrevieja, Mazatlán, Plovdiv); the coordinator read Vienna and caught the Plovdiv/Acibadem wording (fixed in the ranking, profile and doc).

## Check 3: picks 1, 51, 75 on phone/desktop × light/dark
```
desktop-light atlas: scrollWidth 1400 <= 1400 OK bg=rgb(245, 242, 234)
  Algarve: Top pick 1 for expat retirees: open the Algarve (Faro) profile | TOP PICK 1 OF 75 | tax lines: true | scroll OK
  Lima: Top pick 51 for expat retirees: open the Lima profile | TOP PICK 51 OF 75 | tax lines: true | scroll OK
  Vienna: Top pick 75 for expat retirees: open the Vienna profile | TOP PICK 75 OF 75 | tax lines: true | scroll OK
  show-all controls: ["Show all top 15","Show 26–75"]
desktop-dark atlas: scrollWidth 1400 <= 1400 OK bg=rgb(10, 13, 12)
  Algarve: Top pick 1 for expat retirees: open the Algarve (Faro) profile | TOP PICK 1 OF 75 | tax lines: true | scroll OK
  Lima: Top pick 51 for expat retirees: open the Lima profile | TOP PICK 51 OF 75 | tax lines: true | scroll OK
  Vienna: Top pick 75 for expat retirees: open the Vienna profile | TOP PICK 75 OF 75 | tax lines: true | scroll OK
  show-all controls: ["Show all top 15","Show 26–75"]
phone-light atlas: scrollWidth 390 <= 390 OK bg=rgb(245, 242, 234)
  Algarve: Top pick 1 for expat retirees: open the Algarve (Faro) profile | TOP PICK 1 OF 75 | tax lines: true | scroll OK
  Lima: Top pick 51 for expat retirees: open the Lima profile | TOP PICK 51 OF 75 | tax lines: true | scroll OK
  Vienna: Top pick 75 for expat retirees: open the Vienna profile | TOP PICK 75 OF 75 | tax lines: true | scroll OK
  show-all controls: ["Show 26–75"]
phone-dark atlas: scrollWidth 390 <= 390 OK bg=rgb(10, 13, 12)
  Algarve: Top pick 1 for expat retirees: open the Algarve (Faro) profile | TOP PICK 1 OF 75 | tax lines: true | scroll OK
  Lima: Top pick 51 for expat retirees: open the Lima profile | TOP PICK 51 OF 75 | tax lines: true | scroll OK
  Vienna: Top pick 75 for expat retirees: open the Vienna profile | TOP PICK 75 OF 75 | tax lines: true | scroll OK
  show-all controls: ["Show 26–75"]
ERRORS []
```
Screenshots: profile-{algarve,lima,vienna}-{desktop,phone}-{light,dark}.png.

## Check 4: tests, typecheck, build, audit, review
```
 Test Files  15 passed (15)
      Tests  163 passed (163)
typecheck: clean
dist/assets/index-YQeSC2xh.js                                   521.38 kB │ gzip: 170.16 kB
✓ built in 534ms
found 0 vulnerabilities
```
Review: [review.md](review.md).
