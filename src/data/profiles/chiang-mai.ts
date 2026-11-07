import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Very low cost, easy 50+ retirement visa',
  summary:
    'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Chiang Mai is one of the cheapest well-served retiree cities anywhere. For BBD there is no wealth tax, heirs abroad are outside inheritance tax and the LTR visa exempts remitted foreign income, but whether brought-in loan proceeds are taxable is unconfirmed and insurers cap entry ages.',
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 3, community: 5, tax: 4, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Good, low-cost private hospitals (Bangkok Hospital Chiang Mai, Chiang Mai Ram); complex care is often referred to Bangkok; foreigners are outside the public schemes, and most Thai insurers take new applicants only under 60–65 (Pacific Cross to 75).',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor.',
    visa: 'Retirement (Non-O or O-A, age 50+): THB 800,000 in a Thai bank or THB 65,000/month of income, renewed yearly with 90-day reporting; O-A needs USD 100k health cover (or a USD 100k deposit), the in-country Non-O extension none; the 10-year LTR Wealthy Pensioner (50+) needs USD 80,000/year of passive income that you must actually show (or USD 40,000 plus USD 250,000 invested in Thailand).',
    tax: 'No wealth tax; since 2024, residents present 180+ days a year pay up to 35% on foreign income arising from 2024 when it is brought into Thailand, so dividends left in the US account are untaxed; LTR holders are exempt on remitted foreign income (Royal Decree 743), relief for others is unenacted (Oct 2026), and whether remitted margin-loan proceeds count is unverified (they are probably not assessable income).',
    estate:
      'Inheritance tax (5% for descendants above THB 100m per heir) is paid by the heir and reaches non-Thai heirs living abroad only on property in Thailand, so US assets left to US-resident children are outside it; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts Thailand residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Thailand in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'A pleasant cool season (November–February), then a hot, smoky burning season (roughly February–April) with some of the world\'s worst air quality.',
    community: 'A large, long-standing Western retiree and digital-nomad community, with many English-language clubs and services.',
    access: 'No US nonstops; connect via Bangkok, Tokyo, Seoul or Taipei, typically 20+ hours.',
  },
  drawbacks: [
    'Burning-season air pollution is severe, and many expats leave for 2–3 months',
    'Most Thai insurers stop taking new applicants at 60–65, and the visa needs yearly renewal',
    'Foreign income brought into Thailand is taxable unless you hold the LTR visa',
  ],
  sources: [
    S.thRetire,
    { name: 'PwC: Thailand, other taxes', url: 'https://taxsummaries.pwc.com/thailand/individual/other-taxes' },
    {
      name: 'Forvis Mazars: Thailand Inheritance Tax Act',
      url: 'https://www.forvismazars.com/th/en/insights/doing-business-in-thailand/tax/inheritance-tax-act',
    },
    {
      name: 'Thai Law Online: Thailand foreign income remittance tax, what applies in 2026',
      url: 'https://www.thailawonline.com/thailand-foreign-income-tax-2026-what-actually-applies/',
    },
    {
      name: 'BOI: Royal Decree No. 743 (LTR tax exemptions)',
      url: 'https://ltr.boi.go.th/documents/Royal%20Decree%20issued%20under%20the%20Revenue%20Code%20No.743%20(EN).pdf',
    },
    { name: 'BOI: Long-Term Resident visa', url: 'https://ltr.boi.go.th/' },
    { name: 'Royal Thai Embassy Oslo: Non-Immigrant O-A (long stay)', url: 'https://oslo.thaiembassy.org/en/page/non-immigrant-o-a-long-stay' },
    { name: 'Pattaya Mail: health insurance entry ages and premiums for retirees', url: 'https://www.pattayamail.com/latestnews/news/547221-547221' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.seaGpi,
    { name: 'Nation Thailand: Thailand 86th in GPI 2025', url: 'https://www.nationthailand.com/sustaination/40052489', edition: '2025' },
  ],
}

export default profile
