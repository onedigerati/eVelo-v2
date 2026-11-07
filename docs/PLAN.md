# City photo galleries plan

## Goal
Every one of the 75 profiled Atlas picks shows five real, openly licensed photos of the place at the top of its profile, laid out as design A, the "cover mosaic" (canvas https://claude.ai/artifact/71Q8M4YvnFsJUaQkyayR8y, boards "A · Cover mosaic" and "Shared · Full-size view"). One large photo and four small ones, with an "All 5 photos" button. A badge on the large photo shows the plan's odds for that city ("82% plan holds", bar with a home tick, "+6 pts vs 76% in Austin"). Tapping any photo opens a full-size view (arrows, keys, swipe) with a caption, a credit with its licence, and the same odds as a pill in the top bar. Profiles without photos keep today's layout. Done = all 75 cities have photos that were checked to show the place, verified in both themes and on a phone viewport, tests green, previewed, and deployed on approval.

## Baseline
2026-11-07 · tests: 214 pass (20 files) · typecheck: clean · build: ok

## Now
Stage 5 of 5 · Photos: Asia/Africa + launch
Risk: external services (build-time downloads from Wikimedia Commons; publishing the preview and the site), third-party content and licences
Preview: https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth (v25, stage 2: gallery with the 5 pilot cities)
Checks:
- [x] Each of the 10 other Asia/Africa picks (penang, langkawi, taipei, bali, grand-baie, chiang-mai, chiang-rai, bangkok, hua-hin, phuket) has 5 photos with complete, clean credits, under 200 kB, no Commons file used twice (proof: test)
- [x] The photo test requires exactly 5 photos for every one of the 75 picks and names any city that lacks them (proof: test, plus a mutation run that removed two cities)
- [x] A contact sheet of the 10 cities is saved, and every photo was viewed at full size by an independent reviewer, flagged ones replaced and re-viewed (proof: run the product: contact-sheet screenshot + review)
- [x] Three profiles (bangkok, bali, grand-baie) show the mosaic and the odds badge; the build puts all 375 photos in dist/assets and the preview manifest lists them; main chunk within 2 kB of 532.79 kB (proof: run the product: screenshots; command: build and manifest)
- [ ] The preview shows all 75 cities' galleries: stale files removed so the version stays under 511 files, and every manifest path present (proof: run the product: file listing + opening profiles on the preview)
- [ ] Deployed to GitHub Pages on the user's approval, and the live site's asset hashes match a local build (proof: command)
Open: publish the preview with all 75 cities — waiting on the user's go; then deploy — waiting on the user's go
Mode: paused — preview publish is outward-facing; needs the user's go

## Stages
- [x] 1. Photo pipeline — `npm run photos` (Commons API + sharp → WebP), per-city photo data and tests, the five pilot cities, a contact sheet
- [x] 2. Gallery + odds badge — design A mosaic in the profile, odds badge with home comparison, full-size view with the odds pill, phone layout, both themes, reduced motion; preview; stop for review
- [x] 3. Photos: Europe — the other 31 European picks, contact sheet
- [x] 4. Photos: Americas — the other 29 Latin American picks, contact sheet
- [ ] 5. Photos: Asia/Africa + launch — the other 10 picks; a test now requires photos for all 75; preview (stale files pruned); deploy on approval

## Decisions
- 2026-11-07 · Layout is design A, the cover mosaic: one large photo plus four small ones above the profile text, "All 5 photos" button, tap to enlarge — the user's number-one pick of four (A mosaic, B reasons, C carousel, D rail) on the canvas.
- 2026-11-07 · The plan's odds ride on the photos: a badge on the mosaic's large photo and a pill in the full-size view's top bar, each with the home comparison ("+6 pts vs 76% in Austin") — user asked for the odds "as I'm viewing them" and for the home comparison, on both.
- 2026-11-07 · The badge reuses the profile's existing numbers (`row.successRate`, `home.successRate`, `oddsVsHome`, `successTextColor`), so it updates with the plan; while the Atlas is ranking it shows a skeleton, never a stale number — proposed with the mock-up, user approved.
- 2026-11-07 · Photos are real and openly licensed: Wikimedia Commons first (CC0, public domain, CC BY, CC BY-SA), each credited with author and licence in the full-size view and as a credit line under the mosaic. No AI-generated images. Unsplash only where Commons has no good photo, and logged here when used — user accepted the defaults.
- 2026-11-07 · Photos are self-hosted, not hotlinked: downloaded once by `npm run photos` and committed as WebP — user accepted the defaults. Hotlinking would break or be blocked.
- 2026-11-07 · Exactly five photos per city, each tied to a reason the profile gives (old town, waterfront, food, landscape, getting around), with a one-line caption — the mosaic's layout needs five; user accepted.
- 2026-11-07 · One size per photo, about 1280 px wide, quality chosen to stay under 200 kB (~375 files, about 40–60 MB in the repo). The browser loads them only when a profile opens. Two sizes would double the file count past the preview Artifact's 511-file limit — builder's call.
- 2026-11-07 · Photos and their data live in `src/data/photos/<cityId>/` and load through `import.meta.glob(..., { query: '?url' })`, like the profiles; adding a city's photos needs no edit elsewhere — builder's call, mirrors `src/data/profiles/`.
- 2026-11-07 · `sharp` is added as a dev dependency for resizing (no image tool is installed on this machine); it is never in the shipped bundle — builder's call.
- 2026-11-07 · The preview gets the photos in two or more publishes (at most 255 files each), then a file listing confirms every manifest path — the Artifact limits; the full-manifest rule still applies.
- 2026-11-07 · Photos step down in width (1280 → 1152 → 1024 → 896 px, quality 80 → 55) until under 200 kB; portraits fit 1280 px tall — detailed photos can't reach 200 kB at 1280 px even at quality 40 (pilot: 16 at 1280 wide + 1 portrait at 1280 tall, 5 at 1152, 2 at 1024, 1 at 896) — builder's call, kept.
- 2026-11-07 · Lisbon's fifth photo is Praia da Rainha in Cascais, captioned as Cascais (Lisbon's beaches are a reason to live there); Cascais's own profile must use different photos, which the no-duplicate test enforces — PM's call.
- 2026-11-07 · Stage 1 review: credits use Commons' Attribution field when the licensor sets one; placeholder authors, originals under 1000 px and downloads from anywhere but upload.wikimedia.org are refused. Stage 2 must make a missing photo skip that city instead of breaking the Atlas, and the full-size credit may say "resized" — review findings, taken.
- 2026-11-07 · Gallery builder's calls, kept: the phone cover replaces the mosaic below 560 px (an existing breakpoint); both layouts are in the DOM and CSS shows one; the full-size view is portalled with `data-theme="dark"` so it uses dark tokens; when the city is home or home has no row, the badge shows only the odds; credits name each photo's source from its URL and add "resized".
- 2026-11-07 · Preview v25 published (stage 2 gallery, 5 pilot cities) — user: "yes, publish the preview".
- 2026-11-07 · Stages 3 and 4 don't publish a preview; stage 5 publishes once with all 75 cities, removing stale files (the preview holds 149 files of a 511 limit, and ~350 photos are coming), then pauses for deploy — one approval instead of three; PM's call.
- 2026-11-07 · Photo batches run as parallel builders in the main tree, not worktrees: each owns disjoint `src/data/photos/<city>/` folders and always passes its city ids to `npm run photos`; worktrees would each need sharp installed — PM's call.
- 2026-11-07 · The image-host check also allows thumb.wikimedia.org and strips Commons' utm_* parameters — Commons now serves thumbnails from that host, so the stage 1 rule refused every photo; found by a stage 3 builder, PM's fix.
- 2026-11-07 · Each photo batch gets independent full-size review (one reviewer per builder batch) and a fix round; the European review replaced 17 of 155 (crowds, ads, swimwear foregrounds, weak lead photos, HDR) — keeps the bar the user asked for; PM's call.
- 2026-11-07 · Credits are cleaned of platform names, URLs and "Photo by"-style prefixes, and the data test refuses any that remain; `npm run photos -- --recredit` re-applies it offline — the stage 3 verifier found credit lines like "Jorge Royan / http://www.royan.com.ar"; PM's call.
- 2026-11-07 · Stage 4 builders started while stage 3's final review ran (disjoint folders; stage 3 committed before any stage 4 folder existed) — user asked what was taking the time; PM's call.
- 2026-11-07 · Stage 5's 10 cities (two builders: Thailand; Penang, Langkawi, Taipei, Bali, Grand Baie) started alongside stage 4's three, five builders at once; stage 4 still closes first. Not more: image-viewing limits hit one European builder, and Commons requests stay polite — user asked to run more in parallel; PM's call on how many.
- 2026-11-07 · Where Commons coverage is thin (Hopkins, Corozal, Coronado, Grand Baie), the best available honest photo stays even if weaker, nearby places are allowed when the caption names them, and review stops after one re-review round — five photos are required, and the alternatives were checked and found worse; PM's call.
- 2026-11-07 · The photo test now requires exactly 5 photos for every one of the 75 picks and no folder for a non-pick (replaces the pilot-city check) — stage 5's completeness check.
- 2026-11-07 · Every photo is looked at before it ships, and each batch saves a contact sheet to its evidence — Commons titles can be wrong or mislabelled, and the user was told this is the slow part.

