# Landing page plan

## Goal
Give eVelo a landing page that says what the site is before a visitor meets the planner: study C, "Escape velocity" (canvas https://claude.ai/artifact/YXsFA24Z4bXtpgNhhMouHY, boards `Escape` and `EscapeLight`). A field of decorative simulated paths draws itself across the page (most rise in green, some take a hit in brass, a few break through the margin-call line in coral) behind the logo, the headline "Reach *escape velocity.*", the agreed copy, two CTAs and the holds/bruised/broken legend. It follows the site theme (paper in light, ink in dark), works at phone width, and respects reduced motion. First-time visitors at the bare URL see it; everyone else goes straight to the app. Done = verified on the running app in both themes and on a phone viewport, tests green, previewed, and deployed on approval.

## Baseline
2026-11-07 · tests: 189 pass (17 files) · typecheck: clean · build: ok

## Now
Stage 2 of 2 · Escape-velocity view
Mode: paused — preview v23 published (https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth); waiting on the user's review, then approval to deploy to GitHub Pages (and to push the keel 0.5.2 commit)
Risk: UI only
Scope: replace the Stage 1 placeholder with study C (boards `Escape`/`EscapeLight`): seeded decorative paths + margin-call line behind logo, headline, copy, CTAs and legend; follows the site theme; phone layout; reduced motion. Then preview and, on approval, deploy.
Checks:
- [x] The landing shows the logo, "Reach *escape velocity.*", the agreed body copy verbatim, "Launch my plan" (→ planner) and "What is Buy-Borrow-Die?" (→ Method), and the holds/bruised/broken legend; its header has the wordmark, theme toggle and "Open the planner" (proof: run the product)
- [x] Behind it, seeded decorative paths draw themselves in: most rise in green, some dip in brass, a few break through the dashed margin-call line in coral and end in a dot; the picture is identical on every load (proof: test + run the product)
- [x] It follows the site theme: paper with deeper green/brass/coral in light, ink with glowing paths in dark; the landing's toggle switches it live; text meets 4.5:1 over the paths (proof: run the product, both themes)
- [x] At phone width (390px) it reads cleanly with no horizontal scroll, the CTAs are full-size touch targets, and the paths stay behind the text (proof: run the product)
- [x] With reduced motion the paths appear fully drawn, with no animation (proof: run the product)
- [x] Tests, typecheck and build pass; no console errors on the landing
- [ ] Previewed on the preview artifact, and deployed to GitHub Pages on the user's approval (proof: run the product)
Open: none

## Stages
- [x] 1. Landing route — `#home` route, first-visit rule with a persisted "entered the app" flag, shell hides top bar/tab bar on the landing; landing view as a plain placeholder
- [ ] 2. Escape-velocity view — theme-aware hero from study C: seeded decorative paths with draw-in animation, margin-call line, logo, copy, CTAs (Launch my plan → planner, What is Buy-Borrow-Die? → Method), legend, theme toggle; phone layout; reduced motion; preview + deploy on approval

## Decisions
- 2026-11-07 · Landing is study C, "Escape velocity" — user chose it from five studies (A–E) on the canvas.
- 2026-11-07 · Shown on first visit only: the bare URL shows it until the visitor has entered the app once; share links and route hashes go straight to the app; the wordmark brings it back (`#home`) — user picked the recommended option.
- 2026-11-07 · Follows the site theme: paper with deeper green/brass/coral paths in light, ink with glowing paths in dark — user asked to see the light variant, then chose "follow the theme".
- 2026-11-07 · Paths are decorative and seeded (deterministic), not engine output — user chose decorative over real simulation paths.
- 2026-11-07 · Body copy, verbatim from the user: "A portfolio that grows faster than the loan against it never has to be sold. Spend the loan, keep the shares, leave them to your heirs. eVelo runs your plan through thousands of real market histories and counts how many actually reach escape velocity."
- 2026-11-07 · The landing is full-bleed with its own slim header (wordmark, theme toggle, "Open the planner"); the app's top bar and phone tab bar are hidden on it — the study's composition depends on it; defaulted.
- 2026-11-07 · Bare URL meaning is settled once per page load, so Back from the planner to the bare entry still shows the landing; unknown hashes are treated like the bare URL; the bare URL after entering opens `plan` (phones land on the Plan tab, was Outlook) — builder's calls inside the plan's intent, kept.
- 2026-11-07 · A plan saved before the flag existed counts as having entered (checked once per device and recorded as `evelo:v2:entered` = `'1'`/`'0'`), so existing users aren't shown the landing; a plan saved from the landing (theme toggle) never counts — autopilot fix after verification flagged returning users.
- 2026-11-07 · Landing field seed is 2815, not the study's 7: seed 7 yields no broken paths (57 hold, 7 bruised), so it can't show "a few break through"; 2815 gives 53/8/3 with the broken ends right of the text. Paths use `pathLength=1` so long paths finish drawing (the study's fixed 1800 dasharray clipped them) — builder's calls, kept.
- 2026-11-07 · The margin-call label is drawn after the paths with a background-colour halo, so a coral path crossing it (seed 2815 at 1440px) never hides it — autopilot fix after verification.
- 2026-11-07 · Stage evidence commits its screenshots (as earlier plans did); the verifier's `docs/evidence/.gitignore` was dropped.

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
- 2026-11-07 · Pan bounds are the inhabited band (Hawaii to the dateline, 79°N–57°S) plus the region's own fit, not the sphere's bounding box — its corners are empty ocean. (from [Pan and zoom map](plans/2026-11-07-map-pan-zoom.md))
- 2026-11-07 · Touch pans on a horizontal one-finger drag (same intent rule as the sliders) and on two fingers; vertical one-finger swipes stay page scrolls — keeps the page scrollable past the map, which the user has prioritised. (from [Pan and zoom map](plans/2026-11-07-map-pan-zoom.md))
- 2026-11-07 · Tapped city card floats beside its dot on tablets and wider (map ≥ 560px), like the mouse bubble; phones keep it docked below the map — user chose this after trying a compact phone bubble. (from [Pan and zoom map](plans/2026-11-07-map-pan-zoom.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](plans/2026-11-06-saved-portfolios.md)
- 2026-11-07 · Mobile slider gestures: touch-safe sliders, expat price premium relabel with local/tourist ends — [plan](plans/2026-11-06-mobile-slider-gestures.md)
- 2026-11-07 · Pan and zoom map: mouse, trackpad and touch pan/zoom on the Atlas map, zoom buttons, hover fix and tablet tap bubbles, live on GitHub Pages — [plan](plans/2026-11-07-map-pan-zoom.md) · [evidence](plans/2026-11-07-map-pan-zoom/evidence/)
