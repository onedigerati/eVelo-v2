# Stage 1 · Dark by default — evidence
Verified 2026-11-09 on 9a3d701, plus uncommitted changes (index.html, src/state/store.ts, src/state/theme.ts, src/state/__tests__/theme.test.ts)

| Check | Result | Evidence |
|---|---|---|
| The starting theme is Dark with nothing saved, unreadable storage, or a saved System from before the switch; a saved Light or Dark is kept, and a System saved after the switch is kept (proof: test) | pass | [theme-tests.txt](theme-tests.txt): `starting theme (themeFromSaved)` 13 cases, plus `index.html pre-paint script` 13 cases, `paints dark when storage is blocked`, and the theme-color cases, 29/29 |
| Saving the plan records that the switch has happened, so a later System choice survives a reload (proof: test) | pass | [theme-tests.txt](theme-tests.txt): `keeps a System chosen after the switch, once saved`. Also confirmed in the built app: a real save holds `themeV: 2` ([browser-run.txt](browser-run.txt)) |
| In the running app, a fresh browser opens the landing and the planner in dark with no light flash at first paint; an old saved System opens dark; Light survives a reload; picking System after the switch survives a reload (proof: run the product, a test can't see first paint or real storage) | pass | [browser-run.txt](browser-run.txt) (44/44 assertions, no console errors, script [verify-browser.cjs](verify-browser.cjs)); [fresh-light-os-landing.png](fresh-light-os-landing.png), [fresh-light-os-plan.png](fresh-light-os-plan.png), [prepaint-only-fresh.png](prepaint-only-fresh.png), [prepaint-only-old-system.png](prepaint-only-old-system.png), [prepaint-only-light.png](prepaint-only-light.png), [old-system-save-opens-dark.png](old-system-save-opens-dark.png), [light-after-reload.png](light-after-reload.png), [system-after-reload-light-os.png](system-after-reload-light-os.png), [system-after-reload-dark-os.png](system-after-reload-dark-os.png), [phone-390-landing.png](phone-390-landing.png) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint: none configured · tests 688/688 in 45 files ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 high, 0 critical, 0 total ([audit.txt](audit.txt))

Notes:
- First paint was read from an init script at `<body>` insertion, the first animation frame and DOMContentLoaded, all before the app mounts (`#root` has 0 children). The theme is `dark` at all three, and from the first frame the body background is rgb(10, 13, 12) with both theme-color metas `#0A0D0C`, under a light OS. A second run blocked the app's JS bundles, so only the inline pre-paint script and CSS ran. A fresh visit and an old System save paint dark, and a saved Light paints light.
- Light OS throughout, except one reload with the OS switched to dark: there a saved System renders dark and stays `system`.
- At phone width (390×844, touch) the plain URL is dark, the cycle button reads "Dark theme — switch to system theme", and there is no horizontal scroll.
- A fresh visit writes nothing to storage until the plan or theme changes. To capture real inputs for the old-save seed, Light and then Dark were picked; the save contained `themeV: 2`.

Report written by the verifying agent (a fresh agent that built nothing), which was briefed to return it; saved by the main session.
