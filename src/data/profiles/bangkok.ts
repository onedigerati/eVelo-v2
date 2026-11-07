import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'World-class private hospitals, big-city Asian hub',
  summary:
    'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Bangkok\'s private hospitals are among Asia\'s leading medical-tourism centres. It has the same 50+ retirement visa as Chiang Mai, plus a 10-year LTR visa that exempts remitted foreign income; there is no wealth tax and heirs abroad are outside inheritance tax.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4, tax: 4, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Internationally accredited private hospitals (Bumrungrad, Bangkok Hospital, Samitivej, Medpark) with English-speaking, often US-trained specialists, well below US prices; foreigners are outside the public schemes, and most Thai insurers take new applicants only under 60–65 (Pacific Cross to 75).',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor and political protests recur.',
    visa: 'Retirement (Non-O or O-A, age 50+): THB 800,000 in a Thai bank or THB 65,000/month of income, renewed yearly with 90-day reporting; O-A needs USD 100k health cover (or a USD 100k deposit); the 10-year LTR Wealthy Pensioner (50+) needs USD 80,000/year of passive income, investment returns included (or USD 40,000 plus USD 250,000 invested in Thailand), and Wealthy Global Citizen USD 1M in assets plus USD 500k in Thailand.',
    tax: 'No wealth tax; since 2024, residents present 180+ days a year pay up to 35% on foreign income arising from 2024 when it is brought into Thailand, so dividends left in the US account are untaxed; LTR holders are exempt on remitted foreign income (Royal Decree 743), relief for others is unenacted (Oct 2026), and whether remitted margin-loan proceeds count is unverified (they are probably not assessable income).',
    estate:
      'Inheritance tax (5% for descendants above THB 100m per heir) is paid by the heir and reaches non-Thai heirs living abroad only on property in Thailand, so US assets left to US-resident children are outside it; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts Thailand residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Thailand in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Hot and humid all year (about 30–35°C), with a wet season (roughly June–October) that floods streets, and smoggy air in the dry months.',
    community: 'A large expat community along Sukhumvit and in Sathorn, with plenty of English-language services, though more working expats than retirees.',
    access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei or Hong Kong (United flies Los Angeles–Bangkok via Hong Kong), typically 18–22 hours.',
  },
  drawbacks: [
    'Relentless heat, rainy-season flooding and dry-season air pollution',
    'Foreign income brought into Thailand is taxable unless you hold the LTR visa',
    'Most Thai insurers stop taking new applicants at 60–65',
  ],
  sources: [
    {
      name: 'Issa Compass: Wealthy Pensioner LTR visa requirements (updated Oct 2026)',
      url: 'https://www.issacompass.com/insights/wealthy-pensioner-ltr-visa-income-requirements-the-10-year-structure-and-how-to-',
    },
    S.thRetire,
    {
      name: 'Thai Law Online: Thailand foreign income remittance tax, what applies in 2026',
      url: 'https://www.thailawonline.com/thailand-foreign-income-tax-2026-what-actually-applies/',
    },
    {
      name: 'BOI: Royal Decree No. 743 (LTR tax exemptions)',
      url: 'https://ltr.boi.go.th/documents/Royal%20Decree%20issued%20under%20the%20Revenue%20Code%20No.743%20(EN).pdf',
    },
    { name: 'BOI: Long-Term Resident visa', url: 'https://ltr.boi.go.th/' },
    { name: 'PwC: Thailand, other taxes', url: 'https://taxsummaries.pwc.com/thailand/individual/other-taxes' },
    {
      name: 'Forvis Mazars: Thailand Inheritance Tax Act',
      url: 'https://www.forvismazars.com/th/en/insights/doing-business-in-thailand/tax/inheritance-tax-act',
    },
    { name: 'Thailand Starter Kit: Thailand health insurance', url: 'https://www.thailandstarterkit.com/health/thailand-health-insurance/' },
    { name: 'Pattaya Mail: health insurance entry ages and premiums for retirees', url: 'https://www.pattayamail.com/latestnews/news/547221-547221' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.seaGpi,
  ],
}

export default profile
