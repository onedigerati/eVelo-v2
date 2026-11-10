# Your spending on profiles plan

## Goal
City profiles show where the numbers are the user's own. Every spending row on a profile already uses the plan's overrides; now each row the user set gets a subtle marker beside its value — "your amount" for a typed $ for that city, "your change" for a typed % (which applies to every non-home city) — with matching screen-reader text, and the note under the list names the categories the user changed. Done = the stage passes verification in the running build; deploy waits for the user's go.

## Baseline
2026-11-10 · tests: 734 pass (50 files) · typecheck: clean

## Now
All stages done
Agents: wide — confirmed 2026-11-10 07:52
Risk: UI only
Checks:
- [x] On a non-home profile, a category with a typed $ for that city is marked "your amount", a category with a typed % is marked "your change", and other rows, other cities' $ and the home profile carry no mark (proof: test)
- [x] The note under the list names the changed categories, and says nothing about overrides when there are none (proof: test)
- [x] Each marked row's screen-reader line says "your amount" or "your change" (proof: test)
- [x] On the destination's profile in the running app, marked rows show a subtle marker, legible in dark and light, phone and desktop (proof: screenshot, a test can't judge the look)
Open: none

## Stages
- [x] 1. Override markers — mark user-set spending rows on profiles, name them in the note

## Decisions
- 2026-11-10 · Mark an override on every profile where it applies (typed $ only on its own city, typed % on every non-home city), not only the destination's — user: "Mark it everywhere the override applies, go ahead".
- 2026-11-10 · Agents: wide; run on autopilot — user: "Let's go wide and autopilot."
- 2026-11-10 · The marker follows the Plan card's override styling (`is-override`) so it reads as the same thing — PM's call.
- 2026-11-10 · Deploy (push to main) waits for the user's go after the stage passes — PM's call (no deploy instruction for this plan).
- 2026-11-10 · Stage 1 closed: 4/4 checks pass ([evidence](evidence/stage-1/report.md)), verified by a fresh agent on the production build; no `keel:review`: UI only, with tests — PM's call.
- 2026-11-10 · All stages done; deploy waits for the user's go — PM's call.
- 2026-11-10 · Scale check didn't fire (1 stage, one release) — PM's call.

## Open questions
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
