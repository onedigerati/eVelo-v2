# Expat picks plan

## Goal
Make the Atlas trustworthy and useful for someone choosing where to retire abroad. The cost data for the 25 most expat-friendly destinations (judged for retirees) is checked against current published sources and labeled with source and date. The other cities stay but are clearly marked as rough estimates. The top 15 get a ranked profile explaining why each ranks well, with sources cited: cost, healthcare, safety, visa/residency, climate, expat community and the main drawbacks. All of this is woven into the Atlas flow. Done = the live Atlas shows the ranked picks with reasons, verified vs estimate labels are accurate, tests are green, and it works on phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 65 pass (9 files) · typecheck: clean · build: ok (main chunk 345.6 kB)

## Now
Stage 3 of 3 · Atlas picks
Mode: autopilot
Risk: UI only
Checks:
- [ ] The Atlas shows a "Top picks" section ranking the 15 profiled cities, each with its tagline, factor scores and the plan's odds there; picks 16–25 appear as a compact list with their one-line reason (proof: run the product)
- [ ] Opening a pick shows its profile (summary, scores, facts, drawbacks, sources) beside its cost comparison with home and the plan's odds, and can make it the destination (proof: run the product + test)
- [ ] City rows and comparisons label each city as verified (source, date) or a rough estimate, and the ranking method and sources are cited in the app (proof: run the product)
- [ ] Works at phone width (390px) and desktop, in light and dark themes, with keyboard access and no console errors; tests, typecheck and build green (proof: screenshots + commands)
- [ ] Preview artifact republished (proof: artifact URL)
Open: pushing to main deploys the live site — ask the user first

## Stages
- [x] 1. Verify costs — choose the top 25 for retirees, check their cost/healthcare data against current sources, label verified vs estimate
- [x] 2. Profiles — ranked profiles for the top 15: score by factor, why it ranks, drawbacks, sources
- [ ] 3. Atlas picks — "Top picks for expats" in the Atlas, profile beside the cost comparison and plan odds, verified/estimate labels; phone + both themes; preview

## Decisions
- 2026-11-06 · Verify cost data for 25 cities; write full profiles for the top 15 — user's choice.
- 2026-11-06 · Keep all 96 cities; unverified ones are labeled as rough estimates — home and destination choices keep working.
- 2026-11-06 · Ranking blends published sources (InterNations Expat City Ranking, International Living Global Retirement Index and similar) with cost, healthcare, safety and visa factors, weighted for retirees; sources cited in the app — user's choice.
- 2026-11-06 · Numbeo's figures are used to check and round our own indices, not bulk-copied, and no script scrapes them — their terms restrict bulk copying.
- 2026-11-06 · If a top pick isn't already in the dataset, add it rather than skip it.
- 2026-11-06 · Top 25 chosen from IL Global Retirement Index 2026, Live and Invest Overseas 2026, Expat Insider 2026/2025, InterNations city ranking 2024 (latest city edition found), Global Peace Index 2026 and Forbes 2026; all 25 already in the dataset. Dubai, Singapore, London and Dublin were ranked lower for retirees (no retiree visa route, or high cost).
- 2026-11-06 · Cost indices checked against Numbeo's current city table (read 2026-11-06, cross-checked with the 2026 Mid-Year edition and livingcost.org). US home cities were updated from the same table too: comparisons are destination ÷ home, and US restaurants ran ~13% low (up to 34%) and rent was off by up to 17%. US cities without full Numbeo rows (Scottsdale, Asheville, Sarasota) stay estimates.
- 2026-11-06 · Healthcare factor = midpoint of local/public cover and an international plan (Cigna/Allianz, age 60) vs a 2026 US benchmark-silver couple at 60 (~$35.9k/yr incl. ~$4k out-of-pocket), rounded to 0.05. Applies per country.
- 2026-11-06 · Verified cities carry source, date and confidence; Boquete is low confidence (9 Numbeo contributors) and Medellín averages two disagreeing Numbeo editions.
- 2026-11-06 · Profile scores calibrated across the 15 (San José cost 3→2, San Miguel safety 3→2, Puerto Vallarta healthcare 4→3, Panama City climate 2→3, Panama visa 5→4 because Pensionado excludes portfolio income) — two researchers scored on one scale; checked against GPI, US advisories and the cost indices.
- 2026-11-06 · Stage 2 profile research runs alongside stage 1 — the 15 cities were settled, so research doesn't need to wait on the cost data.

## Open questions
- Some 2026 single-stock months are very large (INTC +114% Apr 2026; MU/SNOW/DDOG ~+87% May 2026); match Yahoo raw bars but unverified against a second source.
- In-browser fetch of arbitrary tickers needs a CORS proxy or serverless function — user decides on hosting later; not blocking.
- Pushing to main deploys the live site — confirm with the user before the stage 3 push.

## Standing decisions
- 2026-11-06 · React + Vite + TS, hand-built SVG charts (d3-scale/shape/geo), static hosting — full design control, no backend. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Destination cost in USD = home budget × per-category city ratios (with expat factor) × US CPI path × real-FX random walk — PPP-consistent and simple. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Preview: after each stage that changes what the user sees, publish the production build to one private claude.ai Artifact (same URL every time) and keep a local dev server up — user asked to review meaningful updates on a preview site. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Public repo onedigerati/eVelo-v2 with GitHub Pages via Actions — user chose public (matches v1). (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · City cost indices are curated approximations from public indices, labeled as estimates and user-overridable per category. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · UI reads a prebuilt `market-index.json` (derived by `scripts/build-market-index.mjs`, sync-checked by a test); `market.json` ships only in the worker. Atlas/Method lazy; framer-motion via LazyMotion — main chunk 1,177 kB → 345 kB. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Plain hashes (`#atlas`) are canonical and share links are `#p=…` — the claude.ai preview host only passes plain hashes; `#/atlas` and `#/?p=` still parse. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Verdict bands 80 / 65 / 45 (holds / mostly holds / fragile / breaks), classified on the displayed whole percent; one outcome color scale (`outcomeScale.ts`, hue-adjacent `--ramp-*` stops, step at 65%) for every success color. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))
- 2026-11-06 · Atlas shows the Outlook's full-path odds for the user's home and destination, so one city never shows two numbers. (from [eVelo v2 build](plans/2026-11-06-evelo-v2-build.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
