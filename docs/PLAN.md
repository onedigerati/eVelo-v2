# BBD destinations plan

## Goal
Find the best places to retire for someone living on buy-borrow-die: a portfolio that is never sold, spending funded by borrowing against it, and the estate passed on with a step-up. The ranking and the simulation weigh what actually matters for that: the destination's wealth tax and inheritance tax (now modeled in the engine), tax on dividends and foreign income, residency routes that accept assets rather than a pension, whether a US broker will still lend to a resident there, and healthcare cost and quality into the late 70s and beyond, alongside cost, safety, climate and flights. Belize and the other places skipped last time (LIOS 2026 #4–10) are added with verified costs, and the candidate pool is not limited to cities already in the dataset. Done = the live Atlas ranks the new top 25 with BBD-specific scores and sourced profiles, each city's odds and estate reflect its local taxes, tests are green, and it works on phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 107 pass (12 files) · typecheck: clean · build: ok (main chunk 354.0 kB)

## Now
Stage 2 of 5 · New cities
Scope: add 12 cities to `src/data/cities.ts` — Crete (Chania), Hua Hin, Kotor, Paphos, Limassol, Sliema, Cayo (San Ignacio), Ambergris Caye (San Pedro), Gascony (Auch), Tarragona, Las Terrenas, Asunción — with new country bases for Cyprus, Malta, Montenegro, Belize, Dominican Republic, Paraguay (currency, FX fallback, fxVol, healthcare factor, 1–3 notes from the Stage 1 research), costs checked against Numbeo with a `verified` record (low confidence + note where thin), and a cost-check section in `docs/research/cost-check-2026-11.md`. Profiles and ranking are Stage 4.
Risk: low (data only; no money logic changes)
Checks:
- [ ] All 12 cities are in `CITIES`, each with a `verified` record citing the Numbeo page read, and listed with their indices and healthcare factor in `docs/research/cost-check-2026-11.md` (proof: test asserting the ids + verified, and read the doc)
- [ ] Healthcare factors for the six new countries are set on the existing scale (US = 1) with the basis written down (proof: read the doc)
- [ ] The new cities appear and run in the Atlas (proof: screenshot of the running dev app with a new city selected)
- [ ] Tests green, typecheck clean, build ok (proof: command output)
Open: none
Mode: paused — Stage 2 risk line tripped the money gate (false positive: data only); Stage 3 (engine wealth/inheritance tax) is money logic and needs the user’s go

## Stages
- [x] 1. BBD research — country tax, residency, lending and healthcare facts for every candidate, sourced; new top-25 draft
- [ ] 2. New cities — add Belize (Cayo, Ambergris Caye), the other skipped LIOS picks and any research adds, with verified costs and healthcare factors
- [ ] 3. Local taxes — wealth and inheritance tax per country in the engine, with tests; odds and estate reflect them; Method page explains
- [ ] 4. BBD ranking — rerank the top 25 with new tax/estate and lending factors; profiles for newcomers, refreshed facts for the rest
- [ ] 5. Atlas & verify — tax lines in "Your plan here", phone + both themes, preview, deploy on approval

## Decisions
- 2026-11-06 · Belize and LIOS 2026 #4–10 (Gascony, Crete, Tarragona, Cayo, Hua Hin, Kotor, Las Terrenas) are added — last round silently ranked only cities already in the dataset, breaking its own "add it rather than skip it" rule; user asked to add them.
- 2026-11-06 · Candidates are not limited to the dataset; every candidate dropped from the top 25 gets a written reason.
- 2026-11-06 · Ranking is judged for buy-borrow-die retirees (tax on holding and passing on a portfolio, asset-based residency, US-broker lending abroad, healthcare into old age) — user: "that's kind of the whole point".
- 2026-11-06 · The simulation applies each destination's annual wealth tax and inheritance tax — user's choice over score-only, so odds and estates reflect what the plan really keeps.

- 2026-11-06 · Research surfaced Cyprus (Paphos, Limassol) and Malta (Sliema) as strong BBD fits and they enter the draft top 25; Paraguay (Asunción) and the Philippines were considered and dropped with reasons — autopilot call within the "not limited to the dataset" decision.
- 2026-11-06 · Broker/margin facts rest on secondary sources (IBKR and Schwab International pages refuse automated fetch; a shell workaround was declined as bot-check circumvention) — marked secondary in the doc and carried as a caveat, not a ranking driver.

## Open questions
- Malta's Global Residence Programme terms are kept to 2031 only for applications filed by 31 Dec 2026 — time-sensitive for the user personally, not for the app.
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
- 2026-11-06 · Ranking blends published sources (IL Global Retirement Index, InterNations, LIOS, GPI, Forbes) weighted for retirees; sources cited in the app. (from [Expat picks](plans/2026-11-06-expat-picks.md))
- 2026-11-06 · Verified cities carry source, date and confidence; others are labeled rough estimates; Numbeo used to check, not bulk-copied. (from [Expat picks](plans/2026-11-06-expat-picks.md))
- 2026-11-06 · Profile scores are eVelo's own 1–5 assessment on one scale across all picks, checked against GPI, US advisories and the cost indices. (from [Expat picks](plans/2026-11-06-expat-picks.md))
- 2026-11-06 · New logo: the user's "escape velocity" concept (ring, script e breaking into a rising chart, rocket) redrawn as SVG — user picked the Homage study of four (https://claude.ai/artifact/1gJfSyj9E8qjbjeGsj9hkX). Gradient uses new `--brand-1/--brand-2` tokens (accent green → teal-blue); `Mark`, `public/favicon.svg` and `public/apple-touch-icon.png` share one drawing. (from [Profiles 16–25](plans/2026-11-06-profiles-16-25.md))
- 2026-11-06 · Wordmark set in Geist Semibold (23px, -0.035em), all ink, replacing Instrument Serif with a green italic V — the serif's hairlines looked faint beside the heavy mark and the green V competed with it; user chose this from six studies (https://claude.ai/artifact/VEK952PiL72D8BwTbWBqa3). (from [Profiles 16–25](plans/2026-11-06-profiles-16-25.md))
- 2026-11-06 · Atlas runs every city on the plan's full path count (was capped at 1,500, with the Outlook's number swapped in for home and destination) — user wanted all cities on the same simulation so picking a city never moves it; ranking takes ~1 s at 4,000 paths, ~2.3 s at 10,000, in the worker. Replaces the standing decision that the Atlas overlays the Outlook's odds. (from [Saved portfolios](plans/2026-11-06-saved-portfolios.md))
- 2026-11-06 · Saved portfolios live in localStorage under their own key (`evelo:v2:portfolios`), separate from the plan, and are not part of share links — user agreed to browser-only, holdings-only. (from [Saved portfolios](plans/2026-11-06-saved-portfolios.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](plans/2026-11-06-saved-portfolios.md)
