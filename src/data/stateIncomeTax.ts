// State (and local) income tax on investment income for the US home cities, for the
// living-on-income mode (stage 2). Research and sources: docs/research/state-muni-rules.md.
//
// Brackets are tax year 2026 as of 2026-01-01 (Tax Foundation table, 2026-02-17) unless a
// record's note says otherwise. Amounts are taken as real 2026 USD. Credits that stand in for a
// deduction (CA, OR) are converted to an equivalent deduction at the rate a typical retiree
// pays; phase-outs and age-65 extras are left out (see each note).
//
// For a national muni fund, 'in-state-exempt' and 'reciprocal' are both taken as fully taxed:
// the in-state (or reciprocating-state) share of a national fund is small and is taken as none.

import type { TaxBand } from '../engine/types'
import type { FilingStatus, MuniRule, StateIncomeTax } from '../engine/incomeTaxTypes'

const READ = '2026-11-18'
const TF_2026 = `Tax Foundation, "State Individual Income Tax Rates and Brackets, 2026" (as of 2026-01-01, published 2026-02-17), https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/ — read ${READ}`
const SS_LIST = `Kiplinger / CPA Practice Advisor, "8 states tax Social Security in 2026" (CO, CT, MN, MT, NM, RI, UT, VT), https://www.cpapracticeadvisor.com/2026/07/07/42-states-dont-tax-social-security-here-are-the-8-that-do/186336/ — via search summary ${READ}`
const MSRB = `MSRB, Tax Treatment (in-state/out-of-state muni rules vary by state), https://www.msrb.org/node/13541 — read ${READ}`

type B = [from: number, rate: number][]
const bands = (b: B): TaxBand[] => b.map(([from, rate]) => ({ from, rate }))
const same = (b: B): Record<FilingStatus, TaxBand[]> => ({ single: bands(b), mfj: bands(b) })
const flat = (rate: number) => same([[0, rate]])
const ded = (single: number, mfj: number): Record<FilingStatus, number> => ({ single, mfj })

const NONE: Pick<StateIncomeTax, 'taxesInvestmentIncome' | 'bands' | 'deduction' | 'taxesSocialSecurity' | 'taxesPensions' | 'muni'> = {
  taxesInvestmentIncome: false,
  taxesPensions: false,
  muni: 'all-exempt',
  bands: { single: [], mfj: [] },
  deduction: ded(0, 0),
  taxesSocialSecurity: false,
}

function taxing(
  state: string,
  muni: MuniRule,
  b: Record<FilingStatus, TaxBand[]>,
  deduction: Record<FilingStatus, number>,
  taxesSocialSecurity: boolean,
  sources: string[],
  note?: string,
  localRate?: number,
): StateIncomeTax {
  return {
    state,
    taxesInvestmentIncome: true,
    muni,
    bands: b,
    deduction,
    taxesSocialSecurity,
    taxesPensions: true,
    ...(localRate !== undefined ? { localRate } : {}),
    sources: [TF_2026, ...sources],
    ...(note ? { note } : {}),
  }
}

// ---------------------------------------------------------------- states without a tax on interest and dividends

const noTax = (state: string, note: string): StateIncomeTax => ({ state, ...NONE, sources: [TF_2026], note })

const FL = noTax('FL', 'No personal income tax.')
const TX = noTax('TX', 'No personal income tax.')
const NV = noTax('NV', 'No personal income tax.')
const TN = noTax('TN', 'No personal income tax; the Hall tax on interest and dividends was fully repealed from tax year 2021.')
const WA = noTax(
  'WA',
  'No tax on wages, interest or dividends. Washington taxes only long-term capital gains: 7% above a $278,000 standard deduction ' +
    '(2025 amount), with a higher rate above $1M under SB 5813 (the Tax Foundation summary says a 9% top rate; other reporting ' +
    'says 9.9%; not confirmed). The contract has no field for a gains-only tax, so it is not modelled; it reaches only large gains.',
)

// ---------------------------------------------------------------- taxing states

