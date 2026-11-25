# Stage 3 · Live check
Deploy run: https://github.com/onedigerati/eVelo-v2/actions/runs/45556203923 (success, head b6b86fd). Live site: https://onedigerati.github.io/eVelo-v2/

`node live.mjs` against the live site, Lisbon's profile at 2560×1440, dark theme, 2026-11-24:
- at the top: sheet 2200px, three columns 663 / 762 / 597px, banner 520px, no horizontal scroll (2560 = 2560)
- after wheel-scrolling down: banner 210px, `.is-compact` on
- back at the top: banner 520px, `.is-compact` off

The live profile matches the verified build.
