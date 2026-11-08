# Docked verdict plan

## Goal
On desktop and tablet, the verdict ("Your plan holds in X% of futures") stays in view after its headline scrolls away: it turns into a glass pill docked at the top of the results column (option A on the [Verdict on scroll canvas](https://claude.ai/artifact/TpwbR7bfagZffwgxAaottC)), so a user editing the plan rail sees the odds change without scrolling back up. Phone is unchanged. Done = the pill on desktop and tablet, verified in the running app in both themes, a preview, and deployed on approval.

## Baseline
2026-11-08 · tests: 485 pass · typecheck: clean · build: ok (after bf1ba98)

## Now
Stage 1 of 1 · Docked verdict pill
Risk: UI only
Agents: wide — confirmed 2026-11-08 15:35
Checks:
- [x] Desktop: the pill is hidden while the verdict headline's number is on screen and docks at the top of the results column, below the top bar, once it has scrolled away; it fades/slides in rather than popping (proof: run the product, screenshots at two scroll positions, a test can't judge layout or motion)
- [x] It shows the phone pill's content (progress ring, "Holds in X% of futures", tone colour from the shared outcome scale) and updates live when a rail input changes, briefly showing the change in points ("+6 pts") (proof: test for the delta logic; run the product for the live update)
- [x] Its back button scrolls to the verdict and moves focus there; the pill is reachable by keyboard and named for screen readers, and hidden from them while it's hidden on screen (proof: run the product, keyboard walk + accessibility tree, a test can't drive the real layout)
- [x] Tablet: the same pill works over the outlook, including while the plan drawer is open (proof: run the product at tablet width, screenshot)
- [x] It never covers a chart's hover tooltip or crosshair readout, and it looks right in light and dark themes (proof: screenshots of a chart hovered under the pill, both themes)
- [x] Phone is unchanged: the Plan-tab pill and the keyboard docking from bf1ba98 behave as before (proof: test for keyboardDockTop stays green; run the product at phone width)
Open: built and verified (all six checks, [evidence](evidence/stage-1/report.md)); preview after the user's go, deploy on their approval

## Stages
- [ ] 1. Docked verdict pill — desktop/tablet pill that docks when the verdict headline leaves view, live delta, back-to-verdict, both themes; preview; deploy on approval

## Decisions
- 2026-11-08 · Phone: the verdict pill stays in view while typing. `interactive-widget=resizes-content` in the viewport meta keeps the sticky top bar and pill on screen on Android; elsewhere (iOS) `useKeyboardDock` pins the pill to the top of the visual viewport while a text field is focused and the keyboard has shrunk it (≥120 px, not when pinch-zoomed), with a spacer so the form doesn't jump. Shipped outside a plan in bf1ba98 (Actions run 42524515083) — user asked for it and confirmed on their phone: "That was perfect."
- 2026-11-08 · Desktop and tablet keep the verdict in view with option A, the glass pill docked at the top of the results column, chosen from six concepts (A pill, B into the top bar, C rail header, D dot ribbon, E margin numeral, F section dock) on the [Verdict on scroll canvas](https://claude.ai/artifact/TpwbR7bfagZffwgxAaottC) — user: "Let's go with option A."
- 2026-11-08 · Survey: desktop and tablet scroll the window (the rail is its own sticky scroller; `.canvas` is in normal flow), so the pill can be `position: sticky` inside `.canvas` under the top bar, and an IntersectionObserver on the hero's number decides when it shows; it reuses `VerdictPill`'s ring and tone pieces rather than a second implementation. The canvas's numbers and rail stepper were illustrative only — builder's call, from the survey.
- 2026-11-08 · One stage: the work is one component plus CSS, reviewable in one sitting; scale check didn't fire — PM's call.
- 2026-11-08 · The docked pill steps aside for charts rather than layering under their readouts: readouts live inside each card (not portalled), so they can't sit above a sticky pill, and putting the pill under the cards would hide it whenever a card scrolls beneath. While the pointer is over, or focus is in, a chart plot that reaches into the pill's band, the pill fades out and goes inert/aria-hidden — builder's call, verified.
- 2026-11-08 · Tablet with the plan drawer open: the pill is portalled above the drawer's backdrop, centred in the strip of outlook beside the 440px panel, shown whatever the scroll (the backdrop hides the verdict), ring + number only below 900px; clicking it closes the drawer and goes to the verdict. It's outside the drawer's focus trap (pointer only there) — verify found the first version hidden under the drawer; PM's call.
- 2026-11-08 · Focus rule: whenever the pill goes away while it holds focus (verdict scrolled back into view, or stepping aside for a chart), focus moves to the verdict headline. Decided from `document.activeElement` at that moment, not a focus flag, because the pill re-mounts without a blur when it moves into or out of the drawer portal — from verify (D2, D3, D5).

## Open questions
- The shared Sheet restores focus to its opener on close; when the opener has re-mounted elsewhere (the docked pill when the drawer opens by browser Back/Forward while it holds focus), focus lands on `<body>`. Fall back when the restore target is disconnected — from the stage 1 verify, later.
- Profile the Atlas slowdown on CI: since the opening-sale change (9e306b7) the success-only kernel loop runs ~30–50% slower on GitHub's runner (2.7–3.4 s vs 1.8–2.3 s for 80 cities), while locally only the first, cold run is slower. Suspects ruled out: the import, the per-path start values, the opening-sale call itself and the `initialLoan` expression. The CI budget was raised from 2500 to 3500 ms meanwhile — next plan.
- A plan that fails at once draws its fan y-axis as "$1 $1 $1 $0 $0 $0" (all-zero data), and the sale warning can say "$3.0M sold" on a $3.0M portfolio from rounding (pre-existing / cosmetic; from the stage 2 re-check) — later.
- The LTV caption reads "peaks at 100%" when the median path breaks, because broken paths are recorded with LTV 1 (pre-existing; deferred from the round 2 review) — later.
- Plans opened from a share link replace the recipient's own plan, including any existing loan balance, without a flag in the UI (`OPENED_FROM_LINK` exists); pre-existing for every input — from the stage review, later.
- Seoul, London, Amsterdam and Berlin have no `localTaxes.ts` entry (money logic, needs tests) — user's call, a later plan.
- Recheck Colorado Amendment 87 (Denver tax 5 → 4 if certified) and Florida Amendment 3 ("unofficial results" in four Florida profiles) once certified — later.
- The photo credit cleaner misses "upload on <date>" suffixes — later.
- Region chip rows (list and map) use `role="toolbar"` without arrow-key navigation; fix both or drop the role. The list chips also read region from context while the list reads it as a prop (consistent today) — deferred from the stage 2 review, later.

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
