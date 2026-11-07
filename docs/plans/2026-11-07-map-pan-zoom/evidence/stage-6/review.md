# Stages 5–6 review (fresh agent, 2026-11-06)

No high-severity findings. The security pass found no new input parsing, no unsafe HTML and no network calls. Findings and triage:

1. MEDIUM, verified: Medellín `tax: 2` broke the rubric, since Colombia's threshold is ~$1.2M. **Fixed:** set to 1.
2. MEDIUM, verified: Spain's estate is 4 though the facts and engine model zero for US-resident heirs. **Kept 4, rule made explicit:** the estate rubric now says a regime whose reach over US assets is only inferred scores one lower. Turkey and the Dominican Republic score 4 on their rates anyway.
3. LOW, verified: a move at or after the horizon showed "stays under the threshold". **Fixed:** says the move is outside the plan; test added.
4. LOW, verified: skeletons didn't clear on error. **Fixed:** shown only while loading.
5. LOW, plausible: results weren't announced to screen readers. **Fixed:** a visually hidden `role="status"` region, with loading rows aria-hidden.
6. LOW, plausible: the stay-home run was recomputed and an idle worker stayed alive. **Fixed:** the main pipeline's cache is reused; the worker is terminated when the last sheet closes or after 30 s idle.

Checked as correct: stale-result guards in `useDestinationSim`; full-input cache key; the same-seed stay-home comparison; tax wording cases; the rank order matching the research doc; lending scores matching Appendix E; six profiles spot-checked; focus trap and Escape in the sheet.
