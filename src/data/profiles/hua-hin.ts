import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Quiet royal beach town, Thailand\'s retiree coast',
  summary:
    'Live and Invest Overseas ranks Hua Hin 8th for 2026: a calm, low-cost beach town about 200 km south of Bangkok, with a large, retiree-heavy expat community and a JCI-accredited Bangkok Hospital branch. It shares Thailand\'s BBD profile (no wealth tax, heirs abroad outside inheritance tax, LTR exemption on remitted foreign income) and its caveats on loan proceeds and insurance ages.',
  scores: { cost: 4, healthcare: 3, safety: 3, visa: 4, climate: 3, community: 4, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Bangkok Hospital Hua Hin is JCI-accredited (from 1 March 2024) and San Paulo Hua Hin is a cheaper private option; serious cases often go to Bangkok, 2.5–3 hours by road; foreigners are outside the public schemes, and most Thai insurers take new applicants only under 60–65 (Pacific Cross to 75).',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia; Hua Hin is generally considered one of the safer Thai beach towns, and the UK advises against travel only near the far-south and Cambodian borders (Oct 2026); road safety is poor.',
    visa: 'Retirement (Non-O or O-A, age 50+): THB 800,000 in a Thai bank or THB 65,000/month of income, renewed yearly with 90-day reporting; O-A needs USD 100k health cover (or a USD 100k deposit), the in-country Non-O extension none; the 10-year LTR Wealthy Pensioner (50+) needs USD 80,000/year of passive income that you must actually show (or USD 40,000 plus USD 250,000 invested in Thailand).',
    tax: 'No wealth tax; since 2024, residents present 180+ days a year pay up to 35% on foreign income arising from 2024 when it is brought into Thailand, so dividends left in the US account are untaxed; LTR holders are exempt on remitted foreign income (Royal Decree 743), relief for others is unenacted (Oct 2026), and whether remitted margin-loan proceeds count is unverified (they are probably not assessable income).',
    estate:
      'Inheritance tax (5% for descendants above THB 100m per heir) is paid by the heir and reaches non-Thai heirs living abroad only on property in Thailand, so US assets left to US-resident children are outside it; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts Thailand residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Thailand in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Hot all year (mean highs about 32 °C, near 34 °C in April–May) but drier than most of Thailand, about 940 mm of rain a year, wettest in October; sea breezes help, and dry-season haze is milder than in the north.',
    community:
      'A large expat community for a Thai beach town, with online groups of tens of thousands, skewed to retirees, especially Scandinavians and Britons.',
    access:
      'Hua Hin airport has only a few domestic flights and no international service (Jul 2026); most arrivals fly into Bangkok and go 2.5–3 hours by road or bus, and there are no US nonstops to Bangkok.',
  },
  drawbacks: [
    'Serious medical cases mean a 2.5–3 hour trip to Bangkok',
    'Most Thai insurers stop taking new applicants at 60–65',
    'Foreign income brought into Thailand is taxable unless you hold the LTR visa',
  ],
  sources: [
    { ...S.lios, name: '401(k) Specialist: Live and Invest Overseas 2026 list' },
    { name: 'Thailand Starter Kit: living in Hua Hin', url: 'https://www.thailandstarterkit.com/moving/living-in-hua-hin/' },
    {
      name: 'Bangkok Hospital Hua Hin: Joint Commission International accreditation',
      url: 'https://www.bangkokhospital.com/en/huahin/about-us/awards-accreditations/joint-commission-international-jci-bhh',
    },
    { name: 'Wikipedia: Hua Hin', url: 'https://en.wikipedia.org/wiki/Hua_Hin' },
    { name: 'Wikipedia: Hua Hin Airport', url: 'https://en.wikipedia.org/wiki/Hua_Hin_Airport' },
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
