# Stage 1 · Variations — evidence
Verified 2026-11-08 on 16b9450, plus uncommitted changes (docs/PLAN.md only; no product code changed since c5fc49a)

| Check | Result | Evidence |
|---|---|---|
| A variations page shows at least four distinct ways to show the setting and the now/2/4/5-year comparison in the app's look, at desktop and phone width | pass | [variations-page.txt](variations-page.txt): the [variations page](https://claude.ai/artifact/FGJKDUPPZATHCBzvLRX2jt), read file by file. It has five boards: A ladder, B timeline, C ledger and D fan (dark) at 1280×860, and E phone at 390×844. Each board has a retire-in selector (A segmented control, B draggable marker and chips, C Use buttons, D Compare chips, E swipe cards and "Use this") and a Now/2/4/5 comparison. Light boards use the tokens.css bg, inks, holds and bruised colours, plus Instrument Serif and Geist. D's accents match the dark tokens, but its bg/ink is #0d1210/#e8efe9, not #0a0d0c/#ecf1ee |
| The user picks a direction, and it's logged as a decision | pass | [decision.txt](decision.txt): PLAN.md Decisions line 35 "Visual direction: variation A … plus D's shaded working years …". The user wrote "Go with A plus D's shaded working years" |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint none configured · tests 555/555 in 36 files ([tests.txt](tests.txt)) · build pass, chunk-size warning only ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 high, 0 critical, 0 total ([audit.txt](audit.txt))

Notes: the page is a Design artifact, so it was checked from its published source rather than screenshots. Only board E is drawn at phone width. A, the direction picked, has no phone layout of its own; that layout belongs to stage 3 ("both themes and phone").
