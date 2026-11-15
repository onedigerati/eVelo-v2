// Local wealth and inheritance taxes, as they reach a US citizen's US brokerage portfolio.
//
// Facts and source URLs come from docs/research/bbd-ranking-2026-11.md (Country summary and
// Appendices A–L), checked claim by claim in the November 2026 fact check
// (docs/research/fact-check-2026-11/, where each `modelMismatch` records how this file was brought
// in line). Amounts are today's USD, converted at the bundled src/data/fx.json rates (the
// same rates the app uses), so USD thresholds move a little with each `npm run data:fx`. Bands are marginal: `rate` applies above `from`.
// Current-law schedules; where a law phases rates down, the steady-state schedule is used.
//
// Heirs are modelled as two US-resident adult children (engine HEIRS). Regimes that tax the heir by
// the heir's residence (Spain, Thailand, Vietnam, Turkey) do not reach US assets passing to them and are
// modelled as zero. A tax charged on the whole estate (the UK, South Africa, South Korea, the US
// states) is expressed per heir by halving its allowance and thresholds: with two equal shares and
// marginal bands that gives the same total. Treaty credits are ignored. Not tax advice.
//
// US cities (and every other entry): the engine applies a destination's entry from the move, and a
// home city's own entry from year 0 in the run that stays home (or whose destination is home), as
// if resident from the start; a move charges only the destination's. It models no federal estate
// tax (the $15M exemption, 2026) for anyone. The state estate and inheritance taxes below (Washington, Oregon, Hawaii, Minnesota,
// Illinois, Massachusetts, New York, DC, Pennsylvania) are city overrides; other US cities' states
// have neither and get no entry.
//
// Countries in the city dataset with no entry, so the simulation applies no local tax there:
//   - Canada: no wealth or inheritance tax, but death is a deemed sale of all capital property
//     (gains accrued since arrival taxed at up to 26.8%) plus provincial probate (Ontario 1.5%, BC
//     about 1.4%, above CAD 50k). A tax on gains needs the cost basis at arrival, which neither
//     shape carries; an entry with probate alone would read as "taxed" while leaving out the larger
//     charge, so none is given.
//   - Australia: no wealth or inheritance tax, but CGT event K3 taxes the unrealised gain on shares
//     left to a non-resident heir in the date-of-death return: a tax on gains, not expressible.
//   - New Zealand: no wealth or inheritance tax. The FIF rules' fair-dividend-rate method works like
//     a yearly tax of up to 1.95% of opening value after a 4-year exemption, but it depends on cost
//     (NZD 50,000) and on the lower of two methods, and qualifying new migrants can use the revenue
//     account method instead, which taxes a never-sell portfolio only on its dividends. Not modelled.
// Also not modelled where an entry exists: exit taxes on leaving (South Africa s9H, Japan above
// JPY 100m after 5 of 10 years, South Korea's from 2027 above KRW 500m of foreign shares), South
// Africa's CGT at death (s9HA) and Austria's yearly tax on non-reporting funds, all of which need a
// cost basis or a departure the engine does not have.

import { HEIRS } from '../engine/localTax'
import type { LocalTax, TaxBand } from '../engine/types'
import fxJson from './fx.json'

/** Units per USD for the currencies the tax schedules are written in (from fx.json). */
const RATES = (fxJson as { rates: Record<string, number> }).rates
export const FX = {
  EUR: RATES.EUR,
  COP: RATES.COP,
  ARS: RATES.ARS,
  JPY: RATES.JPY,
  PHP: RATES.PHP,
  ZAR: RATES.ZAR,
  GBP: RATES.GBP,
  CHF: RATES.CHF,
  KRW: RATES.KRW,
}

const usd = (amount: number, ccy: keyof typeof FX) => Math.round(amount / FX[ccy])
const bandsIn = (ccy: keyof typeof FX, b: [from: number, rate: number][]): TaxBand[] =>
  b.map(([from, rate]) => ({ from: usd(from, ccy), rate }))
const flat = (rate: number): TaxBand[] => [{ from: 0, rate }]

type Inheritance = NonNullable<LocalTax['inheritance']>

/** A tax on the whole estate (USD thresholds of the estate) in the engine's per-heir shape: the
 *  engine splits the estate into HEIRS equal shares and taxes each, so halving the allowance and
 *  every threshold gives the same total for marginal bands. */
export function wholeEstate(allowance: number, bands: TaxBand[]): Inheritance {
  return {
    perHeirAllowance: Math.round(allowance / HEIRS),
    bands: bands.map((b) => ({ from: Math.round(b.from / HEIRS), rate: b.rate })),
  }
}
const usBands = (b: [from: number, rate: number][]): TaxBand[] => b.map(([from, rate]) => ({ from, rate }))

const PWC_QC_WEALTH = 'https://taxsummaries.pwc.com/quick-charts/net-wealth-worth-tax-rates'
const PWC_QC_INH = 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates'

// ---------------------------------------------------------------- Spain

// State wealth-tax scale breakpoints (EUR of taxable base). The research gives only each region's
// exemption and rate range; the steps between follow the state scale's breakpoints.
const ES_STEPS = [0, 167_129.45, 334_252.88, 668_499.75, 1_336_999.51, 2_673_999.01, 5_347_998.03, 10_695_996.06]
// Catalonia's own scale (AEAT Patrimonio 2025 manual) puts its fifth step at €1,336,999.75, 24 cents
// above the state scale's; every other step is the same.
const ES_STEPS_CAT = ES_STEPS.map((s, i) => (i === 4 ? 1_336_999.75 : s))
const esScale = (exemption: number, rates: number[], extra: [number, number][] = [], steps = ES_STEPS): TaxBand[] =>
  bandsIn('EUR', [...steps.map((s, i): [number, number] => [exemption + s, rates[i]]), ...extra.map(([s, r]): [number, number] => [exemption + s, r])])

/** Solidarity tax (ITSGF) as collected in Andalusia and Madrid: €700k exemption, then 0% to €3M of
 *  base, 1.7% / 2.1% / 3.5% (the state scale's €5.35M and €10.7M breakpoints). */
const ITSGF_LEVEL: TaxBand[] = bandsIn('EUR', [
  [700_000 + 3_000_000, 0.017],
  [700_000 + 5_347_998.03, 0.021],
  [700_000 + 10_695_996.06, 0.035],
])

const ES_HEIR_NOTE =
  'Inheritance: Spain taxes the heir, and a non-resident heir only on Spanish-situs assets, so US assets passing to US-resident children are modelled as untaxed (an inference from the heir-residence rule; confirm with a Spanish adviser).'
const ES_SOURCES = [
  'https://taxsummaries.pwc.com/spain/individual/other-taxes',
  'https://www.taxesforexpats.com/country-guides/spain/succession-inheritance-tax-spain.html',
]
const ES_CAP =
  'The 60% income-plus-wealth-tax cap (which limits relief to 80%) is ignored, as is any interaction with the solidarity tax beyond what is stated.'

