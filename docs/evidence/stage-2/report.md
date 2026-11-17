# Stage 2 · Honest growth — verification report

Date: 2026-11-16 · Verified by a fresh verifier agent on 48ab104 (built none of the stage), then re-run by the PM on the merged review fix (b64c608) with the verifier's own script.

## Project checks
| Check | Result | Output |
|---|---|---|
| Tests | 1152/1152 pass, 74 files | [tests-after-fix.txt](tests-after-fix.txt) · stage's own files: [tests-stage2.txt](tests-stage2.txt) · before fix: [tests.txt](tests.txt) |
| Typecheck | clean | [typecheck-after-fix.txt](typecheck-after-fix.txt) |
| Build + e2e smoke (headless Chromium) | pass | [e2e-after-fix.txt](e2e-after-fix.txt) · [e2e.txt](e2e.txt) |
| Dependency audit | 0 vulnerabilities | [audit-after-fix.txt](audit-after-fix.txt) · [audit.txt](audit.txt) |
| Lint | no lint script in the project | — |

## Acceptance checks
| # | Check | Result | Proof |
|---|---|---|---|
| 1 | The "loan costs more than the portfolio earns" diagnosis compares the loan rate with the portfolio's compounded (median CAGR, nominal) growth, not its average return: a plan whose average return beats the loan rate but whose compounded growth doesn't gets the warning (proof: test) | pass | `diagnosis.test.ts` (6 cases, incl. loan rate between average and compounded growth, and the review's 12% APR vs 12.4% growth — effective 12.68%) — [tests-after-fix.txt](tests-after-fix.txt); in the app, defaults with a 9% loan: "The loan costs 9% a year but this portfolio typically grows only about 8.3% a year compounded…", 9.7% not quoted — [run-product-after-fix.txt](run-product-after-fix.txt), [loan-diagnosis-desktop-dark.png](loan-diagnosis-desktop-dark.png), [loan-diagnosis-phone-dark.png](loan-diagnosis-phone-dark.png) (screenshots from the first run, before the "typically grows" wording) |
| 2 | The Outlook's "Exp. return" figure is labelled as the average year, beside the Median CAGR it compounds to (proof: screenshot) | pass | "Avg. return", "average year · after inflation · 9.7% nominal", in the row with Volatility and Median CAGR; "Exp. return" appears nowhere — [outlook-lens-desktop-dark.png](outlook-lens-desktop-dark.png), [outlook-lens-phone-dark.png](outlook-lens-phone-dark.png) |
| 3 | The real-FX walk has zero log drift: the median currency factor stays at 1 for every horizon, and raising a city's FX volatility never raises its odds (Buenos Aires, Lisbon, Bangkok; 4,000 paths) (proof: test) | pass | `fxWalk.test.ts` — [tests-stage2.txt](tests-stage2.txt); the correctness reviewer restored the old drift in a scratch copy and both tests failed (Buenos Aires 0.740 → 0.762 with vol) |
| 4 | The Method page's currency paragraph says the typical future keeps today's rate and that more currency swing costs odds (proof: screenshot) | pass | rendered text in [run-product-after-fix.txt](run-product-after-fix.txt); [method-currency-desktop-dark.png](method-currency-desktop-dark.png), [method-currency-phone-dark.png](method-currency-phone-dark.png) |
| 5 | The default dividend tax drag is 0.40%; a saved plan or link that carries its own value keeps it, and the Method page shows the new default (proof: test) | pass | `dividendDrag.test.ts` (5 tests) — [tests-stage2.txt](tests-stage2.txt); Method page "0.4% a year drag", plan rail 0.40% with tooltip "1.7% × 23.8% ≈ 0.40%" — [method-dividend-drag-desktop-dark.png](method-dividend-drag-desktop-dark.png), [plan-dividend-drag-phone-dark.png](plan-dividend-drag-phone-dark.png) |

## Final re-run of stage 1's hand-proven checks
Stage 2 is the plan's last stage, so stage 1's checks 4 (recovery screen and Reset plan) and 5 (crafted links + reload) were re-run on the stage 2 code: both pass — [rerun-stage-1/](rerun-stage-1/).

## Odds moved by this stage (4,000 paths, seed 7, defaults)
| Plan | Before | After |
|---|---|---|
| St. Louis, stay home | 63.9% | 61.8% (dividend drag only) |
| St. Louis → Bangkok | 79.5% | 77.1% |
| Buenos Aires | 76.2% | 63.3% (74.0% with no currency risk) |
| Lisbon | 68.9% | 65.0% (66.2% with no currency risk) |

## Notes
- Review (correctness + security, in parallel): the diagnosis compared the APR with an annual compounded rate (fixed: effective `(1 + r/12)^12 − 1`, b64c608) and called a median "expected" (now "typically grows"). Old share links made at the 0.25% default now open at 0.40% while saved plans keep 0.25% — deferred to the plan's open questions. FX overflow is unreachable (vol ≤ 0.25, horizon ≤ 40 years); no injection; no new dependencies.
- At 390px the lens card's "Median CAGR" eyebrow is cut to "MEDIAN CAG…" — pre-existing, logged as an open question.
