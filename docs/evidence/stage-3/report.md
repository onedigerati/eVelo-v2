# Stage 3 evidence: new cities (2026-11-06)

## Check 1: 20 cities in CITIES with verified records, listed in cost-check doc
- Test `src/data/__tests__/cities.test.ts` asserts the 20 ids exist, each `verified` url is a Numbeo page, and every low-confidence record carries a note.
- `docs/research/cost-check-2026-11.md` § Stage 3 lists all 20 with indices, confidence, method, healthcare factor and the Numbeo page read (8 high, 12 low; Numbeo 429-rate-limited 5 pages, which are mapped to rows that were read and say so).

## Check 2: healthcare factors for the 7 new countries with basis
Cyprus 0.25, Malta 0.3, Montenegro 0.3, Belize 0.35 (Ambergris 0.4), Dominican Rep. 0.3 (Las Terrenas 0.35), Paraguay 0.3 (rough, not researched), Guatemala 0.3; Oaxaca override 0.3. Basis paragraphs in the cost-check doc § "Healthcare factors for the new countries".

## Check 3: new cities appear and run in the Atlas
Playwright against the dev server (port 5199): each of the 20 found by the Atlas search with its Verified mark; Paphos chosen as destination ranks and simulates (73% vs St. Louis 64%; 116 cities ranked; no console errors). Output: [atlas-run.txt](atlas-run.txt); screenshot: [atlas-paphos-desktop.png](atlas-paphos-desktop.png).

## Check 4: tests, typecheck, build
```
 Test Files  12 passed (12)
      Tests  108 passed (108)
typecheck: clean
dist/assets/index-DAslx4EM.js                                   354.01 kB │ gzip: 111.52 kB
✓ built in 467ms
```
