# Landing hero plan

## Goal
A first-time visitor to the home page sees how Buy, Borrow, Die works, and why moving somewhere cheaper helps, in one viewing. The hero's map card is replaced by variation A's four-beat card ([mockup](research/landing-hero/variation-a.html)). Buy: the portfolio fills, what you paid plus hatched gains. Borrow: a credit line pays each year's living money and the loan creeps up under the margin-call line. Live anywhere: a flight from St. Louis to Bangkok, the yearly draw shrinks, the loan bends flatter and the illustrative odds rise. Die: the step-up removes the gains tax, the estate repays the loan and heirs keep the rest. The four step cards under the hero light up with the beats and jump to them. The card is a React component with hand-built SVG and theme tokens. Its numbers come from one tested illustrative model, not the engine. Done = all stages pass verification in the running app, a preview is reviewed, and the work is deployed on approval.

## Baseline
2026-11-09 · tests: 624 pass (42 files) · typecheck: clean

## Now
Stage 3 of 3 · Preview and ship
Risk: UI only (removes dead landing code; deploy is outward-facing and waits for the user)
Mode: paused — git push origin main to deploy preview v41 via GitHub Pages (user approved "Deploy"; the keel hook holds the push)
Agents: wide — confirmed 2026-11-08 22:19
Checks:
- [x] The old map-card code is gone: `atlasCard.ts` and its test are removed, with the two figures `story.ts` reads from it (Bangkok's map odds and the home-city odds, and `bandFor`) moved into the landing story model unchanged and still tested; no unused landing exports, CSS or tokens remain (proof: test, plus a search for leftovers)
- [x] The rest of the app still works: the Atlas (map, list, city profiles), the Plan and Outlook, Method and the landing's links and theme toggle load with no console errors, at 1280 and 390 (proof: run the product, screenshots)
- [x] A preview is published for the user to review; deploy only on their approval (proof: the user's words)
Open: none — preview v41 reviewed (user: "Deploy"); deploying

## Stages
- [x] 1. Story model and card — tested illustrative model; the resting-frame card replaces the map card; step buttons; both themes and a real phone layout
- [x] 2. The four beats — the timeline (render at time t), play/pause/replay, step sync and jump, plays when in view, reduced motion, aria-live per beat
- [ ] 3. Preview and ship — clean up the old map-card code and its test, check the Atlas and the rest of the landing still work, preview for review, deploy on approval

## Decisions
- 2026-11-09 · Preview v41 reviewed and deploy approved — user: "Deploy".
- 2026-11-09 · Stage 3 checks 1–2 pass ([evidence](evidence/stage-3/report.md)); the verify's three leftover exports fixed by the PM. Preview v41 published with the full `dist/artifact-files.json` manifest (all 29 paths confirmed present) — PM's call.
- 2026-11-09 · Stage 2 closed: 6/6 checks pass ([evidence](evidence/stage-2/report.md)); review: 4 fix-now fixed, 3 cheap defers taken (Play counts as in view, `LandingStory` wrapper so the page doesn't re-render per frame, dead `frameCopy` lead/detail dropped), 2 deferred to open questions, 3 rejected — PM's call.
- 2026-11-09 · Step-press scroll rule: show the chart and the pressed step together when they fit; else the whole step plus at least half the chart (1000px stacked); else (phone) the whole chart, accepting that the pressed step scrolls off screen — they can't share an 844px screen. Focus stays on the step — PM's call.
- 2026-11-09 · Stage 2 verify notes fixed in-stage (layout shift between beats, off-screen card on phone step presses, play after a paused jump) and the review's four fix-now items (60fps re-renders while idle, hold surviving a reduced-motion switch, first-entry IntersectionObserver, StrictMode announcing Die at load) — PM's call.
- 2026-11-08 · Stage 1 closed: 4/4 checks pass ([evidence](evidence/stage-1/report.md)); review: 1 fix-now (dead phone grid rule, removed), 6 deferred into stage 2's checks (step/card sync, one beat id type, SVG name, faded content in the a11y tree, blended odds and bands, per-frame work), 3 rejected — PM's call.
- 2026-11-08 · Stage 1 verify found SVG text under 11px at 360–375px phones, ~573–622px and ~1145–1245px viewports, and the active step card 6px from the phone edge; both fixed inside stage 1 (the 11px floor is the check's intent, not just the two named widths) — PM's call.
- 2026-11-08 · Stage 1 builders resumed after the hook held them — user: "Go".
- 2026-11-08 · The card's resting (Die) frame shows the step-up as the mockup does: hatch faded, gains in a plain fill, key reads the step-up line — PM's call.
- 2026-11-08 · Stage 1 leaves built in the main tree, not worktrees: the keel hook's money-risk clearance didn't reach worktree builders (both refused at their first write); split by file region instead — PM's call.
- 2026-11-08 · Bangkok spending = $80K × the cost-of-living ratio from `categoryRatios(stl, bkk, 0)` (index 42/71 → $47,324), as the decision above names; the app's default expat factor (0.35) would give $60.5K. St. Louis odds read as the map's home-city figure (63%, band 2). `story.ts` imports these from `atlasCard.ts`, so stage 3's cleanup must keep or move them — PM's call.
- 2026-11-08 · Stage 1 cleared to build despite its risk line naming money (illustrative figures only, tested model) — user: "Go ahead, build stage 1 as planned".
- 2026-11-09 · Visual direction: variation A, the four-beat loop, as it stands (no sell-versus-borrow beat, no result row); B, C, D and the A+D hybrid are not taken — user: "Let's go with option A" ([variations](https://claude.ai/artifact/QeAKiE7ZvvnSK665sCeSHf)).
- 2026-11-09 · Home city St. Louis, destination Bangkok, Thailand, in place of Austin and Lisbon — user: "I want the home city to be St. Louis and the destination city to be Bangkok, Thailand".
- 2026-11-09 · The four-beat card replaces the current hero map card, and the odds are illustrative, not engine output — user: "replace the current hero map card and the odds should just be illustrative".
- 2026-11-09 · Agents: wide carries over from the last plan, confirmed in this session — PM's call.
- 2026-11-09 · Scale check didn't fire (3 stages, one release) — PM's call.
- 2026-11-09 · The illustrative model follows the mockups' brief ([brief](research/landing-hero/brief.md)): $2.5M, $1.0M basis, 7% growth, 6% credit line with interest added to the loan, spending up 3% a year, ages 60 to 90, margin call at 50% LTV, St. Louis $80k/yr. Bangkok's figure is derived from the cost data (`src/engine/cost.ts` ratios over `src/data/cities.ts`, cost-of-living index 71 vs 42), so it follows the app's data — PM's call.
- 2026-11-09 · Fixes for the mockup's known weak spots: a real phone layout for the chart (its text was ~9–10px at 390px), the key in normal layout (the percentage overlay was fragile), and play twice then rest on the finished frame (as the mockup does) — PM's call.
- 2026-11-09 · Must keep from the mockup: a complete resting frame before any motion, `prefers-reduced-motion` (finished frames only), play/pause/replay, play only while in view, aria-live per beat — PM's call.
- 2026-11-09 · The motion is split from the card (stages 1 and 2) so the resting frame and layout are reviewed before the timeline is built — PM's call.

## Open questions
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
