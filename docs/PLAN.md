# Pan and zoom map plan

## Goal
Make the Atlas world map pannable and zoomable with mouse, trackpad and touch, without taking over page scrolling on phones. Mouse drag pans; Ctrl/⌘+scroll and trackpad pinch zoom at the cursor; touch: horizontal one-finger drag pans, vertical swipe scrolls the page, two fingers pinch/pan; + / − / reset buttons. Taps and clicks on cities still work. Done = verified on the running app (mouse and touch emulation), tests green, deployed on approval.

## Baseline
2026-11-07 · tests: 173 pass (16 files) · typecheck: clean · build: ok

## Now
All stages done. Stage 1 verified ([evidence](evidence/map-pan-zoom/report.md)); Preview: https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth (v19). Live: https://onedigerati.github.io/eVelo-v2/ (deployed 2026-11-07, run 42391330188).

## Stages
- [x] 1. Pan and zoom — pure view helpers (zoom-at-point, pinch, clamp) with tests; gestures and controls in `WorldMap`
  - [x] Mouse drag pans the map; a click after a drag does not choose a city; a plain click still does
  - [x] Ctrl/⌘+wheel zooms at the cursor; a plain wheel scrolls the page (with a hint)
  - [x] Touch: horizontal drag pans, vertical swipe scrolls the page, two-finger pinch zooms; a tap still opens the city card
  - [x] + / − / reset buttons work; region chips still fly to their region; pan is clamped to the world
  - [x] Tests, typecheck and build pass

## Decisions
- 2026-11-07 · Pan bounds are the inhabited band (Hawaii to the dateline, 79°N–57°S) plus the region's own fit, not the sphere's bounding box — its corners are empty ocean.
- 2026-11-07 · Touch pans on a horizontal one-finger drag (same intent rule as the sliders) and on two fingers; vertical one-finger swipes stay page scrolls — keeps the page scrollable past the map, which the user has prioritised.

- 2026-11-07 · User approved push and deploy — "push it".

## Open questions
- WebKit's touch path (iPhone) is untested until the user tries it.

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
- 2026-11-06 · Touch sliders decide drag vs scroll from the first ~8px of movement (`classifyTouch`); a vertical swipe on a slider scrolls the page — user: "Yes proceed please". (from [Mobile slider gestures](plans/2026-11-06-mobile-slider-gestures.md))
- 2026-11-07 · Premium slider labelled "Expat price premium", ends "Live like a local" / "Live like a tourist", default 35%. (from [Mobile slider gestures](plans/2026-11-06-mobile-slider-gestures.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](plans/2026-11-06-saved-portfolios.md)
- 2026-11-07 · Mobile slider gestures: touch-safe sliders, expat price premium relabel with local/tourist ends — [plan](plans/2026-11-06-mobile-slider-gestures.md)
