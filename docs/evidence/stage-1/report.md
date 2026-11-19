# Stage 1 · Chart readouts — verification report

2026-11-19 · verified by a fresh agent that built none of the stage; re-run in the main session after two phone refinements (the phone income readout sits under the bars; a tap outside a chart clears its readout).

## Project checks
- typecheck: clean — `typecheck.txt`
- tests: 1457 passed, 1 skipped (baseline 1443 + 14 new) — `tests.txt`; the stage's own: 45 passed — `readout-tests.txt`
- build: ok, chunk-size warning only (as baseline) — `build.txt`
- `npm audit --omit=dev`: 0 vulnerabilities — `audit.txt`
- `npm run e2e`: smoke passed — `e2e.txt`
- lint: no lint script in the project

## Acceptance checks
Driven by `readouts.mjs` (Playwright, headless Chromium, the built app served as the e2e scripts do), output `readouts.txt`: all checks ok, exit 0.

| Check | Result | Evidence |
|---|---|---|
| 1. Results income chart hover: that bar full strength, the rest dimmed, readout with age, unlocked income lines, tax, sold, spending and sold/reinvested — the ledger's figures | pass | `readout-tests.txt` (`readoutRows`); `readouts.txt` "1280 results hover bar 0/4/12/22/29": one bar at opacity 1, rest 0.32, rows equal the worker's median year and the ledger row; results-1280-first.png (local) |
| 2. Desktop ask readout shows only unlocked layers; the 150px phone ask chart has none | pass | `readouts.txt` "1280 ask q1–q6" (none, none, Dividends, + muni and taxable, + tax, + Social Security, spending, sold) and "390 ask q3–q6" (`ic--phone-ask`, no tabindex, no readout, a tap shows nothing); ask-1280-q5-hover.png, ask-390-q4-tap.png (local) |
| 3. Comparison hover: guide line, a dot per median, readout with medians, middle halves and the gap | pass | `readout-tests.txt` (`compareReadout`); `readouts.txt` "1280 compare hover 30%/70%": guide, 2 median dots, 4 quartile rings, readout equals `compareReadout` on the seeded plan; compare-1280-hover.png (local) |
| 4. Keys step and Escape clears; phone tap and drag scrub; mouse off clears | pass | `readouts.txt`: income keys 62, 63, 64, 91, 90, 85, 62, 62; comparison 60, 61, 88, 87; Escape and mouse-off clear both; at 390 tap and drag scrub both charts; a tap outside clears the phone readout |
| 5. At 390 and 1280 the readout stays on screen at the first and last year; no sideways scroll | pass | `readouts.txt` "year first/last", "first/last age": measured bounds inside the viewport, overflow 0, both charts, both widths; at 390 the income readout sits under the bars (top 456 ≥ plot bottom 450); results-390-first/last.png, compare-390/1280-first/last.png (local) |
| 6. Main site's charts and `npm run e2e` unchanged, suite green | pass | `e2e.txt`, `tests.txt`; `src/ui/outlook/` untouched by the stage; `readouts.txt` "fan (#plan)": the fan chart's own readout on hover, cleared on mouse-off, the mode's readout absent |

## Found and fixed during verification
- The phone results readout (7–8 rows) hung over the 170px plot and covered the bars, and on touch nothing but Escape cleared it. It now sits just under the plot (over the legend) and a tap anywhere outside the chart clears it; both checked in `readouts.txt`.
- The verifier's first run had one failure from its own script (it looked for the readout page-wide, where there are two); the script was fixed, not the app.

Screenshots are git-ignored and stay local.
