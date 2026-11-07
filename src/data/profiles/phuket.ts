import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Island resort life with an accredited hospital',
  summary:
    'Phuket pairs a beach-island lifestyle and a large foreign community with Bangkok Hospital Phuket, JCI-accredited since 2009. Thailand\'s profile is workable for BBD (no wealth tax, heirs abroad outside inheritance tax, LTR exemption on remitted foreign income), but there are no US nonstops and insurance entry ages bite after 65.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Bangkok Hospital Phuket has been JCI-accredited since 2009 (its 6th cycle covers 2025–2028), with Phuket International Hospital and Mission Hospital as other private options and Vachira Phuket as the public hospital; foreigners rely on private insurance, and most Thai insurers take new applicants only under 60–65 (Pacific Cross to 75).',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia; the US rates Thailand Level 1, with Level 2 only for border areas (secondary source), and the UK flags the far south (Pattani, Yala, Narathiwat, parts of Songkhla), not Phuket (Oct 2026); road safety is poor.',
    visa: 'Retirement (Non-O or O-A, age 50+): THB 800,000 in a Thai bank or THB 65,000/month of income, renewed yearly with 90-day reporting; O-A needs USD 100k health cover (or a USD 100k deposit), the in-country Non-O extension none; the 10-year LTR Wealthy Pensioner (50+) needs USD 80,000/year of passive income that you must actually show (or USD 40,000 plus USD 250,000 invested in Thailand).',
    tax: 'No wealth tax; since 2024, residents present 180+ days a year pay up to 35% on foreign income arising from 2024 when it is brought into Thailand, so dividends left in the US account are untaxed; LTR holders are exempt on remitted foreign income (Royal Decree 743), relief for others is unenacted (Oct 2026), and whether remitted margin-loan proceeds count is unverified (they are probably not assessable income).',
    estate:
      'Inheritance tax (5% for descendants above THB 100m per heir) is paid by the heir and reaches non-Thai heirs living abroad only on property in Thailand, so US assets left to US-resident children are outside it; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts Thailand residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Thailand in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Tropical monsoon: highs about 32 °C all year, dry December–March, and about 2,200 mm of rain a year, peaking in September.',
    community:
      'A large foreign population: the 2010 census counted about 116,000 "expatriates", 21% of residents (a figure flagged as possibly inaccurate), mixing retirees with tourism workers and nomads.',
    access: 'Phuket airport (HKT) has no US nonstops; one-stop routes run via Dubai, Abu Dhabi, Singapore, Seoul, Hong Kong or Istanbul.',
  },
  drawbacks: [
    'No US nonstops, and long one-stop trips home',
    'Most Thai insurers stop taking new applicants at 60–65',
    'Foreign income brought into Thailand is taxable unless you hold the LTR visa',
  ],
  sources: [
    {
      name: 'Bangkok Hospital Phuket: Joint Commission International accreditation',
      url: 'https://www.bangkokhospital.com/en/phuket/about-us/awards-accreditations/joint-commission-international-accreditation-jci',
    },
    { name: 'Wikipedia: Phuket province', url: 'https://en.wikipedia.org/wiki/Phuket_province' },
    { name: 'Wikipedia: Phuket International Airport', url: 'https://en.wikipedia.org/wiki/Phuket_International_Airport' },
    { name: 'Travel Advisory: Thailand (US levels)', url: 'https://www.traveladvisory.io/advisory/thailand' },
    { name: 'GOV.UK: Thailand travel advice', url: 'https://www.gov.uk/foreign-travel-advice/thailand', edition: '2026' },
    {
      name: 'Thai Law Online: Thailand foreign income remittance tax, what applies in 2026',
      url: 'https://www.thailawonline.com/thailand-foreign-income-tax-2026-what-actually-applies/',
    },
    {
      name: 'BOI: Royal Decree No. 743 (LTR tax exemptions)',
      url: 'https://ltr.boi.go.th/documents/Royal%20Decree%20issued%20under%20the%20Revenue%20Code%20No.743%20(EN).pdf',
    },
    { name: 'BOI: Long-Term Resident visa', url: 'https://ltr.boi.go.th/' },
    S.thRetire,
    { name: 'PwC: Thailand, other taxes', url: 'https://taxsummaries.pwc.com/thailand/individual/other-taxes' },
    {
      name: 'Forvis Mazars: Thailand Inheritance Tax Act',
      url: 'https://www.forvismazars.com/th/en/insights/doing-business-in-thailand/tax/inheritance-tax-act',
    },
    { name: 'Pattaya Mail: health insurance entry ages and premiums for retirees', url: 'https://www.pattayamail.com/latestnews/news/547221-547221' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.seaGpi,
  ],
}

export default profile
