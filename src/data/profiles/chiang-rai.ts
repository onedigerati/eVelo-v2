import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Quieter, cheaper northern Thailand, with the worst of the smoke',
  summary:
    'Chiang Rai has Thailand\'s BBD profile (no wealth tax, heirs abroad outside inheritance tax, and an LTR visa that exempts remitted foreign income) at some of the lowest costs of any pick. It ranks below Chiang Mai because the burning-season smoke is worse (the air-quality index hit 269 on 2 Apr 2026, the highest in Thailand that day), and it has fewer specialists, flights and expats.',
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 2, community: 3, tax: 4, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals in town (Bangkok Hospital Chiang Rai, Overbrook, Kasemrad Sriburin, Chiang Rai Inter), and Overbrook reportedly claims JCI accreditation (secondary); specialist care is often in Chiang Mai, about 3.5 hours away; foreigners are outside the public schemes, and most Thai insurers take new applicants only under 60–65 (Pacific Cross to 75).',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia, and is reportedly at US Level 1 (an old 2023 stamp; secondary); UK warnings cover only the deep south and the Cambodian border, not Chiang Rai; road safety is poor.',
    visa: 'Retirement (Non-O or O-A, age 50+): THB 800,000 in a Thai bank or THB 65,000/month of income, renewed yearly with 90-day reporting; O-A needs USD 100k health cover (or a USD 100k deposit), the in-country Non-O extension none; the 10-year LTR Wealthy Pensioner (50+) needs USD 80,000/year of passive income that you must actually show (or USD 40,000 plus USD 250,000 invested in Thailand).',
    tax: 'No wealth tax; since 2024, residents present 180+ days a year pay up to 35% on foreign income arising from 2024 when it is brought into Thailand, so dividends left in the US account are untaxed; LTR holders are exempt on remitted foreign income (Royal Decree 743), relief for others is unenacted (Oct 2026), and whether remitted margin-loan proceeds count is unverified (they are probably not assessable income).',
    estate:
      'Inheritance tax (5% for descendants above THB 100m per heir) is paid by the heir and reaches non-Thai heirs living abroad only on property in Thailand, so US assets left to US-resident children are outside it; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts Thailand residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Thailand in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical wet-and-dry: a pleasant cool season (roughly November–February), then a hot, smoky burning season with April highs near 34.5°C and an air-quality index of 269 on 2 Apr 2026, worse than Chiang Mai; Typhoon Yagi\'s floods in September 2024 killed at least 36 people in the province and closed the airport.',
    community:
      'A small Western retiree community in a city of about 70,000, far smaller than Chiang Mai\'s (no headcount found); English is less widely spoken than in Chiang Mai or Bangkok.',
    access:
      'No US nonstops: Chiang Rai airport flies to Bangkok (Don Mueang and Suvarnabhumi), Phuket and Singapore (Scoot), so the US is two or more connections and 20+ hours away.',
  },
  drawbacks: [
    'Burning-season smoke among Thailand\'s worst, and many expats leave for 2–3 months',
    'Specialists, and most flights, are in Chiang Mai or Bangkok',
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
    { name: 'Nation Thailand: Chiang Rai air quality worst in Thailand (2 Apr 2026)', url: 'https://www.nationthailand.com/news/general/40064573', edition: '2026' },
    { name: 'Wikipedia: Chiang Rai', url: 'https://en.wikipedia.org/wiki/Chiang_Rai' },
    { name: 'Wikipedia: Mae Fah Luang–Chiang Rai International Airport', url: 'https://en.wikipedia.org/wiki/Mae_Fah_Luang_%E2%80%93_Chiang_Rai_International_Airport' },
    { name: 'Wikipedia: Typhoon Yagi', url: 'https://en.wikipedia.org/wiki/Typhoon_Yagi' },
    { name: 'GOV.UK: Thailand travel advice, warnings and insurance', url: 'https://www.gov.uk/foreign-travel-advice/thailand/warnings-and-insurance' },
    { name: 'Travel Advisory: Thailand (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/thailand' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.seaGpi,
  ],
}

export default profile
