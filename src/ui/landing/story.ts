// The landing hero's four-beat story (variation A): one illustrative Buy-Borrow-Die plan, told as
// Buy / Borrow / Live anywhere / Die, St. Louis to Bangkok. Pure and computed once at module load;
// the card only renders it. Numbers are illustrative (docs/research/landing-hero/brief.md), not
// engine output, except Bangkok's spending, which follows the app's cost data for the two cities.
//
// Series are plain arrays indexed by year t = 0..30 (ages 60..90) so the card can draw any prefix
// of them (render at time t).

import { CITY_BY_ID } from '../../data/cities'
import { categoryRatios } from '../../engine/cost'
import { currencyCompact } from '../format'
import { CITIES as MAP_CITIES, HOME as MAP_HOME } from './atlasCard'

/* ---------- Assumptions (the brief) ---------- */

export const START_AGE = 60
export const YEARS = 30
export const END_AGE = START_AGE + YEARS
export const PORTFOLIO = 2_500_000
export const BASIS = 1_000_000
export const GROWTH = 0.07
export const LOAN_RATE = 0.06
export const INFLATION = 0.03
/** The lender calls when the loan exceeds this share of the portfolio. */
export const MARGIN_LTV = 0.5
export const HOME_ID = 'st-louis'
export const DEST_ID = 'bangkok'
/** St. Louis spending, today's USD a year. */
export const HOME_SPEND = 80_000

/* ---------- Spending ---------- */

/**
 * Destination spending for a home-city amount: home × the cost-of-living ratio between the two
 * cities from the app's cost model (`categoryRatios` over `src/data/cities.ts`; its `col` ratio is
 * the one it applies to transport, utilities and other). Raw ratio, no expat premium: the story
 * compares costs of living, not one user's budget mix.
 */
export function destinationSpend(homeSpend: number, homeId = HOME_ID, destId = DEST_ID): number {
  const home = CITY_BY_ID[homeId]
  const dest = CITY_BY_ID[destId]
  if (!home || !dest) throw new Error(`story: unknown city ${!home ? homeId : destId}`)
  return homeSpend * categoryRatios(home, dest, 0).other
}

/** Bangkok spending, today's USD a year (~$47K). */
export const DEST_SPEND = destinationSpend(HOME_SPEND)

/* ---------- Odds (illustrative, as on the landing map) ---------- */

const mapPct = (name: string) => {
  const c = MAP_CITIES.find((m) => m.name === name)
  if (!c) throw new Error(`story: ${name} is not on the landing map`)
  return c.pct
}

/** Bangkok's illustrative odds, read from today's landing map (93%). */
export const DEST_ODDS = mapPct('Bangkok')
/**
 * St. Louis isn't on the map. Its figure is the map's home city at the same $80K a year (Austin,
 * 63%, band 2 on the 80 / 65 / 45 / 35 bands): same spending, same illustrative plan.
 */
export const HOME_ODDS = mapPct(MAP_HOME)

/* ---------- Series ---------- */

export interface CitySeries {
  /** Ages START_AGE..END_AGE, one per year (31 entries). */
  age: number[]
  portfolio: number[]
  /** What you paid (constant). */
  basis: number[]
  /** Unrealised gains: portfolio − basis. */
  gains: number[]
  loan: number[]
  /** The portfolio share at which the lender calls: MARGIN_LTV × portfolio. */
  marginCall: number[]
  /** What heirs keep after the estate repays the loan: portfolio − loan. */
  heirs: number[]
}

/** The portfolio at year t: $2.5M growing 7% a year. */
export const portfolioAt = (t: number) => PORTFOLIO * Math.pow(1 + GROWTH, t)

/**
 * Loan by year: loan[0] = 0, loan[t+1] = (loan[t] + spend·1.03^t)·1.06. Each year's spending is
 * drawn at the start of the year (inflating 3%) and the 6% interest is added to the loan.
 */
