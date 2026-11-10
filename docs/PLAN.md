# Atlas speed plan

## Goal
The Atlas feels fast. City odds show up in well under half the time they take today: the ranking is split across several workers, the last ranking is saved in the browser so a return visit shows it at once, and the ranking starts at idle before the user opens the Atlas. Profiles download a fraction of today's photo bytes: a 640px copy of every photo for the small tiles and the phone cover, picked by `srcset`/`sizes`, and the photos start loading when the user hovers, focuses or presses a profile button. Done = both stages pass verification against the running build, with before/after numbers from the same measurement script; deploy waits for the user's go.

## Baseline
2026-11-09 · tests: 688 pass (45 files) · typecheck: clean · build: ok (AtlasView chunk 1,194 KB / 339 KB gz, worker 615 KB)
Perf (local `vite preview`, headless Chromium, [raw](research/atlas-perf/baseline.txt); scripts in [research/atlas-perf/](research/atlas-perf/) (`node docs/research/atlas-perf/measure.mjs http://localhost:<port>/` against `vite preview`)): Atlas odds (profile buttons) ~3.0 s after `#atlas` on a 12-core desktop; ranking worker posts at ~530 ms and answers ~2.45 s later. A profile downloads 700–910 KB of photos (five 1280px WebPs) into tiles drawn at 501×372 and 251×183; on 10 Mbps + 4× CPU the lead photo lands 500–700 ms after the dialog.

