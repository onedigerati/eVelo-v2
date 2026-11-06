# Saved portfolios plan

## Goal
Let the user name the current holdings mix, save it, and pick it again later from the Portfolio section, alongside the built-in model portfolios; rename and delete saved ones. Saved in the browser (no account), holdings and weights only — applying one never touches budget, borrowing or other settings. Done = save / apply / rename / delete work on the live site, survive a reload, tests green, phone and desktop in both themes.

## Baseline
2026-11-06 · tests: 96 pass (11 files) · typecheck: clean · build: ok (main chunk 346.1 kB)

## Now
Stage 1 in progress.
Live: https://onedigerati.github.io/eVelo-v2/ (deploys on push to main)
Preview: https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth (republish: `npm run build && node scripts/artifact-page.mjs`)

## Stages
- [ ] 1. Saved portfolios — storage module with tests, Portfolio-section UI, verify in the running app, preview
  - [ ] "Save as…" names the current mix; it appears under "Your portfolios" and is marked active
  - [ ] Applying a saved portfolio replaces holdings only (budget etc. unchanged), with the same confirm step as model portfolios
  - [ ] Rename and delete work; saving under an existing name asks before replacing it
  - [ ] Saved portfolios survive a reload; corrupt or unknown-ticker storage is cleaned, never crashes
  - [ ] Works on phone and desktop, light and dark

## Decisions
- 2026-11-06 · Saved portfolios live in localStorage under their own key (`evelo:v2:portfolios`), separate from the plan, and are not part of share links — user agreed to browser-only, holdings-only.

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
- 2026-11-06 · New logo: the user's "escape velocity" concept (ring, script e breaking into a rising chart, rocket) redrawn as SVG — user picked the Homage study of four (https://claude.ai/artifact/1gJfSyj9E8qjbjeGsj9hkX). Gradient uses new `--brand-1/--brand-2` tokens (accent green → teal-blue); `Mark`, `public/favicon.svg` and `public/apple-touch-icon.png` share one drawing. (from [Profiles 16–25](plans/2026-11-06-profiles-16-25.md))
- 2026-11-06 · Wordmark set in Geist Semibold (23px, -0.035em), all ink, replacing Instrument Serif with a green italic V — the serif's hairlines looked faint beside the heavy mark and the green V competed with it; user chose this from six studies (https://claude.ai/artifact/VEK952PiL72D8BwTbWBqa3). (from [Profiles 16–25](plans/2026-11-06-profiles-16-25.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
