# Stage 7 evidence: research and data for picks 51–75 (2026-11-06)

## Check 1: new countries have sourced rows and localTaxes entries
Summary rows added: Mauritius, Bulgaria, Albania, Austria, Honduras, Singapore, South Africa (Appendices I–J; towns in K). `src/data/localTaxes.ts` entries for MU, BG, AL, HN, AT, SG, ZA; the data test checks every source URL appears in the doc and hand-works ZA estate duty.
```
72 summary URLs, 0 missing from the appendices
```

## Check 2: draft top 75 with reasons; candidates outside have reasons
```
ranked rows: 75
outside rows: 13
```

## Check 3: every ranked city in CITIES with a verified record
One-off vitest over the 75 ids: 0 missing after adding Batumi and pricing Rome, Barcelona and Cartagena (livingcost.org method; Numbeo still 429). 15 Stage 7 cities added, all low confidence with notes — docs/research/cost-check-2026-11.md § Stage 7.

## Check 4: tests, typecheck, build
```
 Test Files  15 passed (15)
      Tests  163 passed (163)
typecheck: clean
dist/assets/index-DnaFcJph.js                                   521.38 kB │ gzip: 170.17 kB
✓ built in 426ms
```
(First run after the Batumi row showed 5 failing files from a quoting slip in its note; fixed in the next commit and re-run here.)
