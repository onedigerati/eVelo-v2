# Stage 4 review (fresh agent, 2026-11-06)

No blocking bugs in the money math. Findings and triage:

1. MEDIUM, verified — tax thresholds converted at stale FX_FALLBACK rates (Colombia threshold $967k vs doc ~$1.17M). **Fixed:** localTaxes converts at bundled fx.json rates; FX_FALLBACK refreshed; test checks against fx.json.
2. LOW, verified — estate note dropped "after the destination's inheritance tax" when the median tax was 0 though the medians were after tax. **Fixed:** `localTax.inheritanceApplies` flag drives the note; types comment warns the medians don't subtract.
3. LOW, plausible — Ireland/Japan residence gate one year early (≥ vs >). **Fixed:** strict >, tests at 5/6 and 10/11 years.
4. LOW, verified (security) — share links didn't range-check numeric inputs; capGainsRate 5 or −3 broke the sell gross-up. **Fixed:** every numeric input clamped to the plan UI's own limits in `sanitizeInputs` (share links and persisted plans); hostile-value tests. Tax parameters come only from bundled data, so links can't inject them; no new network calls or secrets.
5. INFO — dead `ES_STATE`. **Fixed:** removed; Spain is regional-only and the coverage test checks each Spanish city.

Test gaps (move month not a multiple of 12, tax-driven insolvency, Japan gate, sell-estate inheritance with wealth tax, real-data hand-worked figures) — **added**.

Deferred (in the plan's open questions): bands filled from statutory scales where the doc gives only ranges (each note says so); thresholds per person, not per couple; 11 countries outside the top 50 (UK, Switzerland, etc.) carry no tax data, so the Atlas shows them untaxed.