export function loanSeries(spend: number, years = YEARS): number[] {
  const out = [0]
  for (let t = 0; t < years; t++) out.push((out[t] + spend * Math.pow(1 + INFLATION, t)) * (1 + LOAN_RATE))
  return out
}

export function citySeries(spend: number): CitySeries {
  const age: number[] = []
  const portfolio: number[] = []
  for (let t = 0; t <= YEARS; t++) {
    age.push(START_AGE + t)
    portfolio.push(portfolioAt(t))
  }
  const loan = loanSeries(spend)
  return {
    age,
    portfolio,
    basis: portfolio.map(() => BASIS),
    gains: portfolio.map((p) => Math.max(0, p - BASIS)),
    loan,
    marginCall: portfolio.map((p) => p * MARGIN_LTV),
    heirs: portfolio.map((p, t) => p - loan[t]),
  }
}

export interface StoryCity {
  id: string
  name: string
  /** Today's USD a year. */
  spend: number
  /** Illustrative % of futures that hold. */
  odds: number
  series: CitySeries
  /** Figures at 90. */
  atEnd: { portfolio: number; loan: number; heirs: number; marginCall: number; gains: number }
}

function storyCity(id: string, spend: number, odds: number): StoryCity {
  const series = citySeries(spend)
  return {
    id,
    name: CITY_BY_ID[id].name,
    spend,
    odds,
    series,
    atEnd: {
      portfolio: series.portfolio[YEARS],
      loan: series.loan[YEARS],
      heirs: series.heirs[YEARS],
      marginCall: series.marginCall[YEARS],
      gains: series.gains[YEARS],
    },
  }
}

export const HOME: StoryCity = storyCity(HOME_ID, HOME_SPEND, HOME_ODDS)
export const DEST: StoryCity = storyCity(DEST_ID, DEST_SPEND, DEST_ODDS)

/* ---------- Copy ---------- */

/** "$2.5M", "$19.0M", "$47K", "$80K": one decimal for millions, none for thousands. */
export function money(v: number): string {
  return currencyCompact(v, { digits: Math.abs(v) >= 1e6 ? 1 : 0 })
}
export const pct = (n: number) => `${Math.round(n)}%`

export type BeatId = 'buy' | 'borrow' | 'live' | 'die'
export interface Beat {
  id: BeatId
  /** Step number as shown, "01".."04". */
  n: string
  /** Step-button title. */
  title: string
  /** Step-button copy (today's steps row, verbatim). */
  body: string
  /** Caption shown under the chart during this beat. */
  lead: string
  detail: string
}

const H = HOME.name
const D = DEST.name

export const BEATS: readonly Beat[] = [
  {
    id: 'buy',
    n: '01',
    title: 'Buy',
    body: 'Hold assets that grow. Never sell them, so the gains are never taxed.',
    lead: 'Buy, and hold.',
    detail: `A ${money(PORTFOLIO)} portfolio of shares. You paid ${money(BASIS)}; the other ${money(PORTFOLIO - BASIS)} is gains, taxed only if you sell. So you never sell.`,
  },
  {
    id: 'borrow',
    n: '02',
    title: 'Borrow',
    body: 'Live on a line of credit secured by the portfolio. The loan grows; so, usually, do the shares.',
    lead: 'Borrow for living money.',
    detail: `Each year a credit line pays your ${money(HOME.spend)}. The shares stay untouched and keep compounding, while the loan grows with interest.`,
  },
  {
    id: 'live',
    n: '03',
    title: 'Live anywhere',
    body: 'Spend the loan where life costs less. A smaller loan gives the portfolio an easier race to win.',
    lead: 'Spend it where life costs less.',
    detail: `The same life in ${D} costs ${money(DEST.spend)}, not ${money(HOME.spend)}. The loan grows slower, the gap widens, and the odds rise from ${pct(HOME.odds)} to ${pct(DEST.odds)}.`,
  },
  {
    id: 'die',
    n: '04',
    title: 'Die',
    body: 'Heirs inherit at a stepped-up basis. The estate repays the loan and keeps the rest.',
    lead: 'Gains never taxed. Loan repaid. The rest is theirs.',
    detail: `At death, heirs inherit at a stepped-up basis. The estate repays the ${money(DEST.atEnd.loan)} loan from the top; ${money(DEST.atEnd.heirs)} passes on.`,
  },
]

