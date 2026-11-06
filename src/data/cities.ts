// City cost-of-living dataset.
//
// Indices are Numbeo-style, relative to New York City = 100, and are rounded
// estimates (see COL_SOURCES). Healthcare factors, FX volatilities and notes are
// planning approximations, not quotes and not tax advice. Every value is
// user-overridable in the UI.

import type { City } from '../engine/types'

export const COL_AS_OF = '2026-11'

export const COL_SOURCES: string[] = [
  'Cost indices (col excl. rent, rent, groceries, restaurants) are rounded estimates modeled on publicly reported Numbeo-style city indices (NYC = 100), cross-checked against other public cost-of-living comparisons; they are not a direct copy of any one source.',
  'Healthcare factor: estimated private / expat health insurance premiums plus typical out-of-pocket costs for a couple aged 55–64, relative to US pre-Medicare marketplace coverage (US = 1.0).',
  'FX volatility: rough annualized volatility of the real exchange rate vs USD based on recent multi-year history; 0 for USD-using economies, near 0 for hard pegs (AED).',
  'FX_FALLBACK: approximate late-2026 spot rates, used only when live rates are unavailable.',
  'Notes summarize widely reported tax-residency and visa features as of the as-of date. Rules change often; verify with a qualified cross-border tax adviser. Not tax or legal advice.',
]

/** Caveats that apply to every non-US destination; shown once rather than repeated per city. */
export const EXPAT_CAVEATS: string[] = [
  'US citizens and green-card holders remain subject to US tax on worldwide income wherever they live, and must file FBAR/FATCA reports on foreign accounts. The foreign earned income exclusion does not cover investment income.',
  'Medicare generally does not cover care received outside the US; budget for private coverage abroad.',
  'Some US brokerages restrict or close accounts with a foreign address, and securities-backed lines of credit may be unavailable to non-residents. Confirm with your custodian and lender before relying on Buy-Borrow-Die from abroad.',
  'Leaving a high-tax state may require clearly ending state residency; some states (e.g. California, New York) audit departures closely.',
  'Tax treaties, local wealth/inheritance taxes and estate rules can interact with the US step-up in basis. Not tax advice.',
]

