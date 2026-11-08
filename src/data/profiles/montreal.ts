import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'French-speaking, cheaper and lively, but a hard visa and hard winters',
  summary:
    'Montréal is cheaper than Toronto or Vancouver, a French-speaking, European-feeling place with festivals, good food and McGill and Université de Montréal teaching hospitals, an hour from Vermont, in a country 14th in the 2026 Global Peace Index. For buy-borrow-die it is mostly a base for long summer visits: Canada has no retiree or passive-income visa, so a US citizen can normally stay up to 6 months at a time, and Quebec\'s Investor Program (CAD 2M net worth, oral French and recent management experience) suits few retirees. Anyone who did become resident would file a separate Quebec return and pay up to 53.3% on US dividends, and at death Canada taxes every gain accrued since arrival as if the portfolio were sold, which undoes the step-up that buy-borrow-die relies on.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 2, climate: 1, community: 4, tax: 2, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Good teaching hospitals: the McGill University Health Centre (24th in the world for neurosurgery in Newsweek\'s 2026 specialized rankings), CHUM and the Jewish General; Quebec\'s RAMQ plan does not cover tourists, and a newcomer who does settle waits up to 3 months for cover, so a visitor pays hospital bills in full and needs travel medical cover, which often caps age or pre-existing conditions, and Quebec\'s emergency rooms are known for long waits.',
    safety:
      'Canada is 14th of 163 in the 2026 Global Peace Index and at US Level 1, "exercise normal precautions" (June 2026); violent crime is low by US big-city standards, with car theft and some petty crime downtown.',
    visa: 'No retirement or passive-income visa: a US citizen can normally visit for up to 6 months (the border officer sets the stay; a longer one needs an extension applied for at least 30 days before it ends), and savings or a portfolio alone give no right to live there; the one route on capital, quebec\'s Investor Program is open with no cap (2026) but needs CAD 2M net worth, a CAD 1M five-year placement returned without interest plus a CAD 200k non-refundable contribution, oral French at level 7 and 2 years of management experience in the last 5, which few retirees meet; otherwise a Canadian spouse or partner, skilled work through Express Entry (no age points after 45), or, for a parent or grandparent of a Canadian citizen or permanent resident, the super visa, which allows stays of up to 5 years at a time with private medical insurance.',
    tax:
      'No wealth tax; residents (generally those who settle there, or anyone present 183 days in a year) pay tax on worldwide income and file a separate Quebec return with Revenu Québec, and foreign dividends get no dividend tax credit, so US dividends and interest are taxed at up to 53.3% combined federal and Quebec (2026); under the US–Canada treaty Canada credits US tax on US dividends only up to 15% and the US credits the Canadian tax on the rest, so a US citizen pays about the Canadian rate overall; half of a realised gain is taxable (up to 26.7%), and a new resident\'s cost base is reset to market value on arrival; a visitor under 6 months a year with a US home generally stays outside all this.',
    estate:
      'No inheritance or estate tax, but at death a resident is taxed as if all capital property were sold at market value, so gains accrued since arrival pay up to 26.7% (a spouse can defer it), and leaving Canada triggers the same departure tax; Quebec charges no probate tax, and a notarial will needs no court verification; the US–Canada treaty lets Canada credit US estate tax on US property and the US credit Canada\'s tax at death on non-US property, but below the $15M US exemption (2026) there is no US estate tax, so the Canadian tax is simply paid.',
    lending:
      'IBKR serves Canadian residents through Interactive Brokers Canada (margin under CIRO rules), while Schwab One International reportedly does not accept Canada residents (October 2026); US brokers reportedly often restrict accounts once the holder lives in Canada, so plan on IBKR Canada or a Canadian bank broker.',
    climate:
      'Cold humid continental: warm, humid summers (July highs about 27 °C / 80 °F) and long, hard winters (January highs about −5 °C / 23 °F) with over 200 cm of snow, so from December to March much of daily life moves indoors.',
    community:
      'French is the common language, and Quebec law has government bodies serve immigrants in English only for their first 6 months, but English is widely spoken downtown and in the west of the island, and McGill and Concordia anchor a large English-speaking community; fewer Americans than in Toronto or Vancouver.',
    access:
      'Montréal–Trudeau has nonstops to dozens of US cities on Air Canada, American, Delta and United, cleared through US preclearance before boarding; New York is about 1.5 hours by air, and the Vermont border is about an hour\'s drive.',
  },
  drawbacks: [
    'No retiree visa; the Investor Program needs CAD 2M, French and recent management experience',
    'For residents, a separate Quebec return, up to 53.3% on US dividends and tax on all gains at death',
    'Long, hard winters with over 2 m of snow, and French needed for much of daily life',
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
    { name: 'Willful: probate in Quebec', url: 'https://www.willful.co/en-qc-learn/probate-quebec' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'IRCC: parent and grandparent super visa', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html' },
    { name: 'RAMQ: waiting period', url: 'https://www.ramq.gouv.qc.ca/en/definition/waiting-period' },
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
    { name: 'RAMQ: health insurance registration information', url: 'https://www.ramq.gouv.qc.ca/en/citizens/health-insurance/registration-information' },
    { name: 'MTL Blog: nine Montréal hospitals in Newsweek\'s 2026 specialized rankings', url: 'https://www.mtlblog.com/montreal-best-hospitals-ranking-2026', edition: '2026' },
    { name: 'Éducaloi: access to provincial and municipal services in English', url: 'https://educaloi.qc.ca/en/capsules/access-to-provincial-and-municipal-services-in-english/' },
    { name: 'Daily Hive: Canada among the 20 most peaceful countries (GPI 2026)', url: 'https://dailyhive.com/canada/canada-us-global-peace-index-2026', edition: '2026' },
    { name: 'Travel Advisory: Canada (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/canada' },
    { name: 'Interactive Brokers Canada', url: 'https://www.interactivebrokers.ca/en/home.php' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: climate of Montreal', url: 'https://en.wikipedia.org/wiki/Climate_of_Montreal' },
    { name: 'Wikipedia: Montréal–Trudeau International Airport', url: 'https://en.wikipedia.org/wiki/Montr%C3%A9al%E2%80%93Trudeau_International_Airport' },
  ],
}

export default profile
