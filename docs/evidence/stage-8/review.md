# Stage 8 · review (risky: money)

Reviewed 2026-11-15 by one fresh reviewer that built none of the stage. The `security-review` skill wouldn't run because the repo has no `origin/HEAD`, so the security pass was done by hand.

**What was checked:**
- Every new and changed `localTaxes.ts` entry was recomputed by hand against the statutes: Illinois's $5M → $285,714 exactly; New York's cliff, which is exact (§952(c) phases out linearly); WA, OR, HI, MN, MA, DC, PA, the UK, Box 3, Germany's step relief, Korea and Zurich.
- FX, the per-heir halving, `afterYearsResident` and the edge cases.
- Security: no shell in `scripts/fact-check-report.mjs` (git is called with an argument array), no new dependencies, no HTML rendering of ledger text, no secrets, and no instructions in the ledger.

| # | Finding | Pile | Outcome |
|---|---|---|---|
| 1 | A taxed home city was never taxed, so "estate vs staying home" was wrong. Example: Chicago home, Portland showed about $800k worse when the true gap was about $122k. | fix now | The home run now applies the home city's own `localTax` from year 0 (`simulate.ts`, `kernel.ts` `fromMonth`). Engine tests cover a taxed home, destination = home, move never taxed by home, and untaxed homes unchanged; a snapshot of 273 runs showed untaxed homes bit-identical. UI notice removed; copy updated. |
| 2 | The "not modelled" reason was wrong for New Zealand (FIF is a yearly deemed-return tax) | fix now | Per-country reasons; test |
| 3 | `what-changed.md`: "eleven US cities in nine states", and the Austria OeKB wording undid the ledger's correction | fix now | Fixed |
| 4 | The InfoTip read "How United States's local taxes are modelled" | fix now | `taxInfoLabel()` names the state; test |
| 5 | Stale `types.ts` comment ("Absent for US cities") | fix now | Fixed |
| 6 | Misplaced doc comment in `picks.ts` | fix now | Fixed |
| 7 | `verify8.mjs` hard-codes local paths | reject | It's an evidence script, and stages 1–7 use the same pattern |
| — | The report test checked only corrected ids, not `rankFlag`s | fix now | The test now checks all 25 `rankFlag` ids |
| — | Pre-move years at a taxed home (a Zurich wealth tax before a delayed move) and a move at or after the horizon run without the home's tax | defer | Plan open questions |
