# Stage 2 · Europe, Africa, Middle East — evidence
Verified 2026-11-07 on a7d8572 plus the stage 2 paths only (clean worktree; other in-progress cities left out)

| Check | Result | Evidence |
|---|---|---|
| Each of the 8 has a profile to the README's standard, with sources, scored on the 1–5 rubric, and its review findings applied (proof: test + review notes) | pass | `src/data/__tests__/expatPicks.test.ts` checks every profile's shape, scores and sources ([tests.txt](tests.txt)); 13–19 sources each. The content reviews ran in the earlier session (builder-independent reviewers; fixes applied, including the France treaty wording in nice.ts, gascony.ts and localTaxes.ts). Their notes weren't saved; the plan's resume notes record each city as "reviewed and fixed". |
| Each has exactly 5 openly licensed photos with credits, checked on a contact sheet (proof: test + contact sheet) | pass | `photos.test.ts` (exactly 5 per profiled city, credits and licences) in [tests.txt](tests.txt). [europe-north/contact-sheet.png](europe-north/contact-sheet.png), [europe-africa-me/contact-sheet.png](europe-africa-me/contact-sheet.png): newer than every photo, captions match, CC BY / BY-SA / CC0 |
| In a clean tree holding only stage 1 + stage 2 paths: type check, tests and build pass (proof: test) | pass | [typecheck.txt](typecheck.txt) · [tests.txt](tests.txt) 357/357 · [build.txt](build.txt) |
| Each of the 8 opens from its list "Profile" chip with 5 photos loaded, "Profile · <country>" in the eyebrow, and stays out of the top picks; both themes and a phone (proof: run the product) | pass | [run-product.txt](run-product.txt): 8/8 in desktop light and dark and phone light and dark (phone counts the carousel after stepping through it); no overflow, no console errors or failed requests. [sheet-london-desk-dark.png](sheet-london-desk-dark.png), [sheet-london-phone-light.png](sheet-london-phone-light.png), [sheet-dubai-desk-light.png](sheet-dubai-desk-light.png), [sheet-dubai-phone-dark.png](sheet-dubai-phone-dark.png). Script: [s2.js](s2.js) |
| Preview republished with stage 2's 40 photos added to the asset store (proof: run the product on the preview build) | pass | 40 photos uploaded and recorded (425 in all); v31 published with every `dist/artifact-files.json` entry, stale v30 chunks removed; its file list matches the manifest. The v31 build run locally with `/_blob/` answered by [blobserve.js](blobserve.js): 8/8 cities 5/5 from `/_blob/`, desktop light and phone dark, no errors ([v31-local-run.txt](v31-local-run.txt), [s2v31.js](s2v31.js)) |

Project checks: type check pass · lint: none configured · tests 357/357 · build pass
Audit: `npm audit --omit=dev`: 0 vulnerabilities (stage 1's run, same dependencies: [../stage-1/audit.txt](../stage-1/audit.txt))

## History
- 2026-11-07 · The first product run was cut off by a 115 s timeout during phone-dark. Rerun in full without the timeout: [run-product.txt](run-product.txt).