## Now
Stage 1 of 2 · Parallel Atlas
Mode: autopilot
Agents: wide — confirmed 2026-11-09 23:33
Risk: user input (a saved ranking read back from browser storage is parsed and validated; it stores a hash of the plan, never the plan's inputs)
Checks:
- [x] A ranking split across N workers returns exactly the entries (order, rates, spend) a single run returns, for the default plan, a plan with an existing loan and a retire-later plan (proof: test)
- [x] A fresh `#atlas` load on the desktop profile shows the odds at least 40% faster than the ~3.0 s baseline (≤ 1.8 s), median of 5 on the full measure script (proof: run the measure script, a test can't time a real browser)
- [x] The saved ranking is keyed by the plan inputs and the data version: a reload with the same plan shows the odds without running the ranking, and a changed plan, a changed data version or a corrupt stored value never shows a saved ranking (proof: test, plus a run for the reload)
- [x] With the app open on the landing for 5 s, going to `#atlas` shows the odds at once, with no running state (proof: run, it spans page navigation in a real browser)
- [x] The engine's Atlas time budget test still passes (proof: test)
Open: none

## Stages
- [x] 1. Parallel Atlas — rank across several workers, save the last ranking, start at idle
- [ ] 2. Lighter photos — 640px copies with srcset/sizes, preload on hover/focus/press

Stage 2 checks (moved into `## Now` when it starts):
- Every listed photo has a 640px copy beside it, and the photo coverage test fails when one is missing (proof: test)
- Opening a profile on the desktop profile downloads ≤ 400 KB of photos, against 700–910 KB at baseline (proof: run the measure script)
- Hovering a profile button 300 ms before the click, the lead photo is ready within 150 ms of the dialog on the 10 Mbps + 4× CPU profile (proof: run)
- The full-size viewer still shows the 1280px originals (proof: run, naturalWidth in a real browser)
- The preview build's photo asset map includes the 640px copies (proof: test)

## Decisions
- 2026-11-09 · Do findings 1 and 2 of the Atlas perf measurement only (parallel/saved/idle ranking; 640px photos + preload); profile code splitting and the blur/DOM experiment wait — user: "Proceed with 1 and 2 only, on autopilot and go wide."
- 2026-11-09 · Agents: wide — user: "go wide".
- 2026-11-09 · One extra photo size (640px, +~36 MB in the repo), not a full ladder: tiles draw at 251–501 CSS px, so 640 covers 1× lead and 2× small tiles; 1280 stays for the lead at 2× and the viewer — PM's call.
- 2026-11-09 · The 640px copies are made offline from the stored 1280px WebPs (no network, no re-download from Commons) — PM's call.
- 2026-11-09 · Worker count is min(cores − 1, 4), at least 1; every shard builds the same common random scenarios, so results match a single run exactly — PM's call.
- ~~2026-11-09 · Deploy waits for the user's go after both stages pass — PM's call (no deploy instruction for this plan).~~ Replaced below.
- 2026-11-10 · Deploy (push to main) once both stages pass verification — user: "Deploy when ready".
- 2026-11-09 · The saved ranking stores only a hash of the ranking key (plan inputs + data version) and each city's odds, spend and cost ratio (review: the home city's spend equals the plan's budget total), never the inputs themselves, so it adds no personal data to the browser beyond the plan the app already saves; risk line set to user input (stored-value parsing) — PM's call.
- 2026-11-09 · Stage 2 (photos) touches nothing stage 1 does, so it's built in parallel in its own worktree and verified and committed after stage 1 — PM's call.
- 2026-11-09 · Stage 1 review: 2 fix-now (saved-ranking path and storage failures untested; the split test depended on the machine's core count) plus two cheap guards (a sync `new Worker`/`postMessage` throw, empty city list) sent back to the builder; 2 deferred to open questions; 6 rejected with reasons — PM's call.
- 2026-11-10 · Fix round 1 (check 2 missed: 1627 ms): chunk queue over min(cores − 1, 6) workers, spare re-runs of the oldest outstanding chunk, per-worker scenario memo — PM's call, inside the plan's intent.
- 2026-11-10 · Fix-round review: no correctness bug; fix now the doubled memory peak on a memo miss, plus cheap guards (`messageerror` → fail; skip the prewarm under Save-Data or ≤ 2 cores); 2 deferred to open questions — PM's call.
- 2026-11-10 · Fix round 2: review items fixed (memo freed before rebuild, `messageerror` → fail, no prewarm under Save-Data or ≤ 2 cores); two chunks queued per worker, and `runAtlas` runs each chunk's cities over 256-path blocks (exact: clean-path counts are integers). Builder's numbers: in-page odds ~0.8 s, desktop-only run ~1.0 s, full measure script median 1635 / 1670 ms — still above 1.5 s. Paused for the user — PM's call.
- 2026-11-10 · ~~Check 2: odds in ≤ 1.5 s, median of 3~~ → at least 40% faster than the ~3.0 s baseline (≤ 1.8 s), median of 5 on the full measure script: its desktop run is always the first page in a fresh browser, which this machine makes slow whatever the code does — user picked "Accept 2× as the bar".
- 2026-11-10 · Path-blocking review: exact (checked against unblocked `runPaths` at 700 paths on 4 plans); add that comparison as a test so a future kernel change can't silently break it — PM's call.
- 2026-11-10 · Stage 1 closed: 5/5 checks pass after two fix rounds ([evidence](evidence/stage-1/report.md)): fresh `#atlas` odds median 1193 ms vs ~3.0 s; same-plan reload 0 ranking posts, odds ~400 ms; landing → Atlas shows odds without running. Verified by fresh agents; reviewed three times (correctness + security pass on the stored value) — PM's call.
- 2026-11-09 · Scale check didn't fire (2 stages, one release) — PM's call.

## Open questions
- The Atlas worker pool (up to 6) stays alive for the page's life, and every superseding plan edit respawns all of it (each re-parses the 615 KB worker and rebuilds scenarios); shut it down after idle like `DestinationClient`, and keep idle workers on cancel — from the fix-round review, later.
- Scenario generation is paid once per Atlas worker; time `makeScenarios` against a shard's `runPaths` on a low-end phone before claiming the phone speedup — from the fix-round review, later.
- The idle prewarm starts the full-path ranking on up to 4 workers while the retire-in comparison still runs on the sim worker; each Atlas worker builds its own scenarios (~23 MB at 4,000 paths × 40 years, ~115 MB at 20k), so on a 4-core phone it may slow the comparison cards and raise memory. Measure on a real phone — from the stage 1 review, later.
- `peek()` re-parses the saved ranking (~15 KB JSON + two hashes) on every cache miss, e.g. each slider tick; cache the decoded value if profiling shows it — from the stage 1 review, later.
- On a phone, keyboard users swing ~684px per step press (Tab scrolls down to the next step, Enter brings the chart back): tier 3 by design — from the stage 2 verify, later if wanted.
- `useStoryPlayback` has no hook-level tests (vitest runs in node without testing-library); its logic is covered by pure tests and the e2e verify — from the stage 2 review, later.
- On phone, Buy shows two empty bands (reserved key rows and caption height), as the mockup does — from the stage 2 verify, later.
- Chart text falls under 11px below 360px viewports (320: 9.67px; 340: 10.45px) — from the stage 1 verify, later.
- The step titles were `h2` headings and are now button text, so they've left the heading outline — from the stage 1 verify, later.
- The comparison adds up to 5 simulates + 5 solves (+5 stay-home runs) per plan change on the main worker; on a 12-core desktop the verdict and Atlas times didn't move, but on a 2–4 core phone it may slow the Atlas fill. Measure on a real phone; if needed, run the comparison only while the Outlook is visible or at fewer paths — from the stage 4 verify, later.
- At 1100px `scrollWidth` reads 1137 because the verdict section (661px) overflows its 592px column; `overflow-x: clip` hides it, pre-existing — from the stage 4 fix, later.
- `chartKit.workingYears` and `src/ui/retire.ts` both compute the retirement age (built in parallel); dedupe — later.
- A $0 home category with no fixed amount reads "$0 ±0%" in the Outlook cost card while the plan card shows no % (cosmetic) — from the stage 2 verify, later.
- The Outlook cost card's "→" overlaps the home number at large home totals (~$174K) — pre-existing, from the stage 2 verify, later.
- Should the % override also become per-city? Today a "−33% housing" override applies to every Atlas city — user's call, later.
- Monthly entry ("1500/mo") in the amount field — later, if wanted.
- The shared Sheet restores focus to its opener on close; when the opener has re-mounted elsewhere (the docked pill when the drawer opens by browser Back/Forward while it holds focus), focus lands on `<body>`. Fall back when the restore target is disconnected — from the docked-verdict verify, later.
- Profile the Atlas slowdown on CI: since the opening-sale change (9e306b7) the success-only kernel loop runs ~30–50% slower on GitHub's runner (2.7–3.4 s vs 1.8–2.3 s for 80 cities), while locally only the first, cold run is slower. Suspects ruled out: the import, the per-path start values, the opening-sale call itself and the `initialLoan` expression. The CI budget was raised from 2500 to 3500 ms meanwhile — next plan.
- A plan that fails at once draws its fan y-axis as "$1 $1 $1 $0 $0 $0" (all-zero data), and the sale warning can say "$3.0M sold" on a $3.0M portfolio from rounding (pre-existing / cosmetic) — later.
- The LTV caption reads "peaks at 100%" when the median path breaks, because broken paths are recorded with LTV 1 (pre-existing) — later.
- Plans opened from a share link replace the recipient's own plan, including any existing loan balance, without a flag in the UI (`OPENED_FROM_LINK` exists); pre-existing for every input — later.
- Seoul, London, Amsterdam and Berlin have no `localTaxes.ts` entry (money logic, needs tests) — user's call, a later plan.
- Recheck Colorado Amendment 87 (Denver tax 5 → 4 if certified) and Florida Amendment 3 ("unofficial results" in four Florida profiles) once certified — later.
- The photo credit cleaner misses "upload on <date>" suffixes — later.
- Region chip rows (list and map) use `role="toolbar"` without arrow-key navigation; fix both or drop the role. The list chips also read region from context while the list reads it as a prop (consistent today) — later.

## Standing decisions
- Standing decisions from earlier plans are in [decisions.md](decisions.md).

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](plans/2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](plans/2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](plans/2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](plans/2026-11-06-saved-portfolios.md)
- 2026-11-07 · Mobile slider gestures: touch-safe sliders, expat price premium relabel with local/tourist ends — [plan](plans/2026-11-06-mobile-slider-gestures.md)
- 2026-11-07 · Pan and zoom map: mouse, trackpad and touch pan/zoom on the Atlas map, zoom buttons, hover fix and tablet tap bubbles, live on GitHub Pages — [plan](plans/2026-11-07-map-pan-zoom.md) · [evidence](plans/2026-11-07-map-pan-zoom/evidence/)
- 2026-11-07 · Landing page: first-visit landing (study G, "The Atlas is the chart") with the illustrative odds map and four steps, live on GitHub Pages — [plan](plans/2026-11-07-landing-page.md) · [evidence](plans/2026-11-07-landing-page/evidence/)
- 2026-11-07 · City photo galleries: five checked, openly licensed photos in a cover mosaic with the odds badge and a full-size view for all 75 picks, live on GitHub Pages — [plan](plans/2026-11-07-city-photos.md) · [evidence](plans/2026-11-07-city-photos/evidence/)
- 2026-11-07 · City profiles for all 133: unranked profiles and 5 checked photos for every city (Europe, Africa, Middle East, Asia-Pacific, Canada, South America, 32 US cities), a coverage test, live on GitHub Pages — [plan](plans/2026-11-07-all-city-profiles.md) · [evidence](plans/2026-11-07-all-city-profiles/evidence/)
- 2026-11-08 · City list navigation: collapsible tiers following the sort, region chips with counts in the list toolbar, a more opaque map city card, one Plan tab on desktop, live on GitHub Pages — [plan](plans/2026-11-08-city-list-navigation.md) · [evidence](plans/2026-11-08-city-list-navigation/evidence/)
- 2026-11-08 · Existing loan balance: an "Existing loan balance" input in Borrowing that every output starts from (BBD loan, opening forced sale above the call line, sell side at equal net worth), with warnings, limits and copy, live on GitHub Pages — [plan](plans/2026-11-08-existing-loan.md) · [evidence](plans/2026-11-08-existing-loan/evidence/)
- 2026-11-08 · Docked verdict: a glass verdict pill docked at the top of the results column on desktop and tablet once the headline scrolls away, with live delta, back-to-verdict and drawer support, live on GitHub Pages — [plan](plans/2026-11-08-docked-verdict.md) · [evidence](plans/2026-11-08-docked-verdict/evidence/)
- 2026-11-08 · Set your own spending: type a category's destination spending in $ or %, fixed amounts per city that don't drift, an ⓘ tip on the card, live on GitHub Pages — [plan](plans/2026-11-08-set-your-own-spending.md) · [evidence](plans/2026-11-08-set-your-own-spending/evidence/)
- 2026-11-09 · Retire later: a "Retire in" setting and "Saving while working" amount across the engine and app, shaded working years and a Retire line on the charts, and a "When could you retire?" comparison, live on GitHub Pages — [plan](plans/2026-11-09-retire-later.md) · [evidence](plans/2026-11-09-retire-later/evidence/)
- 2026-11-09 · Landing hero: the four-beat story card (Buy, Borrow, Live anywhere, Die; St. Louis to Bangkok) with play/pause, step sync and reduced motion, replacing the map card, live on GitHub Pages — [plan](plans/2026-11-09-landing-hero.md) · [evidence](plans/2026-11-09-landing-hero/evidence/)
- 2026-11-09 · Landing default: the plain URL shows the landing on every visit, the first-visit flag removed, live on GitHub Pages — [plan](plans/2026-11-09-landing-default.md) · [evidence](plans/2026-11-09-landing-default/evidence/)
- 2026-11-09 · Dark by default: the site opens in dark mode, saved System switched to Dark once, no light flash, live on GitHub Pages — [plan](plans/2026-11-09-dark-by-default.md) · [evidence](plans/2026-11-09-dark-by-default/evidence/)
