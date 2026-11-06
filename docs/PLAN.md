# eVelo v2 plan

## Goal
A slick, design-forward static web app for planning a Buy-Borrow-Die retirement. A user picks real tickers and weights, sets age, horizon, lifestyle budget and borrowing terms, and sees the probability their plan holds for 15/20/30 years without a forced sale — in their home city and in any destination city (cost-of-living, expat factor, FX risk). Done = deployed-ready build that runs on desktop and phone, light and dark themes, real bundled market data with a refresh script, a tested simulation engine, and a city "atlas" ranking where money goes furthest.

## Now
Stage 6 of 6 · Polish + verify
Risk: UI only (plus engine review)
Mode: autopilot
Preview: https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth (republish: `npm run build && node scripts/artifact-page.mjs`)
Checks:
- [x] Method page explains the model in plain language with the real parameters (proof: run the product)
- [x] market.json is no longer in the main bundle; main chunk < 500 kB (proof: command)
- [x] Routes work as plain hashes (`#atlas`) as well as `#/atlas` (proof: run the product)
- [x] Fresh-eyes engine review: findings fixed or logged (proof: review report + tests)
- [x] All views at 360/390/900/1440, light and dark: no horizontal scroll, no console errors (proof: screenshots)
- [x] README and scheduled data-refresh workflow exist; `npm run build` and `npm test` pass (proof: command)
Open: none

## Stages
- [x] 1. Data + engine — Yahoo/FRED fetch script, factor backfill, block bootstrap + fat-tail, SBLOC/margin call/forced sale, BBD vs sell, city cost model, solver
- [x] 2. App shell + design system — Vite/React/TS, tokens, fonts, light/dark, responsive layout, mobile tab bar, state + URL share
- [x] 3. Plan inputs — ticker command palette, weights, life/budget, borrowing, move scenario, model settings
- [x] 4. Results — verdict + 100-futures dot chart, fan charts (net worth / LTV / loan), margin-call timing, safe-spend solver, BBD vs sell
- [x] 5. Atlas — city cost data, live FX, world map + ranked cities, side-by-side comparison, country notes
- [ ] 6. Polish + verify — methodology page, animations, a11y, mobile pass, build, README, data refresh workflow

## Decisions
- 2026-11-06 · Fresh codebase, not a fork of v1 — v1 is a heavy web-components app; v2 is a redesign around one verdict. v1's methodology informs the engine.
- 2026-11-06 · React + Vite + TS, hand-built SVG charts (d3-scale/shape/geo), static hosting — full design control, no backend.
- 2026-11-06 · Market data bundled at build time from Yahoo monthly adjusted closes (+ FRED CPI), refreshed by script/scheduled workflow — Yahoo has no browser CORS; keeps the site static and fast.
- 2026-11-06 · Short histories backfilled from SPY via regression (alpha, beta, resampled residuals); means shrunk toward a CAPM prior by "outlook" setting — stops young winners from projecting forever.
- 2026-11-06 · Headline success = no forced sale (margin call) and solvent through horizon — the BBD failure mode is selling at the bottom.
- 2026-11-06 · Destination cost in USD = home budget × per-category city ratios (with expat factor) × US CPI path × real-FX random walk — PPP-consistent and simple.
- 2026-11-06 · Stages 1, 2 and the city dataset (from stage 5) built in parallel against `src/engine/types.ts` — they're independent; the contract keeps them aligned.
- 2026-11-06 · Preview: after each stage that changes what the user sees, publish the production build to one private claude.ai Artifact (same URL every time) and keep a local dev server up — user asked to review meaningful updates on a preview site.
- 2026-11-06 · Single-stock means capped at 35% history weight (balanced) / 15% (conservative); 'historical' uses the real-window mean only — 100% NVDA was projecting 24%/yr for 30 years.
- 2026-11-06 · Data months keyed by UTC month of timestamp+12h; script fails on gaps or a stale last month — a DST offset bug had shifted/merged months.
- 2026-11-06 · Stages 3 and 4 built in parallel: inputs live in `src/ui/plan`, results + worker client in `src/ui/outlook` / `src/state/sim.ts` — disjoint files.
- 2026-11-06 · Review fixes: shared backfill donor months; explicit priors for bonds/real estate/commodities; insolvency counts as a forced sale; real stats added. Deferred: young asset paired with a full-history asset keeps only beta-linked correlation in backfilled months (NVDA/AMD 0.27 vs 0.53); a call that can't reach target counts as broken.
- 2026-11-06 · City cost indices are curated approximations from public indices, labeled as estimates and user-overridable per category.

- 2026-11-06 · UI reads a prebuilt `market-index.json` (derived by `scripts/build-market-index.mjs`, sync-checked by a test); `market.json` ships only in the worker. Atlas/Method lazy; framer-motion via LazyMotion — main chunk 1,177 kB → 345 kB.
- 2026-11-06 · Plain hashes (`#atlas`) are canonical and share links are `#p=…` — the claude.ai preview host only passes plain hashes; `#/atlas` and `#/?p=` still parse.
- 2026-11-06 · Verdict bands 80 / 65 / 45 (holds / mostly holds / fragile / breaks), classified on the displayed whole percent; one outcome color scale (`outcomeScale.ts`, hue-adjacent `--ramp-*` stops, step at 65%) for every success color.
- 2026-11-06 · Atlas shows the Outlook's full-path odds for the user's home and destination, so one city never shows two numbers.

## Open questions
- In-browser fetch of arbitrary tickers needs a CORS proxy or serverless function — user decides on hosting later; not blocking.
