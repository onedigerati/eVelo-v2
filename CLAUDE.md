# eVelo v2

Buy-Borrow-Die retirement planner. Static site: React 19 + Vite + TypeScript, hand-built SVG charts (d3-scale/shape/geo), simulation in a Web Worker.

## Commands
- `npm run dev` — dev server
- `npm test` — vitest (engine tests in `src/engine/__tests__`)
- `npm run typecheck` / `npm run build`
- `npm run data:refresh` — refetch market data (Yahoo monthly adjusted closes + FRED CPI) into `src/data/market.json`, derive `src/data/market-index.json`, refresh `src/data/fx.json`
- `npm run e2e` — build, then a smoke test of the built app in headless Chromium (Playwright; `e2e/smoke.mjs`). Stage verifications drive the app with `playwright` the same way.
- `npm run lighthouse [-- '#atlas']` — build, then Lighthouse on the built app with Playwright's Chromium; reports in `lighthouse/` (git-ignored)
- Headless Chromium needs `npx playwright install chromium` once per machine, and on WSL/Linux its system libraries: `sudo env "PATH=$PATH" npx playwright install-deps chromium`
- `npm run data:index` — rebuild the UI index from market.json (a test checks they match)

## Layout
- `src/engine/` — pure TS simulation (no DOM). `types.ts` is the contract with the UI.
- `src/data/` — bundled market data, city cost-of-living data
- `src/ui/` — React components; `src/styles/` — design tokens + global CSS
- `docs/PLAN.md` — project plan
