# Pick reasons plan

## Goal
The fact check corrected the city profiles but kept the ranked 75's order and their one-line `why` reasons as they were, and flagged 25 places where a reason or a summary no longer matches the corrected facts (the `rankFlag` entries in `docs/research/fact-check-2026-11/`, listed in `what-changed.md`). The user chose to keep the ranks and rewrite those lines. Done = every flagged `why` line in `src/data/expatPicks.ts`, and Nice's summary, agrees with its profile and the ledger, every ranked pick whose borrow step is in doubt (lending 2) says so in its reason, the ranks are unchanged, and a test holds it.

## Baseline
2026-11-15 · tests: 1103 pass · typecheck: clean · build: ok

## Now
All stages done. The fact check and the pick reasons are live on GitHub Pages (run 43783468539, 2026-11-16).
Agents: lean

## Stages
- [x] 1. Pick reasons — rewrite the 25 rank-flagged `why` lines and Nice's summary to match the corrected facts, with a borrow warning on every ranked lending-2 pick — [evidence](evidence/stage-1/report.md)

## Fixes
- 2026-11-15 · Spain's seven profiles now warn, in the residency fact, that the Los Angeles consulate says applicants "cannot have/leave loans or mortgages in the United States" and doesn't say whether a margin loan counts (ledger `es-visa-la-no-us-loans`) — tests 1103/1103, typecheck, and Madrid seen on a phone-width profile
- 2026-11-15 · Landing buttons get a quiet hover effect: "Find your eVelo"'s arrow curves up into an escape path, and "Explore the Atlas" gains a small globe whose meridians turn; hover, keyboard focus and press only, nothing ambient, off under reduced motion — user picked it from a six-way sampler; tests 1111/1111, typecheck, build, and the buttons seen at rest and hovered on desktop and at phone width