const ES_VALENCIA: LocalTax = {
  wealth: { base: 'net', bands: esScale(2_000_000, [0.0025, 0.0037, 0.0062, 0.0112, 0.0162, 0.0212, 0.0262, 0.035]) },
  note: `Valencian Community: wealth tax on worldwide net wealth (margin debt deductible) above a €2M exemption from the 2026 assessment (Ley 5/2026), rates 0.25–3.5%. The research gives only the range; the steps between follow the Valencian scale on the state breakpoints. The solidarity tax credits regional tax and adds little on top, so it is not modelled. ${ES_CAP} ${ES_HEIR_NOTE}`,
  sources: [
    'https://www.cuatrecasas.com/es/spain/art/comunidad-valenciana-novedades-tributarias-2026',
    'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/',
    ...ES_SOURCES,
  ],
}

const ES_ANDALUSIA: LocalTax = {
  wealth: { base: 'net', bands: ITSGF_LEVEL },
  note: `Andalusia: 100% wealth-tax relief, but above about €3.7M of net wealth the region collects tax at the solidarity-tax rates (1.7–3.5% above €3M of base after the €700k exemption). Bands built to match that summary, using the state scale's breakpoints. ${ES_CAP} ${ES_HEIR_NOTE}`,
  sources: [
    'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/',
    'https://www.cuatrecasas.com/es/spain/fiscalidad/art/itsgf-medidas-adoptadas-ccaa',
    ...ES_SOURCES,
  ],
}

const ES_MADRID: LocalTax = {
  wealth: { base: 'net', bands: ITSGF_LEVEL },
  note: `Community of Madrid: the 100% relief is reduced by the solidarity tax, so residents pay nothing between €700k and about €3.7M of net wealth and about the solidarity rates (1.7–3.5%) above. Bands built to match that summary, using the state scale's breakpoints. ${ES_CAP} ${ES_HEIR_NOTE}`,
  sources: [
    'https://www.cuatrecasas.com/es/spain/fiscalidad/art/itsgf-medidas-adoptadas-ccaa',
    'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/',
    ...ES_SOURCES,
  ],
}

const ES_CATALONIA: LocalTax = {
  wealth: {
    base: 'net',
    bands: esScale(500_000, [0.0021, 0.00315, 0.00525, 0.00945, 0.01365, 0.01785, 0.02205, 0.0275], [[20_000_000, 0.0348]], ES_STEPS_CAT),
  },
  note: `Catalonia: wealth tax on worldwide net wealth above a €500k exemption, no relief, rates 0.21–3.48%, on the Catalan scale as the Agencia Tributaria's manual gives it (its breakpoints are the state scale's except the fifth, €1,336,999.75; top rate above €20M of base). Catalan tax is credited against the solidarity tax, which adds little on top and is not modelled. ${ES_CAP} ${ES_HEIR_NOTE}`,
  sources: [
    'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/patrimonio-2025/c-4-determinacion-base-liquidable-integra/determinacion-cuota-integra/regla-general/escalas-autonomicas/comunidad-autonoma-cataluna.html',
    'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/',
    ...ES_SOURCES,
  ],
}

// ---------------------------------------------------------------- Germany

/** ErbStG § 19(1), tax class I (children): each rate applies to the WHOLE taxable acquisition up to
 *  the bracket's limit (EUR), not marginally. */
const DE_CLASS_I: [upTo: number, rate: number][] = [
  [75_000, 0.07],
  [300_000, 0.11],
  [600_000, 0.15],
  [6_000_000, 0.19],
  [13_000_000, 0.23],
  [26_000_000, 0.27],
  [Infinity, 0.3],
]

/**
 * § 19(1) with the step relief of § 19(3) as exact marginal bands (EUR). Just above a limit L the
 * tax is the lesser of the new rate on the whole amount and the tax at L plus half the excess (half
 * because no class I rate is above 30%), so the marginal rate is 50% from L to the crossover
 * x* = L(0.5 − r_prev)/(0.5 − r), then r (r·x is linear through 0, so from x* on the marginal rate is r).
 */
export function germanClassIBands(): [from: number, rate: number][] {
  const out: [number, number][] = [[0, DE_CLASS_I[0][1]]]
  for (let i = 1; i < DE_CLASS_I.length; i++) {
    const L = DE_CLASS_I[i - 1][0]
    const rPrev = DE_CLASS_I[i - 1][1]
    const r = DE_CLASS_I[i][1]
    out.push([L, 0.5], [(L * (0.5 - rPrev)) / (0.5 - r), r])
  }
  return out
}

// ---------------------------------------------------------------- US state estate taxes

/** The pre-2005 federal credit for state death taxes, 26 USC 2011(b) (still the schedule Illinois
 *  and Massachusetts use): [adjusted taxable estate from, credit at that amount, rate above]. The
 *  adjusted taxable estate is the taxable estate less $60,000. */
const SDTC: [from: number, base: number, rate: number][] = [
  [40_000, 0, 0.008],
  [90_000, 400, 0.016],
  [140_000, 1_200, 0.024],
  [240_000, 3_600, 0.032],
  [440_000, 10_000, 0.04],
  [640_000, 18_000, 0.048],
  [840_000, 27_600, 0.056],
  [1_040_000, 38_800, 0.064],
  [1_540_000, 70_800, 0.072],
  [2_040_000, 106_800, 0.08],
  [2_540_000, 146_800, 0.088],
  [3_040_000, 190_800, 0.096],
  [3_540_000, 238_800, 0.104],
  [4_040_000, 290_800, 0.112],
  [5_040_000, 402_800, 0.12],
  [6_040_000, 522_800, 0.128],
  [7_040_000, 650_800, 0.136],
  [8_040_000, 786_800, 0.144],
  [9_040_000, 930_800, 0.152],
  [10_040_000, 1_082_800, 0.16],
]

/** The 2011(b) credit on an adjusted taxable estate. */
export function stateDeathTaxCredit(adjusted: number): number {
  let row = null as (typeof SDTC)[number] | null
  for (const r of SDTC) if (adjusted > r[0]) row = r
  return row ? row[1] + row[2] * (adjusted - row[0]) : 0
}

/**
 * Illinois (whole estate, USD). The tax t is the lesser of
 *   (a) the 2011(b) credit on (E − t − $60k), and
 *   (b) the federal tentative tax on (E − t) less the tentative tax on the $4M exclusion,
 *       i.e. 40% × (E − t − $4M), so t = (2/7)(E − $4M);
 * "interrelated" because the Illinois tax is deductible in computing itself. (b) is the lesser from
 * $4M to the crossover (about $5.36M), (a) above it, where each 2011(b) segment of rate r gives a
 * marginal rate r/(1+r) in E. Both pieces are linear between breakpoints, so the bands are exact.
 */
