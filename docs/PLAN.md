# Country on city cards plan

## Goal
The atlas city cards (the Best odds, Your home and Your destination tiles, and the Top picks cards) show the country next to the city name, quietly enough that the city name still leads: smaller, lighter and muted, so the code chip is no longer the only hint of the country. Then (stage 2) on a phone, a sheet such as the city profile closes with a swipe down anywhere on it once its content is scrolled to the top, as well as by the handle and ×. Done = both stages pass verification in the running build; deploy waits for the user's go.

## Baseline
2026-11-10 · tests: 749 pass · typecheck: clean

## Now
All stages done
Agents: wide — confirmed 2026-11-10 08:45
Risk: UI only
Checks:
- [x] On a phone-size bottom sheet with its content scrolled to the top, a downward touch swipe on the content drags the sheet with the finger; releasing past 110px or faster than 550px/s down closes it, a shorter or paused swipe springs back (proof: test)
- [x] With the content scrolled down, a downward swipe scrolls it and never moves the sheet; upward swipes scroll; sideways swipes (photo carousel) and taps work as before (proof: test)
- [x] In the running app on a touch phone: swipe-down at top closes the city profile, the cases above hold, and the handle, ×, Escape and backdrop still close it; side drawers are unchanged (proof: scripted touch run, a unit test can't drive real scrolling and touch)
Open: none

## Stages
- [x] 1. Country label — muted country name beside the city on atlas tiles and top-pick cards
- [x] 2. Swipe to close — swipe down on a phone sheet's content at scroll top closes it, like the handle

## Decisions
- 2026-11-10 · Agents: wide; run on autopilot — user: "Let's go wide and on autopilot."
- 2026-11-10 · Scale check didn't fire (1 stage, one release) — PM's call.
- 2026-11-10 · The country goes inline after the city name in a smaller, regular-weight, muted face (as the "also worth a look" rows and the city list already show it), not on its own line, so the cards keep their height and look — PM's call (default).
- 2026-11-10 · Push to main and deploy once the stage passes — user: "Push and deploy when ready."
- 2026-11-10 · The country shows whole or not at all (wraps to a clipped line, as the city list's subtitle does), and stacks under the name on the phone's half-width tiles, after "Unit…" showed on St. Louis at 390px — PM's call.
- 2026-11-10 · Fix round 1: verify failed checks 2–3 (stubs like "Dominican Repu…" on phone half-width tiles; country hidden on 123/133 tiles at 768). Stacking now keys off the card's own width (container queries) and the stacked country wraps instead of trimming — PM's call.
- 2026-11-10 · Swipe-down to close joins this plan as stage 2 (shared Sheet, so every phone sheet gets it), shipped in the same deploy — user chose "Stage 2 of this plan".
- 2026-11-10 · Fix round 2: re-verify passed stubs/hidden (0/133) but the 340px container query stacked every desktop tile at 1280 (+18px). Replaced by a content rule: the country wraps under the name only when it doesn't fit beside it — PM's call.
- 2026-11-10 · Stage 1 closed: 3/3 checks pass after two fix rounds ([evidence](evidence/stage-1/report.md)), verified by a fresh agent on the production build; risk line UI only confirmed against the diff (CSS/TSX/tests); no `keel:review` (UI only, with tests) — PM's call.
- 2026-11-10 · Stage 2 closed: 3/3 checks pass ([evidence](evidence/stage-2/report.md)), built in a worktree in parallel with stage 1's fixes, verified by a fresh agent on the production build (25/25 scripted touch cases); risk line UI only confirmed (Sheet primitive + touch hook); no `keel:review` (UI only, with tests) — PM's call.
- 2026-11-10 · All stages done; pushing to deploy per the user's earlier go — PM's call.
- 2026-11-10 · The code chip stays; the country is extra, not a replacement — PM's call (default).

## Open questions
- Touch-dragging the tablet's left Plan drawer doesn't close it (fails the same before stage 2; likely needs `touch-action: pan-y` on side sheets) — from the stage 2 build, later.
- The profile's tinted % marker overhangs the spending list's right edge by 4px (cosmetic, not clipped) — from the stage 1 verify, later.
- The preview build (claude.ai artifact) needs the 665 new 640px copies uploaded to its asset store before preview galleries use them; until then they fall back to the originals — from stage 2, next preview publish.
- Phones don't save photo bytes (DPR 3 needs the 1280); a 960px step or AVIF would — from the stage 2 verify, later.
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
- 2026-11-10 · Atlas speed: city odds split across workers, saved last ranking and an idle start (odds ~1.1 s vs ~3.0 s), 640px photo copies with srcset and hover preload (profiles 178–256 KB vs 700–910 KB), live on GitHub Pages — [plan](plans/2026-11-10-atlas-speed.md) · [evidence](plans/2026-11-10-atlas-speed/evidence/)
- 2026-11-10 · Your spending on profiles: user-set spending rows marked "your amount"/"your change" on city profiles, named in the note, live on GitHub Pages — [plan](plans/2026-11-10-spending-markers.md) · [evidence](plans/2026-11-10-spending-markers/evidence/)
- 2026-11-10 · Clickable atlas tiles: Best odds, Your home and Your destination tiles open the city profile from anywhere on the tile, with pick-card hover, live on GitHub Pages — [plan](plans/2026-11-10-clickable-tiles.md) · [evidence](plans/2026-11-10-clickable-tiles/evidence/)
