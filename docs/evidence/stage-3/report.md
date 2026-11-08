# Stage 3 · Asia-Pacific — evidence
Verified 2026-11-07 on the stage 3 plan commit plus the stage 3 paths only (clean worktree; other in-progress cities left out)

| Check | Result | Evidence |
|---|---|---|
| Each of the 11 has a profile to the README's standard, with sources, scored on the 1–5 rubric; Auckland, Melbourne and Sydney pass an independent content review with its findings applied (proof: test + review notes) | pass | `expatPicks.test.ts` checks every profile's shape, scores and sources ([tests.txt](tests.txt)). Oceania review: [review-oceania.md](review-oceania.md), five fixes applied, no score changes. The other eight were reviewed and fixed in the earlier session (recorded in the plan; notes not saved). |
| Each has exactly 5 openly licensed photos with credits, checked on a contact sheet (proof: test + contact sheet) | pass | `photos.test.ts` in [tests.txt](tests.txt). [north-asia-singapore-manila/contact-sheet.png](north-asia-singapore-manila/contact-sheet.png), [vietnam-cebu/contact-sheet.png](vietnam-cebu/contact-sheet.png), [oceania/contact-sheet.png](oceania/contact-sheet.png): each newer than every photo it shows; captions match; CC BY / BY-SA / CC0 / public domain |
| In a clean tree holding only stages 1–3 paths: type check, tests and build pass (proof: test) | pass | [typecheck.txt](typecheck.txt) · [tests.txt](tests.txt) 357/357 · [build.txt](build.txt) |
| Each of the 11 opens from its list "Profile" chip with 5 photos loaded, "Profile · <country>" in the eyebrow, and stays out of the top picks; both themes and a phone (proof: run the product) | pass | [run-product.txt](run-product.txt): 44/44 (11 cities × desktop light, dark, phone light, dark); no overflow, console errors or failed requests. [sheet-seoul-desk-light.png](sheet-seoul-desk-light.png), [sheet-sydney-phone-dark.png](sheet-sydney-phone-dark.png). Script: [s3.js](s3.js) |
| Preview republished with stage 3's 55 photos added to the asset store (proof: run the product on the preview build) | pass | 55 photos uploaded and recorded (480 in all); v32 published with every `dist/artifact-files.json` entry, stale v31 chunks removed. The v32 build locally with `/_blob/` answered by [blobserve.js](blobserve.js): 22/22 (desktop light, phone dark), no errors ([v32-local-run.txt](v32-local-run.txt), [s2v31.js](s2v31.js)) |

Project checks: type check pass · lint: none configured · tests 357/357 · build pass
Audit: `npm audit --omit=dev`: 0 vulnerabilities (stage 1's run, same dependencies: [../stage-1/audit.txt](../stage-1/audit.txt))
