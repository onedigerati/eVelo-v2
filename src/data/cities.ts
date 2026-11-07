// City cost-of-living dataset.
//
// Indices are Numbeo-style, relative to New York City = 100. Cities listed in
// VERIFIED (below) were checked against Numbeo's current city index on
// COL_AS_OF and carry a `verified` record; every other city is a rounded,
// rough estimate. Healthcare factors, FX volatilities and notes are planning
// approximations, not quotes and not tax advice. Every value is
// user-overridable in the UI.

import type { City, CityVerification } from '../engine/types'
import { localTaxFor } from './localTaxes'

/** Date the verified cities' indices were read from their source (ISO). */
export const COL_AS_OF = '2026-11-06'

export const COL_SOURCES: string[] = [
  'Cost indices (col excl. rent, rent, groceries, restaurants; NYC = 100): for verified cities (the 25 expat picks, US cities with a full Numbeo row and the 20 BBD destinations added in Stage 3), Numbeo\'s current cost-of-living index by city, read 2026-11-06, rounded, and cross-checked against Numbeo\'s 2026 Mid-Year edition and livingcost.org. Places without a Numbeo index are marked low confidence and either derived from Numbeo\'s raw prices vs New York or mapped to a nearby city row; each record\'s note says which. Eleven picks added later (Madrid, Tbilisi, Phuket, Santiago, Prague, Istanbul, Mexico City, Budapest, Taipei, Lima, Playa del Carmen) are low confidence, derived from livingcost.org prices vs New York and scaled to Numbeo with per-index factors fitted on four cities that have Numbeo rows. The fifteen Stage 7 additions are low confidence too: livingcost.org by the same method, or a stated mapping to a nearby row where it has no page. Rome, Barcelona and Cartagena are low confidence by the same livingcost.org method. Every other city is a rough estimate modeled on the same kind of index, not checked against a current source.',
  'Healthcare factor (US = 1.0): midpoint of local private or public cover and an international plan (Cigna Global / Allianz, age 60) plus estimated out-of-pocket costs for a couple at 60, relative to a 2026 US benchmark-silver marketplace plan for a couple at 60 (~$35.9k/yr including ~$4k out-of-pocket). Sources: KFF 2026 average marketplace premiums, plus insurer and broker quotes; rounded to 0.05. Checked for the 16 countries of the expat picks and set on the same basis for Cyprus, Malta, Montenegro, Belize, the Dominican Republic, Paraguay and Guatemala, and in Stage 7 for Mauritius, Bulgaria, Albania, Honduras and Austria (docs/research/cost-check-2026-11.md); other countries are rough estimates. City overrides add cost where hospitals are far or evacuation cover is needed.',
  'FX volatility: rough annualized volatility of the real exchange rate vs USD based on recent multi-year history; 0 for USD-using economies, near 0 for hard pegs (AED).',
  'FX_FALLBACK: src/data/fx.json rates (2026-11-07) rounded, used only for a currency missing from the bundled and live rates.',
  'Notes summarize widely reported tax-residency and visa features as of late 2026. Rules change often; verify with a qualified cross-border tax adviser. Not tax or legal advice.',
]

/** Caveats that apply to every non-US destination; shown once rather than repeated per city. */
export const EXPAT_CAVEATS: string[] = [
  'US citizens and green-card holders remain subject to US tax on worldwide income wherever they live, and must file FBAR/FATCA reports on foreign accounts. The foreign earned income exclusion does not cover investment income.',
  'Medicare generally does not cover care received outside the US; budget for private coverage abroad.',
  'Some US brokerages restrict or close accounts with a foreign address, and securities-backed lines of credit may be unavailable to non-residents. Confirm with your custodian and lender before relying on Buy-Borrow-Die from abroad.',
  'Leaving a high-tax state may require clearly ending state residency; some states (e.g. California, New York) audit departures closely.',
  'Tax treaties, local wealth/inheritance taxes and estate rules can interact with the US step-up in basis. Not tax advice.',
]

/** Units of currency per 1 USD: src/data/fx.json (2026-11-07) rounded to 3–4 figures. */
export const FX_FALLBACK: Record<string, number> = {
  USD: 1,
  EUR: 0.8961,
  GBP: 0.7477,
  CHF: 0.8199,
  CZK: 21.78,
  HUF: 325.5,
  GEL: 2.595,
  TRY: 50.18,
  AED: 3.6725,
  JPY: 158.4,
  KRW: 1360,
  TWD: 32.84,
  SGD: 1.282,
  THB: 33.55,
  MYR: 4.057,
  VND: 25600,
  IDR: 18100,
  PHP: 63.08,
  MXN: 18.66,
  COP: 3240,
  CRC: 454.3,
  UYU: 40.27,
  ARS: 1550,
  CLP: 974.3,
  PEN: 3.435,
  CAD: 1.41,
  AUD: 1.455,
  NZD: 1.804,
  ZAR: 16.51,
  BZD: 2,
  DOP: 60.52,
  PYG: 6110,
  GTQ: 7.651,
  MUR: 46.99,
  ALL: 80.99,
  HNL: 26.91,
}

type Idx = [col: number, rent: number, groceries: number, restaurants: number]
type Base = Pick<City, 'country' | 'countryCode' | 'region' | 'currency' | 'fxVol' | 'healthcare'> & {
  /** Country-level notes appended to every city in that country. */
  notes?: string[]
}

function mk(
  base: Base,
  id: string,
  name: string,
  lat: number,
  lon: number,
  [col, rent, groceries, restaurants]: Idx,
  cityNotes: string[] = [],
  overrides: Partial<Pick<City, 'healthcare'>> = {},
): City {
  const { notes: baseNotes = [], ...rest } = base
  const notes = [...cityNotes, ...baseNotes].slice(0, 3)
  return {
    id,
    name,
    ...rest,
    ...overrides,
    lat,
    lon,
    idx: { col, rent, groceries, restaurants },
    ...(notes.length ? { notes } : {}),
  }
}

// ---------------------------------------------------------------- United States

const US: Base = {
  country: 'United States',
  countryCode: 'US',
  region: 'North America',
  currency: 'USD',
  fxVol: 0,
  healthcare: 1,
}

const NO_STATE_TAX = (state: string) => `${state} has no state personal income tax.`
const FL = [NO_STATE_TAX('Florida'), 'Homestead exemption and Save Our Homes cap limit property-tax growth on a primary residence.']
const TX = [NO_STATE_TAX('Texas'), 'Property taxes are relatively high; homestead exemptions apply.']
const CA = ['California taxes capital gains as ordinary income at rates up to 13.3%+, which matters if you ever sell instead of borrow.']