export function illinoisBands(): TaxBand[] {
  const EX = 4_000_000
  const b = 2 / 7
  const out: TaxBand[] = [{ from: EX, rate: b }]
  // (a) in segment k as a function of E: t = (base + r(E − 60k − from)) / (1 + r).
  for (let k = 0; k < SDTC.length; k++) {
    const [from, base, r] = SDTC[k]
    // crossover with (b): (base + r(E − 60k − from)) / (1 + r) = b(E − EX)
    const E = (base - r * (60_000 + from) + b * (1 + r) * EX) / (b * (1 + r) - r)
    const t = b * (E - EX)
    const adj = E - t - 60_000
    const upper = k + 1 < SDTC.length ? SDTC[k + 1][0] : Infinity
    if (adj > from && adj <= upper) {
      out.push({ from: Math.round(E), rate: r / (1 + r) })
      for (let j = k + 1; j < SDTC.length; j++) {
        const [f, bs, rj] = SDTC[j]
        out.push({ from: f + bs + 60_000, rate: rj / (1 + rj) })
      }
      return out
    }
  }
  throw new Error('Illinois: no crossover')
}

/**
 * New York (whole estate, USD), deaths in 2026: the § 952(b) table less a credit that removes the
 * tax up to the $7,350,000 basic exclusion amount, phases out over the next 5% and is gone above
 * 105% ($7,717,500), where the whole estate is taxed from the first dollar (the "cliff"). Within
 * 7.1M–8.1M the table is linear at 13.6%, so the tax rises linearly from 0 at the exclusion to the
 * full table tax at 105%: one band of about 200% marginal, which is exact, not an approximation.
 */
const NY_BEA = 7_350_000
const NY_TABLE: [from: number, base: number, rate: number][] = [
  [0, 0, 0.0306],
  [500_000, 15_300, 0.05],
  [1_000_000, 40_300, 0.055],
  [1_500_000, 67_800, 0.065],
  [2_100_000, 106_800, 0.08],
  [2_600_000, 146_800, 0.088],
  [3_100_000, 190_800, 0.096],
  [3_600_000, 238_800, 0.104],
  [4_100_000, 290_800, 0.112],
  [5_100_000, 402_800, 0.12],
  [6_100_000, 522_800, 0.128],
  [7_100_000, 650_800, 0.136],
  [8_100_000, 786_800, 0.144],
  [9_100_000, 930_800, 0.152],
  [10_100_000, 1_082_800, 0.16],
]
export function newYorkTableTax(x: number): number {
  let row = NY_TABLE[0]
  for (const r of NY_TABLE) if (x > r[0]) row = r
  return row[1] + row[2] * (x - row[0])
}
function newYorkBands(): TaxBand[] {
  const cliff = NY_BEA * 1.05
  const out: TaxBand[] = [{ from: NY_BEA, rate: newYorkTableTax(cliff) / (cliff - NY_BEA) }]
  out.push({ from: cliff, rate: 0.136 })
  for (const [from, , rate] of NY_TABLE) if (from > cliff) out.push({ from, rate })
  return out
}

const US_NOTE =
  'Charged on the whole estate, modelled per heir by halving the thresholds for the two equal heirs, which gives the same total. Applies where you are domiciled at death: from the move when this city is the destination, and from the start when it is home and you stay. The federal estate tax (above the $15M exemption, 2026) is not modelled for any city; the state tax would be deductible from it. Assumes the estate is the portfolio, all intangible property taxed by the state of domicile.'
const TF_STATE = 'https://taxfoundation.org/data/all/state/estate-inheritance-taxes/'

const US_SEATTLE: LocalTax = {
  inheritance: wholeEstate(
    3_000_000,
    usBands([
      [0, 0.1],
      [1_000_000, 0.14],
      [2_000_000, 0.15],
      [3_000_000, 0.16],
      [4_000_000, 0.18],
      [6_000_000, 0.19],
      [7_000_000, 0.195],
      [9_000_000, 0.2],
    ]),
  ),
  note: `Washington estate tax, deaths from 1 July 2026 (SB 6347): a $3M exclusion, frozen, then 10% on the first $1M of taxable estate rising to 20% above $9M (the Department of Revenue's table). No inheritance tax. ${US_NOTE}`,
  sources: ['https://dor.wa.gov/taxes-rates/other-taxes/estate-tax-tables', TF_STATE],
}

const US_PORTLAND: LocalTax = {
  inheritance: wholeEstate(
    1_000_000,
    usBands([
      [0, 0.1],
      [500_000, 0.1025],
      [1_500_000, 0.105],
      [2_500_000, 0.11],
      [3_500_000, 0.115],
      [4_500_000, 0.12],
      [5_500_000, 0.13],
      [6_500_000, 0.14],
      [7_500_000, 0.15],
      [8_500_000, 0.16],
    ]),
  ),
  note: `Oregon estate tax (ORS 118.010): nothing on an estate under $1M, then 10% of the excess over $1M rising to 16% above $9.5M; no indexing. No inheritance tax. ${US_NOTE}`,
  sources: ['https://oregon.public.law/statutes/ors_118.010', 'https://www.oregon.gov/dor/programs/businesses/pages/estate.aspx', TF_STATE],
}

const US_HONOLULU: LocalTax = {
  inheritance: wholeEstate(
    5_490_000,
    usBands([
      [0, 0.1],
      [1_000_000, 0.11],
      [2_000_000, 0.12],
      [3_000_000, 0.13],
      [4_000_000, 0.14],
      [5_000_000, 0.157],
      [10_000_000, 0.2],
    ]),
  ),
  note: `Hawaii estate tax: a $5.49M exclusion (the federal amount as at 2017, fixed), then 10% on the first $1M of net taxable estate rising to 20% above $10M (HRS 236E-8). A 2026 bill to cut the exclusion to $3M died. No inheritance tax. ${US_NOTE}`,
  sources: [
    'https://data.capitol.hawaii.gov/hrscurrent/Vol04_Ch0201-0257/HRS0236E/HRS_0236E-0006.htm',
    'https://data.capitol.hawaii.gov/hrscurrent/Vol04_Ch0201-0257/HRS0236E/HRS_0236E-0008.htm',
    TF_STATE,
  ],
}

const US_MINNEAPOLIS: LocalTax = {
  inheritance: wholeEstate(
    3_000_000,
    usBands([
      [0, 0.13],
      [7_100_000, 0.136],
      [8_100_000, 0.144],
      [9_100_000, 0.152],
      [10_100_000, 0.16],
    ]),
  ),
  note: `Minnesota estate tax: the $3M exclusion (not indexed) is subtracted, then 13% of the Minnesota taxable estate up to $7.1M, rising to 16% above $10.1M (Minn. Stat. 291.03); the state-tax deduction is added back, so the calculation is not interrelated. Gifts in the 3 years before death are added back (not modelled). It reaches a resident's securities wherever held. ${US_NOTE}`,
  sources: ['https://www.revisor.mn.gov/statutes/cite/291.016', 'https://www.revisor.mn.gov/statutes/cite/291.03', 'https://www.revenue.state.mn.us/estate-tax-rates', TF_STATE],
}

