# Stage 4 · Canada + South America — evidence
Verified 2026-11-07 on c09f988 plus the stage 4 paths only (clean worktree; other in-progress cities left out)

| Check | Result | Evidence |
|---|---|---|
| Each of the 5 has a profile to the README's standard, with sources, scored on the 1–5 rubric, and passes an independent content review with its findings applied (proof: test + review notes) | pass | `expatPicks.test.ts` ([tests.txt](tests.txt)). Builders: [build-canada.md](build-canada.md), [build-south-america.md](build-south-america.md). Reviews: [review-canada.md](review-canada.md) (Quebec investor program is open per Québec's own pages; Montréal residency 1 → 2; treaty wording fixed), [review-south-america.md](review-south-america.md) (Bogotá investor threshold ≈ $190k; Buenos Aires currency controls and flights corrected) |
| Each has exactly 5 openly licensed photos with credits, checked on a contact sheet (proof: test + contact sheet) | pass | `photos.test.ts` in [tests.txt](tests.txt). [canada/contact-sheet.png](canada/contact-sheet.png), [south-america/contact-sheet.png](south-america/contact-sheet.png), checked by the builders and again by the reviewers (captions, authors and licences match Commons) |
| In a clean tree holding only stages 1–4 paths: type check, tests and build pass (proof: test) | pass | [typecheck.txt](typecheck.txt) · [tests.txt](tests.txt) 357/357 · [build.txt](build.txt) |
| Each of the 5 opens from its list "Profile" chip with 5 photos loaded, "Profile · <country>" in the eyebrow, and stays out of the top picks; both themes and a phone (proof: run the product) | pass | [run-product.txt](run-product.txt): 20/20 (5 cities × desktop light, dark, phone light, dark); no overflow, console errors or failed requests. [sheet-montreal-desk-light.png](sheet-montreal-desk-light.png), [sheet-buenos-aires-phone-dark.png](sheet-buenos-aires-phone-dark.png). Script: [s4.js](s4.js) |
| Preview republished with stage 4's 25 photos added to the asset store (proof: run the product on the preview build) | pass | 25 photos uploaded and recorded (505 in all); v33 published with every `dist/artifact-files.json` entry, stale v32 chunks removed. The v33 build locally with `/_blob/` answered by [blobserve.js](blobserve.js): 10/10 (desktop light, phone dark), no errors ([v33-local-run.txt](v33-local-run.txt), [s2v31.js](s2v31.js)) |

Project checks: type check pass · lint: none configured · tests 357/357 · build pass
Audit: `npm audit --omit=dev`: 0 vulnerabilities (stage 1's run, same dependencies: [../stage-1/audit.txt](../stage-1/audit.txt))
