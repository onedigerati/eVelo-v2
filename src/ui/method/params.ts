// Every number the Method page quotes, read from the code that uses it (engine constants,
// defaults, the bundled data), so the explainer cannot drift from the model.

import { CITIES, CITY_BY_ID, COL_AS_OF } from "../../data/cities";
import fxJson from "../../data/fx.json";
import { categoryRatios } from "../../engine/cost";
import { DEFAULT_INPUTS } from "../../engine/defaults";
import {
  BOND_PREMIUM,
  COMMODITY_PREMIUM,
  CRYPTO_PREMIUM,
  PRIOR_BETA_MAX,
  PRIOR_BETA_MIN,
  RF_ANNUAL,
  priorMonthly,
  shrinkWeight,
} from "../../engine/prepare";
import { T_DF } from "../../engine/scenarios";
import { SOLVE_MAX_PATHS } from "../../engine/solve";
import type { AssetClass, Outlook } from "../../engine/types";
import { SOLVE_TARGET } from "../../state/sim";
import { marketIndex } from "../plan/marketIndex";
import { VERDICT_THRESHOLDS } from "../verdict";

const ym = (s: string) => {
  const [y, m] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};
const day = (s: string) =>
  new Date(`${s}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/* ---------------------------------------------------------------- Data */

const endIndex = marketIndex.months - 1;
const [sy, sm] = marketIndex.start.split("-").map(Number);
const endDate = new Date(Date.UTC(sy, sm - 1 + endIndex, 1));

export const DATA = {
  tickers: marketIndex.assets.length,
  start: ym(marketIndex.start),
  end: endDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  months: marketIndex.months,
  years: Math.floor(marketIndex.months / 12),
  marketAsOf: day(marketIndex.asOf),
  fxAsOf: day((fxJson as { asOf: string }).asOf),
  cities: CITIES.length,
  colAsOf: ym(COL_AS_OF),
  /** Assets with less than the full calendar of real history (need a backfill). */
  backfilled: marketIndex.assets.filter((a) => a.first > 0).length,
  nvdaYears: Math.floor(
    marketIndex.assets.find((a) => a.symbol === "NVDA")?.years ?? 27,
  ),
  youngest: [...marketIndex.assets]
    .sort((a, b) => a.years - b.years)
    .slice(0, 3)
    .map((a) => a.symbol),
};

/* ---------------------------------------------------------------- Defaults */

export const DEF = {
  loanRate: DEFAULT_INPUTS.loanRate,
  maxLtv: DEFAULT_INPUTS.maxLtv,
  targetLtv: DEFAULT_INPUTS.targetLtvAfterCall,
  capGains: DEFAULT_INPUTS.capGainsRate,
  dividendDrag: DEFAULT_INPUTS.dividendTaxDrag,
  blockMonths: DEFAULT_INPUTS.blockMonths,
  paths: DEFAULT_INPUTS.paths,
  expat: DEFAULT_INPUTS.expatFactor,
  incomeStartAge: DEFAULT_INPUTS.incomeStartAge,
  tDf: T_DF,
  solvePaths: SOLVE_MAX_PATHS,
  solveTarget: SOLVE_TARGET,
  thresholds: VERDICT_THRESHOLDS,
};

/* ---------------------------------------------------------------- Priors + shrinkage */

const OUTLOOKS: Exclude<Outlook, "historical">[] = ["balanced", "conservative"];
/** Equity risk premium per outlook, recovered from the prior of a beta-1 equity fund. */
const erp = (o: Outlook) => priorMonthly("etf-equity", 1, o) * 12 - RF_ANNUAL;

export const PRIOR = {
  rf: RF_ANNUAL,
  erp: Object.fromEntries(OUTLOOKS.map((o) => [o, erp(o)])) as Record<
    (typeof OUTLOOKS)[number],
    number
  >,
  bond: BOND_PREMIUM,
  commodity: COMMODITY_PREMIUM,
  crypto: CRYPTO_PREMIUM,
  betaMin: PRIOR_BETA_MIN,
  betaMax: PRIOR_BETA_MAX,
};

export const SHRINK_CLASSES: { cls: AssetClass; label: string }[] = [
  { cls: "stock", label: "Single stocks" },
  { cls: "etf-equity", label: "Stock funds" },
  { cls: "etf-bond", label: "Bond funds" },
  { cls: "crypto", label: "Crypto" },
];

/** k recovered from w = n / (n + k) at n = 1 year (below every cap). */
const kOf = (o: Outlook) => {
  const w = shrinkWeight("etf-equity", 1, o);
  return Math.round((1 - w) / w);
};

export const SHRINK_TABLE = OUTLOOKS.map((o) => ({
  outlook: o,
  k: kOf(o),
  caps: SHRINK_CLASSES.map(({ cls }) => shrinkWeight(cls, 1e9, o)),
  /** Weight on history for an asset with the full calendar of real data. */
  full: SHRINK_CLASSES.map(({ cls }) => shrinkWeight(cls, DATA.months / 12, o)),
}));

/** History weight vs years of history (for the curve diagram). */
export function weightCurve(
  cls: AssetClass,
  o: Outlook,
  maxYears = 40,
  step = 0.5,
): [number, number][] {
  const out: [number, number][] = [];
  for (let n = 0; n <= maxYears + 1e-9; n += step)
    out.push([n, shrinkWeight(cls, n, o)]);
  return out;
}

/* ---------------------------------------------------------------- Living abroad example */

const home = CITY_BY_ID[DEFAULT_INPUTS.homeCityId];
const dest =
  CITY_BY_ID[DEFAULT_INPUTS.destCityId ?? "bangkok"] ??
  CITIES.find((c) => c.id !== home.id)!;
const raw = categoryRatios(home, dest, 0);
const eff = categoryRatios(home, dest, DEFAULT_INPUTS.expatFactor);

export const ABROAD = {
  home: home.name,
  dest: dest.name,
  currency: dest.currency,
  fxVol: dest.fxVol,
  healthcare: dest.healthcare / home.healthcare,
  rows: (["housing", "groceries", "dining", "healthcare"] as const).map(
    (c) => ({ c, raw: raw[c], eff: eff[c] }),
  ),
};
