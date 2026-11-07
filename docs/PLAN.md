# BBD destinations plan

## Goal
Find the best places to retire for someone living on buy-borrow-die: a portfolio that is never sold, spending funded by borrowing against it, and the estate passed on with a step-up. The ranking and the simulation weigh what actually matters for that: the destination's wealth tax and inheritance tax (now modeled in the engine), tax on dividends and foreign income, residency routes that accept assets rather than a pension, whether a US broker will still lend to a resident there, and healthcare cost and quality into the late 70s and beyond, alongside cost, safety, climate and flights. Belize and the other places skipped last time (LIOS 2026 #4–10) are added with verified costs, and the candidate pool is not limited to cities already in the dataset. Done = the live Atlas ranks the new top 75 with BBD-specific scores and a sourced profile page for each of the 75, each city's odds and estate reflect its local taxes, tests are green, and it works on phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 107 pass (12 files) · typecheck: clean · build: ok (main chunk 354.0 kB)

## Now
Stage 8 of 8 · Profiles 51–75 & ship
Scope:
- `EXPAT_PICKS` becomes the research doc's draft top 75, with ranks and reasons.
- 25 new profile files, one per new pick: Tavira, Grand Baie, Torrevieja, La Paz, Hopkins, Corozal, Plovdiv, Chiang Rai, Roatán, Sarandë, Langkawi, Volcán, Panajachel, Placencia, Ambergris Caye, Split, Batumi, Gascony, Rome, Tarragona, Barcelona, Cartagena, Mazatlán, Bali, Vienna. They follow `src/data/profiles/README.md` and the rubric.
- The Atlas handles 75 picks: "Top pick N of 75", and the top-picks section and list stay readable.
- Then verify, run a fresh review and republish the preview.
- Then pause for the user's deploy approval.

Risk: low (curated content and UI; engine untouched)
Checks:
- [x] `EXPAT_PICKS` has 75 picks ranked 1–75 in the doc's order, each with a reason (proof: test)
- [x] All 75 have a full profile per the rubric (9 scores, all facts, drawbacks, ≥3 read sources, no TODO) (proof: test + spot-read 5 new profiles against the doc)
- [x] Atlas opens profiles for picks 1, 51 and 75 on phone and desktop, in light and dark, with no horizontal scroll and no console errors (proof: Playwright + screenshots)
- [x] Tests green, typecheck clean, build ok; fresh review triaged (proof: command output + review notes) — [evidence](evidence/stage-8/report.md)
- [ ] Preview republished; deploy done on the user's approval (proof: preview URL + live site check)
Open: none
Mode: paused — preview v15 published; ready to run `git push origin main` (deploys the top-75 build to GitHub Pages), held by the keel hook for the user’s word

## Stages
- [x] 1. BBD research — country tax, residency, lending and healthcare facts for every candidate, sourced; new top-25 draft
- [x] 2. Research for 26–50 — more candidates and any new countries, sourced the same way; draft top 50
- [x] 3. New cities — add Belize (Cayo, Ambergris Caye), the other skipped LIOS picks and every research add for the top 50, with verified costs and healthcare factors
- [x] 4. Local taxes — wealth and inheritance tax per country in the engine, with tests; odds and estate reflect them; Method page explains
- [x] 5. BBD ranking — rerank the top 50 with new tax/estate and lending factors; profile pages for all 50 (new ones for newcomers and 26–50, refreshed facts for the rest)
- [x] 6. Atlas & verify — tax lines in "Your plan here", the Atlas list and profile pages handle 50 picks, phone + both themes, preview
- [x] 7. Research for 51–75 — the 17 outside candidates plus ≥15 more (retiree towns in covered countries, new countries, unweighed dataset cities), sourced the same way; new cities added with costs, healthcare factors and local-tax data; draft top 75
- [ ] 8. Profiles 51–75 & ship — profile pages for 51–75, UI for 75 picks, verify phone + both themes, fresh review, preview, deploy on approval

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
- 2026-11-06 · Lending scores: 5 needs confirmed margin access for residents (none confirmed yet), 4 = Schwab International reported outside the EU plus IBKR, 3 = EU or IBKR only — normalised across the four profile builders, who read the rubric differently.
- 2026-11-06 · 11 picks newly in the top 50 (Madrid, Tbilisi, Phuket, Santiago, Prague, Istanbul, Mexico City, Budapest, Taipei, Lima, Playa del Carmen) get costs from livingcost.org scaled to Numbeo, low confidence — Numbeo rate-limited every fetch.
- 2026-11-06 · Estate rubric: a regime whose reach over US assets left to US-resident heirs is only inferred scores one point lower (Spain 4) — review triage. Medellín tax score corrected to 1.
- 2026-11-06 · Placencia (Belize) added as a candidate — user asked; it had never been evaluated because the plan fixed Belize as Cayo and Ambergris Caye and neither research pass revisited Belize.
- 2026-11-06 · Profile pages expand to the top 75 — user asked; candidates ranked 51–75 include the 17 now outside the 50 (low-ranked with their drawbacks stated rather than excluded) plus ≥15 new candidates; two stages added (7 research and data, 8 profiles and ship), deploy moved to Stage 8.
- 2026-11-06 · Draft top 75: the 50 keep their relative order; Tavira (#14), Grand Baie, Mauritius (#20), Torrevieja (#33), La Paz (#37) and Hopkins (#40) are inserted on merit, and the rest fill 51–75; 13 candidates sit outside with reasons. Stage 7's dataset check was narrowed to the 75 ranked cities (outside candidates never needed city entries). Austria's yearly tax on non-registered funds and South Africa's CGT at death are noted, not modelled.
- 2026-11-06 · User approved publishing and deploying the top-75 build — "Please go ahead and publish when ready".

## Open questions
- Two livingcost-derived restaurant indices look high (Vienna 92 vs Paris 80; Tavira 62 vs Lisbon 58) — re-check when Numbeo is reachable.
- Georgia: the IRS may still apply the 1973 US–USSR income tax treaty to Georgia; profiles say "no US–Georgia income tax treaty" — confirm against the IRS treaty table.
- Re-read Numbeo for the 11 livingcost-derived cities, the 5 Stage-3 cities mapped to nearby rows, and the noisy Belize pages once the rate limit lifts.
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