const US_CHICAGO: LocalTax = {
  inheritance: wholeEstate(0, illinoisBands()),
  note: `Illinois estate tax: a $4M exclusion that is a threshold, not a credit (not indexed, not portable), and an interrelated calculation on the federal state-death-tax-credit table (up to 16%, about 13.8% at the margin once the tax deducts itself). The bands reproduce it exactly: 28.57% of the estate above $4M up to about $5.36M (the Attorney General's example: $285,714 on a $5M all-Illinois estate), then the credit table's rates r as r/(1+r). ${US_NOTE}`,
  sources: [
    'https://illinoisattorneygeneral.gov/Page-Attachments/EstateTaxInstructionFactSheet.pdf',
    'https://www.govinfo.gov/content/pkg/USCODE-2011-title26/html/USCODE-2011-title26-subtitleB-chap11-subchapA-partII-sec2011.htm',
    TF_STATE,
  ],
}

const US_BOSTON: LocalTax = {
  // Tax = 2011(b) credit on (E − $60k) less a $99,600 credit, none at or below $2M: marginal 7.2%
  // from $2M (where the credit table gives exactly $99,600), then the table's rates from E = from + $60k.
  inheritance: wholeEstate(0, [
    { from: 2_000_000, rate: 0.072 },
    ...SDTC.filter(([from]) => from + 60_000 > 2_000_000).map(([from, , rate]) => ({ from: from + 60_000, rate })),
  ]),
  note: `Massachusetts estate tax: the federal state-death-tax-credit table on the taxable estate less $60,000, minus a $99,600 credit, with no tax on an estate of $2M or less (since 2023). So nothing at $2M, 7.2% at the margin above it ($7,200 at $2.1M), rising to 16% above $10.1M, with no cliff and no portability. ${US_NOTE}`,
  sources: [
    'https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIX/Chapter65C/Section2A',
    'https://www.govinfo.gov/content/pkg/USCODE-2011-title26/html/USCODE-2011-title26-subtitleB-chap11-subchapA-partII-sec2011.htm',
    TF_STATE,
  ],
}

const US_NEW_YORK: LocalTax = {
  inheritance: wholeEstate(0, newYorkBands()),
  note: `New York estate tax, deaths in 2026: nothing up to the $7,350,000 basic exclusion; above 105% of it ($7,717,500) the credit is lost and the whole estate is taxed on the Tax Law § 952 table (3.06% to 16%), the "cliff". Between the two the credit phases out, so the tax climbs from $0 to about $735k over $367,500 (a marginal rate of about 200%, which the model carries exactly), then follows the table: 13.6%, 14.4% from $8.1M, 15.2% from $9.1M, 16% from $10.1M. The exclusion is indexed yearly; the 2026 figure is used. No portability, no inheritance tax. ${US_NOTE}`,
  sources: ['https://www.tax.ny.gov/pit/estate/etidx.htm', 'https://www.nysenate.gov/legislation/laws/TAX/952', TF_STATE],
}

const US_DC: LocalTax = {
  inheritance: wholeEstate(
    0,
    usBands([
      [4_988_400, 0.112],
      [5_000_000, 0.12],
      [6_000_000, 0.128],
      [7_000_000, 0.136],
      [8_000_000, 0.144],
      [9_000_000, 0.152],
      [10_000_000, 0.16],
    ]),
  ),
  note: `District of Columbia estate tax, deaths in 2026: 0% up to the $4,988,400 zero-bracket amount, then the D.C. Code 47-3702(a-1) brackets from 11.2% (the $4M–5M bracket) to 16% above $10M; no cliff, no portability. ${US_NOTE}`,
  sources: ['https://code.dccouncil.gov/us/dc/council/code/sections/47-3702', TF_STATE],
}

const US_PENNSYLVANIA: LocalTax = {
  inheritance: { perHeirAllowance: 0, bands: flat(0.045) },
  note: 'Pennsylvania inheritance tax: 4.5% on what children and other lineal heirs inherit, with no general exemption (0% to a spouse, 12% siblings, 15% others). It is charged on each transfer, so it is per heir already. The 5% discount for paying within three months is not applied. No separate estate tax. Applies where you are domiciled at death: from the move when this city is the destination, and from the start when it is home and you stay. The federal estate tax (above $15M, 2026) is not modelled for any city.',
  sources: ['https://www.pa.gov/en/agencies/revenue/resources/tax-types-and-information/inheritance-tax.html', TF_STATE],
}

// ---------------------------------------------------------------- by country

