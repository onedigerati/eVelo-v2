# Stage 3 · Income engine — evidence
Verified 2026-11-18 on 192a960, plus uncommitted changes (after the review's fix round)

| Check | Result | Evidence |
|---|---|---|
| The income engine draws the same months as eVelo for the same seed, paths, horizon and block length, and eVelo's own results are bit-identical to before (proof: test) | pass | [same-months.txt](same-months.txt): `simulate` 4000×30y default/fat-tail/seed 12345 hash-identical HEAD vs working tree; scenarios bit-identical; indices = HEAD rng replay (0/1,440,000 mismatches); runIncomePaths = runIncomeOnMonths on them; [income-tests.txt](income-tests.txt) |
| Yields start at each sleeve's latest real yield and move only by each drawn month's capped, demeaned change, with a 0.25% floor, so a 1990s-only future still starts at today's yield (proof: test) | pass | [yields-real-data.txt](yields-real-data.txt): startYield = latest y exactly; y30 medians: munis 3.35%, VFITX 3.97%, VBMFX 4.22%; SPY 1.00→1.21% (floor; 0.87% without it); own replay exact |
| A hand-worked one-path, three-year case (income by type, tax by `incomeTax`, a gap sale with gains tax, a surplus reinvested) matches the engine to the cent, and an independently written reference implementation matches the engine on many random inputs (proof: test) | pass | [income-tests.txt](income-tests.txt) (240-plan cross-check vs the reference); [hand-case-2y-ny.txt](hand-case-2y-ny.txt): verifier's own 2-year MFJ New York case matches to $0.00, bracket lag $55–57 a year |
| The three measures (money lasts, principal never sold, income keeps pace) and the value and income bands come out of `runIncomePaths`, sane on known cases (all-bond plan with spending below income: principal kept on every path; spending above any plausible income: lasts falls as horizon grows) (proof: test) | pass | [measures.txt](measures.txt): defaults 99.5/0/15.2%; all-bond 95.2/0/2.5%; spending 400k lasts 100/1.8/0.1/0.1% at 5/15/30/40y |
| The worker answers an `income` request; at the plan's default paths and horizon, `runIncomePaths` runs within 2× `simulate`'s time on the same machine; app main chunk unchanged (proof: test + build output) | pass | [worker-built.txt](worker-built.txt); [speed.txt](speed.txt) ratio 0.90/0.96 source, 1.04 built; [main-chunk.txt](main-chunk.txt) index 417,493 B, identical after chunk-name hash normalization |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · lint none configured · tests 1289/1289 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
Scripts: check1–4.test.ts.txt, check2b.test.ts.txt, builtworker.mjs.txt, speed.test.ts.txt, speedbuilt.mjs.txt

Verified by a fresh agent that built none of it; this table written to the file by the main session.

Notes from the verifier
- SPY's yield starts at 1.0%, near the 0.25% floor, and the additive walk is wide over 30 years, so the floor lifts its median to 1.21% (0.87% without it) — open question in the plan.
- The all-bond "principal kept on every path" case holds at $10k spending; at $60k (59% of year-one income) 11.4% of paths still sell.
- On the defaults only 15% of paths keep pace (median after-tax income 58.5k → 48.6k by year 10).
