# Stage 2 · Landing side by side — evidence
Verified 2026-11-24 on e28c521 (only uncommitted change: docs/PLAN.md), against a stage 1 build of 4c35b8a in a temp worktree; both served with `vite preview`, driven by Playwright Chromium with reduced motion (the story's resting frame), light and dark themes. Written by an independent verifier agent; saved by the main session.

| Check | Result | Evidence |
|---|---|---|
| Above 1440px the landing frame widens with the window (about 94vw, capped at 2400px, matching the top bar of the other pages), and the story card takes about 60% of the hero row at 1920 and 2560px; at 1440px and below the landing measures as it does today | pass | [measurements.txt](measurements.txt): frame 1804.8 at 1920 (= 94vw = #plan top bar) and 2400 at 2560 (= top bar; baseline 1280 at both); hero columns 673.9/1010.9 and 912/1368, card 58.1% and 58.6% of the hero row; 1440 and 390 identical to baseline in every value; screenshots byte-identical ([screenshot-diff.txt](screenshot-diff.txt)); main-e28c521-landing-1920-light.png, main-e28c521-landing-2560-dark.png (local) |
| The story chart's text stays its normal size as the card grows: axis and label font sizes measured on screen at 1920 and 2560px are within 1px of 1440px | pass | [measurements.txt](measurements.txt): font-size × SVG scale: tick/coin/estate/mono 12.33px at 1440 → 12.65 at 1920 → 12.57 at 2560; pin/inv 12.79 → 13.12 / 13.03; text heights 16–17px → 17px; viewBox 600×418 → 1030×483 → 1420×538 |
| No horizontal page scroll on the landing at 1440, 1920, 2560 and 390px, in both themes, and the 390px phone landing is unchanged | pass | [measurements.txt](measurements.txt): scrollWidth = clientWidth at all 8 width/theme combinations, 0 elements past either edge, 0 errors; 390 measurements and full-page screenshots identical to baseline ([screenshot-diff.txt](screenshot-diff.txt)) |
| Test suite and typecheck green; e2e smoke passes | pass | [tests.txt](tests.txt): 1711 passed, 1 skipped; [typecheck.txt](typecheck.txt): exit 0; [e2e.txt](e2e.txt): 30 ok, 0 FAIL |
| Live: the deploy run is green and the live site shows the wide Atlas, Plan and Landing at 2560px | pending | Checked after deploy, see [live.md](live.md) |

Project checks: type check pass · lint none configured · tests 1711 pass, 1 skipped · build pass (in e2e.txt)
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

Scripts: [measure.mjs](measure.mjs), [summarize.mjs](summarize.mjs). Data: [baseline-4c35b8a-measurements.json](baseline-4c35b8a-measurements.json), [main-e28c521-measurements.json](main-e28c521-measurements.json).

Notes: no overlaps or clipping in the chart at 1920 or 2560. At 2560 there is about 350px of empty space between the hero text and the card, and the legend fills only the left half of the card. The highlighted "Die" step card overhangs the frame by about 13px and the "$80K/yr" label sits on the dot texture, both also in the 1440 baseline.
