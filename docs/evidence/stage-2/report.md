# Stage 2 · Retire later in the engine — evidence
Verified 2026-11-08 on cc192a6, plus uncommitted changes (src/engine/{types,defaults,simulate,kernel}.ts, src/state/share.ts, share.test.ts, new retireLater.test.ts and simKeys.test.ts)

| Check | Result | Evidence |
|---|---|---|
| With retire-in N > 0, nothing is withdrawn before month 12·N and savings (CPI-inflated) go to the portfolio, paying the loan down first; from month 12·N spending starts as today; N = 0 and savings $0 give results identical to before (proof: test) | pass | [tests-stage2.txt](tests-stage2.txt): retireLater.test.ts `withdraws nothing before month 12·N; CPI-inflated savings pay the loan down first, then are invested`, `a loan keeps accruing interest while working`, `savings raise the cost basis…`, `retireMonth 0 and savingsMonthly 0 match a config without the fields…`, `retire-in 0 with savings $0 gives identical results to a plan without the fields`. Break: [break-1-kernel-working-phase.txt](break-1-kernel-working-phase.txt), 9 tests fail |
| Other income counts only from max(income start, retirement); the move and wealth tax start no earlier than retirement; the plan still ends at the same age (proof: test) | pass | [tests-stage2.txt](tests-stage2.txt): `other income counts only from max(income start, retirement)`, `the move and wealth tax start no earlier than retirement, even in a hand-written config`, `retireMonth is 12·N; the move month is max(move, retirement)…`, `the wealth tax starts no earlier than retirement in simulate`, `the inheritance residence test uses the effective move month`, `the plan still ends at the same age: the horizon counts from today`. Break: [break-4-kernel-move-guard.txt](break-4-kernel-move-guard.txt), hand-written-config test fails |
| Later retirement with savings raises odds and safe spending at the defaults; the solver scales retirement spending only, never savings; the sell strategy gets the same savings (proof: test) | pass | [tests-stage2.txt](tests-stage2.txt): `retiring later with savings raises the odds at the defaults`, `retiring later with savings raises safe spending`, `the solver scales retirement spending only, never the savings`, `the sell strategy gets the same savings, invested with basis`. Break: [break-2-solver-scales-savings.txt](break-2-solver-scales-savings.txt), solver test fails (`expected +0 to be 4166.67`). Sanity at real defaults: [sanity-retire-in.txt](sanity-retire-in.txt). After the review fix: [tests-sell-fix.txt](tests-sell-fix.txt), `a sell side that starts at $0 still gets the savings…` |
| Atlas odds, the stay-home baseline and cache keys follow both new inputs (proof: test) | pass | [tests-stage2.txt](tests-stage2.txt): retireLater.test.ts `Atlas odds follow retire-in and savings, and match simulate`; simKeys.test.ts `inputsKey and atlasKey change when either changes`, `simulate and solve rerun for either…`, `Atlas odds rerun for either`, `profile-sheet destination runs rerun for either`, `drops the destination but keeps retire-in and savings`, `the pipeline runs the baseline with both fields and keys it to the plan` |
| Share links and saved plans carry both fields, clamped (retire-in 0–15 and below the horizon, savings 0–$1M); old links without them mean 0 (proof: test) | pass | [tests-stage2.txt](tests-stage2.txt): share.test.ts `retire later` block (round-trip, old links as 0, retire-in clamp, savings clamp, hostile values, engine limits, agrees with normalizeInputs). Break: [break-3-share-horizon-clamp.txt](break-3-share-horizon-clamp.txt), clamp test fails (`expected 12 to be 9`) |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint none configured · tests 587/587, 38 files, baseline 555 (re-run by the PM after the review fix) ([tests.txt](tests.txt)) · build pass, chunk-size warning only ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

Breaks were applied one at a time and restored from copies; `git diff` of src/ was byte-identical afterwards. Verified by a fresh agent; the report text was saved by the PM because subagents can't write .md files here.

Sanity at DEFAULT_INPUTS (4000 paths, seed 7, solver target 0.9), from [sanity-retire-in.txt](sanity-retire-in.txt):

| Retire in | Savings/yr | Success | Max spend home | Max spend Bangkok |
|---|---|---|---|---|
| 0 | $0 | 79.5% | $83,675 | $63,263 |
| 2 | $0 | 85.2% | $96,337 | $72,836 |
| 4 | $0 | 90.3% | $111,208 | $84,079 |
| 5 | $0 | 92.0% | $119,715 | $90,511 |
| 0 | $60,000 | 79.5% | $83,675 | $63,263 |
| 2 | $60,000 | 86.4% | $99,869 | $75,506 |
| 4 | $60,000 | 91.7% | $117,217 | $88,623 |
| 5 | $60,000 | 93.5% | $128,013 | $96,785 |

## History
- 2026-11-08 · Review found the sell strategy skipped savings when it started at $0 (portfolio $0, or loan ≥ portfolio): sell estate 0 vs BBD 120 on a flat path. Fixed: working-phase deposits reach a $0 sell side; new test fails without the fix; suite 587/587.
