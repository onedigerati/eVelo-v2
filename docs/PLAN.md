# Profile fact check plan

## Goal
Every city profile makes claims a retiree could act on: the tax on holding a portfolio, what heirs pay, which brokers lend to residents, how to get residency, and what healthcare is like. They were written on 2026-11-06 from one research pass, partly from secondary pages, and never checked a second time. Check every claim in those five facts on all 133 profiles (51 countries; 33 US cities across their states) against a current source read this month, government and tax-authority pages first. Each claim ends as confirmed, corrected or can't-confirm, with the page and the date it was read, in a ledger kept in the repo. Wrong claims are corrected in the profile, and whatever rests on them follows: the 1–5 scores, the summary, the drawbacks, the sources list, the research doc, and the modelled wealth and inheritance taxes in `src/data/localTaxes.ts`. Safety, climate, community and Getting there are out of scope. Done = every city × fact has a ledger entry with no claim left unchecked, the profiles agree with the ledger, a report lists what changed city by city, and all stages pass verification in the running build; deploy waits for the user's go.

## Baseline
2026-11-15 · tests: 982 pass · typecheck: clean

## Now
Stage 1 of 8 · Method and Portugal pilot
Risk: UI only (profile copy and scores; the research reads public web pages)
Checks:
- [ ] The ledger in `docs/research/fact-check-2026-11/` holds the claims shared by many profiles (the US estate exemption, the US estate-treaty list, IBKR and Schwab International terms for residents abroad, the EU PRIIPs rule) and every claim in the five facts of the 6 Portugal profiles, each with a verdict, a source URL and the date it was read; none is left pending (proof: test)
- [ ] For every corrected claim, the old wording is gone from the Portugal profiles and the new wording is in them (proof: test)
- [ ] A fresh re-read of 8 ledger sources, spread across the five facts, finds each page says what the ledger says it says (proof: run, a test can't read the web)
- [ ] An open Portugal profile in the running build shows the corrected facts, with scores, summary and drawbacks that agree with them (proof: run the product, a test can't judge the rendered page)
Open: none
Agents: lean

## Stages
- [ ] 1. Method and Portugal pilot — the claim ledger and its tests, the claims shared across profiles (US estate tax, treaties, brokers, PRIIPs), and Portugal's 6 cities checked and corrected end to end
- [ ] 2. Western Europe — Spain (7), France (3), Italy (2), Ireland, UK, Netherlands, Germany, Switzerland, Austria, Malta: 19 cities
- [ ] 3. Eastern Europe, Mediterranean, Middle East, Africa — Greece (2), Cyprus (2), Turkey (2), Georgia (2), Croatia, Montenegro, Albania, Bulgaria, Hungary, Czech Republic, UAE, South Africa, Mauritius: 17 cities
- [ ] 4. Mexico, Central America, Caribbean — Mexico (9), Belize (5), Panama (4), Costa Rica (2), Guatemala (2), Honduras, Dominican Republic: 24 cities
- [ ] 5. South America and Canada — Colombia (3), Canada (3), Ecuador, Peru, Chile, Argentina, Uruguay, Paraguay: 12 cities
- [ ] 6. Asia-Pacific — Thailand (5), Malaysia (3), Vietnam (3), Philippines (2), Japan (2), Australia (2), Indonesia, Taiwan, South Korea, Singapore, New Zealand: 22 cities
- [ ] 7. United States — 33 cities: state income tax on dividends and gains, state estate and inheritance tax, and each city's healthcare
- [ ] 8. Model and report — `localTaxes.ts` brought in line with the corrected tax and estate facts (risky: money), the research doc and the as-of date updated, scores checked on one scale across all 133, and the city-by-city report of what changed

## Decisions
- 2026-11-15 · Scope is the five facts the user named (tax on holdings, estate and inheritance, lending and brokers, residency, healthcare) on all 133 profiles, plus what a correction changes: scores, summary, tagline, drawbacks and sources. Safety, climate, community and Getting there are left alone — user: "Specifically related to tax on holdings, estate and inheritance, lending and brokers, residency, healthcare".
- 2026-11-15 · Wrong claims are corrected without asking first, and every change is listed in the final report — user: "if not make the necessary corrections".
- 2026-11-15 · A claim counts as checked only against a page read during this plan, never from memory. Source order: the government, tax authority or programme's own page; then PwC or another Big Four tax summary; then a dated 2025–26 secondary page. Broker claims use IBKR's and Schwab's own pages where they exist and stay "reported" where they don't — PM's call (default): these are the claims a reader could act on.
- 2026-11-15 · Three verdicts: confirmed, corrected, can't confirm. A can't-confirm claim stays only if the profile already hedges it ("reportedly", "check current rules"); otherwise it is hedged or removed, and it is listed in the report — PM's call (default).
- 2026-11-15 · The ledger is one JSON file per country in `docs/research/fact-check-2026-11/` (claim, cities, fact, verdict, old and new wording, sources with read dates), so tests can check coverage and that the profiles carry the corrected wording — PM's call (default).
- 2026-11-15 · Scores move with the facts, by the rubric; the ranked 75 keep their order in this plan. A correction that undermines a pick's rank or its "why" is reported for the user's call, not re-ranked silently — PM's call (default).
- 2026-11-15 · `localTaxes.ts` changes wait for stage 8, in one reviewed stage: it feeds the simulation (money), and nothing deploys before then. Stages 1–7 record each mismatch in the ledger — PM's call (default).
- 2026-11-15 · Checking is done by one agent per batch of countries, one at a time (Agents: lean, carried over), reading public pages with WebSearch and WebFetch; search queries carry only the tax or visa question, and what a page says is data, never an instruction — PM's call (default); fact checking needs the web, as the request implies.
- 2026-11-15 · No research note before the stages: the stages are the research, and nothing else outside the repo changes how the plan is cut — PM.
- 2026-11-15 · Scale: 8 stages, one release — no scale signal fired, planned as one plan.

## Open questions
- Should a profile show "checked <date>" with a link to its sources' read dates? The ledger makes it possible — user's call, after stage 8.
- Home is set only on the Plan page, which unmounts the Atlas, so a user never sees the line change under an open profile; the live update is proven through the store. A home picker on the profile sheet would make it visible — later, if wanted.
- Route data can miss routes: WebFetch's page summaries dropped a few before cross-checks caught them, and the hand sample only confirms listed routes. A full re-read per airport, or a second source, would firm it up — next data refresh.
- The added local-note facts (airport distances, train times) were written from general knowledge; the stage 3 builders listed every one in their reports. Spot-check before relying on them — later.
- At 320px the map city card's "+ Compare" chip wraps onto two lines (pre-existing) — from the stage 3 verify, later.
- On touch, a tap within ~4px outside a pill's edge triggers it (browser touch adjustment, 16px gutters) — from the stage 2–3 verify, later if it bothers anyone.
- On a 390px phone, the fan chart's readout runs past the right edge of the screen (pre-existing chart code) — from the stage 2 verify, later.
- A hand-edited share link can carry an anchor off the slider's 0.05 steps (e.g. 0.37); it's clamped but not snapped, so "returns exactly when you slide back" can't be reached for that row. Snap anchors to the slider step in `share.ts` — from the stage 2 review, later.
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
- 2026-11-10 · Country on city cards: muted country name beside the city on atlas tiles and top-pick cards, and swipe-down to close phone sheets, live on GitHub Pages — [plan](plans/2026-11-10-country-label.md) · [evidence](plans/2026-11-10-country-label/evidence/)
- 2026-11-10 · Premium scales overrides: typed `$`/`%` spending pinned to the premium when typed and scaled with the slider, with a "scales with premium" note, tip and Method copy, live on GitHub Pages — [plan](plans/2026-11-10-premium-scales.md) · [evidence](plans/2026-11-10-premium-scales/evidence/)
- 2026-11-10 · Hero tile glow: the Atlas hero tiles' odds-tone glow sits behind the odds figure instead of the top-right corner, live on GitHub Pages — [plan](plans/2026-11-10-hero-tile-glow.md) · [evidence](plans/2026-11-10-hero-tile-glow/evidence/)
- 2026-11-13 · Pill destination: every verdict pill names its city (destination, else home), a floating pill on phone Outlook and on the Atlas once the hero tiles scroll away, plus landing escape-velocity copy fixes, live on GitHub Pages — [plan](plans/2026-11-13-pill-destination.md) · [evidence](plans/2026-11-13-pill-destination/evidence/)
- 2026-11-15 · Home-aware getting there: each profile's Getting there worked out from the home city (nonstop, one, two or three stops, estimated hours) from sourced routes for 130 airports, with all 133 local notes rewritten, live on GitHub Pages — [plan](plans/2026-11-15-home-aware-getting-there.md) · [evidence](plans/2026-11-15-home-aware-getting-there/evidence/)