## Open questions
- WebKit's touch path (iPhone) is untested until the user tries it; the full-size view's swipe adds to it — user, when they try it.

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
- 2026-11-07 · Landing is study G, "The Atlas is the chart", replacing study C after the user saw C on preview v23 — user: "let's go with option G here instead". (from [Landing page](plans/2026-11-07-landing-page.md))
- 2026-11-07 · Shown on first visit only: the bare URL shows it until the visitor has entered the app once; share links and route hashes go straight to the app; the wordmark brings it back (`#home`) — user picked the recommended option. (from [Landing page](plans/2026-11-07-landing-page.md))
- 2026-11-07 · A plan saved before the flag existed counts as having entered (checked once per device and recorded as `evelo:v2:entered` = `'1'`/`'0'`), so existing users aren't shown the landing; a plan saved from the landing (theme toggle) never counts — autopilot fix after verification flagged returning users. (from [Landing page](plans/2026-11-07-landing-page.md))
- 2026-11-07 · Stage evidence commits its screenshots (as earlier plans did); the verifier's `docs/evidence/.gitignore` was dropped. (from [Landing page](plans/2026-11-07-landing-page.md))

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](plans/2026-11-06-saved-portfolios.md)
- 2026-11-07 · Mobile slider gestures: touch-safe sliders, expat price premium relabel with local/tourist ends — [plan](plans/2026-11-06-mobile-slider-gestures.md)
- 2026-11-07 · Pan and zoom map: mouse, trackpad and touch pan/zoom on the Atlas map, zoom buttons, hover fix and tablet tap bubbles, live on GitHub Pages — [plan](plans/2026-11-07-map-pan-zoom.md) · [evidence](plans/2026-11-07-map-pan-zoom/evidence/)
- 2026-11-07 · Landing page: first-visit landing (study G, "The Atlas is the chart") with the illustrative odds map and four steps, live on GitHub Pages — [plan](plans/2026-11-07-landing-page.md) · [evidence](plans/2026-11-07-landing-page/evidence/)