const usCities: City[] = [
  mk(US, 'new-york', 'New York City', 40.71, -74.01, [100, 100, 100, 100], ['New York State plus NYC income tax are among the highest combined rates in the US.']),
  mk(US, 'san-francisco', 'San Francisco', 37.77, -122.42, [92, 79, 95, 104], CA),
  mk(US, 'los-angeles', 'Los Angeles', 34.05, -118.24, [85, 63, 79, 101], CA),
  mk(US, 'san-diego', 'San Diego', 32.72, -117.16, [83, 72, 82, 97], CA),
  mk(US, 'seattle', 'Seattle', 47.61, -122.33, [86, 59, 91, 90], [
    'Washington has no tax on wages, but levies an excise tax on large long-term capital gains above an annual threshold — check current rates.',
  ]),
  mk(US, 'portland', 'Portland, OR', 45.52, -122.68, [83, 44, 95, 85], ['Oregon has no sales tax but high income-tax rates, plus local Portland-area income taxes.']),
  mk(US, 'denver', 'Denver', 39.74, -104.99, [75, 42, 81, 78]),
  mk(US, 'austin', 'Austin', 30.27, -97.74, [69, 44, 69, 80], TX),
  mk(US, 'dallas', 'Dallas', 32.78, -96.8, [73, 43, 72, 83], TX),
  mk(US, 'houston', 'Houston', 29.76, -95.37, [62, 38, 63, 72], TX),
  mk(US, 'phoenix', 'Phoenix', 33.45, -112.07, [72, 37, 73, 80], ['Arizona has a low flat income tax and does not tax Social Security.']),
  mk(US, 'scottsdale', 'Scottsdale', 33.49, -111.93, [72, 52, 72, 76], ['Arizona has a low flat income tax and does not tax Social Security.']),
  mk(US, 'las-vegas', 'Las Vegas', 36.17, -115.14, [70, 33, 66, 92], [NO_STATE_TAX('Nevada')]),
  mk(US, 'chicago', 'Chicago', 41.88, -87.63, [73, 52, 76, 80], [
    'Illinois exempts Social Security and most retirement-plan income, but taxes investment income at its flat rate; property taxes are high.',
  ]),
  mk(US, 'minneapolis', 'Minneapolis', 44.98, -93.27, [72, 37, 80, 80], ['Minnesota has relatively high income-tax rates.']),
  mk(US, 'kansas-city', 'Kansas City', 39.1, -94.58, [66, 29, 66, 83], [
    'Missouri exempts Social Security from state income tax (from 2024) and enacted an individual capital-gains subtraction starting 2025 — check current rules.',
  ]),
  mk(US, 'st-louis', 'St. Louis', 38.63, -90.2, [71, 25, 84, 70], [
    'Missouri exempts Social Security from state income tax (from 2024) and enacted an individual capital-gains subtraction starting 2025 — check current rules.',
    'The City of St. Louis levies a 1% earnings tax on wages of residents (not on investment income).',
  ]),
  mk(US, 'nashville', 'Nashville', 36.16, -86.78, [71, 45, 72, 78], [NO_STATE_TAX('Tennessee') + ' (the Hall tax on investment income was repealed in 2021).']),
  mk(US, 'atlanta', 'Atlanta', 33.75, -84.39, [75, 39, 75, 95], ['Georgia offers a sizable retirement-income exclusion for residents 62+ and does not tax Social Security.']),
  mk(US, 'charlotte', 'Charlotte', 35.23, -80.84, [69, 38, 74, 71]),
  mk(US, 'raleigh', 'Raleigh', 35.78, -78.64, [66, 34, 71, 80]),
  mk(US, 'asheville', 'Asheville', 35.6, -82.55, [68, 40, 70, 70]),
  mk(US, 'tampa', 'Tampa', 27.95, -82.46, [68, 46, 70, 76], FL),
  mk(US, 'miami', 'Miami', 25.76, -80.19, [83, 66, 84, 103], [FL[0], 'Homeowners and flood insurance costs have risen sharply in South Florida.']),
  mk(US, 'orlando', 'Orlando', 28.54, -81.38, [68, 40, 72, 79], FL),
  mk(US, 'sarasota', 'Sarasota', 27.34, -82.53, [72, 50, 74, 72], FL),
  mk(US, 'boston', 'Boston', 42.36, -71.06, [88, 71, 89, 98], ['Massachusetts adds a 4% surtax on annual income above roughly $1M, including capital gains.']),
  mk(US, 'washington-dc', 'Washington, DC', 38.91, -77.04, [85, 64, 88, 90]),
  mk(US, 'philadelphia', 'Philadelphia', 39.95, -75.17, [77, 45, 78, 82], ['Pennsylvania does not tax Social Security or most retirement income; Philadelphia also levies a wage tax.']),
  mk(US, 'pittsburgh', 'Pittsburgh', 40.44, -80.0, [67, 32, 72, 67], ['Pennsylvania does not tax Social Security or most retirement income.']),
  mk(US, 'honolulu', 'Honolulu', 21.31, -157.86, [103, 55, 119, 118], ['Hawaii has high income-tax rates but excludes Social Security and most employer pensions.']),
  mk(US, 'boise', 'Boise', 43.62, -116.2, [66, 33, 70, 73]),
  mk(US, 'salt-lake-city', 'Salt Lake City', 40.76, -111.89, [64, 35, 65, 68]),
]

// ---------------------------------------------------------------- Asia

const TH: Base = {
  country: 'Thailand', countryCode: 'TH', region: 'Asia', currency: 'THB', fxVol: 0.07, healthcare: 0.3,
  notes: [
    'Since 2024, foreign income brought into Thailand in a year you are tax resident (180+ days) may be taxable; guidance is still evolving — check current rules.',
    'Retirement visas (Non-O / O-A) require age 50+ and proof of funds or income; O-A also requires health insurance.',
  ],
}
const MY: Base = {
  country: 'Malaysia', countryCode: 'MY', region: 'Asia', currency: 'MYR', fxVol: 0.07, healthcare: 0.3,
  notes: [
    'Foreign-sourced income received by individuals is currently exempt from Malaysian tax under a time-limited exemption — check current rules.',
    'The MM2H long-stay program was relaunched with tiered, higher deposit requirements.',
  ],
}
const VN: Base = {
  country: 'Vietnam', countryCode: 'VN', region: 'Asia', currency: 'VND', fxVol: 0.04, healthcare: 0.3,
  notes: [
    'Vietnam tax residents are taxed on worldwide income.',
    'There is no dedicated retirement visa; long stays typically rely on renewable e-visas — check current rules.',
  ],
}
const ID: Base = {
  country: 'Indonesia', countryCode: 'ID', region: 'Asia', currency: 'IDR', fxVol: 0.09, healthcare: 0.35,
  notes: [
    'Indonesia offers retirement and "second home" stay permits with age and funds requirements — check current rules.',
    'Residents are generally taxed on worldwide income, with some exemptions for qualifying foreigners — check current rules.',
  ],
}
const PH: Base = {
  country: 'Philippines', countryCode: 'PH', region: 'Asia', currency: 'PHP', fxVol: 0.06, healthcare: 0.3,
  notes: [
    'Resident aliens are generally taxed only on Philippine-source income.',
    'The SRRV retiree visa requires a deposit with an accredited bank.',
  ],
}
const SG: Base = {
  country: 'Singapore', countryCode: 'SG', region: 'Asia', currency: 'SGD', fxVol: 0.05, healthcare: 0.7,
  notes: [
    'Singapore generally does not tax foreign-sourced income received by individuals and has no capital gains tax.',
    'There is no retirement visa: the only passive route to permanent residence (the Global Investor Programme family-office track) needs about S$200M of investible assets.',
  ],
}
const JP: Base = {
  country: 'Japan', countryCode: 'JP', region: 'Asia', currency: 'JPY', fxVol: 0.11, healthcare: 0.45,
  notes: [
    'Non-permanent residents (resident under 5 of the last 10 years) are taxed on Japan-source income plus foreign income remitted to Japan; worldwide after that.',
    'There is no general retirement visa; long-stay options for retirees are limited.',
  ],
}
const KR: Base = {
  country: 'South Korea', countryCode: 'KR', region: 'Asia', currency: 'KRW', fxVol: 0.1, healthcare: 0.4,
  notes: [
    'Korea taxes residents on worldwide income, with some relief for short-term foreign residents — check current rules.',
    'There is no general retirement visa for US citizens.',
  ],
}
const TW: Base = {
  country: 'Taiwan', countryCode: 'TW', region: 'Asia', currency: 'TWD', fxVol: 0.06, healthcare: 0.35,
  notes: [
    'Taiwan income tax is largely territorial, but overseas income above a threshold can enter the alternative minimum tax — check current rules.',
    'Residents can join the National Health Insurance after a qualifying stay.',
  ],
}

