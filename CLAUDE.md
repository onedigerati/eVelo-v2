# eVelo v2

Buy-Borrow-Die retirement planner. Static site: React 19 + Vite + TypeScript, hand-built SVG charts (d3-scale/shape/geo), simulation in a Web Worker.

## Commands
- `npm run dev` — dev server
- `npm test` — vitest (engine tests in `src/engine/__tests__`)
- `npm run typecheck` / `npm run build`
- `npm run data:refresh` — refetch market data (Yahoo monthly adjusted closes + FRED CPI) into `src/data/market.json`

## Layout
- `src/engine/` — pure TS simulation (no DOM). `types.ts` is the contract with the UI.
- `src/data/` — bundled market data, city cost-of-living data
- `src/ui/` — React components; `src/styles/` — design tokens + global CSS
- `docs/PLAN.md` — project plan