export const LOCAL_TAX_BY_COUNTRY: Record<string, LocalTax> = {
  // Europe
  PT: {
    note: 'No wealth or inheritance tax on a US portfolio: Portugal has no net wealth tax, and its 10% stamp duty on inheritances covers Portuguese-situs assets only, with children exempt.',
    sources: [
      'https://taxsummaries.pwc.com/portugal/individual/other-taxes',
      'https://www.legal500.com/intelligence/global/tax/practical-tax-guide-to-inheritance-and-gifts-received-in-portugal',
    ],
  },
  FR: {
    inheritance: {
      perHeirAllowance: usd(100_000, 'EUR'),
      bands: bandsIn('EUR', [
        [0, 0.05],
        [8_072, 0.1],
        [12_109, 0.15],
        [15_932, 0.2],
        [552_324, 0.3],
        [902_838, 0.4],
        [1_805_677, 0.45],
      ]),
    },
    note: 'Inheritance: France taxes a French-resident decedent\'s worldwide estate. Each child gets a €100k allowance, then the direct-line scale of 5% to 45% (45% above €1,805,677), all seven bands as Service-Public gives them. Under the US–France estate treaty a US citizen (not French) who clearly intends to keep a US domicile and has lived in France under 5 of the last 7 years is treated as US-domiciled, so France taxes only French real estate and goods in France; after that, or for anyone settled for good, the worldwide estate is in reach and the treaty gives credits only, which are ignored. The model taxes the worldwide estate (the settled case). No wealth tax on a portfolio: IFI covers real estate only.',
    sources: [
      'https://taxsummaries.pwc.com/france/individual/other-taxes',
      'https://www.service-public.gouv.fr/particuliers/vosdroits/F14198',
    ],
  },
  GR: {
    inheritance: {
      perHeirAllowance: 0,
      bands: bandsIn('EUR', [
        [150_000, 0.01],
        [300_000, 0.05],
        [600_000, 0.1],
      ]),
    },
    note: 'Inheritance (Category A, children): 0% on the first €150k, 1% to €300k, 5% to €600k, 10% above, per beneficiary. A foreign national resident in Greece is taxed on movable property abroad (subject to an art. 75(2)(c) qualification the source does not spell out); modelled as applying. The US–Greece treaty is ignored. No wealth tax (ENFIA is Greek real estate only).',
    sources: [
      'https://minfin.gov.gr/en/tax-policy/tax-guide/capital-taxation/',
      'https://taxsummaries.pwc.com/greece/individual/other-taxes',
    ],
  },
  IT: {
    wealth: { base: 'gross', bands: flat(0.002) },
    inheritance: { perHeirAllowance: usd(1_000_000, 'EUR'), bands: flat(0.04) },
    note: 'Wealth: IVAFE, 0.2% a year on the market value of financial assets held abroad (gross; the loan is not deducted). Inheritance: 4% above a €1M allowance per child, on all assets of a resident decedent "even if abroad" (Testo unico art. 2(1)). The US–Italy treaty and the credit for inheritance tax paid abroad (art. 26) are ignored, as is the flat-tax option for new residents, which replaces IVAFE and limits inheritance tax to Italian assets.',
    sources: [
      'https://taxsummaries.pwc.com/italy/individual/other-taxes',
      'https://www.brocardi.it/testo-unico-successioni-donazioni/titolo-i/art2.html',
      'https://www.agenziaentrate.gov.it/portale/schede/pagamenti/imposta-di-successione/aliquote-e-franchigie',
    ],
  },
  HR: {
    note: 'No wealth or inheritance tax on a US portfolio: Croatia has no wealth tax, spouse and descendants are exempt from its 4% inheritance tax, and inheritances located abroad are not taxed.',
    sources: [
      'https://taxsummaries.pwc.com/croatia/individual/other-taxes',
      'https://porezna-uprava.gov.hr/en/inheritanc-e-and-gifts-tax-information-on-the-general-rules-rates-and-taxpayer/7315',
    ],
  },
  ME: {
    note: 'No wealth or inheritance tax on a US portfolio: Montenegro has no wealth tax, and its 3–6% inheritance tax applies only to real estate.',
    sources: [PWC_QC_WEALTH, PWC_QC_INH, 'https://adriacom.me/is-montenegro-a-tax-haven'],
  },
  CY: {
    note: 'No wealth or inheritance tax on a US portfolio: Cyprus has neither.',
    sources: ['https://taxsummaries.pwc.com/cyprus/individual/other-taxes', PWC_QC_INH],
  },
  MT: {
    note: 'No wealth or inheritance tax on a US portfolio: Malta has neither; stamp duty on inheriting applies only to Maltese property and shares.',
    sources: ['https://taxsummaries.pwc.com/malta/individual/other-taxes'],
  },
  GE: {
    note: 'No wealth or inheritance tax on a US portfolio: Georgia has no wealth tax, and inheritances by children are exempt from income tax.',
    sources: [
      'https://taxsummaries.pwc.com/georgia/individual/other-taxes',
      'https://www.legal500.com/intelligence/georgia/tax/georgia-tax-card-2025',
    ],
  },
  HU: {
    note: 'No wealth or inheritance tax on a US portfolio: Hungary has no wealth tax, and transfers to children are exempt from inheritance tax.',
    sources: ['https://taxsummaries.pwc.com/hungary/individual/other-taxes'],
  },
  CZ: {
    note: 'No wealth or inheritance tax on a US portfolio: the Czech Republic has neither.',
    sources: ['https://taxsummaries.pwc.com/czech-republic/individual/other-taxes'],
  },
  TR: {
    note: 'No wealth tax. Inheritance tax is paid by the heir and, by Article 1 of Law 7338, reaches property of Turkish nationals and property located in Turkey; a US citizen\'s US securities passing to US-resident, non-Turkish children are neither, so they are modelled as untaxed (the statute\'s words; no adviser page applies it to this case). If it did apply: normally 1–10% for inheritances (1% on the first TRY 3m up to 10% above TRY 55m, 2026; 10–30% is the gift scale) above TRY 2,907,136 per child, cut to 1% during the Law 7582 new-resident regime.',
    sources: [
      'https://www.mevzuat.gov.tr/MevzuatMetin/1.3.7338.doc',
      'https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yilinda-uygulanacak-veraset-ve-intikal-vergisi-maktu-istisna-tutarlari-ile-matrah-dilim-tutarlari-yayimlandi/3355',
      'https://taxsummaries.pwc.com/turkey/individual/other-taxes',
      'https://www.ey.com/en_gl/technical/tax-alerts/turkiye-introduces-new-personal-tax-regime-including-foreign-income-exemption-inheritance-tax-relief-and-asset-repatriation-measure',
    ],
  },
  BG: {
    note: 'No wealth or inheritance tax on a US portfolio: Bulgaria has no wealth tax, and its municipal inheritance tax reaches a foreign national only on property in Bulgaria, with children fully exempt in any case (law-firm source; the Ministry of Finance page could not be read).',
    sources: ['https://taxsummaries.pwc.com/bulgaria/individual/other-taxes', 'https://www.innovires.com/en/blog/danak-nasledstvo-bulgaria.html'],
  },
  AL: {
    note: 'No wealth or inheritance tax on a US portfolio: Albania has no wealth tax (only a property tax on buildings), and its 15% inheritance tax exempts first- and second-degree heirs, so children pay nothing.',
    sources: ['https://taxsummaries.pwc.com/albania/individual/other-taxes'],
  },
  AT: {
    note: 'No wealth or inheritance tax: Austria has no wealth, inheritance, estate or gift tax. Not modelled: funds that do not report their tax figures to Austria\'s reporting agent, the Oesterreichische Kontrollbank (OeKB), which reportedly include many US-domiciled ETFs, are taxed every year on a deemed distribution of 90% of their growth (minimum 10% of year-end value) at 27.5%, so a never-sell ETF portfolio pays Austrian tax each year anyway. Ordinary individual US stocks are not caught (US REITs and BDCs reportedly are). Dividends and bond interest are taxed at 27.5% as income, bank-deposit interest at 25% (outside this entry).',
    sources: [
      'https://taxsummaries.pwc.com/austria/individual/other-taxes',
      'https://taxsummaries.pwc.com/austria/individual/income-determination',
      'https://www.broker-test.at/news/nichtmeldefonds-pauschale-besteuerung/',
    ],
  },
  GB: {
    // Inheritance tax is charged on the estate: the £325,000 nil-rate band is halved per heir.
    inheritance: { perHeirAllowance: Math.round(usd(325_000, 'GBP') / HEIRS), bands: flat(0.4), afterYearsResident: 10 },
    note: 'Inheritance: 40% of the estate above the £325,000 nil-rate band (per estate, frozen to April 2031; split across the modelled heirs so the total matches). Since April 2025 non-UK assets come into scope only for a long-term resident, UK resident 10 of the previous 20 tax years, so it applies when the horizon is more than 10 years after the move. The residence nil-rate band (homes left to children) does not apply to a portfolio; the US–UK treaty credit is ignored. No wealth tax.',
    sources: [
      'https://www.gov.uk/inheritance-tax',
      'https://www.gov.uk/guidance/inheritance-tax-if-youre-a-long-term-uk-resident',
      'https://taxsummaries.pwc.com/united-kingdom/individual/other-taxes',
    ],
  },
  NL: {
    // Box 3 (2026): 36% × a deemed 6.00% return on investments = 2.16% a year of the value above the
    // €59,357 allowance. Debts are deemed to cost only 2.70%, so the margin loan would take off just
    // 0.97% of its balance a year; the base is modelled as gross (the loan not deducted), which
    // overstates the tax by that much rather than understating it by 1.19% of the loan as a net base would.
    wealth: { base: 'gross', bands: bandsIn('EUR', [[59_357, 0.36 * 0.06]]) },
    inheritance: {
      perHeirAllowance: usd(26_230, 'EUR'),
      bands: bandsIn('EUR', [
        [0, 0.1],
        [158_669, 0.2],
      ]),
    },
    note: 'Wealth: Box 3 taxes a deemed return, not actual income. For 2026 investments are deemed to yield 6.00% (final), taxed at 36% above a €59,357 allowance per person: 2.16% a year of the portfolio, modelled as a flat yearly tax on the gross value above the allowance (one person). The margin loan counts as a debt deemed to cost 2.70% (provisional), which would cut the tax by about 0.97% of the loan a year; that relief is ignored, so the tax is somewhat overstated. Also ignored: the option to be taxed on a lower actual return in a weak year, and the proposed move to taxing gains when sold (intended for 2029, not law). Inheritance: children pay 10% up to €158,669 and 20% above, after a €26,230 exemption each, on a Dutch resident\'s worldwide estate. The US treaty\'s Article 4(2) carve-out (under 7 of 10 years, there for business, study, tourism or a similar purpose) may not fit a retiree and is not applied; its credit is ignored.',
    sources: [
      'https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026',
      'https://www.sra.nl/nieuws/600041/2026/01/box-3-percentages-vrijstellingen-en-bedragen-2026',
      'https://taxsummaries.pwc.com/netherlands/individual/income-determination',
      'https://www.belastingdienst.nl/wps/wcm/connect/nl/erfbelasting/content/tarieven-erfbelasting',
      'https://www.belastingdienst.nl/wps/wcm/connect/nl/erfbelasting/content/vrijstelling-erfbelasting',
      'https://taxsummaries.pwc.com/netherlands/individual/other-taxes',
    ],
  },
  DE: {
    inheritance: {
      perHeirAllowance: usd(400_000, 'EUR'),
      bands: bandsIn('EUR', germanClassIBands()),
      afterYearsResident: 10,
    },
    note: 'Inheritance: each child pays on their own share above a €400,000 allowance, at class I rates of 7% to €75k, 11% to €300k, 15% to €600k, 19% to €6M, 23% to €13M, 27% to €26M and 30% above, each applied to the whole share, with the step relief of § 19(3) (the excess over a step is taxed at no more than half of it). The bands reproduce that exactly as marginal steps of 50% just above each limit. A resident decedent\'s worldwide estate is in scope, but under the US treaty (1998 protocol) a US citizen who is not German and has lived in Germany 10 years or less is treated as US-domiciled, so it applies when the horizon is more than 10 years after the move. The treaty credit is ignored. No wealth tax.',
    sources: [
      'https://www.gesetze-im-internet.de/erbstg_1974/__2.html',
      'https://www.gesetze-im-internet.de/erbstg_1974/__16.html',
      'https://www.gesetze-im-internet.de/erbstg_1974/__19.html',
      'https://www.govinfo.gov/content/pkg/CRPT-106erpt10/html/CRPT-106erpt10.htm',
      'https://taxsummaries.pwc.com/germany/individual/other-taxes',
    ],
  },
  IE: {
    inheritance: { perHeirAllowance: usd(420_000, 'EUR'), bands: flat(0.33), afterYearsResident: 5 },
    note: 'Inheritance: Capital Acquisitions Tax at 33% above the €420k Group A (child) threshold. A non-domiciled decedent counts as resident only after 5 consecutive years, so it applies when the horizon is more than 5 years after the move. The US–Ireland treaty credit is ignored. No wealth tax.',
    sources: [
      'https://www.revenue.ie/en/gains-gifts-and-inheritance/cat-thresholds-rates-and-aggregation-rules/cat-thresholds.aspx',
      'https://taxsummaries.pwc.com/ireland/individual/other-taxes',
    ],
  },

  // Middle East
  AE: {
    note: 'No wealth or inheritance tax: the UAE has no personal income, capital gains, wealth, inheritance, estate or gift tax. No US estate treaty.',
    sources: ['https://taxsummaries.pwc.com/united-arab-emirates/individual/other-taxes', PWC_QC_INH],
  },

  // Latin America
  PA: {
    note: 'No wealth or inheritance tax: Panama has no net wealth, inheritance, estate or gift taxes.',
    sources: ['https://taxsummaries.pwc.com/panama/individual/other-taxes'],
  },
  CR: {
    note: 'No wealth or inheritance tax: Costa Rica has neither.',
    sources: ['https://taxsummaries.pwc.com/costa-rica/individual/other-taxes', PWC_QC_INH],
  },
  MX: {
    note: 'No wealth or inheritance tax: Mexico has no net wealth tax and no specific inheritance tax (inheritances are exempt from income tax).',
    sources: ['https://taxsummaries.pwc.com/mexico/individual/other-taxes'],
  },
  CO: {
    wealth: {
      base: 'net',
      bands: bandsIn('COP', [
        [3_770_928_000, 0.005], // 72,000 UVT
        [6_389_628_000, 0.01], // 122,000 UVT (UVT 2026 = COP 52,374)
      ]),
    },
    inheritance: { perHeirAllowance: 0, bands: flat(0.15) },
    note: 'Wealth: residents pay on worldwide net wealth above 72,000 UVT (COP 3.77bn), 0.5% to 122,000 UVT and 1% above. The 1.5% band above 239,000 UVT applies only to 2026 and becomes 1% from 2027; the steady-state schedule is used. Inheritance: taxed to each heir as an occasional gain at 15%; how it applies to non-resident heirs and US assets is not verified, and it is modelled as applying with no exemptions. Assessed at year-end here (the law measures 1 January).',
    sources: [
      'https://taxsummaries.pwc.com/colombia/individual/other-taxes',
      'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8914_2026.htm',
    ],
  },
  EC: {
    inheritance: {
      perHeirAllowance: 0,
      bands: [
        { from: 78_527, rate: 0.05 },
        { from: 157_054, rate: 0.1 },
        { from: 314_108, rate: 0.15 },
        { from: 471_162, rate: 0.2 },
        { from: 628_216, rate: 0.25 },
        { from: 785_270, rate: 0.3 },
        { from: 942_353, rate: 0.35 },
      ],
    },
    note: 'Inheritance: the 2026 table runs from 0% to US$78,527 in 5-point steps to 35% above US$942,353, per heir, and reaches the foreign assets of Ecuadorian residents. The research gives the end points; the steps between follow the table\'s pattern (multiples of the first bracket). No general wealth tax.',
    sources: [
      'https://nmslaw.com.ec/blog/2026/01/05/tablas-impuesto-renta-2026-ecuador/',
      'https://www.ecuadorlegalonline.com/sri/impuesto-herencia-ecuador/',
      'https://taxsummaries.pwc.com/ecuador/individual/other-taxes',
    ],
  },
  UY: {
    note: 'No wealth or inheritance tax on a US portfolio: Uruguay\'s 0.1% wealth tax reaches only net wealth located in Uruguay, and it has no inheritance tax.',
    sources: ['https://taxsummaries.pwc.com/uruguay/individual/other-taxes', PWC_QC_INH],
  },
  BZ: {
    note: 'No wealth or inheritance tax modelled: QRP members are exempt from inheritance tax; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize).',
    sources: ['https://www.belizetourismboard.org/programs-events/retirement-program/'],
  },
  DO: {
    inheritance: { perHeirAllowance: 0, bands: flat(0.03) },
    note: 'Inheritance: 3% on successors. Whether it reaches a resident decedent\'s foreign assets is unverified; modelled as applying. No wealth tax.',
    sources: ['https://taxsummaries.pwc.com/dominican-republic/individual/other-taxes'],
  },
  PY: {
    note: 'No wealth or inheritance tax: Paraguay has neither.',
    sources: [PWC_QC_WEALTH, PWC_QC_INH],
  },
  GT: {
    note: 'No wealth or inheritance tax: Guatemala has no wealth tax (municipal IUSI on real estate only), and inheritance tax was repealed by Decreto 6-2026 (in force 2 Apr 2026).',
    sources: [
      'https://taxsummaries.pwc.com/guatemala/individual/other-taxes',
      'https://lexlatin.com/opinion/decreto-6-2026-guatemala-elimina-impuesto-herencias-legados-donaciones-muerte',
    ],
  },
  CL: {
    note: 'No wealth or inheritance tax on a US portfolio: Chile has no wealth tax, and in a foreigner\'s succession assets abroad are included only if bought with money from Chile (Law 16.271 art. 1). Whether this holds for a foreigner who dies domiciled in Chile is unverified.',
    sources: [
      'https://taxsummaries.pwc.com/chile/individual/other-taxes',
      'https://www.sii.cl/pagina/jurisprudencia/legislacion/basica/herencias_asignaciones_donaciones.doc',
    ],
  },
  HN: {
    note: 'No wealth or inheritance tax: PwC lists neither for Honduras and a secondary source confirms there is no wealth or separate inheritance tax; no Honduran primary source was found.',
    sources: ['https://taxsummaries.pwc.com/honduras/individual/other-taxes', 'https://taxatlas.io/country/honduras/wealth-tax'],
  },
  PE: {
    note: 'No wealth or inheritance tax: Peru has neither (the "none" for inheritance rests on a secondary source).',
    sources: ['https://taxsummaries.pwc.com/peru/individual/other-taxes', 'https://perugestiona.pe/herencias/impuesto-herencia-peru/'],
  },
  AR: {
    wealth: { base: 'gross', bands: [{ from: usd(384_700_000, 'ARS'), rate: 0.0025 }] },
    note: 'Wealth: Bienes Personales on residents\' worldwide assets at 31 December above the ARS 384.7M allowance (FY2025; indexed), on gross assets: debts, a margin loan included, are not deductible. Under Law 27.743 the rates are 0.5–1.0% for FY2025 and 0.5–0.75% for FY2026, then a flat 0.25% from FY2027. The steady-state 0.25% is used from the first year, so the first year-end (FY2026, two to three times the rate) is understated; the bands for FY2026 were not read. A newcomer cannot use the REIBP prepayment. A foreigner becomes resident from the 13th month. Inheritance: none in the City of Buenos Aires (only Buenos Aires Province levies one).',
    sources: [
      'https://taxsummaries.pwc.com/argentina/individual/other-taxes',
      'https://taxsummaries.pwc.com/quick-charts/net-wealth-worth-tax-rates',
      'https://chambers.com/practice-guides/guides/private-wealth-2026/argentina',
    ],
  },

  // Asia
  SG: {
    note: 'No wealth or inheritance tax: Singapore has no net wealth tax, and estate duty was abolished for deaths on or after 15 Feb 2008.',
    sources: ['https://taxsummaries.pwc.com/singapore/individual/other-taxes'],
  },
  MY: {
    note: 'No wealth or inheritance tax: Malaysia has no net wealth, inheritance, estate or gift taxes.',
    sources: ['https://taxsummaries.pwc.com/malaysia/individual/other-taxes'],
  },
  TH: {
    note: 'No wealth tax. Inheritance tax (5% for descendants above THB 100m) is paid by the heir and reaches non-Thai heirs only on property in Thailand, so US assets passing to US-resident children are modelled as untaxed.',
    sources: [
      'https://taxsummaries.pwc.com/thailand/individual/other-taxes',
      'https://www.forvismazars.com/th/en/insights/doing-business-in-thailand/tax/inheritance-tax-act',
    ],
  },
  VN: {
    note: 'No wealth tax. Inheritances are taxed as income of the recipient (10%); a non-resident heir is likely outside it for foreign assets, so US assets passing to US-resident children are modelled as untaxed (not verified).',
    sources: [
      'https://taxsummaries.pwc.com/vietnam/individual/other-taxes',
      'https://taxsummaries.pwc.com/vietnam/individual/taxes-on-personal-income',
    ],
  },
  ID: {
    note: 'No wealth or inheritance tax: Indonesia has no net wealth, inheritance, estate or gift taxes.',
    sources: ['https://taxsummaries.pwc.com/indonesia/individual/other-taxes'],
  },
  PH: {
    inheritance: { perHeirAllowance: Math.round(usd(5_000_000, 'PHP') / HEIRS), bands: flat(0.06) },
    note: 'Inheritance: a flat 6% estate tax on the worldwide net estate of resident aliens (US brokerage accounts included), after the PHP 5m standard deduction (split equally across the modelled heirs). The family-home deduction (up to PHP 10m) is not applied: the modelled estate is the portfolio, with no home in it. No wealth tax. No US estate treaty.',
    sources: [
      'https://www.respicio.ph/commentaries/estate-tax-computation-guidelines-in-the-philippines',
      PWC_QC_WEALTH,
      PWC_QC_INH,
    ],
  },
  TW: {
    note: 'No wealth tax. For non-ROC nationals the estate tax reaches only property located in Taiwan, so a US citizen\'s US portfolio is untaxed.',
    sources: [
      'https://taxsummaries.pwc.com/taiwan/individual/other-taxes',
      'https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=G0340072',
    ],
  },
  JP: {
    inheritance: {
      // Basic exemption JPY 30m + 6m per statutory heir (two) = 42m, i.e. 21m per heir.
      perHeirAllowance: usd(21_000_000, 'JPY'),
      bands: bandsIn('JPY', [
        [0, 0.1],
        [10_000_000, 0.15],
        [30_000_000, 0.2],
        [50_000_000, 0.3],
        [100_000_000, 0.4],
        [200_000_000, 0.45],
        [300_000_000, 0.5],
        [600_000_000, 0.55],
      ]),
      afterYearsResident: 10,
    },
    note: 'Inheritance: up to 55% (above JPY 600m per heir\'s share) after a basic exemption of JPY 30m + 6m per heir; the lower steps follow the statutory table. A foreign national on a Table I status such as Long Stay (the profiles\' case) brings overseas assets in only after 10 of the last 15 years in Japan, so it applies when the horizon is more than 10 years after the move. Not modelled: a permanent resident or spouse of a Japanese national (statuses outside Table I) is taxed on the worldwide estate from arrival, so the model understates the tax for them in the first 10 years; and the exit tax on unrealised gains when leaving with JPY 100m or more in securities after 5 of 10 years outside Table I. The US–Japan treaty credit is ignored. No wealth tax.',
    sources: ['https://taxsummaries.pwc.com/japan/individual/other-taxes'],
  },

  KR: {
    // Korea taxes the whole estate (no separate per-heir tax yet): the KRW 500m lump-sum deduction
    // and the bracket limits are halved per heir.
    inheritance: wholeEstate(
      usd(500_000_000, 'KRW'),
      bandsIn('KRW', [
        [0, 0.1],
        [100_000_000, 0.2],
        [500_000_000, 0.3],
        [1_000_000_000, 0.4],
        [3_000_000_000, 0.5],
      ]),
    ),
    note: 'Inheritance: a resident\'s worldwide estate (resident = a domicile in Korea or 183+ days, foreigners included) is taxed as a whole at 10% to KRW 100m, 20% to 500m, 30% to 1bn, 40% to 3bn and 50% above, after the KRW 500m lump-sum deduction (split across the modelled heirs so the total matches). From the move, since residence at death decides. A plan to tax each heir on their own share is still a proposal. Not modelled: the exit tax on foreign shares above KRW 500m for someone resident 5 of the last 10 years who leaves (from 2027). No US estate treaty. No wealth tax.',
    sources: [
      'https://pbl.legal/insights/international-estate-planning-a-guide-to-korean-inheritance-law/',
      'https://braindetox.kr/en/posts/inheritance_tax_exemption_limit_2026.html',
      'https://taxsummaries.pwc.com/republic-of-korea/individual/other-taxes',
      'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2324&cntntsId=7718',
    ],
  },

  // Africa
  MU: {
    note: 'No wealth or inheritance tax: Mauritius has no net wealth tax and no inheritance, estate or gift tax.',
    sources: ['https://taxsummaries.pwc.com/mauritius/individual/other-taxes'],
  },
  ZA: {
    inheritance: {
      // Estate duty is charged on the whole estate, but the engine splits it equally across HEIRS and
      // taxes each share. Halving the R3.5M abatement and the R30M breakpoint gives the same total:
      // HEIRS × bandTax(estate / HEIRS − R3.5M / HEIRS) = 20% of the dutiable estate to R30M, 25% above.
      perHeirAllowance: Math.round(usd(3_500_000, 'ZAR') / HEIRS),
      bands: bandsIn('ZAR', [
        [0, 0.2],
        [30_000_000 / HEIRS, 0.25],
      ]),
    },
    note: 'Inheritance: estate duty on an ordinarily resident decedent\'s worldwide estate, 20% of the dutiable estate above an R3.5M abatement and 25% above R30M dutiable, applied to the whole estate (the abatement and breakpoint are split across the modelled heirs so the total matches). Relief not modelled: s4(e) of the Estate Duty Act deducts foreign property acquired before first becoming ordinarily resident (and, per a practitioner source, its proceeds), so a portfolio held on arrival may be largely outside duty; the whole portfolio is taxed here as the cautious reading. Whether a US margin loan is deductible is unverified. Not modelled: CGT at death on gains accrued while resident (death is a deemed disposal) and the exit tax on ceasing residence. The US–South Africa estate treaty gives credit only, so no reduction is modelled. No wealth tax.',
    sources: [
      'https://taxsummaries.pwc.com/south-africa/individual/other-taxes',
      'https://jutamedia2.blob.core.windows.net/jutacoza/uploads/SAIT_Compenduim_2016_Volume1/files/basic-html/page668.html',
      'https://capitallegacy.co.za/faq/17/how-much-tax-do-you-pay-on-a-deceased-estate',
    ],
  },
}