/** Units of currency per 1 USD, approximate late-2026 levels. */
export const FX_FALLBACK: Record<string, number> = {
  USD: 1,
  EUR: 0.87,
  GBP: 0.76,
  CHF: 0.8,
  CZK: 21.3,
  HUF: 335,
  GEL: 2.7,
  TRY: 45,
  AED: 3.6725,
  JPY: 150,
  KRW: 1400,
  TWD: 31,
  SGD: 1.3,
  THB: 32.5,
  MYR: 4.2,
  VND: 26300,
  IDR: 16600,
  PHP: 58,
  MXN: 18.6,
  COP: 3900,
  CRC: 505,
  UYU: 40,
  ARS: 1500,
  CLP: 940,
  PEN: 3.45,
  CAD: 1.39,
  AUD: 1.52,
  NZD: 1.73,
  ZAR: 17.6,
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
  mk(US, 'san-francisco', 'San Francisco', 37.77, -122.42, [92, 87, 95, 92], CA),
  mk(US, 'los-angeles', 'Los Angeles', 34.05, -118.24, [78, 66, 80, 82], CA),
  mk(US, 'san-diego', 'San Diego', 32.72, -117.16, [77, 62, 79, 78], CA),
  mk(US, 'seattle', 'Seattle', 47.61, -122.33, [86, 60, 90, 84], [
    'Washington has no tax on wages, but levies an excise tax on large long-term capital gains above an annual threshold — check current rates.',
  ]),
  mk(US, 'portland', 'Portland, OR', 45.52, -122.68, [76, 45, 78, 76], ['Oregon has no sales tax but high income-tax rates, plus local Portland-area income taxes.']),
  mk(US, 'denver', 'Denver', 39.74, -104.99, [75, 50, 74, 76]),
  mk(US, 'austin', 'Austin', 30.27, -97.74, [70, 46, 70, 74], TX),
  mk(US, 'dallas', 'Dallas', 32.78, -96.8, [70, 42, 70, 72], TX),
  mk(US, 'houston', 'Houston', 29.76, -95.37, [66, 36, 68, 68], TX),
  mk(US, 'phoenix', 'Phoenix', 33.45, -112.07, [68, 42, 68, 70], ['Arizona has a low flat income tax and does not tax Social Security.']),
  mk(US, 'scottsdale', 'Scottsdale', 33.49, -111.93, [72, 52, 72, 76], ['Arizona has a low flat income tax and does not tax Social Security.']),
  mk(US, 'las-vegas', 'Las Vegas', 36.17, -115.14, [68, 40, 70, 70], [NO_STATE_TAX('Nevada')]),
  mk(US, 'chicago', 'Chicago', 41.88, -87.63, [77, 52, 76, 78], [
    'Illinois exempts Social Security and most retirement-plan income, but taxes investment income at its flat rate; property taxes are high.',
  ]),
  mk(US, 'minneapolis', 'Minneapolis', 44.98, -93.27, [73, 42, 74, 72], ['Minnesota has relatively high income-tax rates.']),
  mk(US, 'kansas-city', 'Kansas City', 39.1, -94.58, [66, 32, 66, 66], [
    'Missouri exempts Social Security from state income tax (from 2024) and enacted an individual capital-gains subtraction starting 2025 — check current rules.',
  ]),
  mk(US, 'st-louis', 'St. Louis', 38.63, -90.2, [68, 30, 67, 66], [
    'Missouri exempts Social Security from state income tax (from 2024) and enacted an individual capital-gains subtraction starting 2025 — check current rules.',
    'The City of St. Louis levies a 1% earnings tax on wages of residents (not on investment income).',
  ]),
  mk(US, 'nashville', 'Nashville', 36.16, -86.78, [70, 45, 70, 72], [NO_STATE_TAX('Tennessee') + ' (the Hall tax on investment income was repealed in 2021).']),
  mk(US, 'atlanta', 'Atlanta', 33.75, -84.39, [72, 46, 72, 72], ['Georgia offers a sizable retirement-income exclusion for residents 62+ and does not tax Social Security.']),
  mk(US, 'charlotte', 'Charlotte', 35.23, -80.84, [68, 40, 68, 68]),
  mk(US, 'raleigh', 'Raleigh', 35.78, -78.64, [68, 40, 68, 68]),
  mk(US, 'asheville', 'Asheville', 35.6, -82.55, [68, 40, 70, 70]),
  mk(US, 'tampa', 'Tampa', 27.95, -82.46, [70, 46, 72, 70], FL),
  mk(US, 'miami', 'Miami', 25.76, -80.19, [79, 68, 80, 80], [FL[0], 'Homeowners and flood insurance costs have risen sharply in South Florida.']),
  mk(US, 'orlando', 'Orlando', 28.54, -81.38, [70, 48, 72, 70], FL),
  mk(US, 'sarasota', 'Sarasota', 27.34, -82.53, [72, 50, 74, 72], FL),
  mk(US, 'boston', 'Boston', 42.36, -71.06, [86, 75, 85, 86], ['Massachusetts adds a 4% surtax on annual income above roughly $1M, including capital gains.']),
  mk(US, 'washington-dc', 'Washington, DC', 38.91, -77.04, [86, 62, 85, 86]),
  mk(US, 'philadelphia', 'Philadelphia', 39.95, -75.17, [74, 45, 76, 74], ['Pennsylvania does not tax Social Security or most retirement income; Philadelphia also levies a wage tax.']),
  mk(US, 'pittsburgh', 'Pittsburgh', 40.44, -80.0, [68, 32, 70, 66], ['Pennsylvania does not tax Social Security or most retirement income.']),
  mk(US, 'honolulu', 'Honolulu', 21.31, -157.86, [92, 62, 110, 88], ['Hawaii has high income-tax rates but excludes Social Security and most employer pensions.']),
  mk(US, 'boise', 'Boise', 43.62, -116.2, [68, 38, 70, 66]),
  mk(US, 'salt-lake-city', 'Salt Lake City', 40.76, -111.89, [68, 38, 68, 68]),
]

// ---------------------------------------------------------------- Asia

