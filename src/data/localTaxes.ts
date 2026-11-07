// Local wealth and inheritance taxes, as they reach a US citizen's US brokerage portfolio.
//
// Facts and source URLs come from docs/research/bbd-ranking-2026-11.md (Country summary and
// Appendices A–J). Amounts are today's USD, converted at the bundled src/data/fx.json rates (the
// same rates the app uses), so USD thresholds move a little with each `npm run data:fx`. Bands are marginal: `rate` applies above `from`.
// Current-law schedules; where a law phases rates down, the steady-state schedule is used.
//
// Heirs are modelled as two US-resident adult children (engine HEIRS). Regimes that tax the heir by
// the heir's residence (Spain, Thailand, Vietnam) do not reach US assets passing to them and are
// modelled as zero. Treaty credits are ignored. Not tax advice.
//
// Countries in the city dataset with no researched tax data (UK, Netherlands, Germany,
// Switzerland, UAE, South Korea, Canada, Australia, New Zealand) have no entry, and the simulation
// applies no local tax there.

import { HEIRS } from '../engine/localTax'
import type { LocalTax, TaxBand } from '../engine/types'
import fxJson from './fx.json'

/** Units per USD for the currencies the tax schedules are written in (from fx.json). */
const RATES = (fxJson as { rates: Record<string, number> }).rates
export const FX = { EUR: RATES.EUR, COP: RATES.COP, ARS: RATES.ARS, JPY: RATES.JPY, PHP: RATES.PHP, ZAR: RATES.ZAR }

const usd = (amount: number, ccy: keyof typeof FX) => Math.round(amount / FX[ccy])
const bandsIn = (ccy: keyof typeof FX, b: [from: number, rate: number][]): TaxBand[] =>
  b.map(([from, rate]) => ({ from: usd(from, ccy), rate }))
const flat = (rate: number): TaxBand[] => [{ from: 0, rate }]

const PWC_QC_WEALTH = 'https://taxsummaries.pwc.com/quick-charts/net-wealth-worth-tax-rates'
const PWC_QC_INH = 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates'

// ---------------------------------------------------------------- Spain

// State wealth-tax scale breakpoints (EUR of taxable base). The research gives only each region's
// exemption and rate range; the steps between follow the state scale's breakpoints.
const ES_STEPS = [0, 167_129.45, 334_252.88, 668_499.75, 1_336_999.51, 2_673_999.01, 5_347_998.03, 10_695_996.06]
const esScale = (exemption: number, rates: number[], extra: [number, number][] = []): TaxBand[] =>
  bandsIn('EUR', [...ES_STEPS.map((s, i): [number, number] => [exemption + s, rates[i]]), ...extra.map(([s, r]): [number, number] => [exemption + s, r])])

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
    bands: esScale(500_000, [0.0021, 0.00315, 0.00525, 0.00945, 0.01365, 0.01785, 0.02205, 0.0275], [[20_000_000, 0.0348]]),
  },
  note: `Catalonia: wealth tax on worldwide net wealth above a €500k exemption, no relief, rates 0.21–3.48%. The research gives only the range; the steps between follow the Catalan scale on the state breakpoints (top rate above €20M of base). Catalan tax is credited against the solidarity tax, which adds little on top and is not modelled. ${ES_CAP} ${ES_HEIR_NOTE}`,
  sources: ['https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', ...ES_SOURCES],
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
    note: 'Inheritance: France taxes a French-resident decedent\'s worldwide estate. Each child gets a €100k allowance, then 5% to 45% (45% above €1,805,677). The research gives the 5%, 20% and 45% bands; the €12,109 and €902,838 breakpoints follow the statutory child scale. The US–France treaty gives credits only, which are ignored. No wealth tax on a portfolio: IFI covers real estate only.',
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
    note: 'Wealth: IVAFE, 0.2% a year on the market value of financial assets held abroad (gross; the loan is not deducted). Inheritance: 4% above a €1M allowance per child. Worldwide reach for a resident decedent is believed but not verified on the source; modelled as applying. The US–Italy treaty is ignored, as is the €300k flat-tax option that replaces IVAFE.',
    sources: ['https://taxsummaries.pwc.com/italy/individual/other-taxes'],
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
    inheritance: { perHeirAllowance: 0, bands: flat(0.01) },
    note: 'Inheritance: 1% under the Law 7582 new-resident regime (normally 1–30%). Sources disagree on whether the rate keys off the decedent or the heir, and the research suggests a foreign resident\'s US securities left to US heirs may be out of scope entirely; modelled as 1% of the estate as the cautious reading. The reported ~TRY 2.9m child exemption is unverified and not applied, and the regime\'s 20-year limit is ignored. No wealth tax.',
    sources: [
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
    note: 'No wealth or inheritance tax: Austria has no wealth, inheritance, estate or gift tax. Not modelled: funds not registered with Austria\'s tax office (OeKB), which likely include US-domiciled ETFs, are taxed every year on a deemed distribution of 90% of their growth (minimum 10% of year-end value) at 27.5%, so a never-sell ETF portfolio pays Austrian tax each year anyway. Individual US stocks are not caught. Dividends are taxed at 27.5% as income (outside this entry).',
    sources: [
      'https://taxsummaries.pwc.com/austria/individual/other-taxes',
      'https://taxsummaries.pwc.com/austria/individual/income-determination',
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
    note: 'Wealth: Bienes Personales on residents\' assets in Argentina and abroad above the ARS 384.7M allowance. Rates (0.5–1.0% for FY2025) fall to 0.25% by 2027 under Law 27.743; the steady-state 0.25% is used. Modelled on gross assets (the research does not say debts are deductible). Inheritance: none in the City of Buenos Aires (only Buenos Aires Province levies one).',
    sources: ['https://taxsummaries.pwc.com/argentina/individual/other-taxes'],
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
    note: 'Inheritance: a flat 6% estate tax on the worldwide net estate of resident aliens, after the PHP 5m standard deduction (split equally across the modelled heirs). Wealth tax not verified; none modelled.',
    sources: ['https://www.respicio.ph/commentaries/estate-tax-computation-guidelines-in-the-philippines'],
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
    note: 'Inheritance: up to 55% (above JPY 600m per heir\'s share) after a basic exemption of JPY 30m + 6m per heir. A foreign national\'s overseas assets come in after 10 of 15 years\' domicile, so it applies when the horizon is more than 10 years after the move. The research gives the top rate; the lower steps follow the statutory table. The US–Japan treaty credit is ignored. No wealth tax.',
    sources: ['https://taxsummaries.pwc.com/japan/individual/other-taxes'],
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
 *  every Spanish city must carry its region's rules (a test checks this). */
export const LOCAL_TAX_BY_CITY: Record<string, LocalTax> = {
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