const NY_LOCAL_NYC = 0.03876
const NY = taxing(
  'NY',
  'in-state-exempt',
  {
    single: bands([[0, 0.039], [8500, 0.044], [11700, 0.0515], [13900, 0.054], [80650, 0.059], [215400, 0.0685], [1077550, 0.0965], [5000000, 0.103], [25000000, 0.109]]),
    mfj: bands([[0, 0.039], [17150, 0.044], [23600, 0.0515], [27900, 0.054], [161550, 0.059], [323200, 0.0685], [2155350, 0.0965], [5000000, 0.103], [25000000, 0.109]]),
  },
  ded(8000, 16050),
  false,
  [
    `NYC Comptroller, "The NYC Personal Income Tax Before and After the Pandemic", Table 1 (NYC resident rates 3.078%–3.876%; top 3.876% above $50k single / $90k MFJ; unchanged since 2017), https://comptroller.nyc.gov/reports/the-nyc-personal-income-tax-before-and-after-the-pandemic — read ${READ}`,
    MSRB,
    SS_LIST,
  ],
  'NYC resident tax is graduated (3.078%–3.876%); taken as a flat 3.876%, the rate above $50k single / $90k MFJ of NYC taxable income, ' +
    'so it overstates slightly at low incomes. NY recaptures the benefit of lower brackets for high earners (not modelled). ' +
    'The $20k pension/annuity exclusion for 59½+ does not cover interest or dividends; it is a partial pension exclusion, so taxesPensions ' +
    'stays true (not modelled), and NY government pensions are exempt (not modelled).',
  NY_LOCAL_NYC,
)

const CA = taxing(
  'CA',
  'in-state-exempt',
  {
    single: bands([[0, 0.01], [11079, 0.02], [26264, 0.04], [41452, 0.06], [57542, 0.08], [72724, 0.093], [371479, 0.103], [445771, 0.113], [742953, 0.123], [1000000, 0.133]]),
    mfj: bands([[0, 0.01], [22158, 0.02], [52528, 0.04], [82904, 0.06], [115084, 0.08], [145448, 0.093], [742958, 0.103], [891542, 0.113], [1000000, 0.123], [1485906, 0.133]]),
  },
  // $5,540 / $11,080 standard deduction plus the $153 / $306 exemption credit taken at 9.3%.
  ded(7185, 14370),
  false,
  [MSRB, SS_LIST],
  'The top 13.3% includes the 1% Mental Health Services surtax above $1M (single and MFJ alike; the MFJ band list follows the Tax Foundation table). ' +
    'Exemption credits converted to a deduction at 9.3%; their high-income phase-out is not modelled. ' +
    'Pensions are fully taxed. ' +
    'A muni fund passes through California exemption only if at least 50% is in California munis (not verified); a national fund does not.',
)

const OR = taxing(
  'OR',
  'in-state-exempt',
  {
    single: bands([[0, 0.0475], [4550, 0.0675], [11400, 0.0875], [125000, 0.099]]),
    mfj: bands([[0, 0.0475], [9100, 0.0675], [22800, 0.0875], [250000, 0.099]]),
  },
  // $2,910 / $5,820 standard deduction plus the $256 / $512 exemption credit taken at 8.75%.
  ded(5836, 11671),
  false,
  [
    `Metro SHS / Multnomah County PFA: Metro & Multnomah County 2026 tax tables, https://multco.us/file/2026_multnomah_count_preschool_for_all_personal_income_tax_tables/download and Portland Revenue Division, https://www.portland.gov/revenue/personal-tax — via search summary ${READ}`,
    MSRB,
    SS_LIST,
  ],
  'Exemption credit lost above $100k / $200k AGI (not modelled). Oregon allows a deduction for some federal tax paid (not modelled). ' +
    'Pensions taxed (an income-limited retirement income credit and the federal-pension subtraction are not modelled). ' +
    'Portland-area local income taxes do reach interest and dividends, but only above high thresholds: Metro SHS 1% of taxable income above ' +
    '$128k single / $205k MFJ (2026, via search summary), and Multnomah PFA 1.5% above $125k / $200k and 3% above $250k / $400k ' +
    '(figures unconfirmed; a 2026 rate increase was delayed). They are not a flat rate on the whole base, so localRate is left out.',
)