const TH: Base = {
  country: 'Thailand', countryCode: 'TH', region: 'Asia', currency: 'THB', fxVol: 0.07, healthcare: 0.38,
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
  country: 'Indonesia', countryCode: 'ID', region: 'Asia', currency: 'IDR', fxVol: 0.09, healthcare: 0.3,
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
    'There is no retirement visa; long-term stays without employment or investment are difficult.',
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
  mk(TH, 'bangkok', 'Bangkok', 13.76, 100.5, [42, 18, 50, 22]),
  mk(TH, 'chiang-mai', 'Chiang Mai', 18.79, 98.98, [34, 9, 44, 16], ['Seasonal air pollution ("burning season", roughly Feb–Apr) is a health consideration.']),
  mk(TH, 'phuket', 'Phuket', 7.88, 98.39, [42, 18, 52, 26], [], { healthcare: 0.4 }),
  mk(MY, 'kuala-lumpur', 'Kuala Lumpur', 3.14, 101.69, [34, 12, 38, 20]),
  mk(MY, 'penang', 'Penang (George Town)', 5.41, 100.33, [32, 8, 36, 16]),
  mk(VN, 'ho-chi-minh-city', 'Ho Chi Minh City', 10.82, 106.63, [32, 13, 38, 14]),
  mk(VN, 'da-nang', 'Da Nang', 16.05, 108.2, [28, 8, 34, 12]),
  mk(VN, 'hanoi', 'Hanoi', 21.03, 105.85, [31, 11, 38, 13]),
  mk(ID, 'bali', 'Bali (Denpasar / Canggu)', -8.65, 115.22, [32, 16, 38, 16], ['Canggu and Seminyak rents run well above the Denpasar average.']),
  mk(PH, 'manila', 'Manila', 14.6, 120.98, [36, 10, 44, 18]),
  mk(PH, 'cebu', 'Cebu', 10.32, 123.89, [32, 7, 40, 16]),
  mk(SG, 'singapore', 'Singapore', 1.35, 103.82, [84, 82, 82, 52]),
  mk(JP, 'tokyo', 'Tokyo', 35.68, 139.69, [62, 30, 70, 40]),
  mk(JP, 'osaka', 'Osaka', 34.69, 135.5, [56, 20, 64, 36]),
  mk(KR, 'seoul', 'Seoul', 37.57, 126.98, [70, 22, 88, 42], ['Rentals often use large "jeonse"/"wolse" deposits, which ties up capital.']),
  mk(TW, 'taipei', 'Taipei', 25.03, 121.57, [60, 20, 72, 30]),
]

// ---------------------------------------------------------------- Europe

const SCHENGEN = 'US citizens are limited to 90 days in any 180 in the Schengen area without a residence visa.'

const PT: Base = {
  country: 'Portugal', countryCode: 'PT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'The NHR regime closed to new applicants in 2024; its narrower replacement (IFICI) targets certain professions and generally does not help retirees.',
    'The D7 passive-income visa is the common retiree route; residents are taxed on worldwide income.',
  ],
}
const ES: Base = {
  country: 'Spain', countryCode: 'ES', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'Tax residents (183+ days) are taxed on worldwide income and must report foreign assets (Modelo 720); regional and national wealth taxes can apply to large portfolios.',
    'The non-lucrative visa is the usual retiree route.',
  ],
}
const IT: Base = {
  country: 'Italy', countryCode: 'IT', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.35,
  notes: [
    'Residents are taxed on worldwide income and pay IVAFE on foreign financial assets.',
    'The 7% flat-tax regime for foreign pensioners applies only to small towns in southern regions, not major cities — check eligibility.',
  ],
}
const GR: Base = {
  country: 'Greece', countryCode: 'GR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
  notes: [
    'Greece offers a 7% flat tax on foreign-source income for qualifying relocating pensioners — check eligibility for US retirement income.',
    'The financially independent person (FIP) visa is the usual retiree route.',
  ],
}
const FR: Base = {
  country: 'France', countryCode: 'FR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.4,
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
  country: 'Croatia', countryCode: 'HR', region: 'Europe', currency: 'EUR', fxVol: 0.09, healthcare: 0.3,
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
    'Residents are generally taxed on worldwide income — check current rules.',
  ],
}

const europeCities: City[] = [
  mk(PT, 'lisbon', 'Lisbon', 38.72, -9.14, [50, 35, 42, 42]),
  mk(PT, 'porto', 'Porto', 41.16, -8.63, [45, 26, 40, 36]),
  mk(PT, 'algarve', 'Algarve (Faro)', 37.02, -7.93, [46, 26, 42, 40]),
  mk(PT, 'madeira', 'Madeira (Funchal)', 32.65, -16.91, [44, 24, 42, 36]),
  mk(ES, 'madrid', 'Madrid', 40.42, -3.7, [55, 34, 46, 50], ['The Madrid region applies a 100% relief on regional wealth tax, but the national solidarity wealth tax can still apply.']),
  mk(ES, 'barcelona', 'Barcelona', 41.39, 2.17, [58, 38, 48, 54]),
  mk(ES, 'valencia', 'Valencia', 39.47, -0.38, [49, 27, 44, 44]),
  mk(ES, 'malaga', 'Málaga', 36.72, -4.42, [50, 30, 45, 46]),
  mk(IT, 'rome', 'Rome', 41.9, 12.5, [64, 30, 56, 64]),
  mk(IT, 'florence', 'Florence', 43.77, 11.26, [64, 30, 58, 64]),
  mk(GR, 'athens', 'Athens', 37.98, 23.73, [52, 17, 50, 46]),
  mk(FR, 'paris', 'Paris', 48.86, 2.35, [78, 42, 78, 80]),
  mk(FR, 'nice', 'Nice', 43.7, 7.27, [72, 34, 76, 74]),
  mk(GB, 'london', 'London', 51.51, -0.13, [80, 72, 62, 84]),
  mk(IE, 'dublin', 'Dublin', 53.35, -6.26, [78, 62, 66, 84]),
  mk(NL, 'amsterdam', 'Amsterdam', 52.37, 4.9, [80, 56, 66, 88]),
  mk(DE, 'berlin', 'Berlin', 52.52, 13.41, [66, 36, 58, 64]),
  mk(CZ, 'prague', 'Prague', 50.08, 14.44, [52, 24, 48, 42]),
  mk(HU, 'budapest', 'Budapest', 47.5, 19.04, [46, 18, 44, 36]),
  mk(CH, 'zurich', 'Zurich', 47.38, 8.54, [125, 70, 130, 140]),
  mk(HR, 'split', 'Split', 43.51, 16.44, [52, 20, 50, 50], ['Summer tourism drives short-term rents up sharply; long-term leases are cheaper off-season.']),
  mk(GE, 'tbilisi', 'Tbilisi', 41.72, 44.79, [32, 14, 34, 30]),
  mk(TR, 'istanbul', 'Istanbul', 41.01, 28.98, [38, 14, 36, 30]),
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
  ],
}

