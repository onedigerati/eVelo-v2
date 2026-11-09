# Retire later plan

## Goal
A user who isn't ready to retire today can see what retiring in 2, 4 or 5 years would look like, starting from today's portfolio. A "Retire in" setting (now to 15 years) and a "Saving while working" amount feed the whole app: until retirement nothing is withdrawn, savings go into the portfolio (paying down any existing loan first), and from retirement on the plan spends as it does today, still ending at the same age. A comparison shows odds and safe spending for retiring now, in 2, 4 and 5 years side by side. Done = the user picks a visual direction from a variations page, all stages pass verification in the running app, a preview is reviewed, and the work is deployed on approval.

## Baseline
2026-11-08 · tests: 555 pass · typecheck: clean (after c5fc49a)

## Now
Stage 4 of 4 · Retire-later comparison
Risk: UI only
Mode: paused — preview v40 published; waiting for the user's review and deploy approval
Agents: wide — confirmed 2026-11-08 20:26
Checks:
- [x] The Outlook shows A's "When could you retire?" row: cards for Now, 2, 4 and 5 years (those below the horizon), each with an odds ring, "In N yrs · age A", the odds and safe spending; the plan's own card is highlighted, and a fifth "your plan" card appears when its retire-in isn't one of them (proof: run the product, screenshots; a test can't judge the layout)
- [x] Each card's odds and safe spending equal what the main verdict and max-spend show when that retire-in is chosen (same paths and seed), computed off the main thread, and the row shows a loading state while it computes (proof: test for the comparison runner; run the product)
- [x] Tapping a card sets retire-in to it, and the verdict, charts and the highlight follow; the cards are buttons a keyboard and screen reader can reach, each named with its age, odds and spending (proof: run the product, accessibility tree)
- [x] It looks right in light, dark and at phone width (2×2 grid) (proof: run the product, screenshots)
- [ ] A preview is published for the user to review; deploy only on their approval (proof: the user's words)
Open: the user's review of [preview v40](https://claude.ai/artifact/BQo8DhTKwyWAasaXHLBoth) and approval to deploy

## Stages
- [x] 1. Variations — a variations page of ideas for the setting and the comparison; the user picks one
- [x] 2. Retire later in the engine — retireInYears + savingsWhileWorking through kernel, sell side, solver, Atlas, share link, defaults, with tests
- [x] 3. Plan inputs and outlook — A's Retire in segmented control + Saving field (re-clamped when the horizon drops), verdict copy and move age, loan warning's first-year spend, D's shaded working years and Retire line on the charts, loan warning, Method page, both themes and phone
- [ ] 4. Retire-later comparison — A's "When could you retire?" cards (now / 2 / 4 / 5 yrs: odds ring and safe spending, tap to use); preview; deploy on approval

## Decisions
- 2026-11-08 · While working, the user adds a yearly amount ("Saving while working", today's $/yr, can be $0), inflated with CPI like income; it pays down an existing loan first and the rest is invested, through the kernel's existing surplus logic — user chose "Yearly amount".
- 2026-11-08 · A "Retire in" setting that the whole app follows (verdict, charts, Atlas odds), plus a comparison of now / 2 / 4 / 5 years — user chose "Setting + comparison".
- 2026-11-08 · The plan ends at the same age: `horizonYears` still counts from today, so retiring later means fewer drawdown years — user chose "Same end age".
- 2026-11-08 · Show a variations page of visual ideas before building any UI — user asked for it.
- 2026-11-08 · Agents: wide — user confirmed in this session.
- 2026-11-08 · Before retirement there's no spending withdrawal; the existing loan keeps accruing interest; other income counts only from retirement (while working, the savings figure is the net) — PM's call, from the survey (kernel.ts step 3).
- 2026-11-08 · The move to a destination can't come before retirement: the effective move month is max(move, retirement), so wealth tax also starts no earlier than retirement — PM's call.
- 2026-11-08 · The max-spend solver scales retirement spending only, never the savings; the sell strategy gets the same savings, invested — PM's call, from the survey (solve.ts).
- 2026-11-08 · "Retire in" runs 0–15 years in whole years and must stay below the horizon; default 0 and savings default $0, so saved plans and share links don't change — PM's call.
- 2026-11-08 · Scale check didn't fire (4 stages, one release) — PM's call.
- 2026-11-08 · Visual direction: variation A (a Now / 2 yrs / 4 yrs / 5 yrs / Other segmented "Retire in" control in Life & lifestyle, a "Saving while working" field, and a "When could you retire?" row of four cards with odds ring, age, odds and safe spending, the plan's own card highlighted, tap to use) plus D's shaded working years and a "Retire · <age>" line on the outlook charts; D's dashed comparison medians, B, C and E are not taken — user: "Go with A plus D's shaded working years" ([variations](https://claude.ai/artifact/FGJKDUPPZATHCBzvLRX2jt)).
- 2026-11-08 · Stage 2 (money) approved to build — user: "Yes build stage two."
- 2026-11-08 · Engine builder's calls: the move is also held at or after retirement inside the kernel (only when retireMonth > 0, so old hand-written configs behave the same); the FX walk keeps stepping in working months, as it already does before a later move; the sell side doesn't revive from 0 with savings (existing behaviour); the limits are exported as `MAX_RETIRE_IN_YEARS` / `MAX_SAVINGS_WHILE_WORKING` — builder's call.
- 2026-11-08 · Share links restate the two limits rather than import simulate.ts (keeps the engine out of the main bundle), with a test that they equal the engine's; cache keys and the stay-home baseline already follow every input through `inputsKey`/spread, now proven by tests; the store doesn't re-clamp retire-in when the horizon drops (the engine normalizes; stage 3's control caps it) — builder's call.
- 2026-11-08 · For stage 3: `firstYearSpend` (existingLoan.ts, the loan "thin" warning) assumes spending in year one; the move age in FanCard.tsx and VerdictHero.tsx uses `moveInYears`, not max(move, retirement) — from the state builder.
- 2026-11-08 · Stage 4 builder's calls: no new worker request — each card is the plan with only `retireInYears` changed, run through the existing `sim.simulate`/`sim.solve` caches after the main runs (simulates, then solves, then stay-home baselines), so a tapped card's numbers are the main results (`CACHE_MAX` 24 → 32, `peekSolve`); safe spending shows `maxSpendHome` like the main card; the ring uses the verdict's `outcomeColor`; "Your plan" is an `aria-hidden` badge with "(your plan)" in the accessible name; the plan's own card does nothing when tapped. The layout follows the row's width (container queries), keeping cards ≥ ~168px: five cards go 3 + 2 below 888px, four go 2×2 below 708px, two per row below 528px; the ring shrinks to 44px in narrow cards — from the stage 4 verify's badge overflow, builder's call.
- 2026-11-08 · Stage 3 verified by fresh agents ([report](evidence/stage-3/report.md)); two fix rounds for the Retire line crossing tick labels at retire-in 1–2 (fan, then margin-call), both now drawn under haloed labels; the margin-call chart's pre-existing `translate(…, undefined)` console error on horizon change is fixed (`seriesAt`); "Other"/"Custom" read "Other" until the value differs from every preset. No review run: the stage is UI only — PM's call.
- 2026-11-08 · Stage 4 layout: the comparison row sits under the verdict as in A; presets at or beyond the horizon are dropped; a fifth "your plan" card appears when the plan's retire-in isn't 0/2/4/5; odds and safe spending run in the worker with the plan's paths and seed so they match the verdict exactly — PM's call.
- 2026-11-08 · Stage 3 builders' calls: verdict sentences when retiring later — "working in <home> until <age> and retiring there", "…until <age>, then living in <dest>" (move at or before retirement), "working until <age>, then in <home>, moving to <dest> at <age>" (later move); "Other" from Now starts at 1 year; presets above min(15, horizon − 1) are hidden; the store re-clamps retire-in silently (no toast) in `clampAfterSet/Patch/Replace`; the first-year draw is 0 while working, so the "thin" opening-sale warning doesn't fire then; the fan and margin-call charts (the only age-axis charts) get the band and line, the move marker uses max(move, retirement) and "Income starts" max(income age, retirement age), and events in the retirement year join its label ("Retire · move to Bangkok · 59"); on the margin-call chart the "Working" label is a legend swatch so early bars don't hide it; `chartKit.workingYears` and `src/ui/retire.ts` both compute the retirement age (built in parallel; dedupe later) — builders' calls.
- 2026-11-08 · Stage 2 verified by a fresh agent ([report](evidence/stage-2/report.md), 586 tests, four mutation breaks caught; at the defaults retiring in 0/2/4/5 years with $60K savings gives 79.5/86.4/91.7/93.5%). Security review: nothing found. Correctness review triage — fix now: the sell strategy skipped savings when it started at $0 (portfolio $0, or loan ≥ portfolio); a misplaced comment. Into stage 3 (its scope): the loan "thin" warning's first-year spend, the move age labels, and re-clamping retire-in when the horizon drops (as `loanClamp.ts` does for the loan). Logged, not changed: the opening forced sale happens today, before any savings arrive (the lender acts on today's LTV); the "identical" tests compare with and without the fields rather than against cc192a6, which the unchanged existing suite covers; a hot-loop benchmark showed no measurable slowdown (0–7%, noise) — PM's call.
- 2026-11-08 · Stage 1 verified by a fresh agent ([report](evidence/stage-1/report.md)); its note that board A has no phone layout is covered by stage 3's phone check — PM's call.

## Open questions
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