const CO = taxing(
  'CO',
  'in-state-exempt',
  flat(0.044),
  ded(16100, 32200),
  false,
  [
    `Colorado DOR, Social Security, Pensions and Annuities (Jan 2025), https://tax.colorado.gov/sites/tax/files/documents/ITT_Social_Security_Pensions_and_Annuities_Jan_2025.pdf; age rules via search summary ${READ}`,
    MSRB,
    SS_LIST,
  ],
  'Colorado starts from federal taxable income, so the federal standard deduction is the deduction. Colorado nominally taxes Social Security, ' +
    'but from 65 all of it is subtracted, and at 55–64 all of it if AGI ≤ $75k / $95k (else up to $20k): taken as untaxed. ' +
    'The 4.4% rate can fall temporarily under TABOR refunds (not modelled). Pensions are taxed beyond a partial subtraction ' +
    '($24k at 65+, shared with Social Security; not modelled), so taxesPensions stays true.',
)

const AZ = taxing('AZ', 'in-state-exempt', flat(0.025), ded(8350, 16700), false, [MSRB, SS_LIST],
  'Flat 2.5%. Age-65 extra deduction not modelled. Pensions taxed (a small government-pension subtraction is not modelled).')

const IL: StateIncomeTax = { ...taxing(
  'IL',
  'all-taxed',
  flat(0.0495),
  ded(2925, 5850),
  false,
  [
    `Illinois DOR, 2025 IL-1040 instructions, Step 2 Line 2: "Enter the amount of federally tax-exempt interest and dividend income reported on federal Form 1040 ... Line 2a" (added back, in-state and out-of-state alike), https://tax.illinois.gov/forms/incometax/currentyear/individual/il-1040-instr/step-2---income.html — read ${READ}`,
  ],
  'Exemption not allowed above $250k / $500k AGI (not modelled). Illinois subtracts Social Security and most retirement income. ' +
    'A few specific Illinois bond issues are exempt by statute; a national fund holds few if any, so all muni interest is taken as taxed. ' +
    'Qualified pensions and retirement-plan income are subtracted (taxesPensions false).',
), taxesPensions: false }

const MN = taxing(
  'MN',
  'in-state-exempt',
  {
    single: bands([[0, 0.0535], [33310, 0.068], [109430, 0.0785], [203150, 0.0985]]),
    mfj: bands([[0, 0.0535], [48700, 0.068], [193480, 0.0785], [337930, 0.0985]]),
  },
  ded(15300, 30600),
  true,
  [
    `Minnesota Social Security subtraction (100%, less 10% per $4,000 of AGI above a threshold, ~$108k MFJ in 2025), MN House research and MN DOR inflation-adjusted amounts 2026, https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf — via search summary ${READ}`,
    MSRB,
    SS_LIST,
  ],
  'Minnesota taxes Social Security but subtracts all of it below an AGI threshold (about $108k MFJ / $84k single, phasing out above): ' +
    'modelled as taxed (the federally taxable part), which overstates tax for lower-income retirees. Thresholds not confirmed from a primary page. ' +
    'Pensions are taxed (taxesPensions true).',
)

