# Stage 1 · Engine starting loan — evidence
Verified 2026-11-08 on 141c72b (stage 2 also merged; this report covers stage 1 only), no uncommitted source changes. Verified by a fresh agent that built nothing; report saved by the PM because the harness stops subagents from writing it.

All six checks are library logic, proven by tests in `src/engine/__tests__/existingLoan.test.ts` ([existingLoan-tests.txt](existingLoan-tests.txt), 12/12). Each test was also run against a deliberately broken kernel: each mutation in [mutations.txt](mutations.txt) makes at least one of the tests below fail.

| Check | Result | Evidence |
|---|---|---|
| With a $500k balance on a $3M plan, every path records year 0 as loan $500k, LTV 16.7%, net worth $2.5M (proof: test) | pass | `a $500k balance on a $3M plan records year 0 ...` asserts loan, port, nw and LTV (1/6) on all 800 recorder paths, and the simulate p5/p50/p95 bands at year 0 ([existingLoan-tests.txt](existingLoan-tests.txt)). It fails under M1, M5 and M8 ([mutations.txt](mutations.txt)) |
| The balance accrues at `loanRate`: with no spending and flat returns, the loan after 12 months is balance × (1 + rate/12)^12 (proof: test) | pass | `the balance accrues at loanRate ...`: closed form to 1e-10 on a flat one-path kernel ([existingLoan-tests.txt](existingLoan-tests.txt)); fails under M1 |
| The sell strategy starts at portfolio − balance with no debt and basis scaled pro rata; with zero loan rate, no spending and flat returns, the two estates match before tax (proof: test) | pass | `starts at portfolio − balance with no debt ...` (both estates 70, sell tax 0) and `scales the sell side basis pro rata ...` (gain fraction 0.6 on Vs=50, Bs=20) ([existingLoan-tests.txt](existingLoan-tests.txt)); fail under M2 and M3 |
| A balance above `maxLtv` × portfolio triggers a forced sale in month 0, counted in year 0 of the margin-call chart; a balance at or above the portfolio breaks the path at once (proof: test) | pass | `a balance above maxLtv × portfolio forces a sale in month 0 ...` (firstCall 0, lands at LTV 0.45), `counts that month-0 forced sale in year 0 of marginCallByYear` ($2.4M on $3M: byYear[0] = 1), `a balance at or above the portfolio breaks the path at once ...` (L0 = 100 and 150 on V = 100; simulate at $3M: broken 1, byYear[0] = 1) ([existingLoan-tests.txt](existingLoan-tests.txt)); fail under M4, M6, M7 and M8 |
| A balance of 0, or a plan without the field, gives results identical to today's for the same seed (proof: test) | pass | The test `a balance of 0, or a plan without the field ...` compares 0 with a missing field on the new code only, so the pre-stage engine (75ee416) was also compared: simulate, full recorder arrays, solver and Atlas for 10 cases are byte-identical (same sha256) across old, 0 and missing ([zero-balance-bit-identical.txt](zero-balance-bit-identical.txt)) |
| A larger balance lowers the success rate and the solver's max sustainable spend, and reaches every Atlas city (proof: test) | pass | `a larger balance lowers the success rate` (0 > 300k > 800k), `... lowers the solver's max sustainable spend` (home and destination), `reaches every Atlas city ...` (all cities returned, each ≤, at least one lower) ([existingLoan-tests.txt](existingLoan-tests.txt)); fail under M1 and M8 |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint: no lint script in package.json · tests 413/413 in 28 files ([tests.txt](tests.txt)), up from a baseline of 387 in 25 files · build pass, existing chunk-size warning only ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## Kernel read (money math)
- Start: `L = L0` with L0 = initialLoan if > 0, else 0 (this also catches NaN); kernelConfig clamps negatives with `Math.max(0, existingLoan ?? 0)`.
- Sell offset: `Vs = max(0, V − L0)`, `Bs = B·Vs/V` (0 when V = 0). The gain fraction is unchanged, and the offset carries no tax, per the decision.
- Year 0: a path that isn't broken records port V, nw V − L, loan L, LTV L/V. A path broken at the start (L0 > 0 and L0 ≥ V) records 0/0/0/LTV 1 with called = 0. Outputs are finite for NaN, −5, Infinity and portfolio 0 ([edge-probe.txt](edge-probe.txt)).
- A balance of 0 is bit-identical to before: B·(V/V) = B exactly, and the comparison above confirms it.
- Note for stage 2 (not a stage 1 defect): at the defaults, $2.55M on $3M (85.0% LTV) already breaks 100% of paths. Month 0 adds interest and that month's spending before the margin check, so the break point is below the quoted ≈85.7% (V·(1 − g·tax)) ([edge-probe.txt](edge-probe.txt)).
- Minor test gap: the Atlas test wouldn't catch a loan reaching only some cities (≤ per city, < for at least one). Every city goes through the same `kernelConfig`, so there is no defect.

No `docs/evidence/.gitignore` was created: the standing decision of 2026-11-07 dropped it so screenshots are committed. This stage has no images.
