# Stage 1 · Override markers — verification report

2026-11-10 · verified by a fresh agent (built nothing) on the production build (`vite preview`), headless Chromium; report written by the PM from its findings.

Project checks: typecheck pass ([typecheck.txt](typecheck.txt)) · no lint script · tests 744/744 in 51 files, baseline 734/50 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt)) · `npm audit --omit=dev` 0 vulnerabilities ([audit.txt](audit.txt)).

| Check | Result | Evidence |
|---|---|---|
| On a non-home profile, a category with a typed $ for that city is marked "your amount", a category with a typed % is marked "your change", and other rows, other cities' $ and the home profile carry no mark (proof: test) | pass | [tests-profile-spend.txt](tests-profile-spend.txt): `categoryCompare override marks` (5 tests) |
| The note under the list names the changed categories, and says nothing about overrides when there are none (proof: test) | pass | [tests-profile-spend.txt](tests-profile-spend.txt): `spendNote` (3 tests); same notes in the running app ([running-app-dom.txt](running-app-dom.txt)) |
| Each marked row's screen-reader line says "your amount" or "your change" (proof: test) | pass | [tests-profile-spend.txt](tests-profile-spend.txt): `spendRowSpoken` (2 tests); running-app sr lines match ([running-app-dom.txt](running-app-dom.txt)) |
| On the destination's profile in the running app, marked rows show a subtle marker, legible in dark and light, phone and desktop (proof: screenshot, a test can't judge the look) | pass | bangkok-{desktop,phone}-{dark,light}.png and chiangrai-…png (local, git-ignored), [running-app-dom.txt](running-app-dom.txt), [shots.mjs](shots.mjs) |

Setup for check 4: home St. Louis, destination Bangkok, typed $9,000 Housing for Bangkok, typed −40% Dining out. Bangkok shows a brass box on "$9.0K" (Housing) and on "−40%" (Dining out); Chiang Rai (neither home nor destination) boxes only the Dining out % and leaves Housing unmarked. Rows 32px, value column aligned, no sideways scroll, no console errors.

Minor: the % box overhangs the list's right edge by 4px (not clipped, no scroll).
