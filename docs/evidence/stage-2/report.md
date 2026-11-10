# Stage 2 · Swipe to close — evidence
Verified 2026-11-10 on c0a9722 (stage commit a435410), no uncommitted source changes, by a fresh agent that built nothing.

| Check | Result | Evidence |
|---|---|---|
| On a phone-size bottom sheet with its content scrolled to the top, a downward touch swipe on the content drags the sheet with the finger; releasing past 110px or faster than 550px/s down closes it, a shorter or paused swipe springs back (proof: test) | pass | [tests.txt](tests.txt): `classifySheetTouch › drags the sheet on a downward swipe when the content is at the top`, `sheetOffset › follows the finger down 1:1…`, `shouldCloseSheet › uses the handle thresholds: 110px or 550px/s` / `closes past the distance or on a flick` / `springs back on a short, slow swipe…`, `releaseVelocity › ignores samples older than the window, so a drag that stops reads ~0` (12/12). Also seen in the running app: [swipe-run.txt](swipe-run.txt) |
| With the content scrolled down, a downward swipe scrolls it and never moves the sheet; upward swipes scroll; sideways swipes (photo carousel) and taps work as before (proof: test) | pass | [tests.txt](tests.txt): `classifySheetTouch › scrolls on a downward swipe when the content is scrolled down`, `› always scrolls on an upward swipe`, `› leaves mostly-horizontal swipes to the content (carousels, sliders)`, `› stays pending inside the slop`. Also seen in the running app: [swipe-run.txt](swipe-run.txt) |
| In the running app on a touch phone: swipe-down at top closes the city profile, the cases above hold, and the handle, ×, Escape and backdrop still close it; side drawers are unchanged (proof: scripted touch run, a unit test can't drive real scrolling and touch) | pass | [verify-swipe.mjs](verify-swipe.mjs) → [swipe-run.txt](swipe-run.txt) (25/25), [drawer-baseline.txt](drawer-baseline.txt), [phone-mid-drag.png](phone-mid-drag.png) (local), [phone-closed-after-swipe.png](phone-closed-after-swipe.png) (local), [phone-reopened.png](phone-reopened.png) (local), [phone-carousel-swiped.png](phone-carousel-swiped.png) (local), [desktop-profile-after-mouse-drag.png](desktop-profile-after-mouse-drag.png) (local) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint n/a (no lint script) · tests 766/766 ([tests-full.txt](tests-full.txt)), stage tests 12/12 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## How the run was done
Production build served by `vite preview` on 5241; Chromium 1248 under Playwright at 390x844 with `hasTouch`/`isMobile`; touches via CDP `Input.dispatchTouchEvent` with explicit timestamps for the flick and slow cases; profile opened from the Top picks card "Algarve (Faro)".
- 80px slow swipe at top: sheet at y=80 mid-drag, sprang back. 100px drag + 300ms pause: sprang back. 60px at ~100px/s: sprang back.
- 60px flick in ~40ms (~1500px/s): closed. 220px swipe: closed.
- Scrolled down: scrollTop 500→324, sheet stayed at 0. From scrollTop 50, a 300px swipe reached 0 and the sheet never moved. Swipe up: scrollTop 0→214, sheet still.
- Carousel: sideways swipe moved scrollLeft 0→388, sheet still; dot taps work; a content button tap fired its click.
- Handle drag, ×, Escape and backdrop tap all close it; reopening after a swipe-close shows it at rest. Page behind didn't scroll; no console or page errors.

## Also checked
- Compare sheet (the other phone bottom sheet): swipe down at top drags (y=110) and closes it.
- Tablet `#plan` left drawer (820x1180, touch): a downward swipe on its content doesn't move it, so the swipe isn't attached to side drawers.
- Desktop profile (1440x900, mouse): mouse drag on content does nothing; handle drag still closes. `#styleguide`: mouse drag left still closes the Drawer.
- Pre-existing: a scripted touch drag left on the tablet `#plan` drawer doesn't close it; the pre-stage build 22971f7 behaves identically ([drawer-baseline.txt](drawer-baseline.txt)). Logged as INFO, not counted; already in the plan's open questions.

## History
- 2026-11-10 · First run 23/24: the tablet drawer drag-left counted as a failure until shown identical on 22971f7, then logged as INFO; styleguide checks now wait for the lazy route. Final run 25/25.