export const COPY = {
  eyebrow: 'One plan · four beats',
  sub: `${money(PORTFOLIO)} portfolio · ${YEARS} years, age ${START_AGE} to ${END_AGE}`,
  /** The odds badge: "93%" + "of futures hold in Bangkok". */
  oddsUnit: (city: StoryCity) => `of futures hold in ${city.name}`,
  /** Map pins: "St. Louis 63%". */
  pin: (city: StoryCity) => ({ name: city.name, odds: pct(city.odds) }),
  /** Spending chips on the map and by the person: "$80K/yr". */
  spendChip: (city: StoryCity) => `${money(city.spend)}/yr`,
  personChip: money(HOME.spend),
  axis: {
    /** y ticks in $M. */
    yTicks: [5_000_000, 10_000_000, 15_000_000, 20_000_000].map((v) => ({ value: v, label: `$${v / 1e6}M` })),
    xTicks: [
      { t: 0, label: `Age ${START_AGE}` },
      { t: YEARS / 2, label: `${START_AGE + YEARS / 2}` },
      { t: YEARS, label: `${END_AGE}` },
    ],
  },
  key: {
    /** Before the step-up: the gains so far, e.g. "Gains $1.5M · taxed only if you sell". */
    gains: (gains: number) => `Gains ${money(gains)} · taxed only if you sell`,
    gainsStepped: 'Step-up in basis: the gains tax is gone',
    paid: `What you paid ${money(BASIS)}`,
    loanBorrow: 'Credit line · shares untouched',
    loanHome: `Loan, living in ${H}`,
    loanDest: `Loan, living in ${D}`,
    ghost: `Same life in ${H}`,
    margin: `Margin call at ${pct(MARGIN_LTV * 100)}`,
  },
  estate: {
    top: `At ${END_AGE} · ${money(DEST.atEnd.portfolio)}`,
    loanLabel: 'Loan repaid',
    loan: money(DEST.atEnd.loan),
    heirsLabel: 'Heirs',
    heirs: money(DEST.atEnd.heirs),
  },
  keyLabel: 'Key',
  note: 'Illustrative numbers · a typical path, not a forecast',
  controls: {
    play: 'Play the four beats',
    pause: 'Pause the four beats',
    replay: 'Replay from the start',
    paused: 'Paused.',
    playing: 'Playing.',
  },
  stepsLabel: 'How it works, step through the four beats',
  /** aria-live text when a step is chosen. */
  announce: (i: number) => `Step ${i + 1} of ${BEATS.length}. ${BEATS[i].lead} ${BEATS[i].detail}`,
  /** The SVG's accessible name for the resting (Die) frame. */
  svgLabel:
    `Illustrative ${YEARS}-year plan. A ${money(PORTFOLIO)} portfolio grows to ${money(DEST.atEnd.portfolio)} while a credit line pays the living costs. ` +
    `Moving from ${H} to ${D} cuts the yearly draw from ${money(HOME.spend)} to ${money(DEST.spend)}, so the loan ends at ${money(DEST.atEnd.loan)} instead of ${money(HOME.atEnd.loan)}, ` +
    `below the margin-call line, and the odds the plan holds rise from ${pct(HOME.odds)} to ${pct(DEST.odds)}. ` +
    `At death the gains tax is wiped out by the step-up in basis, the estate repays the loan, and heirs keep ${money(DEST.atEnd.heirs)}.`,
} as const
