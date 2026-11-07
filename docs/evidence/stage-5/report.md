# Stage 5 evidence: BBD ranking and 50 profiles (2026-11-06)

## Check 1: 50 picks ranked 1–50 in the research order, with reasons; method and sources name the BBD research
`src/data/__tests__/expatPicks.test.ts` asserts 50 unique picks ranked 1..50, each with a one-sentence reason and known source refs; every pick cites 'eVelo BBD destinations research'; `EXPAT_RANKING_METHOD` judges for BBD retirees. Order matches the doc's "Draft top 50" (foundation builder's list checked against the table).

## Check 2: all 50 have full profiles
Tests: 9 integer scores 1–5, every fact key incl. estate and lending, drawbacks, ≥3 http sources, no TODO, a profile file for every pick and no stray files, rubric covers every key. Score distribution for lending after normalising to the rubric: 22 × 4 (non-EU, Schwab Intl reported), 28 × 3 (EU / IBKR only).
Spot-read against the research doc: Paphos (full), Nice, Medellín, Antalya, Cayo, Taipei (tax, estate, residency facts) — consistent with the country summary and `src/data/localTaxes.ts`, uncertainties hedged.

## Check 3: Atlas lists 50 picks and opens profile pages
Playwright, dev server, desktop 1400×900 and phone 390×844 ([ui-run.txt](ui-run.txt)): picks 1 (Algarve), 3 (Paphos, newcomer) and 50 (Nice) open from the city list as "Top pick N" with Tax on holdings, Estate, Lending and Residency shown; Show-all controls present; no console errors. Screenshots: profile-*-desktop.png, profile-*-phone.png.

## Check 4: tests, typecheck, build
```
 Test Files  14 passed (14)
      Tests  148 passed (148)
typecheck: clean
dist/assets/index-DUhMyiV4.js                                   505.02 kB │ gzip: 164.85 kB
✓ built in 482ms
```

Costs: 11 picks newly in the top 50 had only rough estimates; Numbeo returned HTTP 429 throughout, so they were derived from livingcost.org scaled to Numbeo (fit on Lisbon, Athens, Bangkok, Montevideo; mean error 5–15% per index) and marked low confidence — see docs/research/cost-check-2026-11.md § Stage 5.
