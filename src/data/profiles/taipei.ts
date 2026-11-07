import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Safe, efficient Asian capital, no retiree visa',
  summary:
    'Taipei pairs very low crime, strong teaching hospitals and the National Health Insurance with a mild BBD tax profile: no wealth tax, foreign income taxed only above a high threshold, and estate tax that reaches only Taiwan-sited assets for foreigners. The obstacle is residency: there is no retirement or passive-income visa, so it ranks low for a portfolio retiree.',
  scores: { cost: 3, healthcare: 5, safety: 4, visa: 1, climate: 3, community: 2, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'National Taiwan University Hospital, the country\'s largest public hospital (about 2,400 beds), and other major teaching hospitals are in the city; ARC holders without an employer join National Health Insurance after 6 months of continuous residence (one trip under 30 days allowed), paying about 4.69% of the insured-salary basis, and keep paying while abroad (secondary source).',
    safety:
      'Taiwan is 42nd of 163 in the 2026 Global Peace Index (25th on societal safety), held back by regional military tension; the UK says crime rates are extremely low, and the risks are earthquakes, typhoons and scooter-heavy traffic.',
    visa: 'No retirement or passive-income visa: the Resident Visa for Investment needs a USD 200,000 business investment approved by the Ministry of Economic Affairs (a portfolio does not count) and cannot be switched to after visa-free entry; other routes, such as the Employment Gold Card, need work credentials.',
    tax: 'No wealth tax; regular income tax is territorial, and residents (183+ days) owe the Income Basic Tax only when foreign income is TWD 1m or more, at 20% of basic income above TWD 7.5m and only to the extent it exceeds regular tax, with a foreign tax credit, so up to about TWD 7.5m (roughly $230k) a year of foreign dividends and interest is effectively untaxed.',
    estate:
      'Estate tax of 10–20% (exemption TWD 13.33m) reaches only property located in Taiwan for non-ROC nationals (Estate and Gift Tax Act Art. 1), so a US citizen\'s US brokerage account is outside it; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'IBKR reportedly serves Taiwan residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Taiwan in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Humid subtropical: mild, damp winters (January about 14–19 °C) and hot, humid summers (July highs about 35 °C), about 1,900 mm of rain a year, and typhoons from roughly May to November.',
    community:
      'About 72,000 foreign residents (end of 2022), mostly from Indonesia, the Philippines and Japan; the English-speaking retiree community is small, though English is common in hospitals and transit.',
    access:
      'Taoyuan airport (TPE) has nonstops to about 11 US cities on EVA Air, China Airlines, Starlux, United (San Francisco) and Delta (Seattle), including Los Angeles, New York, Chicago, Dallas, Houston and Washington.',
  },
  drawbacks: [
    'No residence route on a portfolio: a USD 200k business investment or work-based Gold Card',
    'Hot, humid summers, typhoons and earthquake risk',
    'A small English-speaking retiree community, and regional military tension',
  ],
  sources: [
    { name: 'PwC: Taiwan, other taxes', url: 'https://taxsummaries.pwc.com/taiwan/individual/other-taxes' },
    { name: 'PwC: Taiwan, taxes on personal income', url: 'https://taxsummaries.pwc.com/taiwan/individual/taxes-on-personal-income' },
    { name: 'Laws & Regulations Database of the ROC: Estate and Gift Tax Act', url: 'https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=G0340072' },
    {
      name: 'TECO: Resident visas for investment (updated Jul 2024)',
      url: 'https://www.roc-taiwan.org/uploads/sites/76/2023/04/14.-Resident-Visas-for-Investment-20240731-updated.pdf',
      edition: '2024',
    },
    { name: 'Taiwan Gold Card community: health insurance FAQ', url: 'https://taiwangoldcard.com/goldcard-holders-faq/health-insurance/' },
    { name: 'Wikipedia: National Taiwan University Hospital', url: 'https://en.wikipedia.org/wiki/National_Taiwan_University_Hospital' },
    { name: 'Focus Taiwan: Taiwan 42nd in the 2026 Global Peace Index', url: 'https://focustaiwan.tw/politics/202606110011', edition: '2026' },
    { name: 'GOV.UK: Taiwan travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/taiwan/safety-and-security' },
    { name: 'Wikipedia: Taipei', url: 'https://en.wikipedia.org/wiki/Taipei' },
    { name: 'Wikipedia: Taoyuan International Airport', url: 'https://en.wikipedia.org/wiki/Taoyuan_International_Airport' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