const asiaCities: City[] = [
  mk(TH, 'bangkok', 'Bangkok', 13.76, 100.5, [42, 19, 46, 30]),
  mk(TH, 'chiang-mai', 'Chiang Mai', 18.79, 98.98, [32, 11, 38, 19], ['Seasonal air pollution ("burning season", roughly Feb–Apr) is a health consideration.']),
  mk(TH, 'phuket', 'Phuket', 7.88, 98.39, [33, 17, 37, 35], [], { healthcare: 0.4 }),
  mk(TH, 'hua-hin', 'Hua Hin', 12.57, 99.96, [34, 18, 41, 23], ['Bangkok Hospital Hua Hin is the local private hospital; top-tier care is in Bangkok.']),
  mk(MY, 'kuala-lumpur', 'Kuala Lumpur', 3.14, 101.69, [37, 13, 42, 29]),
  mk(MY, 'penang', 'Penang (George Town)', 5.41, 100.33, [33, 9, 40, 24]),
  mk(VN, 'ho-chi-minh-city', 'Ho Chi Minh City', 10.82, 106.63, [32, 13, 38, 14]),
  mk(VN, 'da-nang', 'Da Nang', 16.05, 108.2, [29, 13, 32, 18]),
  mk(VN, 'hanoi', 'Hanoi', 21.03, 105.85, [31, 11, 38, 13]),
  mk(ID, 'bali', 'Bali (Denpasar / Canggu)', -8.65, 115.22, [33, 24, 41, 22], ['Canggu and Seminyak rents run well above the Denpasar average.']),
  mk(PH, 'manila', 'Manila', 14.6, 120.98, [36, 10, 44, 18]),
  mk(PH, 'cebu', 'Cebu', 10.32, 123.89, [32, 7, 40, 16]),
  mk(SG, 'singapore', 'Singapore', 1.35, 103.82, [84, 82, 82, 52]),
  mk(JP, 'tokyo', 'Tokyo', 35.68, 139.69, [62, 30, 70, 40]),
  mk(JP, 'osaka', 'Osaka', 34.69, 135.5, [56, 20, 64, 36]),
  mk(KR, 'seoul', 'Seoul', 37.57, 126.98, [70, 22, 88, 42], ['Rentals often use large "jeonse"/"wolse" deposits, which ties up capital.']),
  mk(TW, 'taipei', 'Taipei', 25.03, 121.57, [48, 18, 52, 38]),
  // Stage 7 additions.
  mk(TH, 'chiang-rai', 'Chiang Rai', 19.91, 99.83, [23, 6, 25, 13], [
    'Private hospitals in town (Bangkok Hospital Chiang Rai, Overbrook); specialists are often in Chiang Mai, about 3.5 hours away. Burning-season smoke is as bad as Chiang Mai\'s.',
  ]),
  mk(MY, 'langkawi', 'Langkawi', 6.35, 99.8, [24, 7, 27, 18], [
    'No private hospital on the island (only the public Hospital Sultanah Maliha); private care is a short flight away in Penang. A duty-free island with no US nonstops.',
  ], { healthcare: 0.35 }),
]

// ---------------------------------------------------------------- Europe

const SCHENGEN = 'US citizens are limited to 90 days in any 180 in the Schengen area without a residence visa.'

const PT: Base = {
  country: 'Portugal', countryCode: 'PT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'The NHR regime closed to new applicants in 2024; its narrower replacement (IFICI) targets certain professions and generally does not help retirees.',
    'The D7 passive-income visa is the common retiree route; residents are taxed on worldwide income.',
  ],
}
const ES: Base = {
  country: 'Spain', countryCode: 'ES', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'Tax residents (183+ days) are taxed on worldwide income and must report foreign assets (Modelo 720); regional and national wealth taxes can apply to large portfolios.',
    'The non-lucrative visa is the usual retiree route.',
  ],
}
const IT: Base = {
  country: 'Italy', countryCode: 'IT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'Residents are taxed on worldwide income and pay IVAFE on foreign financial assets.',
    'The 7% flat-tax regime for foreign pensioners applies only to small towns in southern regions, not major cities — check eligibility.',
  ],
}
const GR: Base = {
  country: 'Greece', countryCode: 'GR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'Greece offers a 7% flat tax on foreign-source income for qualifying relocating pensioners — check eligibility for US retirement income.',
    'The financially independent person (FIP) visa is the usual retiree route.',
  ],
}
const FR: Base = {
  country: 'France', countryCode: 'FR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'Residents are taxed on worldwide income, with social charges on investment income; a real-estate wealth tax (IFI) applies to large property holdings.',
    'The US–France treaty has provisions that can matter for retirees — get advice.',
  ],
}
const GB: Base = {
  country: 'United Kingdom', countryCode: 'GB', region: 'Europe', currency: 'GBP', fxVol: 0.09, healthcare: 0.45,
  notes: [
    'From April 2025 the remittance basis was replaced by a 4-year foreign-income exemption for new arrivals; worldwide taxation after that, and long-term residents can fall into UK inheritance tax.',
    'There is no retirement visa route for US citizens.',
  ],
}
const IE: Base = {
  country: 'Ireland', countryCode: 'IE', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.45,
  notes: [
    'Residents not domiciled in Ireland may be taxed on foreign income only when remitted — check current rules.',
    'Stamp 0 permission for financially independent retirees has high income requirements.',
  ],
}
const NL: Base = {
  country: 'Netherlands', countryCode: 'NL', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.5,
  notes: [
    'Box 3 taxes a deemed return on net assets; the system is being reformed — check current rules.',
    'There is no dedicated retirement visa; basic health insurance is mandatory for residents.',
  ],
}
const DE: Base = {
  country: 'Germany', countryCode: 'DE', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.5,
  notes: [
    'Residents are taxed on worldwide income.',
    'Residence for non-working retirees is discretionary and requires proof of funds and health insurance.',
  ],
}
const CZ: Base = {
  country: 'Czech Republic', countryCode: 'CZ', region: 'Europe', currency: 'CZK', fxVol: 0.11, healthcare: 0.3,
  notes: ['Residents are taxed on worldwide income.', SCHENGEN],
}
const HU: Base = {
  country: 'Hungary', countryCode: 'HU', region: 'Europe', currency: 'HUF', fxVol: 0.13, healthcare: 0.28,
  notes: ['Hungary has a flat personal income tax; residents are taxed on worldwide income.', SCHENGEN],
}
const CH: Base = {
  country: 'Switzerland', countryCode: 'CH', region: 'Europe', currency: 'CHF', fxVol: 0.09, healthcare: 0.8,
  notes: [
    'Cantons levy an annual wealth tax; lump-sum (expenditure) taxation was abolished in the canton of Zurich.',
    'Retiree residence for non-EU citizens requires substantial means and is discretionary; health insurance is mandatory.',
  ],
}
const HR: Base = {
  country: 'Croatia', countryCode: 'HR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: ['Croatia adopted the euro and joined Schengen in 2023.', 'Residents are taxed on worldwide income.'],
}
const GE: Base = {
  country: 'Georgia', countryCode: 'GE', region: 'Europe', currency: 'GEL', fxVol: 0.1, healthcare: 0.2,
  notes: [
    'Georgia taxes individuals on a largely territorial basis; foreign-source income is generally not taxed — check current rules.',
    'US citizens can stay visa-free for up to a year.',
  ],
}
const TR: Base = {
  country: 'Turkey', countryCode: 'TR', region: 'Europe', currency: 'TRY', fxVol: 0.2, healthcare: 0.25,
  notes: [
    'High inflation and lira depreciation make USD-denominated costs unpredictable.',
    'Law 7582 (2026): new residents with no Turkish residence in the prior 3 years can claim a 20-year exemption on foreign-source income (certificate needed in the first year), with inheritance tax cut to 1% meanwhile; otherwise residents are taxed on worldwide income.',
  ],
}

const CY: Base = {
  country: 'Cyprus', countryCode: 'CY', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'Non-domiciled residents pay no Special Defence Contribution on dividends and interest for 17 of 20 years, leaving only the 2.65% GeSY health levy (capped at about €4.8k a year); there is no wealth or inheritance tax and no tax on share gains.',
    'Category F permanent residence needs about €9.6k a year of secured foreign income (dividends and interest count) and gives access to the GeSY public health system.',
  ],
}
const MT: Base = {
  country: 'Malta', countryCode: 'MT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'Resident non-doms are taxed on the remittance basis: foreign income left abroad is untaxed (a €5,000 minimum tax applies once it reaches €35k) and foreign capital gains are untaxed even if remitted; no wealth or inheritance tax.',
    'The Global Residence Programme closes after 31 Dec 2026: applications filed by then keep its terms (15%, €15k minimum tax) to 2031, while the 2027 rules raise the minimum to €35k. Non-EU residents must hold private health cover.',
  ],
}
const ME: Base = {
  country: 'Montenegro', countryCode: 'ME', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'Dividends, interest and gains are taxed at 15%, plus a municipal surtax (13% in Kotor) that may not apply to capital income; no wealth tax, and inheritance tax applies only to real estate.',
    'Temporary residence by owning property assessed at €150k+ (since Jan 2026), renewed yearly; Montenegro uses the euro but is not in the EU or Schengen.',
  ],
}

