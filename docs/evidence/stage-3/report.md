# Stage 3 · Matched sample futures — verification

Verified 2026-11-21 on arm64 by a fresh verifier agent (built nothing); re-run by the PM after the review fix round (match test tied to the engines' actual draws, non-finite months as 0, a stale comment).

| Check | Result | Evidence |
|---|---|---|
| A pure, tested picker chooses early crash, typical, late crash and lucky by the logged plan-neutral market rule; reads only month indices and real stock returns; same inputs → same picks | pass | [stage3-tests.txt](stage3-tests.txt), [stage3-tests-after-review.txt](stage3-tests-after-review.txt) (determinism, windows, ties, a direct O(T·24) scan, NaN months); independent re-derivation on the bundled market, 4 setups: [picker-rule-probe.txt](picker-rule-probe.txt), [picker-rule-probe-after-review.txt](picker-rule-probe-after-review.txt) ([picker-rule.probe.ts](picker-rule.probe.ts)) |
| Under the historical method, simulate and the income engine return per-year rows for the picked paths, equal to each engine's own per-path figures | pass | same test files: eVelo rows = the kernel's per-path recording and a 1-path rerun on that path's months; income rows = that path's own one-path figures to the cent |
| With equal seed, paths, block length and horizon, both engines pick the same paths and those paths share calendar months | pass | `sampleFutures.match.test.ts` in [stage3-tests-after-review.txt](stage3-tests-after-review.txt): same keys and paths; identical month slices; `runIncomePaths` deep-equals `runIncomeOnMonths` on simulate's own drawn months; seed/block-length controls differ. Real data (1000 × 30y, default seed): all four found |
| Under fat-tail, no sample futures | pass | eVelo and income fat-tail tests (null, picker not called) |
| Existing figures don't move; goldens and timing budgets pass | pass | [hash-vs-323810c.txt](hash-vs-323810c.txt): 14/14 hashes (5 simulate, 3 income, 3 atlas, 3 solve) identical to 323810c ([hash-old-figures.probe.ts](hash-old-figures.probe.ts)); goldens pass; simulate 102–134 ms (1500), atlas 634–772 ms (3500), income/simulate 0.90–1.06 (2) |

Project checks: typecheck pass ([typecheck-after-review.txt](typecheck-after-review.txt)) · tests 1584 passed, 1 skipped ([tests-after-review.txt](tests-after-review.txt)) · build and e2e pass, 23 ok ([build-e2e.txt](build-e2e.txt), before the review fixes, which touch only tests and non-finite handling) · audit 0 vulnerabilities ([audit.txt](audit.txt)). Probes run with `PROBE_ROOT=<repo> npx vitest run --config docs/evidence/stage-3/probe.config.mjs`.

Notes: samples add ~20 KB per worker message at 40 years ([message-size.txt](message-size.txt)); under default inputs 3,940 of 4,000 paths have a ≥20% fall, so early/late sort by when the worst fall starts (decision log updated). Goldens for samples and atlas/solve are arm64-only (open question).

Review: security pass found nothing (inputs clamped; ≤~19 MB index array at 10,000 × 40y; nothing logged or sent). Correctness: 3 fixed, 2 carried into stage 4's scope (block-length rounding in the "same futures" gate, repeated picks), 1 deferred (x64 / data-refresh goldens), 1 logged (late window on 10–14-year horizons).