const MO: StateIncomeTax = {
  ...taxing(
    'MO',
    'in-state-exempt',
    same([[0, 0], [1348, 0.02], [2696, 0.025], [4044, 0.03], [5392, 0.035], [6740, 0.04], [8088, 0.045], [9436, 0.047]]),
    ded(16100, 32200),
    false,
    [
      `Kansas City earnings tax (1% on earned income of residents; interest and dividends excluded), KCMO tax FAQs, https://kcmo.gov/city-hall/departments/finance/tax-home/tax-faqs — via search summary ${READ}`,
      `Missouri DOR news release: "Effective January 1, 2025, individuals can deduct 100% of all capital gains reported for federal income tax purposes when calculating their Missouri adjusted gross income" (HB 594, RSMo § 143.121), https://dor.mo.gov/news/newsitem/uuid/15044650-59dd-48f4-975a-01988d485255 — via search summary ${READ}`,
      `Missouri DOR, 2025 Tax Legislative Changes, https://dor.mo.gov/taxation/individual/tax-types/income/year-changes/documents/2025-Tax-Legislative-Changes.pdf — via search summary ${READ}`,
      MSRB,
    ],
    'Missouri exempts Social Security from 2024 (city notes). From tax year 2025 individuals subtract 100% of federally reported capital ' +
      'gains (HB 594; Missouri DOR), modelled as gainsExclusion = 1 on long-term gains. The Kansas City and St. Louis 1% earnings taxes ' +
      'reach wages and business profits only, not interest or dividends, so no localRate. Some federal tax paid is deductible (not modelled). ' +
      'Public pensions are exempt and private pensions partly, subject to income limits (not modelled): taxesPensions stays true.',
  ),
  gainsExclusion: 1,
}

const GA: StateIncomeTax = {
  ...taxing(
    'GA',
    'in-state-exempt',
    flat(0.0519),
    ded(12000, 24000),
    false,
    [
      `Georgia DOR, Retirement Income Exclusion: from age 62; interest, dividends and capital gains count as retirement income; up to twice the individual amount on a joint return when both spouses qualify, https://dor.georgia.gov/retirement-income-exclusion — read ${READ} (the page defers the dollar amounts to the IT-511 worksheet)`,
      `$35,000 at 62–64 and $65,000 at 65+ per qualifying person: Georgia Dept. of Audits, Retirement Income Exclusion Summary, https://www.audits2.ga.gov/wp-content/uploads/2023/09/Retirement-Income-Exclusion-Summary.pdf, and tax-software help pages — via search summary ${READ}`,
      MSRB,
      SS_LIST,
    ],
    'Rate 5.19% as of 2026-01-01; scheduled cuts may lower it. Georgia does not tax Social Security. The retirement income exclusion ' +
      '($65,000 per person 65+, covering interest, dividends and gains) is modelled as retirementExclusionPer65; the $35,000 at 62–64 is ' +
      'not (the contract counts only filers 65+), nor the cap of $5,000 on earned income within it. Dollar amounts from secondary sources; ' +
      'the DOR page confirms which income counts and the per-spouse rule. Pensions are taxed beyond that exclusion, so taxesPensions stays true ' +
      '(the exclusion is shared with interest, dividends and pensions).',
  ),
  retirementExclusionPer65: 65000,
}

const NC = taxing('NC', 'in-state-exempt', flat(0.0399), ded(12750, 25500), false, [MSRB, SS_LIST],
  'Flat 3.99% for 2026. Pensions taxed, except government pensions vested before August 1989 (Bailey; not modelled).')

const MA = taxing(
  'MA',
  'in-state-exempt',
  same([[0, 0.05], [1083150, 0.09]]),
  ded(4400, 8800),
  false,
  [MSRB, SS_LIST],
  '5% on interest, dividends and long-term gains; short-term gains are taxed at 8.5% (not modelled). The 4% surtax above $1,083,150 ' +
    'uses the 2025 threshold (2026 not yet published at the table date) and applies per return, so MFJ shares it. Personal exemptions only, ' +
    'no standard deduction; the $700 age-65 exemption is not modelled. Massachusetts and federal government pensions are exempt, private ' +
    'pensions taxed: a partial exclusion, so taxesPensions stays true.',
)

