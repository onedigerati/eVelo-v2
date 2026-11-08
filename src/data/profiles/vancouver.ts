import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Mountains, sea and mild winters, but no visa to stay',
  summary:
    'Vancouver has the mildest winters in Canada, mountains and sea on the doorstep, good hospitals and a short hop to Seattle, in a country 14th in the 2026 Global Peace Index. For buy-borrow-die it is a base for long visits, not a retirement home: Canada has no retiree or passive-income visa, so a US citizen can normally stay up to 6 months at a time. Anyone who did become resident would pay up to 53.5% on US dividends, and at death Canada taxes every gain accrued since arrival as if the portfolio were sold, which undoes the step-up that buy-borrow-die relies on; housing is among the dearest in North America.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 1, climate: 3, community: 5, tax: 2, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Good teaching hospitals: Vancouver General is in Newsweek\'s 2026 specialized rankings (48th for endocrinology) and St. Paul\'s is a major referral centre; BC\'s Medical Services Plan covers only citizens, permanent residents and some permit holders, after a wait of the rest of the arrival month plus 2 months, so a visitor pays hospital bills in full and needs travel medical cover, which often caps age or pre-existing conditions.',
    safety:
      'Canada is 14th of 163 in the 2026 Global Peace Index and at US Level 1, "exercise normal precautions" (June 2026); violent crime is low by US big-city standards, but property crime is high and open drug use around the Downtown Eastside is a visible problem.',
    visa: 'No retirement or passive-income visa: a US citizen can normally visit for up to 6 months (the border officer sets the stay; a longer one needs an extension applied for at least 30 days before it ends), and savings or a portfolio alone give no right to live there; Quebec\'s Investor Program is open with no cap (2026) but needs CAD 2M net worth, a CAD 1M five-year placement returned without interest plus a CAD 200k non-refundable contribution, oral French at level 7 and 2 years of management experience in the last 5, and it is for people who intend to live in Quebec, so what is left is a Canadian spouse or partner, skilled work through Express Entry (no age points after 45), or, for a parent or grandparent of a Canadian citizen or permanent resident, the super visa, which allows stays of up to 5 years at a time with private medical insurance.',
    tax: 'No wealth tax; residents (generally those who settle there, or anyone present 183 days in a year) pay tax on worldwide income, and foreign dividends get no dividend tax credit, so US dividends and interest are taxed at up to 53.5% combined federal and BC (2026); under the US–Canada treaty Canada credits US tax on US dividends only up to 15% and the US credits the Canadian tax on the rest, so a US citizen pays about the Canadian rate overall; half of a realised gain is taxable (up to 26.8%), and a new resident\'s cost base is reset to market value on arrival; a visitor under 6 months a year with a US home generally stays outside all this.',
    estate:
      'No inheritance or estate tax, but at death a resident is taxed as if all capital property were sold at market value, so gains accrued since arrival pay up to 26.8% (a spouse can defer it), and leaving Canada triggers the same departure tax; BC\'s probate fee is about 1.4% of an estate above CAD 50k; the US–Canada treaty lets Canada credit US estate tax on US property and the US credit Canada\'s tax at death on non-US property, but below the $15M US exemption (2026) there is no US estate tax, so the Canadian tax is simply paid.',
    lending:
      'IBKR serves Canadian residents through Interactive Brokers Canada (margin under CIRO rules), while Schwab One International reportedly does not accept Canada residents (October 2026); US brokers reportedly often restrict accounts once the holder lives in Canada, so plan on IBKR Canada or a Canadian bank broker.',
    climate:
      'Mild oceanic: dry, sunny summers (July highs about 22 °C / 72 °F) and mild, wet, grey winters (January highs about 7 °C / 45 °F) with little snow; about 1,200 mm of rain a year, nearly three-quarters of it from October to March.',
    community:
      'English-speaking, with 42% of residents born abroad (2021 census, largely from East and South Asia) and many Americans; nothing about daily life needs another language.',
    access:
      'YVR has nonstops to nearly 30 US cities on Air Canada, WestJet, Alaska, United, Delta and American, cleared through US preclearance before boarding; Seattle is about a 3-hour drive or a short flight.',
  },
  drawbacks: [
    'No visa for a retiree living on a portfolio: visits of up to 6 months only',
    'For residents, up to 53.5% on US dividends and tax on all gains at death',
    'Among North America\'s most expensive housing, and long grey, rainy winters',
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
    { name: 'TaxTips.ca: British Columbia probate fees', url: 'https://www.taxtips.ca/willsandestates/probatefees/bc.htm', edition: '2026' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'IRCC: parent and grandparent super visa', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html' },
    { name: 'BC Government: how to enrol in MSP (wait period)', url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol' },
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
    {
      name: 'BC Government: Medical Services Plan eligibility',
      url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/are-you-eligible',
    },
    { name: 'Daily Hive: two BC hospitals among the world\'s best specialized centres', url: 'https://dailyhive.com/vancouver/b-c-hospitals-world-ranking-2026', edition: '2026' },
    { name: 'Daily Hive: Canada among the 20 most peaceful countries (GPI 2026)', url: 'https://dailyhive.com/canada/canada-us-global-peace-index-2026', edition: '2026' },
    { name: 'Travel Advisory: Canada (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/canada' },
    { name: 'Interactive Brokers Canada', url: 'https://www.interactivebrokers.ca/en/home.php' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: climate of Vancouver', url: 'https://en.wikipedia.org/wiki/Climate_of_Vancouver' },
    { name: 'Wikipedia: Vancouver', url: 'https://en.wikipedia.org/wiki/Vancouver' },
    { name: 'Wikipedia: Vancouver International Airport', url: 'https://en.wikipedia.org/wiki/Vancouver_International_Airport' },
  ],
}

export default profile