const meAfricaCities: City[] = [
  mk(AE, 'dubai', 'Dubai', 25.2, 55.27, [62, 52, 56, 62]),
  mk(ZA, 'cape-town', 'Cape Town', -33.92, 18.42, [40, 18, 36, 34]),
]

// ---------------------------------------------------------------- Latin America

const MX: Base = {
  country: 'Mexico', countryCode: 'MX', region: 'Latin America', currency: 'MXN', fxVol: 0.13, healthcare: 0.3,
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
  country: 'Panama', countryCode: 'PA', region: 'Latin America', currency: 'USD', fxVol: 0, healthcare: 0.35,
  notes: [
    'Panama uses the US dollar and taxes on a territorial basis; foreign-source income is generally not taxed.',
    'The Pensionado visa requires a lifetime pension (around $1,000/month) and brings local discounts.',
  ],
}
const CR: Base = {
  country: 'Costa Rica', countryCode: 'CR', region: 'Latin America', currency: 'CRC', fxVol: 0.08, healthcare: 0.3,
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
  country: 'Uruguay', countryCode: 'UY', region: 'Latin America', currency: 'UYU', fxVol: 0.1, healthcare: 0.35,
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

const latamCities: City[] = [
  mk(MX, 'mexico-city', 'Mexico City', 19.43, -99.13, [42, 22, 42, 36], ['Altitude (~2,240 m) can matter for some health conditions.']),
  mk(MX, 'merida', 'Mérida', 20.97, -89.62, [36, 12, 38, 28]),
  mk(MX, 'puerto-vallarta', 'Puerto Vallarta', 20.65, -105.23, [44, 20, 44, 38]),
  mk(MX, 'san-miguel-de-allende', 'San Miguel de Allende', 20.91, -100.74, [42, 18, 42, 38]),
  mk(MX, 'playa-del-carmen', 'Playa del Carmen', 20.63, -87.08, [44, 22, 44, 40]),
  mk(CO, 'medellin', 'Medellín', 6.24, -75.58, [30, 12, 30, 22]),
  mk(CO, 'cartagena', 'Cartagena', 10.39, -75.48, [34, 13, 34, 28]),
  mk(CO, 'bogota', 'Bogotá', 4.71, -74.07, [30, 11, 30, 22], ['Altitude (~2,600 m) can matter for some health conditions.']),
  mk(PA, 'panama-city', 'Panama City', 8.98, -79.52, [50, 24, 54, 42]),
  mk(PA, 'boquete', 'Boquete', 8.78, -82.43, [42, 12, 52, 34], [], { healthcare: 0.3 }),
  mk(CR, 'san-jose-cr', 'San José', 9.93, -84.09, [50, 15, 54, 44]),
  mk(EC, 'cuenca', 'Cuenca', -2.9, -79.0, [34, 8, 40, 24]),
  mk(UY, 'montevideo', 'Montevideo', -34.9, -56.16, [58, 20, 56, 54]),
  mk(AR, 'buenos-aires', 'Buenos Aires', -34.6, -58.38, [44, 12, 38, 40]),
  mk(CL, 'santiago', 'Santiago', -33.45, -70.67, [46, 16, 46, 40]),
  mk(PE, 'lima', 'Lima', -12.05, -77.04, [38, 14, 38, 28]),
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

export const CITIES: City[] = [
  ...usCities,
  ...canadaCities,
  ...latamCities,
  ...europeCities,
  ...asiaCities,
  ...meAfricaCities,
  ...oceaniaCities,
]

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]))
