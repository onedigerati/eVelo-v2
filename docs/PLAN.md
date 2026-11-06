# eVelo v2 plan

## Goal
A slick, design-forward static web app for planning a Buy-Borrow-Die retirement. A user picks real tickers and weights, sets age, horizon, lifestyle budget and borrowing terms, and sees the probability their plan holds for 15/20/30 years without a forced sale — in their home city and in any destination city (cost-of-living, expat factor, FX risk). Done = deployed-ready build that runs on desktop and phone, light and dark themes, real bundled market data with a refresh script, a tested simulation engine, and a city "atlas" ranking where money goes furthest.

## Now
Stage 5 of 6 · Atlas
Risk: external services (FX rate fetch)
Mode: autopilot
Preview: https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth (republish: `npm run build && node scripts/artifact-page.mjs`)
Checks:
- [ ] Atlas ranks all 96 cities by success for the current plan within ~2 s; changing an input re-ranks (proof: run the product)
- [ ] Clicking a city on the map or list sets the destination and the verdict updates (proof: run the product)
- [ ] Phone and desktop, light and dark: no horizontal scroll, map legible, no console errors (proof: screenshots)
Open: none

## Stages
- [x] 1. Data + engine — Yahoo/FRED fetch script, factor backfill, block bootstrap + fat-tail, SBLOC/margin call/forced sale, BBD vs sell, city cost model, solver
- [x] 2. App shell + design system — Vite/React/TS, tokens, fonts, light/dark, responsive layout, mobile tab bar, state + URL share
- [x] 3. Plan inputs — ticker command palette, weights, life/budget, borrowing, move scenario, model settings
- [x] 4. Results — verdict + 100-futures dot chart, fan charts (net worth / LTV / loan), margin-call timing, safe-spend solver, BBD vs sell
- [ ] 5. Atlas — city cost data, live FX, world map + ranked cities, side-by-side comparison, country notes
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
- 2026-11-06 · City cost indices are curated approximations from public indices, labeled as estimates and user-overridable per category.

## Open questions
- In-browser fetch of arbitrary tickers needs a CORS proxy or serverless function — user decides on hosting later; not blocking.
