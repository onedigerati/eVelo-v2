# Stage 4 evidence: local wealth and inheritance tax (2026-11-06)

## Check 1: tests prove the tax math
`src/engine/__tests__/localTax.test.ts` (hand-worked band and inheritance figures; one-path flat scenario: tax only after the move, first tax at month 23 for a move at month 13, nothing below threshold, net vs gross base, real-terms thresholds, a tax-triggered margin call and a tax-driven insolvency with no tax after the break, sell-strategy gross-up, sell-estate inheritance with wealth tax; empty/absent tax bit-identical to no tax for simulate and atlas; Ireland 5 vs 6 and Japan 10 vs 11 years strict gate; France and Japan $5M estates to two children hand-worked to within $3; taxed vs untaxed direction).

## Check 2: every top-50 country has an entry with sources; Spanish cities use their region
`src/data/__tests__/localTaxes.test.ts`: top-50 coverage via `localTaxFor`, every source URL found in docs/research/bbd-ranking-2026-11.md, band shape, FX from fx.json, Spain region overrides (Valencia/Alicante, Málaga, Madrid, Tarragona/Barcelona).

## Check 3: running app shows odds and estate changing; Method page explains
Playwright, dev server, share link with a $5M portfolio ([ui-run.txt](ui-run.txt)):
```
St. Louis 86% | → | Málaga 73% | −13 pts 
St. Louis 86% | → | Tarragona 61% | −25 pts 
St. Louis 86% | → | Medellín 81% | −5 pts 
St. Louis 86% | → | Nice 87% | +1 pts 
estate: BORROW, NEVER SELL | $16M 
estate: BORROW, NEVER SELL | $13M 
ERRORS []
```
Before this stage (builder's snapshot at $5M): Málaga 90%, Medellín 92%, Nice estate $21.8M. Estate note reads "after the destination's inheritance tax" (Medellín, Nice). Screenshots: outlook-*-5m.png, [method-localtax.png](method-localtax.png).

## Check 4: tests, typecheck, build, audit, review
```
 Test Files  14 passed (14)
      Tests  142 passed (142)
typecheck: clean
dist/assets/index-D__BIx9T.js                                   504.09 kB │ gzip: 164.48 kB
✓ built in 362ms
found 0 vulnerabilities
```
Bundle: the main chunk reads 504 kB vs 354 kB, but the old build split the city data into a statically imported shared chunk (d3-array-*.js, 134 kB) loaded at startup anyway; startup JS went 488 → 504 kB (+16 kB, the tax data).

Atlas timing (builder, 116 cities, median of 5): 4,000 paths 1,141 → 1,188 ms (+4%); 10,000 paths 2,783 → 2,965 ms (+7%).

Review (fresh agent, with security pass) — [review.md](review.md).