## Decisions
- 2026-11-15 · Keep the ranked 75's order and rewrite the flagged `why` lines and Nice's summary to match the corrected facts — user: "Let's go with your recommendation" (the PM recommended keep and warn over re-ranking).
- 2026-11-15 · Scores that sit between two rubric rungs (Japan vs London estate, New Zealand vs Netherlands tax, Korea residency, Mauritius tax, Colombia tax) stay as they are, with no tie-break rule — same answer.
- 2026-11-15 · A `why` line keeps its length and voice (one sentence, the pick's case and its main catch); a rewrite says what the ledger says, with "reportedly" where the profile has it — PM default, matching the profiles' rules.
- 2026-11-15 · Scale: 1 stage, one release — no scale signal fired, planned as one plan.
- 2026-11-15 · Agents: lean, carried over from the fact check plan.
- 2026-11-15 · No research note: the ledger already holds the facts each line must match.
- 2026-11-15 · User took the PM's recommendations ("Let's go with your recommendations"): Spain's seven profiles get the Los Angeles consulate's loans warning, hedged (done, see Fixes); a "checked" date on profiles is held for later; the fact check deploys after this plan's stage, not before; reminders to recheck Florida's Amendment 3 (after 17 November) and Colorado's Amendment 87 (after 30 November).
- 2026-11-15 · Autopilot, unattended, Agents: lean — user: "Jbit autopilot lean". The reminders are scheduled: Florida on 18 November, Colorado on 1 December.
- 2026-11-15 · (unattended) 27 flags rather than 25: Las Terrenas and Santiago were named only in the report's questions, so the builder gave them flags of their own (`do-lending-schwab-summary`, `cl-estate-domicile-unverified`) to record and test their fixes like the others. Nice's summary fix is recorded on `fr-lending-ibkr-margin-cash-out`.
- 2026-11-15 · (unattended) The borrow warning reads "borrowing cash against the portfolio is reportedly blocked for residents" on all 27 lending-2 picks (all in the EU), one shared phrase that a test checks. Hedges kept where no page settles the fact: Tavira's "about 30–40 minutes", Santiago's "likely falls outside", Budapest's "a draft bill would reportedly close that route from 2027".
- 2026-11-16 · Deployed the fact check and the pick reasons together — user: "Deploy". Pushed main; Deploy to GitHub Pages run 43783468539 passed (tests, build, publish); the live AtlasView chunk carries the new reasons and the re-check date line.

## Open questions
- Show a "checked <date>" on each profile, linked to its sources and read dates — held for later at the user's call.
- Colorado's Amendment 87 (Denver tax 5 → 4 if certified, by 30 November 2026) and Florida's Amendment 3 ("unofficial results" in four Florida profiles; certification 17 November 2026): re-read the certified results and update, each as a quick fix after its date.
- A taxed home city's wealth tax for the years before a delayed move is not charged (matters for a Zurich home), and a move set at or after the horizon runs without the home's estate tax; both need the kernel to handle two tax regimes in one run (money) — later.
- From stage 6: Chiang Rai's healthcare fact now puts Chiang Mai "about 2–3 hours away (secondary source)", while its Getting there fact (out of scope) says 3–4 hours by road — reconcile at the next local-note pass. A New Zealand bill (Sep 2026) would raise the FIF threshold to NZD 100,000; Vietnam's proposed golden visa has no legal basis yet — recheck later.
- From stage 4, unsettled: Panama's Decree 17 text (thresholds rest on two law-firm pages), Costa Rica's Inversionista amount ($150k on DGME in September vs a reported $200k), whether a Mexican margin balance counts as a reportable "préstamo", Guatemala's IUSI home exemption start date (about 26 Nov 2026 by count, 8 Jan 2027 per one outlet) — later.
- From stage 3, unsettled by any readable page: Kotor's hospital's current name (now "Kotor's hospital"), Montenegro's inheritance statute, the UAE's non-Muslim estate law text, the US–South Africa estate treaty text, Grand Baie's drive times and evacuation practice — later, by someone with a browser.
- Not claimed by the profiles, so not added, but they matter to a buy-and-hold ETF portfolio: Ireland's fund exit tax and 8-year deemed disposal, Germany's Vorabpauschale, and Switzerland's "professional securities dealer" tests (borrowing to invest is reportedly one) — a later pass.
- "Loan draws do not count as income" for the D7 has no page behind it: the official lists name pensions and income from property and financial assets only. The profiles now say "believed not to count"; a question to a consulate would settle it — later.
- Whether Madeira's 30% regional cut reaches the 28% rate on dividends from a US broker is unverified (the pages that might settle it returned 403); the profile says so — later.
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
- The photo credit cleaner misses "upload on <date>" suffixes — later.
- Region chip rows (list and map) use `role="toolbar"` without arrow-key navigation; fix both or drop the role. The list chips also read region from context while the list reads it as a prop (consistent today) — later.

## Standing decisions
- Standing decisions from earlier plans are in [decisions.md](decisions.md).

## Shipped
- 2026-11-06 · eVelo v2 build: BBD planner with engine, plan inputs, outlook charts, Atlas and methodology, live on GitHub Pages — [plan](2026-11-06-evelo-v2-build.md)
- 2026-11-06 · Expat picks: verified costs for 25 destinations + US home cities, ranked top 25 with sources, profiles for the top 15 in the Atlas — [plan](2026-11-06-expat-picks.md)
- 2026-11-06 · Profiles 16–25: full profiles for picks 16–25, plus the new escape-velocity logo and Geist wordmark — [plan](2026-11-06-profiles-16-25.md)
- 2026-11-06 · Saved portfolios: save/apply/rename/delete holdings mixes, Atlas on the plan's full path count, info bubbles kept on screen — [plan](2026-11-06-saved-portfolios.md)
- 2026-11-07 · Mobile slider gestures: touch-safe sliders, expat price premium relabel with local/tourist ends — [plan](2026-11-06-mobile-slider-gestures.md)
- 2026-11-07 · Pan and zoom map: mouse, trackpad and touch pan/zoom on the Atlas map, zoom buttons, hover fix and tablet tap bubbles, live on GitHub Pages — [plan](2026-11-07-map-pan-zoom.md) · [evidence](2026-11-07-map-pan-zoom/evidence/)
- 2026-11-07 · Landing page: first-visit landing (study G, "The Atlas is the chart") with the illustrative odds map and four steps, live on GitHub Pages — [plan](2026-11-07-landing-page.md) · [evidence](2026-11-07-landing-page/evidence/)
- 2026-11-07 · City photo galleries: five checked, openly licensed photos in a cover mosaic with the odds badge and a full-size view for all 75 picks, live on GitHub Pages — [plan](2026-11-07-city-photos.md) · [evidence](2026-11-07-city-photos/evidence/)
- 2026-11-07 · City profiles for all 133: unranked profiles and 5 checked photos for every city (Europe, Africa, Middle East, Asia-Pacific, Canada, South America, 32 US cities), a coverage test, live on GitHub Pages — [plan](2026-11-07-all-city-profiles.md) · [evidence](2026-11-07-all-city-profiles/evidence/)
- 2026-11-08 · City list navigation: collapsible tiers following the sort, region chips with counts in the list toolbar, a more opaque map city card, one Plan tab on desktop, live on GitHub Pages — [plan](2026-11-08-city-list-navigation.md) · [evidence](2026-11-08-city-list-navigation/evidence/)
- 2026-11-08 · Existing loan balance: an "Existing loan balance" input in Borrowing that every output starts from (BBD loan, opening forced sale above the call line, sell side at equal net worth), with warnings, limits and copy, live on GitHub Pages — [plan](2026-11-08-existing-loan.md) · [evidence](2026-11-08-existing-loan/evidence/)
- 2026-11-08 · Docked verdict: a glass verdict pill docked at the top of the results column on desktop and tablet once the headline scrolls away, with live delta, back-to-verdict and drawer support, live on GitHub Pages — [plan](2026-11-08-docked-verdict.md) · [evidence](2026-11-08-docked-verdict/evidence/)
- 2026-11-08 · Set your own spending: type a category's destination spending in $ or %, fixed amounts per city that don't drift, an ⓘ tip on the card, live on GitHub Pages — [plan](2026-11-08-set-your-own-spending.md) · [evidence](2026-11-08-set-your-own-spending/evidence/)
- 2026-11-09 · Retire later: a "Retire in" setting and "Saving while working" amount across the engine and app, shaded working years and a Retire line on the charts, and a "When could you retire?" comparison, live on GitHub Pages — [plan](2026-11-09-retire-later.md) · [evidence](2026-11-09-retire-later/evidence/)
- 2026-11-09 · Landing hero: the four-beat story card (Buy, Borrow, Live anywhere, Die; St. Louis to Bangkok) with play/pause, step sync and reduced motion, replacing the map card, live on GitHub Pages — [plan](2026-11-09-landing-hero.md) · [evidence](2026-11-09-landing-hero/evidence/)
- 2026-11-09 · Landing default: the plain URL shows the landing on every visit, the first-visit flag removed, live on GitHub Pages — [plan](2026-11-09-landing-default.md) · [evidence](2026-11-09-landing-default/evidence/)
- 2026-11-09 · Dark by default: the site opens in dark mode, saved System switched to Dark once, no light flash, live on GitHub Pages — [plan](2026-11-09-dark-by-default.md) · [evidence](2026-11-09-dark-by-default/evidence/)
- 2026-11-10 · Atlas speed: city odds split across workers, saved last ranking and an idle start (odds ~1.1 s vs ~3.0 s), 640px photo copies with srcset and hover preload (profiles 178–256 KB vs 700–910 KB), live on GitHub Pages — [plan](2026-11-10-atlas-speed.md) · [evidence](2026-11-10-atlas-speed/evidence/)
- 2026-11-10 · Your spending on profiles: user-set spending rows marked "your amount"/"your change" on city profiles, named in the note, live on GitHub Pages — [plan](2026-11-10-spending-markers.md) · [evidence](2026-11-10-spending-markers/evidence/)
- 2026-11-10 · Clickable atlas tiles: Best odds, Your home and Your destination tiles open the city profile from anywhere on the tile, with pick-card hover, live on GitHub Pages — [plan](2026-11-10-clickable-tiles.md) · [evidence](2026-11-10-clickable-tiles/evidence/)
- 2026-11-10 · Country on city cards: muted country name beside the city on atlas tiles and top-pick cards, and swipe-down to close phone sheets, live on GitHub Pages — [plan](2026-11-10-country-label.md) · [evidence](2026-11-10-country-label/evidence/)
- 2026-11-10 · Premium scales overrides: typed `$`/`%` spending pinned to the premium when typed and scaled with the slider, with a "scales with premium" note, tip and Method copy, live on GitHub Pages — [plan](2026-11-10-premium-scales.md) · [evidence](2026-11-10-premium-scales/evidence/)
- 2026-11-10 · Hero tile glow: the Atlas hero tiles' odds-tone glow sits behind the odds figure instead of the top-right corner, live on GitHub Pages — [plan](2026-11-10-hero-tile-glow.md) · [evidence](2026-11-10-hero-tile-glow/evidence/)
- 2026-11-13 · Pill destination: every verdict pill names its city (destination, else home), a floating pill on phone Outlook and on the Atlas once the hero tiles scroll away, plus landing escape-velocity copy fixes, live on GitHub Pages — [plan](2026-11-13-pill-destination.md) · [evidence](2026-11-13-pill-destination/evidence/)
- 2026-11-15 · Home-aware getting there: each profile's Getting there worked out from the home city (nonstop, one, two or three stops, estimated hours) from sourced routes for 130 airports, with all 133 local notes rewritten, live on GitHub Pages — [plan](2026-11-15-home-aware-getting-there.md) · [evidence](2026-11-15-home-aware-getting-there/evidence/)
- 2026-11-15 · Profile fact check: every tax, estate, lending, residency and healthcare claim in the 133 profiles checked against a current page (1,550 claims in a ledger; 122 corrected, 40 scores moved), the tax model brought in line (UK, NL, DE, KR, Zurich and nine US state taxes; a taxed home now taxed), and a city-by-city report in `docs/research/fact-check-2026-11/what-changed.md`, live on GitHub Pages 2026-11-16 — [plan](plans/2026-11-15-profile-fact-check.md) · [evidence](plans/2026-11-15-profile-fact-check/evidence/)
