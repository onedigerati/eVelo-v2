# Shared brief: eVelo home-page hero mockups

eVelo (repo /home/jonah/repos/eVelo-v2) is a Buy-Borrow-Die retirement planner. Its landing page
(src/ui/landing/LandingView.tsx, landing.css, atlasCard.ts — read them) has a hero: headline
"Live off your portfolio without ever selling it.", and a map card showing one illustrative plan's
odds city by city (Lisbon 88% vs Austin 63%), plus four steps: Buy / Borrow / Live anywhere / Die.
The user likes it, and wants a slick, clever, dynamic illustration that makes the MECHANISM click:
buy-borrow-die together with geographic arbitrage (spend the loan where life costs less).

The core picture: a race between two lines. The portfolio compounds. The loan grows with
interest plus each year's spending. The gap is what heirs inherit. Moving somewhere cheaper
shrinks the yearly draw, so the loan grows slower and stays further from the margin-call line.
At death, the step-up in basis wipes out the tax on the gains; the estate repays the loan, heirs keep the rest.

## Illustrative numbers (use these so all variations agree; label "Illustrative numbers")
- Portfolio $2.5M, cost basis $1.0M (so $1.5M of unrealized gains at the start), grows 7%/yr nominal.
- Credit line rate 6%/yr, interest capitalises (added to the loan).
- Spending: Austin $80k/yr; Lisbon $50k/yr (~38% less). Other cities if you need them:
  New York $118k, Medellín $42k, Chiang Mai $36k, London $96k. Spending inflates 3%/yr.
- Horizon 30 years (retire at 60, age 90 at death).
- Margin call: lender calls when the loan exceeds 50% of the portfolio value.
- Odds shown (illustrative, from the existing card): Austin 63%, Lisbon 88%, New York 38%,
  Medellín 92%, Chiang Mai 95%, London 52%.
- Selling instead (if you show it): each year's spending is raised by selling shares, paying
  20% tax on the gain share of each sale.
Compute the curves yourself from these in JS; keep shapes plausible. It is a median path, a
"typical" future; don't claim more precision than that.

## Output contract (important: your file is concatenated into one review page)
Write ONE file: /tmp/claude-1000/-home-jonah-repos-eVelo-v2/3c08a814-f0f1-49de-90db-03242311ada8/scratchpad/mockups/var-<letter>.html
containing exactly, in order:
1. `<section class="mk-var" id="var-<letter>" aria-labelledby="var-<letter>-title">` with a
   `<div class="mk-var__head">` holding: `<p class="mk-eyebrow">Variation <LETTER></p>`,
   `<h2 id="var-<letter>-title">Name</h2>`, a one-sentence `<p>` on what it is, and a
   `<div class="mk-var__notes">` with 2-3 `<span><b>Label</b> text</span>` notes (e.g. Best for, Cost to build, Risk).
2. Then the mockup itself: a stage that reads like the real hero (headline + copy on one side, the
   visual on the other, or whatever the concept needs), at hero size on desktop.
3. A `<style>` block where EVERY selector is prefixed with `.v<letter>` (e.g. `.va .stage`), so it
   cannot leak. Use only the CSS custom properties defined in shell-head.html (read it): --bg, --ink,
   --ink-2, --ink-3, --card, --card-solid, --card-line, --card-shadow, --hairline, --holds, --holds-text,
   --holds-soft, --bruised, --broken, --ramp-0..4, --loan, --loan-soft, --band-1/2, --grid, --axis,
   --font-display/ui/mono, --focus. No literal colours (so light and dark both work).
4. A `<script>` that is a single IIFE, touching only elements inside its own section (query from
   `document.getElementById('var-<letter>')`). No globals, no libraries, no network.
Do NOT add <title>, <html>, <head>, <body>, fonts or tokens — the shell provides those.
Wrap the stage root in an element with class `v<letter>`.

## Quality bar
- Hand-built inline SVG (like the real app), crisp, to scale, and genuinely slick: eased motion,
  one orchestrated moment rather than scattered effects. Tone for "Die" is dignified, never morbid.
- Complete at rest: the first still frame (before/without animation) must already read well.
- prefers-reduced-motion: no movement; show the final/most-informative frame with controls still usable.
- Play/pause or replay control where it autoplays; animation only runs while in view (IntersectionObserver).
- Works at 390px phone width (stacks), no horizontal page scroll, text never clipped.
- Accessible: real buttons with labels, an aria-live or text description of what each beat shows, SVG role="img" with aria-label.
- Copy: plain, short, active voice; no em-dash asides; no lorem.

## Check your work
Build a preview by concatenating: shell-head.html + your var file into
scratchpad/mockups/preview-<letter>.html wrapped in `<main class="mk-wrap">…</main>`, and if you can, take
desktop and 390px screenshots in light and dark (e.g. `npx -y playwright@1.57.0 screenshot ...` or a
small node script with playwright; Chromium is cached in ~/.cache/ms-playwright; emulate dark via
colorScheme). Fix what you see. Don't spend forever: one or two passes. Also confirm no JS errors.
Do not touch the repo. Reply with: the file path, a 3-line description of what it does, and anything you're unsure about.
