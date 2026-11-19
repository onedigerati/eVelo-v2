# Stage 2 · Income tax — evidence
Verified 2026-11-18 on 90e3ccd, plus uncommitted changes

| Check | Result | Evidence |
|---|---|---|
| 2026 federal ordinary brackets, standard deduction and 65+ additions (single, MFJ) match Rev. Proc. 2025-32 at worked incomes, three or more per filing status (proof: test, figures cited to the note) | pass | [tests.txt](tests.txt) (4 worked incomes per status); [rev-proc-crosscheck.txt](rev-proc-crosscheck.txt): all 14 thresholds, 0/15/20 breakpoints, 16,100/32,200, 2,050/1,650 match the PDF; [independent-federal-comparison.md](independent-federal-comparison.md) |
| Qualified dividends and long-term gains stack on ordinary income at 0/15/20%, and NIIT is 3.8% above $200k/$250k MAGI, with thresholds that stay fixed in nominal terms (so they shrink in real terms year by year) while brackets are indexed; worked examples match hand calculations (proof: test) | pass | [tests.txt](tests.txt); [independent-federal-comparison.md](independent-federal-comparison.md): 12 cases, largest difference $0.00 (e.g. MFJ 15→20% $129,273.00, NIIT $17,100; priceLevel 1.5 NIIT $4,781.67) |
| Muni interest is federally exempt but counts in provisional income for Social Security (0/50/85% taxable, fixed nominal thresholds); Treasury interest is state-exempt (proof: test) | pass | [tests.txt](tests.txt); [independent-federal-comparison.md](independent-federal-comparison.md) (taxable SS 500 / 9,600 / 34,000 cap / 42,500 at priceLevel 1.5); [state-coverage-and-spotcalc.txt](state-coverage-and-spotcalc.txt) (Treasury interest left out of the state base) |
| Every US home city in `cities.ts` has a state rule for muni interest (in-state exempt / all taxed / all exempt / reciprocal) and a state rate on interest and dividends, with a read source; Illinois, DC and Utah settled in `docs/research/state-muni-rules.md`; a foreign home is federal only (proof: test + note) | pass | [state-coverage-and-spotcalc.txt](state-coverage-and-spotcalc.txt): 33/33 US cities, 0 non-US records, toronto state tax 0; IL/DC/UT state tax matches hand calculation; [state-sources-fetch.txt](state-sources-fetch.txt) |
| Typecheck clean, suite green, app bundle unchanged (the module isn't imported by the app yet) (proof: test + build output) | pass | [typecheck.txt](typecheck.txt), [tests.txt](tests.txt), [build.txt](build.txt), [bundle-unchanged.txt](bundle-unchanged.txt): IDENTICAL to 90e3ccd |

Supporting files: [independent-calculator.ts.txt](independent-calculator.ts.txt), [independent-compare.test.ts.txt](independent-compare.test.ts.txt), [independent-states.test.ts.txt](independent-states.test.ts.txt)

Project checks: type check pass · lint none configured · tests 1233/1233 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 high, 0 critical ([audit.txt](audit.txt))

Verified by a fresh agent that built none of it; report table written to this file by the main session.

After the review's fix round, a fresh agent re-ran the independent calculator against the fixed code (12 cases, $0.00 difference) and checked each fix: [recheck-after-fixes.txt](recheck-after-fixes.txt).
