# Set your own spending plan

## Goal
In the "Spending in <city>" card, a user who has researched a real price ("a condo in Bangkok is about $18K a year") can type the dollar amount for any category, not just the percentage change. The percentage, bar, card total and odds follow, and a typed amount stays fixed when the home budget or the expat price premium changes. An ⓘ tip on the card explains what the numbers compare against and how to set your own. Done = both stages verified in the running app, a preview, and deployed on approval.

## Baseline
2026-11-08 · tests: 501 pass · typecheck: clean · build: ok (after 5e26be1)

## Now
Stage 1 of 2 · Fixed amounts in the engine
Risk: user input (share-link decoding of a new field)
Mode: autopilot
Agents: wide — confirmed 2026-11-08 17:23
Checks:
- [ ] A fixed amount for a category becomes that destination's spending for it, whatever the home budget or expat premium, while percentage overrides and untouched rows behave as before; a $0 home category can carry a fixed amount (proof: test)
- [ ] Fixed amounts belong to the city they were set for: they move the Outlook, solver and loan hint for that destination and that city's Atlas row, never other Atlas cities (proof: test)
- [ ] The Outlook's per-category cost rows show the fixed amount, not budget × ratio (proof: test)
- [ ] Share links and the saved plan round-trip fixed amounts; decoding drops unknown cities and categories and non-numbers, and clamps amounts to $0–BUDGET_MAX (proof: test)
Open: none

## Stages
- [ ] 1. Fixed amounts in the engine — per-city fixed dollar overrides through cost model, sim, solver, Atlas, outlook rows, share link, with tests
- [ ] 2. Card editing and tip — edit $ or % on each row, × to clear, ⓘ tip on the card, both themes and phone; preview; deploy on approval

Stage 2 checks (drafted, finalised when it starts):
- Tapping a row's amount lets you type dollars; Enter sets it, Esc cancels; the %, bar, total, −40% chip and odds update (proof: run the product, a test can't judge the live card)
- Setting % on a row that has a fixed amount replaces it, and vice versa; × and "Reset all" clear both kinds (proof: test for the override logic; run the product)
- A fixed row keeps its dollars when the home budget or the premium slider moves; a percentage row follows (proof: run the product)
- The ⓘ tip says what the % compares against (your home city's spending), that you can set the % or the $, that a typed $ stays fixed, and how to undo (proof: run the product, screenshot)
- Keyboard and screen reader can reach and edit both fields, labelled per category; it looks right in light, dark and at phone width (proof: run the product, screenshots)

## Decisions
- 2026-11-08 · Users can set a category's destination spending in dollars as well as by percentage; a dollar entry is stored as a fixed amount and doesn't drift when the home budget changes, while percentage entries keep following the home budget — user: "yes, fixed dollar amounts". This refines the standing cost model (home budget × ratios): a fixed amount takes a category out of the ratio for that city.
- 2026-11-08 · The expat price premium doesn't move a fixed amount (as it already doesn't move percentage overrides) — proposed to the user, accepted.
- 2026-11-08 · Amounts are annual USD in today's money, like the rest of the card; the simulation still inflates them with CPI and FX volatility like any destination spending (it's today's price, not a nominal lock), and the max-spend solver scales them with the rest of the budget — PM's call, from the survey (simulate.ts, solve.ts).
- 2026-11-08 · Fixed amounts are keyed by city (`amountOverrides[cityId][category]`), so research for Bangkok doesn't land on every Atlas city and survives switching destinations; percentage overrides keep today's behaviour (applied everywhere) — PM's call, from the survey (atlas.ts, picks.ts apply overrides to every city).
- 2026-11-08 · One override per category: setting a % replaces a fixed amount and vice versa; a row whose home amount is $0 shows dollars only — user accepted the proposal.
- 2026-11-08 · An ⓘ tip on the card explains it — user asked for it.
- 2026-11-08 · Two stages: the engine and state change with tests, then the card UI; scale check didn't fire — PM's call.

## Open questions
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
