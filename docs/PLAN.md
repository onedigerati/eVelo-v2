# BBD destinations plan

## Goal
Find the best places to retire for someone living on buy-borrow-die: a portfolio that is never sold, spending funded by borrowing against it, and the estate passed on with a step-up. The ranking and the simulation weigh what actually matters for that: the destination's wealth tax and inheritance tax (now modeled in the engine), tax on dividends and foreign income, residency routes that accept assets rather than a pension, whether a US broker will still lend to a resident there, and healthcare cost and quality into the late 70s and beyond, alongside cost, safety, climate and flights. Belize and the other places skipped last time (LIOS 2026 #4–10) are added with verified costs, and the candidate pool is not limited to cities already in the dataset. Done = the live Atlas ranks the new top 50 with BBD-specific scores and a sourced profile page for each of the 50, each city's odds and estate reflect its local taxes, tests are green, and it works on phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 107 pass (12 files) · typecheck: clean · build: ok (main chunk 354.0 kB)

## Now
Stage 4 of 6 · Local taxes
Scope: per-country (and per-region, for Spain) wealth and inheritance tax parameters in `src/data/localTaxes.ts`, sourced from the research doc and attached to each city.

The kernel applies both:
- **Wealth tax:** charged at each year-end after the move, on real net worth (portfolio − loan), or on gross portfolio value where the law says so (Italy's IVAFE). Thresholds are held constant in real terms. BBD borrows the tax; the sell strategy sells to pay it.
- **Inheritance tax:** applied at the horizon to both the BBD estate and the sell estate. The assumed heirs are two US-resident children; heir-based regimes (Spain, Thailand, Vietnam) don't reach US assets passing to them.

Results report the median cumulative wealth tax and the median inheritance tax. The Atlas odds pick the taxes up through the shared kernel. The Method page explains the model and its simplifications: Spain's 60% cap is ignored, there are no treaty credits (the US exemption is $15M), and each country's rates are the current-law schedule.
Risk: high — money logic in the engine (user approved 2026-11-06); keel:review with a security pass
Checks:
- [x] Tests prove the tax math: an all-zero tax config reproduces the existing results exactly; wealth tax is charged only after the move, only above the threshold, on net vs gross base as configured; the inheritance bands compute the hand-worked figures; a wealth-tax country lowers success and estate vs the same city with no tax (proof: `npm test` output)
- [x] Every country in the draft top 50 has a `localTaxes` entry, explicit "none" included, each citing a source URL from the research doc; the Spanish cities use their own region's rules (proof: test + read the data file)
- [x] The running app shows odds and estate changing for a taxed destination (e.g. Tarragona or Medellín vs Málaga at a $5M portfolio), and the Method page explains the model (proof: Playwright run + screenshots)
- [x] Tests green, typecheck clean, build ok, review findings triaged (proof: command output + review notes) — [evidence](evidence/stage-4/report.md)
Open: none
Mode: autopilot

## Stages
- [x] 1. BBD research — country tax, residency, lending and healthcare facts for every candidate, sourced; new top-25 draft
- [x] 2. Research for 26–50 — more candidates and any new countries, sourced the same way; draft top 50
- [x] 3. New cities — add Belize (Cayo, Ambergris Caye), the other skipped LIOS picks and every research add for the top 50, with verified costs and healthcare factors
- [x] 4. Local taxes — wealth and inheritance tax per country in the engine, with tests; odds and estate reflect them; Method page explains
- [ ] 5. BBD ranking — rerank the top 50 with new tax/estate and lending factors; profile pages for all 50 (new ones for newcomers and 26–50, refreshed facts for the rest)
- [ ] 6. Atlas & verify — tax lines in "Your plan here", the Atlas list and profile pages handle 50 picks, phone + both themes, preview, deploy on approval

## Decisions
- 2026-11-06 · Belize and LIOS 2026 #4–10 (Gascony, Crete, Tarragona, Cayo, Hua Hin, Kotor, Las Terrenas) are added — last round silently ranked only cities already in the dataset, breaking its own "add it rather than skip it" rule; user asked to add them.
- 2026-11-06 · Candidates are not limited to the dataset; every candidate dropped from the top 25 gets a written reason.
- 2026-11-06 · Ranking is judged for buy-borrow-die retirees (tax on holding and passing on a portfolio, asset-based residency, US-broker lending abroad, healthcare into old age) — user: "that's kind of the whole point".
- 2026-11-06 · The simulation applies each destination's annual wealth tax and inheritance tax — user's choice over score-only, so odds and estates reflect what the plan really keeps.

- 2026-11-06 · Research surfaced Cyprus (Paphos, Limassol) and Malta (Sliema) as strong BBD fits and they enter the draft top 25; Paraguay (Asunción) and the Philippines were considered and dropped with reasons — autopilot call within the "not limited to the dataset" decision.
- 2026-11-06 · Broker/margin facts rest on secondary sources (IBKR and Schwab International pages refuse automated fetch; a shell workaround was declined as bot-check circumvention) — marked secondary in the doc and carried as a caveat, not a ranking driver.

- 2026-11-06 · Profile pages for the top 50, not just the top 25 — user asked to expand; adds a research stage for picks 26–50 before the new-cities stage, and profiles for all 50 in the ranking stage.

- 2026-11-06 · User gave the go for the revised 6-stage plan, including Stage 4's engine wealth/inheritance tax (money logic) — "Go".
- 2026-11-06 · Draft top 50 adds Cascais, Madrid, Antalya, Antigua Guatemala, Tbilisi, Ajijic, Coronado, Atenas, Alicante, Phuket, Santiago, Prague, Istanbul, Mexico City, Budapest, Taipei, Lima, Oaxaca, Playa del Carmen, and brings back Asunción, Las Terrenas, Medellín, Florence, Cuenca and Nice at 42–50. 16 candidates sit outside, each with a reason. Turkey's Law 7582 (20-year foreign-income exemption) was checked against EY's alert before it lifted Antalya to #19 — autopilot call.
- 2026-11-06 · User approved building Stage 4 (engine wealth/inheritance tax) with the stated assumptions (two US-resident children as heirs; heir-based regimes don't reach them) — "Go ahead please".
- 2026-11-06 · Local-tax thresholds convert at the bundled fx.json rates (review fix), so they drift slightly with `npm run data:fx`; FX_FALLBACK refreshed to match. Share-link and persisted inputs are clamped to the plan UI's own limits (review security fix). Ireland/Japan inheritance reach is read as strictly more than 5/10 years' residence.

## Open questions
- Local-tax bands filled from statutory scales where the research doc gives only ranges (Spanish regional steps, solidarity breakpoints, France, Japan, Ecuador's middle brackets — each note says so); thresholds are per person, not per couple; Turkey's 1% applies though US assets to US heirs may be out of scope.
- Countries outside the top 50 without research (UK, Netherlands, Germany, Switzerland, UAE, South Africa, Singapore, South Korea, Canada, Australia, New Zealand) carry no local-tax data, so the Atlas treats them as untaxed (Switzerland's wealth tax, the UK's inheritance tax not modelled) — Stage 6 should label this.
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
