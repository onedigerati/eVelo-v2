# Profiles 16–25 plan

## Goal
Give picks 16–25 (Medellín, Cuenca, Madeira, Da Nang, Montevideo, Nice, Florence, Bangkok, Split, Bali) the same full profile as the top 15: tagline, summary, six 1–5 scores calibrated against the existing 15, seven facts, drawbacks and sources, opened from the Atlas with the "Your plan here" comparison. Done = all 25 picks open a profile on the live site, tests green, phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 93 pass (11 files) · typecheck: clean · build: ok (main chunk 345.6 kB)

## Now
Stage 1 of 1 · Profiles 16–25
Mode: autopilot
Risk: UI only (bundled reference data; accuracy checked against sources)
Checks:
- [ ] All 25 picks in `src/data/expatPicks.ts` have a full profile, scores calibrated against the existing 15, sources with http(s) urls (proof: test)
- [ ] Material risks and unconfirmed facts for the ten are stated or hedged (proof: review of the data file)
- [ ] In the Atlas, tapping a 16–25 row opens its profile (Make destination from there), and the "Top pick #n" marker opens the profile for all 25 (proof: run the product)
- [ ] Phone and desktop, light and dark, keyboard, no console errors; tests, typecheck, build green; preview republished (proof: screenshots + commands + artifact URL)
Open: pushing to main deploys the live site — ask the user first

## Stages
- [ ] 1. Profiles 16–25 — research, data, Atlas wiring, verify, preview

## Decisions
- 2026-11-06 · The 16–25 list keeps its compact layout; a row tap opens the profile instead of setting the destination — consistent with the top-15 cards; Make destination lives in the profile.

## Open questions
- Some 2026 single-stock months are very large (INTC +114% Apr 2026; MU/SNOW/DDOG ~+87% May 2026); match Yahoo raw bars but unverified against a second source.
- In-browser fetch of arbitrary tickers needs a CORS proxy or serverless function — user decides on hosting later; not blocking.
- Phuket keeps a 0.4 healthcare override while Thailand is now 0.3 — not a pick; re-check if it becomes one.

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
- 2026-11-06 · Ranking blends published sources (IL Global Retirement Index, InterNations, LIOS, GPI, Forbes) weighted for retirees; sources cited in the app. (from [Expat picks](plans/2026-11-06-expat-picks.md))
- 2026-11-06 · Verified cities carry source, date and confidence; others are labeled rough estimates; Numbeo used to check, not bulk-copied. (from [Expat picks](plans/2026-11-06-expat-picks.md))
- 2026-11-06 · Profile scores are eVelo's own 1–5 assessment on one scale across all picks, checked against GPI, US advisories and the cost indices. (from [Expat picks](plans/2026-11-06-expat-picks.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