const DC = taxing(
  'DC',
  'in-state-exempt',
  same([[0, 0.04], [10000, 0.06], [40000, 0.065], [60000, 0.085], [250000, 0.0925], [500000, 0.0975], [1000000, 0.1075]]),
  ded(16100, 32200),
  false,
  [
    `D.C. Code § 47-1803.02(a)(1)(B)(ii): for tax years beginning after 2024, individuals "shall include interest upon the obligations of a state or any political subdivision thereof", excluding DC, DC Water, WMATA and DCHFA bonds (FY2025 Budget Support Act, D.C. Law 25-217), https://code.dccouncil.gov/us/dc/council/code/sections/47-1803.02 — read ${READ}`,
    `D.C. Law 26-89 (temporary, effective 2026-02-12) does not touch muni interest, https://code.dccouncil.gov/us/dc/council/laws/26-89 — read ${READ}`,
    SS_LIST,
  ],
  'DC exempted all states\' muni interest from 2013 to 2024, but taxes out-of-state munis from tax year 2025, so it is now in-state-exempt. ' +
    'Bill B26-0116 would grandfather bonds acquired before 2025 (status not confirmed); a fund bought now gets no benefit either way. ' +
    'DC does not tax Social Security. Pensions taxed (a $3,000 exclusion of DC and federal government pensions at 62+ is not modelled).',
)

const PA_SOURCES = [MSRB, SS_LIST]
const PA = (local: { rate?: number; excludesGains?: boolean; source: string; note: string }): StateIncomeTax => ({
  ...taxing(
    'PA',
    'in-state-exempt',
    flat(0.0307),
    ded(0, 0),
    false,
    [...PA_SOURCES, local.source],
    'Flat 3.07%, no standard deduction or personal exemption. Pennsylvania does not tax Social Security, and does not tax pensions ' +
      'or retirement-plan income after retirement (taxesPensions false). ' +
      local.note,
    local.rate,
  ),
  taxesPensions: false,
  ...(local.excludesGains ? { localExcludesLongTermGains: true } : {}),
})

const PHILADELPHIA = PA({
  rate: 0.0374,
  excludesGains: true,
  source: `City of Philadelphia, School Income Tax (residents; rate table lists 3.74% for 2025, no 2026 row), https://www.phila.gov/services/payments-assistance-taxes/income-taxes/school-income-tax/ — read ${READ}; School Income Tax Regulations (updated 2023-09-25) §206(a) excludes interest on bonds of Pennsylvania, its political subdivisions and municipal authorities, and the United States; §206(b)(1) bank-deposit interest; §206(b)(3) a fund is exempt only in proportion to such holdings ("multiple state municipal bonds ... Pennsylvania Bonds represent .0278 ... $27.80 would not be subject"); §206(c) gains on property held over six months, https://www.phila.gov/media/20230926111713/Updated-School-Income-Tax-SIT-regulations.pdf — read ${READ}`,
  note:
    'Philadelphia School Income Tax 3.74% (2025 rate; a June 2026 phila.gov notice in search results gives 3.735%, but neither the SIT page nor ' +
    'a readable notice confirms it, so 3.74% is kept) taken as a flat localRate on the state base less long-term gains (localExcludesLongTermGains). ' +
    'Treasury interest is outside the base (US obligations are exempt). Other states\' munis are taxed: only the Pennsylvania share of a fund is ' +
    'exempt, taken as none for a national fund. Bank-deposit interest is exempt but bond-fund interest is not; taxableInterest is taken as taxed.',
})
const PITTSBURGH = PA({
  source: `City of Pittsburgh, Taxes (earned income tax excludes interest, dividends, pensions, Social Security, capital gains), https://www.pittsburghpa.gov/City-Government/Finances/Taxes — via search summary ${READ}`,
  note:
    'Pittsburgh\'s 3% city and school earned income tax reaches wages and profits only, not interest or dividends, so no localRate. ' +
    'An October 2026 ordinance proposes a 2% tax on unearned income (dividends, not interest) from 2027; not enacted.',
})