const BG: Base = {
  country: 'Bulgaria', countryCode: 'BG', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.25,
  notes: [
    'Bulgaria adopted the euro on 1 Jan 2026. Residents pay a 5% final tax on dividends and 0% on EU/EEA bank interest; no wealth tax, and a foreigner\'s foreign assets are outside inheritance tax (children are exempt anyway).',
    'The pensioner D visa needs a right to a pension (Social Security should qualify); no savings-only route was found.',
  ],
}
const AL: Base = {
  country: 'Albania', countryCode: 'AL', region: 'Europe', currency: 'ALL', fxVol: 0.08, healthcare: 0.3,
  notes: [
    'Residents are taxed on worldwide income: dividends 8%, interest and gains 15%. There is no wealth tax, and children inherit tax-free.',
    'US citizens may stay a year visa-free; the pensioner permit needs about ALL 1.2m a year of pension paid into an Albanian bank.',
  ],
}
const AT: Base = {
  country: 'Austria', countryCode: 'AT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.45,
  notes: [
    'Funds not registered with Austria\'s tax office (OeKB), likely including US ETFs, are taxed every year at 27.5% on 90% of their growth, so a never-sell ETF portfolio is taxed anyway (not modelled). Dividends pay 27.5%; no wealth or inheritance tax.',
    'The settlement permit (no work) needs about €2,617/month single or €4,128 for a couple (2026), German, and a quota place.',
  ],
}

