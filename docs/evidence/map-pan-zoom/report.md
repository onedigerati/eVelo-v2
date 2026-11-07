# Stage 1 · Pan and zoom — evidence
Verified 2026-11-07 on d6b2d37, plus uncommitted changes (this stage)

| Check | Result | Evidence |
|---|---|---|
| Mouse drag pans the map; a click after a drag does not choose a city; a plain click still does | pass | [drive.txt](drive.txt) (drag 150,50 → marker moved 150.0,50.0; drag from Lisbon left dest unchanged; click on Lisbon chose it) |
| Ctrl/⌘+wheel zooms at the cursor; a plain wheel scrolls the page (with a hint) | pass | [drive.txt](drive.txt) (×2.82, 1.6px drift at whole-pixel cursor, no page scroll; plain wheel scrolled 120px and showed "Ctrl + scroll to zoom"), [desktop-zoomed.png](desktop-zoomed.png) |
| Touch: horizontal drag pans, vertical swipe scrolls the page, two-finger pinch zooms; a tap still opens the city card | pass | [drive.txt](drive.txt) (Chromium touch emulation, 390px), [phone-pinched.png](phone-pinched.png), [phone-card.png](phone-card.png) |
| + / − / reset buttons work; region chips still fly to their region; pan is clamped to the world | pass | [drive.txt](drive.txt), [desktop-europe.png](desktop-europe.png), [desktop-clamped.png](desktop-clamped.png) |
| Tests, typecheck and build pass | pass | [tests.txt](tests.txt), [typecheck.txt](typecheck.txt), [build.txt](build.txt) |

Project checks: type check pass · lint n/a (no config) · tests 185/185 ([tests.txt](tests.txt); 12 new in `mapView.test.ts`) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
Drive script: [map-drive.mjs](map-drive.mjs). WebKit (iPhone) touch untested.

## History
- 2026-11-07 · Pan clamped to the sphere's bounding box let the view drift to its empty corners (desktop-clamped). Fixed: bounds are now the inhabited band (Hawaii→dateline, 79°N–57°S) united with the region's own fit.