const HI: StateIncomeTax = { ...taxing(
  'HI',
  'in-state-exempt',
  {
    single: bands([[0, 0.014], [9600, 0.032], [14400, 0.055], [19200, 0.064], [24000, 0.068], [36000, 0.072], [48000, 0.076], [125000, 0.079], [175000, 0.0825], [225000, 0.09], [275000, 0.1], [325000, 0.11]]),
    mfj: bands([[0, 0.014], [19200, 0.032], [28800, 0.055], [38400, 0.064], [48000, 0.068], [72000, 0.072], [96000, 0.076], [250000, 0.079], [350000, 0.0825], [450000, 0.09], [550000, 0.1], [650000, 0.11]]),
  },
  // $4,400 / $8,800 standard deduction plus $1,144 per person.
  ded(5544, 11088),
  false,
  [MSRB, SS_LIST],
  'Hawaii taxes capital gains at a 7.25% cap (not modelled). Social Security and employer-funded pensions are excluded (taxesPensions false); ' +
    'the employee-contributory part of a pension and IRA/401(k) withdrawals are taxed (not modelled).',
), taxesPensions: false }

const ID = taxing(
  'ID',
  'in-state-exempt',
  { single: bands([[0, 0], [4811, 0.053]]), mfj: bands([[0, 0], [9622, 0.053]]) },
  ded(16100, 32200),
  false,
  [MSRB, SS_LIST],
  'Flat 5.3% above a zero band; the zero-band widths are the 2025 amounts (2026 not published at the table date). ' +
    'Pensions taxed (a retirement-benefits deduction for some government and military pensions at 65+ is not modelled).',
)

const UT = taxing(
  'UT',
  'reciprocal',
  flat(0.045),
  ded(0, 0),
  true,
  [
    `Utah State Tax Commission, Municipal Bond Interest (addition code 57): add interest on non-Utah municipal bonds acquired after 2003-01-01; "Do not enter interest earned on non-Utah municipal bonds if the issuer does not impose an income tax on bonds issued by Utah or the issuing state does not impose an income tax", https://incometax.utah.gov/additions/municipal-bond-interest — read ${READ}`,
    `Utah SB 71 (2025) raised the Social Security credit income limits (to $90k for joint filers), https://le.utah.gov/Session/2025/bills/introduced/SB0071.pdf — via search summary ${READ}`,
    SS_LIST,
  ],
  'Reciprocal: other states\' munis are exempt only if that state does not tax Utah bonds or has no income tax; taken as all taxed for a national fund. ' +
    'Utah\'s standard deduction is a 6% credit on the federal deduction ($966 / $1,932) that phases out above $18,213 / $36,426 AGI (2025): ' +
    'taken as zero, which overstates tax by at most the credit. Utah taxes Social Security but gives a credit below income limits ' +
    '(raised in 2025; single limit not confirmed): modelled as taxed. Rate 4.5% as of 2026-01-01. Pensions taxed (an income-limited ' +
    'retirement credit is not modelled).',
)

// ---------------------------------------------------------------- cities

export const STATE_INCOME_TAX: Record<string /* city id */, StateIncomeTax> = {
  'new-york': NY,
  'san-francisco': CA,
  'los-angeles': CA,
  'san-diego': CA,
  seattle: WA,
  portland: OR,
  denver: CO,
  austin: TX,
  dallas: TX,
  houston: TX,
  phoenix: AZ,
  scottsdale: AZ,
  'las-vegas': NV,
  chicago: IL,
  minneapolis: MN,
  'kansas-city': MO,
  'st-louis': MO,
  nashville: TN,
  atlanta: GA,
  charlotte: NC,
  raleigh: NC,
  asheville: NC,
  tampa: FL,
  miami: FL,
  orlando: FL,
  sarasota: FL,
  boston: MA,
  'washington-dc': DC,
  philadelphia: PHILADELPHIA,
  pittsburgh: PITTSBURGH,
  honolulu: HI,
  boise: ID,
  'salt-lake-city': UT,
}

/** The state income tax for a US home city; undefined for non-US cities. */
export function stateIncomeTaxFor(cityId: string): StateIncomeTax | undefined {
  return Object.prototype.hasOwnProperty.call(STATE_INCOME_TAX, cityId) ? STATE_INCOME_TAX[cityId] : undefined
}
