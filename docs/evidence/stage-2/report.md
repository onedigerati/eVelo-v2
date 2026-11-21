# Stage 2 · Chapters and ledgers — verification

Verified 2026-11-21 by a fresh verifier agent (built nothing) on c77feeb plus uncommitted work; re-run by the PM after the review fix round (11 items), with the verifier's script updated for one review fix (income tax now shows once, in the ledger header).

| Check | Result | Evidence |
|---|---|---|
| Chapter rules are pure and tested: 3–6 chapters, contiguous, every year once; no Social Security → no "arrives"; no bad year → no bad-market chapter; estate last | pass | [chapter-rules-tests.txt](chapter-rules-tests.txt) (incl. a sweep of every horizon 3–40); after review: [tests-after-review.txt](tests-after-review.txt) (both-plans fall rule, collapse-to-0 excluded) |
| Once synced, the walkthrough shows under the comparison (not before), from the engines' real results: paragraphs, twin ledgers, "medians don't add up" note | pass | [walkthrough-e2e.txt](walkthrough-e2e.txt), [walkthrough-e2e-after-review.txt](walkthrough-e2e-after-review.txt): absent before sync; after the comparison once synced; ledger figures equal the engines' medians re-run in node (ages 60, 67, 76), tax read from the header. Script: [verify-walkthrough.mjs](verify-walkthrough.mjs) |
| Overview chart lights the chapter; tap/click jumps to the year and its chapter; slider covers only the chapter | pass | same files; tap at age 76 → middle chapter, lit band and slider [8, 24] |
| Play story runs the chapter's years and stops at its end; Next chapter carries on; reduced motion steps without animation | pass | same files (stepped 8→24 and stayed; reduced motion: no transitions, still steps); also the new walkthrough block in [e2e-smoke-after-review.txt](e2e-smoke-after-review.txt) |
| Desktop and 390px phone with no horizontal scroll; keyboard reaches and works rail, buttons, slider, chart | pass | same files; scrollWidth = viewport at 1280 and 390; Tab order rail → buttons → chart → slider; Back/Next now `aria-disabled` at the ends so focus stays. Screenshots (desk/phone, light/dark, keyboard focus) kept local (git-ignored PNGs) |
| The rest of the site is unchanged: suite and e2e smoke pass | pass | [tests-after-review.txt](tests-after-review.txt) 1548 passed, 1 skipped; [e2e-smoke-after-review.txt](e2e-smoke-after-review.txt) passed |

Project checks: typecheck pass ([typecheck-after-review.txt](typecheck-after-review.txt)) · no lint script · build pass (in `npm run e2e`) · audit 0 vulnerabilities ([audit.txt](audit.txt)).

Not shown live: the default synced plan has no bad year, repayment or forced sale in its medians, so the bad-market chapter and the Repaid / Sold-in-forced-sales rows were proven by unit tests only.

Review: 11 findings, all fixed (copy following the numbers, "about" on sums of medians, one spending figure, honest LTV/loan wording, collapse ≠ bad market, Play stops on new data, focus at the ends, smoke coverage, motion tokens, tax once). Security lens: no user input reaches innerHTML.