/** Per-city overrides, keyed by city id. Spain has no country entry: wealth tax is regional, so
 *  every Spanish city must carry its region's rules (a test checks this). Zurich (cantonal wealth
 *  tax) and the US cities in states with an estate or inheritance tax are here too. */
export const LOCAL_TAX_BY_CITY: Record<string, LocalTax> = {
  // Switzerland: wealth tax is cantonal and communal, so Zurich carries its own.
  zurich: {
    wealth: {
      base: 'net',
      // 2026 basic tariff (single) × (cantonal 0.95 + City of Zurich 1.19) = × 2.14.
      bands: bandsIn('CHF', [
        [81_000, 0.0005 * 2.14],
        [322_000, 0.001 * 2.14],
        [726_000, 0.0015 * 2.14],
        [1_371_000, 0.002 * 2.14],
        [2_339_000, 0.0025 * 2.14],
        [3_304_000, 0.003 * 2.14],
      ]),
    },
    note: 'Wealth: the canton of Zurich taxes worldwide net wealth every year, debts (the margin loan) deductible. 2026 basic tariff for a single person: 0% to CHF 81,000, then 0.05%, 0.10%, 0.15%, 0.20%, 0.25% and 0.30% above CHF 3,304,000, multiplied by the cantonal Steuerfuss (0.95 for 2026–27) plus the City of Zurich\'s (1.19), so about 0.107% to 0.642% at the margin. The married tariff (0% to CHF 161,000) and church tax are not modelled. Inheritance: none for children or a spouse (Zurich exempts them; no federal inheritance tax).',
    sources: [
      'https://taxsummaries.pwc.com/switzerland/individual/other-taxes',
      'https://taxsummaries.pwc.com/switzerland/individual/taxes-on-personal-income',
      'https://www.blick.ch/politik/schlappe-fuer-rot-gruen-zuercher-zahlen-die-naechsten-zwei-jahre-weniger-steuern-id21519126.html',
    ],
  },
  // US state estate and inheritance taxes (see the header). Other US cities get no entry.
  seattle: US_SEATTLE,
  portland: US_PORTLAND,
  honolulu: US_HONOLULU,
  minneapolis: US_MINNEAPOLIS,
  chicago: US_CHICAGO,
  boston: US_BOSTON,
  'new-york': US_NEW_YORK,
  'washington-dc': US_DC,
  philadelphia: US_PENNSYLVANIA,
  pittsburgh: US_PENNSYLVANIA,
  valencia: ES_VALENCIA,
  alicante: ES_VALENCIA,
  torrevieja: ES_VALENCIA,
  malaga: ES_ANDALUSIA,
  madrid: ES_MADRID,
  tarragona: ES_CATALONIA,
  barcelona: ES_CATALONIA,
}

export function localTaxFor(cityId: string, countryCode: string): LocalTax | undefined {
  return LOCAL_TAX_BY_CITY[cityId] ?? LOCAL_TAX_BY_COUNTRY[countryCode]
}
