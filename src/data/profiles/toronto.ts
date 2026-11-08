import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Safe, English-speaking and an hour from the US, but no way to stay',
  summary:
    'Toronto is a big, safe, English-speaking city (Canada is 14th in the 2026 Global Peace Index) with Toronto General, ranked 2nd in the world by Newsweek in 2026, and nonstops to dozens of US cities. For buy-borrow-die it is a base for long summer visits, not a retirement home: Canada has no retiree or passive-income visa, so a US citizen can normally stay up to 6 months at a time. Anyone who did become resident would pay up to 53.5% on US dividends, and at death Canada taxes every gain accrued since arrival as if the portfolio were sold, which undoes the step-up that buy-borrow-die relies on.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 1, climate: 2, community: 5, tax: 2, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Excellent teaching hospitals: Toronto General (UHN) was ranked 2nd in the world in Newsweek\'s 2026 list, with Mount Sinai and Sunnybrook also in its top 30; Ontario\'s OHIP covers only citizens, permanent residents and some permit holders, with no waiting period once eligible, so a visitor pays hospital bills in full and needs travel medical cover, which often caps age or pre-existing conditions.',
    safety:
      'Canada is 14th of 163 in the 2026 Global Peace Index and at US Level 1, "exercise normal precautions" (June 2026); violent crime is low by US big-city standards, though car theft and some downtown disorder draw complaints.',
    visa: 'No retirement or passive-income visa: a US citizen can normally visit for up to 6 months (the border officer sets the stay; a longer one needs an extension applied for at least 30 days before it ends), and savings or a portfolio alone give no right to live there; Quebec\'s Investor Program is open with no cap (2026) but needs CAD 2M net worth, a CAD 1M five-year placement returned without interest plus a CAD 200k non-refundable contribution, oral French at level 7 and 2 years of management experience in the last 5, and it is for people who intend to live in Quebec, so what is left is a Canadian spouse or partner, skilled work through Express Entry (no age points after 45), or, for a parent or grandparent of a Canadian citizen or permanent resident, the super visa, which allows stays of up to 5 years at a time with private medical insurance.',
    tax: 'No wealth tax; residents (generally those who settle there, or anyone present 183 days in a year) pay tax on worldwide income, and foreign dividends get no dividend tax credit, so US dividends and interest are taxed at up to 53.5% combined federal and Ontario (2026); under the US–Canada treaty Canada credits US tax on US dividends only up to 15% and the US credits the Canadian tax on the rest, so a US citizen pays about the Canadian rate overall; half of a realised gain is taxable (up to 26.8%), and a new resident\'s cost base is reset to market value on arrival; a visitor under 6 months a year with a US home generally stays outside all this.',
    estate:
      'No inheritance or estate tax, but at death a resident is taxed as if all capital property were sold at market value, so gains accrued since arrival pay up to 26.8% (a spouse can defer it), and leaving Canada triggers the same departure tax; Ontario\'s probate tax is 1.5% of an estate above CAD 50k; the US–Canada treaty lets Canada credit US estate tax on US property and the US credit Canada\'s tax at death on non-US property, but below the $15M US exemption (2026) there is no US estate tax, so the Canadian tax is simply paid.',
    lending:
      'IBKR serves Canadian residents through Interactive Brokers Canada (margin under CIRO rules), while Schwab One International reportedly does not accept Canada residents (October 2026); US brokers reportedly often restrict accounts once the holder lives in Canada, so plan on IBKR Canada or a Canadian bank broker.',
    climate:
      'Humid continental: warm, humid summers (July highs about 27 °C / 81 °F) and cold, grey winters (January highs about −1 °C / 30 °F) with about 120 cm of snow; spring and autumn are short and pleasant.',
    community:
      'English-speaking, and nearly half its residents were born abroad (2021 census), so newcomers from everywhere, Americans included, fit in easily; nothing about daily life needs another language.',
    access:
      'Pearson has nonstops to dozens of US cities on Air Canada, WestJet, Porter, American, United and Delta, most cleared through US preclearance before boarding; New York is about 1.5 hours away, and Buffalo is a 2-hour drive.',
  },
  drawbacks: [
    'No visa for a retiree living on a portfolio: visits of up to 6 months only',
    'For residents, up to 53.5% on US dividends and tax on all gains at death',
    'Long, cold winters and housing costs close to a large US city',
  ],
  sources: [
    { name: 'PwC: Canada, taxes on personal income', url: 'https://taxsummaries.pwc.com/canada/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Canada, other taxes', url: 'https://taxsummaries.pwc.com/canada/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Canada, income determination', url: 'https://taxsummaries.pwc.com/canada/individual/income-determination', edition: '2026' },
    { name: 'Justice Laws: Income Tax Act, section 70 (death of a taxpayer)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-70.html' },
    {
      name: 'CRA: dispositions of property when leaving or entering Canada',
      url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/dispositions-property.html',
    },
    { name: 'Morningstar Canada: how taxes on dividends differ', url: 'https://global.morningstar.com/en-ca/personal-finance/how-taxes-on-dividends-differ' },
    { name: 'Ontario: Estate Administration Tax', url: 'https://www.ontario.ca/page/estate-administration-tax' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'IRCC: parent and grandparent super visa', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html' },
    { name: 'IRCC: how long can I stay in Canada as a visitor', url: 'https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1016&top=16' },
    { name: 'Québec: Programme des investisseurs, conditions', url: 'https://www.quebec.ca/immigration/permanente/immigrer-affaires/investisseurs/conditions', edition: '2026' },
    {
      name: 'Québec: Programme des investisseurs, présenter une demande (any time, no cap)',
      url: 'https://www.quebec.ca/immigration/permanente/immigrer-affaires/investisseurs/presenter-demande',
      edition: '2026',
    },
    {
      name: 'Finance Canada: Canada–US tax convention (Arts. XXIV and XXIX B)',
      url: 'https://www.canada.ca/en/department-finance/programs/tax-policy/tax-treaties/country/united-states-america-convention-consolidated-1980-1983-1984-1995-1997-2007.html',
    },
    { name: 'Ontario: apply for OHIP and get a health card', url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card' },
    {
      name: 'UHN: Toronto General ranked 2nd in Newsweek\'s World\'s Best Hospitals',
      url: 'https://www.uhn.ca/corporate/News/PressReleases/Pages/canadian-hospital-now-ranked-2-in-the-world.aspx',
      edition: '2026',
    },
    { name: 'Sinai Health: Mount Sinai ranked 27th in Newsweek\'s World\'s Best Hospitals', url: 'https://www.sinaihealth.ca/news/mount-sinai-hospital-ranked-second-best-hospital-in-canada', edition: '2026' },
    { name: 'Daily Hive: Canada among the 20 most peaceful countries (GPI 2026)', url: 'https://dailyhive.com/canada/canada-us-global-peace-index-2026', edition: '2026' },
    { name: 'Travel Advisory: Canada (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/canada' },
    { name: 'Interactive Brokers Canada', url: 'https://www.interactivebrokers.ca/en/home.php' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: demographics of Toronto', url: 'https://en.wikipedia.org/wiki/Demographics_of_Toronto' },
    { name: 'Wikipedia: climate of Toronto', url: 'https://en.wikipedia.org/wiki/Climate_of_Toronto' },
    { name: 'Wikipedia: Toronto Pearson International Airport', url: 'https://en.wikipedia.org/wiki/Toronto_Pearson_International_Airport' },
  ],
}

export default profile
