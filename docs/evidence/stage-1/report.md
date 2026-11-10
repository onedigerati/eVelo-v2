# Stage 1 · Landing by default — evidence
Verified 2026-11-09 on 234c08d, plus uncommitted changes (src/state/entered.ts and its test deleted; router.ts, store.ts, hooks.ts, landing.test.ts changed)

| Check | Result | Evidence |
|---|---|---|
| The bare URL, `#`, `#/` and an unknown hash resolve to the landing, whatever the visitor did before (proof: test) | pass | [landing-tests.txt](landing-tests.txt): `default-page rule (resolveRoute) > shows the landing for the bare URL, on every visit` and `> treats an unknown hash like the bare URL` (`npx vitest run src/state/__tests__/landing.test.ts`); resolveRoute takes no stored state; also seen in the browser ([browser-run.txt](browser-run.txt): `/#`, `/#/`, `/#nope`) |
| Route hashes (`#plan`, `#/atlas`, …), `#home` and share links in every form resolve as before (proof: test) | pass | [landing-tests.txt](landing-tests.txt): `sends route hashes straight to the app`, `reads the legacy slash forms as app routes`, `never shows the landing for a share link, in any form`, `shows the landing for #home in any form`, `writes #home for the landing` |
| Nothing reads or writes `evelo:v2:entered` any more (proof: command, a search of `src/`) | pass | [grep-entered.txt](grep-entered.txt): no matches (grep exit 1) |
| In the running app, after using the planner, a fresh load of the plain URL shows the landing; the wordmark and Back return to it (proof: run the product, a test can't drive real reloads with storage) | pass | [browser-run.txt](browser-run.txt) (production build, vite preview, Playwright Chromium): [01-plan-used.png](01-plan-used.png) (local), [02-plain-url-after-planner.png](02-plain-url-after-planner.png) (local), [03-stale-flag-ignored.png](03-stale-flag-ignored.png) (local), [04-wordmark-to-landing.png](04-wordmark-to-landing.png) (local), [05-cta-to-planner.png](05-cta-to-planner.png) (local), [06-back-to-landing.png](06-back-to-landing.png) (local), [07-share-link-opens-app.png](07-share-link-opens-app.png) (local), [08-phone-390-landing.png](08-phone-390-landing.png) (local); no console errors |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint: none configured · tests 659/659, 44 files ([tests.txt](tests.txt); baseline 664/45 less the deleted entered.test.ts (4) and one merged landing test) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

Report written by the verifying agent; saved by the main session at the user's word ("Yes, please save the agent's report"), after the subagent's write was blocked.