const europeCities: City[] = [
  mk(PT, 'lisbon', 'Lisbon', 38.72, -9.14, [53, 35, 48, 58]),
  mk(PT, 'porto', 'Porto', 41.16, -8.63, [49, 28, 46, 53]),
  mk(PT, 'algarve', 'Algarve (Faro)', 37.02, -7.93, [47, 30, 43, 46]),
  mk(PT, 'madeira', 'Madeira (Funchal)', 32.65, -16.91, [47, 36, 42, 55]),
  mk(ES, 'madrid', 'Madrid', 40.42, -3.7, [62, 37, 59, 71], ['The Madrid region applies a 100% relief on regional wealth tax, but the national solidarity wealth tax can still apply.']),
  mk(ES, 'barcelona', 'Barcelona', 41.39, 2.17, [59, 37, 58, 72]),
  mk(ES, 'valencia', 'Valencia', 39.47, -0.38, [50, 30, 45, 63]),
  mk(ES, 'malaga', 'Málaga', 36.72, -4.42, [49, 30, 46, 60]),
  mk(IT, 'rome', 'Rome', 41.9, 12.5, [63, 33, 60, 69]),
  mk(IT, 'florence', 'Florence', 43.77, 11.26, [68, 33, 70, 77]),
  mk(GR, 'athens', 'Athens', 37.98, 23.73, [54, 17, 51, 62]),
  mk(FR, 'paris', 'Paris', 48.86, 2.35, [78, 42, 78, 80]),
  mk(FR, 'nice', 'Nice', 43.7, 7.27, [71, 28, 77, 75]),
  mk(GB, 'london', 'London', 51.51, -0.13, [80, 72, 62, 84]),
  mk(IE, 'dublin', 'Dublin', 53.35, -6.26, [78, 62, 66, 84]),
  mk(NL, 'amsterdam', 'Amsterdam', 52.37, 4.9, [80, 56, 66, 88]),
  mk(DE, 'berlin', 'Berlin', 52.52, 13.41, [66, 36, 58, 64]),
  mk(CZ, 'prague', 'Prague', 50.08, 14.44, [52, 29, 51, 49]),
  mk(HU, 'budapest', 'Budapest', 47.5, 19.04, [56, 22, 54, 67]),
  mk(CH, 'zurich', 'Zurich', 47.38, 8.54, [125, 70, 130, 140]),
  mk(HR, 'split', 'Split', 43.51, 16.44, [54, 22, 48, 63], ['Summer tourism drives short-term rents up sharply; long-term leases are cheaper off-season.']),
  mk(GE, 'tbilisi', 'Tbilisi', 41.72, 44.79, [38, 17, 40, 42]),
  mk(GE, 'batumi', 'Batumi', 41.64, 41.63, [33, 11, 36, 37], ['Black Sea resort city with Georgia'\''s tax profile; healthcare and flights are weaker than in Tbilisi.']),
  mk(TR, 'istanbul', 'Istanbul', 41.01, 28.98, [46, 24, 40, 48]),
  // Stage 3 additions (BBD destinations).
  mk(GR, 'crete', 'Crete (Chania)', 35.51, 24.02, [53, 14, 48, 57], [
    'Serious care is in Chania or Heraklion; from 2026 ENFIA property tax is halved on main homes in small villages (Athens is excluded).',
  ]),
  mk(CY, 'paphos', 'Paphos', 34.77, 32.42, [53, 27, 48, 55], ['The more retiree-oriented and cheaper of the two Cyprus picks; both share the national regime.']),
  mk(CY, 'limassol', 'Limassol', 34.68, 33.04, [62, 36, 55, 69], ['Pricier and more business-oriented than Paphos, with the best hospitals on the island.']),
  mk(MT, 'sliema', 'Sliema', 35.91, 14.5, [61, 38, 57, 70], ['Sliema is in the full-price property tier; GRP thresholds are lower in the south of Malta and on Gozo.']),
  mk(ME, 'kotor', 'Kotor', 42.42, 18.77, [49, 19, 39, 64], ['Public healthcare is weak; serious care is in Podgorica or across the border in Dubrovnik.']),
  mk(FR, 'gascony', 'Gascony (Auch)', 43.65, 0.59, [64, 14, 71, 64], [
    'In rural Gers costs are low and the IFI real-estate wealth tax is unlikely, but specialists are sparser; the nearest major hospitals are in Toulouse.',
  ]),
  mk(ES, 'tarragona', 'Tarragona', 41.12, 1.25, [49, 19, 40, 57], [
    'Catalonia taxes wealth above only €500,000 (rates to 3.48%, no relief) and its inheritance relief for children thins out on large estates — the weakest Spanish region for a large portfolio.',
  ]),
  mk(ES, 'alicante', 'Alicante', 38.35, -0.48, [49, 24, 50, 56], [
    'Valencian Community: the wealth-tax exemption rises to €2M from 2026, with 99% inheritance relief for children. No US nonstop flights.',
  ]),
  mk(PT, 'cascais', 'Cascais', 38.7, -9.42, [51, 47, 44, 52], [
    'Hospital CUF Cascais (private) and the public Hospital de Cascais are local; Lisbon and its airport are reached by the A5 or commuter train.',
  ]),
  mk(TR, 'antalya', 'Antalya', 36.9, 30.7, [40, 13, 36, 45], [
    'Property residence needs US$200k, and some Antalya neighbourhoods are closed to first applications — check the DGMM list before buying.',
  ]),
  // Stage 7 additions.
  mk(PT, 'tavira', 'Tavira', 37.13, -7.65, [39, 28, 43, 62], [
    'No 24-hour emergency unit in town (the nearest is in Vila Real de Santo António, about 30 minutes); Hospital de Faro and the private CUF Faro are 30–40 minutes away. Faro airport has a seasonal United nonstop to Newark.',
  ]),
  mk(ES, 'torrevieja', 'Torrevieja', 37.98, -0.68, [41, 17, 47, 59], [
    'Valencian Community rules, as in Alicante (€2M wealth-tax exemption). Hospital Quirónsalud Torrevieja is JCI-accredited, and the British retiree community is large. Alicante airport is about 42 minutes away, with no US nonstops.',
  ]),
  mk(BG, 'plovdiv', 'Plovdiv', 42.14, 24.75, [35, 12, 40, 41], [
    'Eurohospital Plovdiv (private) is local; serious cases go to Sofia, about 1.5–2 hours away. No US nonstop flights from Bulgaria.',
  ]),
  mk(AL, 'sarande', 'Sarandë', 39.88, 20.0, [43, 21, 48, 53], [
    'No English-speaking hospital is listed in Sarandë; serious care is in Tirana (4–5 hours by road) or Corfu (by ferry), which are also the usual airports.',
  ], { healthcare: 0.35 }),
  mk(AT, 'vienna', 'Vienna', 48.21, 16.37, [78, 31, 76, 92], [
    'Excellent hospitals; public ÖGK self-insurance costs €565.25/month (2026) after a 6-month wait. Nonstops to New York, Washington, Boston and Chicago.',
  ]),
]

// ---------------------------------------------------------------- Middle East / Africa

const AE: Base = {
  country: 'United Arab Emirates', countryCode: 'AE', region: 'Middle East', currency: 'AED', fxVol: 0.01, healthcare: 0.5,
  notes: [
    'The UAE levies no personal income tax; the dirham is pegged to the US dollar.',
    'A retirement visa is available at 55+ subject to savings, income or property thresholds; health insurance is required.',
  ],
}
const ZA: Base = {
  country: 'South Africa', countryCode: 'ZA', region: 'Africa', currency: 'ZAR', fxVol: 0.15, healthcare: 0.35,
  notes: [
    'Residents are taxed on worldwide income; a retired-person visa requires a minimum monthly income.',
    'Personal security and power-supply reliability are practical considerations.',
    'Death counts as a sale: CGT is due on gains accrued while resident, and leaving triggers an exit tax on the same gains. Neither is modelled here (estate duty is).',
  ],
}
const MU: Base = {
  country: 'Mauritius', countryCode: 'MU', region: 'Africa', currency: 'MUR', fxVol: 0.07, healthcare: 0.35,
  notes: [
    'Foreign income is taxed only when remitted, and there is no capital gains, wealth or inheritance tax; US dividends left in the US account and margin draws spent by card are likely untaxed locally (an inference: document what you transfer).',
    'The Retired Non-Citizen permit (age 50+, 10 years) needs about US$2,000/month transferred in (older sources say US$1,500). Cyclone season runs November–May.',
  ],
}

const meAfricaCities: City[] = [
  mk(AE, 'dubai', 'Dubai', 25.2, 55.27, [62, 52, 56, 62]),
  mk(ZA, 'cape-town', 'Cape Town', -33.92, 18.42, [40, 18, 36, 34]),
  // Stage 7 addition.
  mk(MU, 'grand-baie', 'Grand Baie', -20.01, 57.58, [36, 15, 35, 37], [
    'C-Care Grand Baie is local; the larger private hospitals (C-Care Wellkin, Darné) are about 45–60 minutes away, and complex cases often go to South Africa or France. No US nonstop flights.',
  ]),
]

// ---------------------------------------------------------------- Latin America

const MX: Base = {
  country: 'Mexico', countryCode: 'MX', region: 'Latin America', currency: 'MXN', fxVol: 0.13, healthcare: 0.25,
  notes: [
    'Mexico taxes its tax residents on worldwide income; holding a residence visa does not by itself make you tax resident — get advice.',
    'Temporary/permanent residency via financial solvency is the usual retiree route; thresholds are tied to the minimum wage and rise yearly.',
  ],
}
const CO: Base = {
  country: 'Colombia', countryCode: 'CO', region: 'Latin America', currency: 'COP', fxVol: 0.15, healthcare: 0.25,
  notes: [
    'Residents (183+ days) are taxed on worldwide income, and a wealth tax applies above a high net-worth threshold.',
    'The pensioner (M) visa requires a minimum monthly pension.',
  ],
}
const PA: Base = {
  country: 'Panama', countryCode: 'PA', region: 'Latin America', currency: 'USD', fxVol: 0, healthcare: 0.25,
  notes: [
    'Panama uses the US dollar and taxes on a territorial basis; foreign-source income is generally not taxed.',
    'The Pensionado visa requires a lifetime pension (around $1,000/month) and brings local discounts.',
  ],
}
const CR: Base = {
  country: 'Costa Rica', countryCode: 'CR', region: 'Latin America', currency: 'CRC', fxVol: 0.08, healthcare: 0.25,
  notes: [
    'Costa Rica is traditionally territorial, but the treatment of foreign passive income has been contested recently — check current rules.',
    'Pensionado residency requires a minimum pension (around $1,000/month); residents must join the CCSS ("Caja") public health system.',
  ],
}
const EC: Base = {
  country: 'Ecuador', countryCode: 'EC', region: 'Latin America', currency: 'USD', fxVol: 0, healthcare: 0.25,
  notes: [
    'Ecuador uses the US dollar; residents are generally taxed on worldwide income — check current rules.',
    'The retiree (jubilado) visa requires a minimum lifetime pension.',
  ],
}
const UY: Base = {
  country: 'Uruguay', countryCode: 'UY', region: 'Latin America', currency: 'UYU', fxVol: 0.1, healthcare: 0.25,
  notes: [
    'New tax residents can elect a multi-year holiday on foreign-source passive income; after that some foreign investment income is taxed at a low flat rate — check current rules.',
  ],
}
const AR: Base = {
  country: 'Argentina', countryCode: 'AR', region: 'Latin America', currency: 'ARS', fxVol: 0.25, healthcare: 0.3,
  notes: [
    'The peso is highly volatile; USD-denominated costs have swung widely as currency controls were eased.',
    'Residents are taxed on worldwide income, and a personal assets (wealth) tax applies — check current rules.',
  ],
}
const CL: Base = {
  country: 'Chile', countryCode: 'CL', region: 'Latin America', currency: 'CLP', fxVol: 0.13, healthcare: 0.35,
  notes: [
    'Foreign residents are generally taxed only on Chilean-source income for their first three years, then on worldwide income — check current rules.',
  ],
}
const PE: Base = {
  country: 'Peru', countryCode: 'PE', region: 'Latin America', currency: 'PEN', fxVol: 0.07, healthcare: 0.3,
  notes: [
    'Residents (183+ days) are taxed on worldwide income.',
    'The rentista visa requires a minimum pension or passive income.',
  ],
}

const BZ: Base = {
  country: 'Belize', countryCode: 'BZ', region: 'Latin America', currency: 'BZD', fxVol: 0.01, healthcare: 0.35,
  notes: [
    'The Qualified Retired Persons (QRP) program (age 40+, US$2,000/month of foreign income; investment accounts qualify) exempts all foreign-source income from Belizean tax. The Belize dollar is pegged 2:1 to the US dollar.',
    'Healthcare is weak: serious cases go to Belize City, then by air to Mérida, Guatemala City or Miami. Budget international cover with medical evacuation.',
  ],
}
const DO: Base = {
  country: 'Dominican Republic', countryCode: 'DO', region: 'Latin America', currency: 'DOP', fxVol: 0.06, healthcare: 0.3,
  notes: [
    'Taxation is territorial, but foreign investment income is taxed after a resident\'s third year; Law 171-07 exempts the declared income of rentista and pensionado residents (confirm it covers dividends above that amount). Inheritance tax is 3%.',
    'The rentista visa needs US$2,000/month of stable foreign income (pensionado US$1,500).',
  ],
}
const PY: Base = {
  country: 'Paraguay', countryCode: 'PY', region: 'Latin America', currency: 'PYG', fxVol: 0.07, healthcare: 0.3,
  notes: [
    'Personal income tax applies only to Paraguayan-source income, so foreign dividends and interest appear untaxed (confirm locally); there is no wealth or inheritance tax.',
    'Temporary residence (up to 2 years) leads to permanent residence; no means test is published.',
  ],
}
const GT: Base = {
  country: 'Guatemala', countryCode: 'GT', region: 'Latin America', currency: 'GTQ', fxVol: 0.02, healthcare: 0.3,
  notes: [
    'Guatemala taxes only Guatemalan-source income, and repealed its inheritance and gift tax from April 2026 (Decreto 6-2026); there is no wealth tax.',
    'Rentista/pensionado permanent residence needs US$1,250/month of foreign income (+US$300 per dependent). The public IGSS system does not cover retirees: budget private or international cover with evacuation.',
  ],
}

const HN: Base = {
  country: 'Honduras', countryCode: 'HN', region: 'Latin America', currency: 'HNL', fxVol: 0.03, healthcare: 0.3,
  notes: [
    'Honduras taxes on a territorial basis, so US dividends are untaxed, and there is no wealth or inheritance tax. A worldwide-income bill failed in May 2025 but could return.',
    'Rentista residence needs US$2,500/month of stable foreign income (pensionado US$1,500).',
  ],
}

const latamCities: City[] = [
  mk(MX, 'mexico-city', 'Mexico City', 19.43, -99.13, [49, 28, 51, 49], ['Altitude (~2,240 m) can matter for some health conditions.']),
  mk(MX, 'merida', 'Mérida', 20.97, -89.62, [42, 14, 42, 48]),
  mk(MX, 'puerto-vallarta', 'Puerto Vallarta', 20.65, -105.23, [46, 23, 49, 53]),
  mk(MX, 'san-miguel-de-allende', 'San Miguel de Allende', 20.91, -100.74, [48, 23, 54, 52]),
  mk(MX, 'playa-del-carmen', 'Playa del Carmen', 20.63, -87.08, [45, 24, 49, 50]),
  mk(CO, 'medellin', 'Medellín', 6.24, -75.58, [43, 21, 44, 38]),
  mk(CO, 'cartagena', 'Cartagena', 10.39, -75.48, [41, 23, 41, 45]),
  mk(CO, 'bogota', 'Bogotá', 4.71, -74.07, [30, 11, 30, 22], ['Altitude (~2,600 m) can matter for some health conditions.']),
  mk(PA, 'panama-city', 'Panama City', 8.98, -79.52, [49, 28, 55, 47]),
  mk(PA, 'boquete', 'Boquete', 8.78, -82.43, [42, 18, 52, 30]),
  mk(CR, 'san-jose-cr', 'San José', 9.93, -84.09, [58, 25, 65, 56]),
  mk(EC, 'cuenca', 'Cuenca', -2.9, -79.0, [30, 11, 34, 28]),
  mk(UY, 'montevideo', 'Montevideo', -34.9, -56.16, [55, 16, 52, 64]),
  mk(AR, 'buenos-aires', 'Buenos Aires', -34.6, -58.38, [44, 12, 38, 40]),
  mk(CL, 'santiago', 'Santiago', -33.45, -70.67, [47, 16, 44, 52]),
  mk(PE, 'lima', 'Lima', -12.05, -77.04, [41, 17, 34, 25]),
  // Stage 3 additions (BBD destinations).
  mk(MX, 'lake-chapala', 'Lake Chapala / Ajijic', 20.3, -103.26, [35, 19, 38, 39], [
    'Mexico\'s largest US-retiree enclave; local clinics only, with serious care and wide US nonstop service in Guadalajara, about 55 km north.',
  ]),
  mk(MX, 'oaxaca', 'Oaxaca', 17.07, -96.73, [36, 14, 41, 40], [
    'No JCI hospital in the city (private: Hospital Ángeles, Centro Médico de Oaxaca); severe cases may need transfer to Puebla or Mexico City. Altitude ~1,555 m.',
  ], { healthcare: 0.3 }),
  mk(PA, 'coronado', 'Coronado', 8.53, -79.89, [47, 23, 55, 44], [
    'About 4,000 expats; local private clinics, with serious care (e.g. Hospital Punta Pacífica) in Panama City, 1–1.5 hours away.',
  ]),
  mk(CR, 'atenas', 'Atenas', 9.98, -84.38, [55, 20, 65, 50], [
    'A 24-hour clinic in town; Hospital CIMA and Clínica Bíblica are under an hour away, and SJO airport about 30–45 minutes.',
  ]),
  mk(BZ, 'cayo', 'Cayo (San Ignacio)', 17.16, -89.07, [50, 10, 56, 30], [
    'San Ignacio has a community hospital, with the private La Loma Luz in Santa Elena and the regional hospital in Belmopan.',
  ]),
  mk(BZ, 'ambergris-caye', 'Ambergris Caye (San Pedro)', 17.92, -87.96, [61, 27, 88, 36], [
    'San Pedro has clinics but no hospital; anything more means a boat or flight to the mainland, and medevac can cost US$10,000+.',
  ], { healthcare: 0.4 }),
  mk(BZ, 'placencia', 'Placencia', 16.51, -88.37, [56, 19, 72, 33], [
    'A public polyclinic (opened 2024, billed as 24-hour, though a night-time visit later found it unstaffed); the nearest hospital is the public Southern Regional in Dangriga, about 1¼–1¾ hours by road. Private hospitals are in Belize City, 3½ hours by road or a short flight from the airstrip.',
    'Tropic Air and Maya Island Air fly from the Placencia airstrip to Belize City\'s international airport many times a day; it has year-round US nonstops to Atlanta, Dallas, Houston, Los Angeles and Miami.',
    'A low, exposed peninsula: Hurricane Iris (2001) damaged about 95% of the village\'s buildings. Hurricane season runs June–November.',
  ], { healthcare: 0.4 }),
  mk(DO, 'las-terrenas', 'Las Terrenas', 19.31, -69.54, [42, 16, 40, 46], [
    'Private clinics only; complex cases go to Santo Domingo or Santiago, 2–3 hours by road or by helicopter.',
  ], { healthcare: 0.35 }),
  mk(PY, 'asuncion', 'Asunción', -25.26, -57.58, [32, 11, 32, 33], ['Healthcare was not researched; Asunción is the realistic base for private care in Paraguay.']),
  // Stage 7 additions.
  mk(MX, 'la-paz', 'La Paz (Baja California Sur)', 24.14, -110.31, [46, 17, 50, 58], [
    'Private Hospital Fidepaz and The Medical Centre are local, with some specialist care in Guadalajara. The US rates Baja California Sur Level 2; the only US nonstop is to Los Angeles. Hurricane-exposed.',
  ]),
  mk(MX, 'mazatlan', 'Mazatlán', 23.24, -106.41, [43, 16, 46, 45], [
    'The US rates Sinaloa Level 4 "Do Not Travel", Mazatlán included (the UK exempts the city). Private hospitals locally (e.g. Hospital Marina Mazatlán); several US nonstops.',
  ]),
  mk(BZ, 'hopkins', 'Hopkins', 16.86, -88.28, [56, 15, 72, 33], [
    'A small Garifuna village with a public clinic; the public Southern Regional Hospital in Dangriga is about 30 minutes away, and private care is in Belize City, about 2.5 hours. Hurricane-exposed.',
  ]),
  mk(BZ, 'corozal', 'Corozal', 18.39, -88.39, [50, 10, 50, 30], [
    'Corozal Community Hospital is in town, and private care is in Chetumal, Mexico, about 26 minutes across the border. US flights leave from Belize City, about 2 hours by road. Hurricane-exposed.',
  ]),
  mk(PA, 'volcan', 'Volcán', 8.77, -82.63, [40, 14, 52, 27], [
    'Only a basic emergency hospital; private hospitals are in David, 40 minutes to an hour away, and specialist care means flying to Panama City. Highland climate (about 1,400 m) below Volcán Barú.',
  ]),
  mk(HN, 'roatan', 'Roatán', 16.32, -86.54, [43, 20, 42, 36], [
    'The island\'s only public hospital burned in April 2024 and private care is very limited; serious cases fly to San Pedro Sula or the US, so budget evacuation cover. Nonstops to Miami, Dallas, Atlanta and Houston.',
  ], { healthcare: 0.4 }),
  mk(GT, 'panajachel', 'Lake Atitlán (Panajachel)', 14.74, -91.16, [38, 10, 44, 37], [
    'No hospital in Panajachel (a 24-hour public health centre and private clinics; the public Sololá hospital is about 20 minutes uphill); specialist care is about 3 hours away in Guatemala City. The US rates Guatemala Level 3.',
  ], { healthcare: 0.35 }),
  mk(GT, 'antigua-guatemala', 'Antigua Guatemala', 14.56, -90.73, [39, 19, 45, 42], [
    'Hospital Privado Hermano Pedro (24/7) is local; serious-care hospitals and the airport are in Guatemala City, about an hour away. Volcanic risk (Fuego).',
  ]),
]

// ---------------------------------------------------------------- Canada

const CAN: Base = {
  country: 'Canada', countryCode: 'CA', region: 'North America', currency: 'CAD', fxVol: 0.07, healthcare: 0.45,
  notes: [
    'Canada taxes residents on worldwide income; there is no retirement visa, and US visitors are generally limited to six months.',
    'Provincial health coverage is only for residents; visitors need private insurance.',
  ],
}

const canadaCities: City[] = [
  mk(CAN, 'toronto', 'Toronto', 43.65, -79.38, [72, 52, 74, 68]),
  mk(CAN, 'vancouver', 'Vancouver', 49.28, -123.12, [74, 58, 76, 70]),
  mk(CAN, 'montreal', 'Montréal', 45.5, -73.57, [66, 36, 70, 62], ['Quebec has its own provincial income tax return and French-language requirements.']),
]

// ---------------------------------------------------------------- Oceania

const AU: Base = {
  country: 'Australia', countryCode: 'AU', region: 'Oceania', currency: 'AUD', fxVol: 0.11, healthcare: 0.45,
  notes: [
    'Australia closed its investor retirement visa to new applicants; retiree options are now very limited.',
    'Temporary residents are generally not taxed on foreign income — check current rules.',
  ],
}
const NZ: Base = {
  country: 'New Zealand', countryCode: 'NZ', region: 'Oceania', currency: 'NZD', fxVol: 0.11, healthcare: 0.4,
  notes: [
    'New tax residents may get a four-year transitional exemption on most foreign income.',
    'Retiree visas require substantial investment and funds — check current rules.',
  ],
}

const oceaniaCities: City[] = [
  mk(AU, 'sydney', 'Sydney', -33.87, 151.21, [80, 56, 84, 70]),
  mk(AU, 'melbourne', 'Melbourne', -37.81, 144.96, [76, 46, 82, 70]),
  mk(NZ, 'auckland', 'Auckland', -36.85, 174.76, [74, 42, 78, 72]),
]

// ---------------------------------------------------------------- Verification

const NUMBEO = 'Numbeo current city index'
const NUMBEO_TABLE = 'https://www.numbeo.com/cost-of-living/rankings_current.jsp'

type V = Partial<Omit<CityVerification, 'asOf'>>
const v = (o: V = {}): CityVerification => ({ source: NUMBEO, url: NUMBEO_TABLE, asOf: COL_AS_OF, confidence: 'high', ...o })

/** A low-confidence record priced from livingcost.org (`page` is the path after /cost/). */
const livingcost = (page: string): CityVerification =>
  v({
    source: 'livingcost.org',
    url: `https://livingcost.org/cost/${page}`,
    confidence: 'low',
    note: 'Derived from livingcost.org prices vs New York, scaled to Numbeo with factors fitted on Lisbon, Athens, Bangkok and Montevideo; Numbeo was rate-limiting.',
  })

/** Cities whose indices were checked against a current published source (see COL_SOURCES). */
const VERIFIED: Record<string, CityVerification> = {
  // The 25 expat picks.
  algarve: v({ note: 'Mapped to Numbeo\'s Faro row; Lagos and Albufeira have no index of their own.' }),
  boquete: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Boquete',
    confidence: 'low',
    note: 'Thin data: 9 Numbeo contributors and no city index. Rent and restaurants are derived from Numbeo\'s raw prices vs NYC; col and groceries are kept from the earlier estimate.',
  }),
  'panama-city': v(),
  lisbon: v(),
  valencia: v(),
  malaga: v(),
  'san-jose-cr': v(),
  'puerto-vallarta': v(),
  athens: v(),
  'kuala-lumpur': v(),
  penang: v({ note: 'Uses Numbeo\'s "Penang, Malaysia" row (the table\'s "George Town" is in the Cayman Islands).' }),
  'chiang-mai': v(),
  merida: v(),
  'san-miguel-de-allende': v(),
  porto: v(),
  medellin: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Medellin',
    note: 'Two Numbeo editions disagree (current col 46.5 vs 2026 Mid-Year 39.1; livingcost.org sides with the lower); values average the two editions.',
  }),
  cuenca: v(),
  madeira: v({ note: 'Mapped to Numbeo\'s Funchal row.' }),
  'da-nang': v(),
  montevideo: v(),
  nice: v(),
  florence: v(),
  bangkok: v(),
  split: v(),
  bali: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Bali',
    note: 'Uses Numbeo\'s "Bali, Indonesia" row, which reflects expat areas such as Canggu and Seminyak; rent is set between that row and Ubud. Denpasar proper is much cheaper.',
  }),
  // Stage 3 additions. Rows in Numbeo's current table are high confidence; the rest are low, with the method noted.
  // "Derived" means: Numbeo's raw prices for the place vs New York, priced through a fixed basket per index
  // (groceries, restaurants, and those two plus transport, utilities, leisure and clothing for col), then scaled by
  // a per-index factor fitted on 16 cities that have both a page and a table row (mean error 2–6% per index).
  crete: v({ note: 'Uses Numbeo\'s Chania row.' }),
  'hua-hin': v(),
  paphos: v(),
  limassol: v(),
  sliema: v(),
  alicante: v(),
  asuncion: v(),
  antalya: v(),
  cascais: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Cascais',
    confidence: 'low',
    note: 'Not in Numbeo\'s table (14 contributors). Col and rent are the page\'s own index figures (48.7% and 53.4% below New York); groceries and restaurants are derived from its raw prices vs NYC.',
  }),
  tarragona: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Tarragona',
    confidence: 'low',
    note: 'No Numbeo index (33 contributors in 18 months, some prices estimated by Numbeo); all four values derived from its raw prices vs NYC.',
  }),
  gascony: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Toulouse',
    confidence: 'low',
    note: 'Numbeo has no page for Auch or Gers. Mapped to Numbeo\'s Toulouse row (67/19/71/71) adjusted down for a rural market town: rent -25%, col -5%, restaurants -10%, groceries unchanged. A judgment adjustment, not measured.',
  }),
  'lake-chapala': v({
    url: 'https://www.numbeo.com/cost-of-living/in/Ajijic',
    confidence: 'low',
    note: 'No Numbeo index for Ajijic (26 contributors in 18 months, some prices estimated by Numbeo); derived from its raw prices vs NYC. Numbeo has no Chapala page.',
  }),
  'antigua-guatemala': v({
    url: 'https://www.numbeo.com/cost-of-living/in/Antigua-Guatemala',
    confidence: 'low',
    note: 'No Numbeo index (30 contributors in 18 months, some prices estimated by Numbeo); derived from its raw prices vs NYC.',
  }),
  'ambergris-caye': v({
    url: 'https://www.numbeo.com/cost-of-living/in/San-Pedro-Belize',
    confidence: 'low',
    note: 'Very thin: Numbeo\'s San Pedro page has 13 entries from 1 contributor (Mar 2026) and no index; derived from those raw prices vs NYC, with col built from the items present. Treat as rough.',
  }),
  'las-terrenas': v({
    url: 'https://www.numbeo.com/cost-of-living/in/Santo-Domingo',
    confidence: 'low',
    note: 'Numbeo has no Las Terrenas page. Mapped to Numbeo\'s Santo Domingo row (39/14/37/40) adjusted up for an expat beach town with imported goods: col +8%, rent +15%, groceries +10%, restaurants +15%. A judgment adjustment, not measured.',
  }),
  kotor: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Budva',
    confidence: 'low',
    note: 'Numbeo has a Kotor page but it could not be read (rate-limited). Mapped unadjusted to Numbeo\'s Budva row (a similar coastal resort about 20 km away).',
  }),
  oaxaca: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Guadalajara',
    confidence: 'low',
    note: 'Numbeo\'s Oaxaca page could not be read (rate-limited) and Oaxaca has no table row. Mapped to Numbeo\'s Guadalajara row (41/18/43/47) adjusted down for a smaller, cheaper city: col -10%, rent -20%, groceries -5%, restaurants -15%. A judgment adjustment.',
  }),
  coronado: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Panama-City',
    confidence: 'low',
    note: 'Numbeo\'s Coronado page could not be read (rate-limited) and it has no index. Mapped to Numbeo\'s Panama City row (49/28/55/47) adjusted: rent -20%, col -3%, restaurants -5%, groceries unchanged. A judgment adjustment.',
  }),
  atenas: v({
    confidence: 'low',
    note: 'Numbeo\'s Atenas page could not be read (rate-limited) and it has no index. Mapped to the San José, Costa Rica table row (58/25/65/56) adjusted: rent -20%, col -5%, restaurants -10%, groceries unchanged. A judgment adjustment.',
  }),
  cayo: v({
    url: 'https://www.numbeo.com/cost-of-living/in/Belmopan',
    confidence: 'low',
    note: 'Numbeo\'s San Ignacio page could not be read (rate-limited). Derived from Numbeo\'s raw prices for Belmopan (30 km east; 32 entries from 1 contributor, May 2025) vs NYC. Very thin; treat as rough.',
  }),
  placencia: v({
    source: 'Mapped to nearby Belize rows',
    url: 'https://www.numbeo.com/cost-of-living/in/Placencia',
    confidence: 'low',
    note: 'No usable source: Numbeo\'s Placencia page returned HTTP 429 and livingcost.org has no Placencia page. Set to the midpoint of the Cayo (50/10/56/30) and Ambergris Caye (61/27/88/36) rows, rounded half up: a beach village dearer than inland Cayo but supplied by road, unlike the island. A judgment mapping, not measured.',
  }),
  // Stage 5: picks newly in the top 50, priced from livingcost.org because Numbeo was rate-limiting (HTTP 429).
  // See docs/research/cost-check-2026-11.md, Stage 5.
  ...Object.fromEntries(
    (
      [
        ['madrid', 'spain/madrid'],
        ['tbilisi', 'georgia/tbilisi'],
        ['phuket', 'thailand/phuket'],
        ['santiago', 'chile/santiago'],
        ['prague', 'czech-republic/prague'],
        ['istanbul', 'turkey/istanbul'],
        ['mexico-city', 'mexico/mexico'],
        ['budapest', 'hungary/budapest'],
        ['taipei', 'taiwan/taipei'],
        ['lima', 'peru/lima'],
        ['playa-del-carmen', 'mexico/playa-del-carmen'],
      ] as const
    ).map(([id, page]) => [id, livingcost(page)]),
  ),
  // Stage 7: new cities. Numbeo returned HTTP 429, so these use the Stage 5 livingcost.org method, or a stated
  // mapping where livingcost.org has no page. See docs/research/cost-check-2026-11.md, Stage 7.
  ...Object.fromEntries(
    (
      [
        ['tavira', 'portugal/tavira'],
        ['torrevieja', 'spain/torrevieja'],
        ['la-paz', 'mexico/la-paz'],
        ['mazatlan', 'mexico/mazatlan'],
        ['chiang-rai', 'thailand/chiang-rai'],
        ['langkawi', 'malaysia/langkawi'],
        ['panajachel', 'guatemala/panajachel'],
        ['plovdiv', 'bulgaria/plovdiv'],
        ['sarande', 'albania/sarande'],
        ['vienna', 'austria/vienna'],
      ] as const
    ).map(([id, page]) => [id, livingcost(page)]),
  ),
  'grand-baie': v({
    source: 'livingcost.org (mapped)',
    url: 'https://livingcost.org/cost/mauritius/port-louis',
    confidence: 'low',
    note: 'livingcost.org has no Grand Baie page (404) and Numbeo returned HTTP 429. Port Louis priced by the Stage 5 livingcost method (34/12/35/32), then adjusted for a resort town with an expat rental market: col +5%, rent +25%, restaurants +15%, groceries unchanged. A judgment adjustment.',
  }),
  roatan: v({
    source: 'livingcost.org (mapped)',
    url: 'https://livingcost.org/cost/honduras/tegucigalpa',
    confidence: 'low',
    note: 'livingcost.org has no Roatán page (404) and Numbeo returned HTTP 429. Tegucigalpa priced by the Stage 5 livingcost method (37/10/35/29), then adjusted for an island resort with imported goods and a US-expat rental market: col +15%, rent +100%, groceries +20%, restaurants +25%. A judgment adjustment; the result is close to livingcost\'s San Pedro Town (Ambergris Caye) page at 45/20/50/37.',
  }),
  hopkins: v({
    source: 'Mapped to nearby Belize rows',
    url: 'https://livingcost.org/cost/belize',
    confidence: 'low',
    note: 'No source page: livingcost.org has no Hopkins page (its Belize page lists none) and Numbeo was rate-limiting. Mapped to the dataset\'s Placencia row (56/19/72/33) with rent -20% for a smaller, less developed beach village; other indices unchanged. A judgment mapping on a row that is itself a mapping.',
  }),
  corozal: v({
    source: 'Mapped to nearby Belize rows',
    url: 'https://livingcost.org/cost/belize',
    confidence: 'low',
    note: 'No source page: livingcost.org has no Corozal page (its Belize page lists none) and Numbeo was rate-limiting. Mapped to the dataset\'s Cayo row (50/10/56/30), an inland town of similar size, with groceries -10% for shopping in Chetumal; other indices unchanged. A judgment mapping.',
  }),
  volcan: v({
    source: 'Mapped to the Boquete row',
    url: 'https://livingcost.org/cost/panama',
    confidence: 'low',
    note: 'No source page: livingcost.org has no Volcán or Boquete page (its Panama page lists David, not either town) and Numbeo was rate-limiting. Mapped to the dataset\'s Boquete row (42/18/52/30, itself low confidence) adjusted for a smaller, less touristy highland town: col -5%, rent -20%, restaurants -10%, groceries unchanged. A judgment mapping.',
  }),
  // Ranked cities that had only rough estimates, priced by the Stage 5 livingcost.org method (Numbeo rate-limiting).
  // See docs/research/cost-check-2026-11.md, "Stage 7: four ranked cities without checked costs".
  ...Object.fromEntries(
    (
      [
        ['rome', 'italy/lz/rome'],
        ['barcelona', 'spain/barcelona'],
        ['cartagena', 'colombia/cartagena'],
        ['batumi', 'georgia/batumi'],
      ] as const
    ).map(([id, page]) => [id, livingcost(page)]),
  ),
  // US home cities with a full Numbeo row (Scottsdale, Asheville and Sarasota have none and stay estimates).
  'new-york': v({ note: 'Base city: every index is 100 by definition.' }),
  ...Object.fromEntries(
    [
      'san-francisco', 'los-angeles', 'san-diego', 'seattle', 'portland', 'denver', 'austin', 'dallas', 'houston',
      'phoenix', 'las-vegas', 'chicago', 'minneapolis', 'kansas-city', 'st-louis', 'nashville', 'atlanta',
      'charlotte', 'raleigh', 'tampa', 'miami', 'orlando', 'boston', 'washington-dc', 'philadelphia', 'pittsburgh',
      'honolulu', 'boise', 'salt-lake-city',
    ].map((id) => [id, v()]),
  ),
}

const withVerified = (c: City): City => (VERIFIED[c.id] ? { ...c, verified: VERIFIED[c.id] } : c)

/** Local wealth/inheritance tax (src/data/localTaxes.ts): a city override (Spain's regions) or the
 *  country entry. US cities, and countries without researched data, get none. */
const withLocalTax = (c: City): City => {
  const localTax = c.countryCode === 'US' ? undefined : localTaxFor(c.id, c.countryCode)
  return localTax ? { ...c, localTax } : c
}

export const CITIES: City[] = [
  ...usCities,
  ...canadaCities,
  ...latamCities,
  ...europeCities,
  ...asiaCities,
  ...meAfricaCities,
  ...oceaniaCities,
]
  .map(withVerified)
  .map(withLocalTax)

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]))
