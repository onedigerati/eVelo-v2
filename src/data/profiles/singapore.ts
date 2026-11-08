import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Perfect BBD tax rules, very costly, and no retiree visa',
  summary:
    'On paper Singapore is the best buy-borrow-die tax home in Asia: no tax on foreign dividends or interest, no capital gains tax, no wealth or estate tax, plus excellent hospitals, English everywhere and 8th place in the 2026 Global Peace Index. In practice it is closed to retirees: there is no retirement visa, the only passive route to permanent residence is the Global Investor Programme at S$25M in a fund or a S$200M family office, and living costs come close to New York\'s.',
  scores: { cost: 1, healthcare: 5, safety: 5, visa: 1, climate: 3, community: 4, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Healthcare is of a high quality and expensive, with English-speaking staff in public and private hospitals alike; MediShield Life, the national insurance, covers only citizens and permanent residents, so a foreigner pays unsubsidised rates and needs private cover (some local plans take new members up to 80; premiums at 65–75 not published).',
    safety:
      'Singapore is 8th of 163 in the 2026 Global Peace Index and the US rates it Level 1; violent crime and theft are rare, scams are the main risk, and drug laws are severe (caning and the death penalty) and vapes are banned.',
    visa: 'No retirement visa: the Global Investor Programme gives permanent residence for S$10M into a Singapore business that must reach 30 staff, S$25M in a GIP-select fund, or a family office with S$200M of assets and S$50M invested locally, open only to established business owners, founders and family-office principals; Long-Term Visit Passes are for relatives of citizens, PRs or pass holders.',
    tax: 'No wealth tax; all foreign-sourced income received by individuals is exempt (unless received through a Singapore partnership), Singapore dividends are exempt and gains on shares held as personal investments are generally not taxed, so US dividends, interest, gains and loan draws are untaxed locally; there is no exit tax.',
    estate:
      'No inheritance or estate tax: estate duty was abolished for deaths from 15 Feb 2008, and there is no gift tax, so US assets pass to US-resident children with no Singapore tax; there is no US estate treaty and none is needed, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR serves Singapore residents through its MAS-licensed Singapore entity (margin accounts from age 21), and Schwab One International\'s online form reportedly accepted Singapore in Oct 2026, though Schwab Singapore serves only accredited investors (net financial assets above S$1M, net personal assets above S$2M or income above S$300k); margin by country of residence is unreported.',
    climate:
      'Tropical rainforest: hot and humid all year (typically 25–33 °C), about 2,100–2,300 mm of rain with afternoon storms, and two monsoons, mid-Nov to early Mar and Jun to Sep.',
    community:
      'English is the working language and the expat community is large, but it is mostly working professionals on employment passes rather than retirees, since there is no retirement route.',
    access:
      'Changi (SIN) has nonstops on Singapore Airlines to Los Angeles, San Francisco, Seattle, New York–JFK and Newark, and on United to San Francisco.',
  },
  drawbacks: [
    'No retirement visa: permanent residence needs S$25M in a fund or a S$200M family office',
    'Costs close to New York\'s, and no public health insurance for non-PRs',
    'Hot and humid every day of the year',
  ],
  sources: [
    { name: 'PwC: Singapore, income determination', url: 'https://taxsummaries.pwc.com/singapore/individual/income-determination', edition: '2026' },
    { name: 'PwC: Singapore, other taxes', url: 'https://taxsummaries.pwc.com/singapore/individual/other-taxes', edition: '2026' },
    {
      name: 'IRAS: gains from sale of property, shares and financial instruments',
      url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/what-is-taxable-what-is-not/gains-from-sale-of-property-shares-and-financial-instruments',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'EDB: Global Investor Programme factsheet', url: 'https://www.edb.gov.sg/content/dam/edb-en/how-we-help/global-investor-programme/GIP%20Factsheet.pdf', edition: '2025' },
    {
      name: 'Withers: Singapore PR under the enhanced Global Investor Programme',
      url: 'https://www.withersworldwide.com/en-gb/insight/read/getting-singapore-permanent-residency-(-spr-)-status-under-the-new-enhanced-global-investor-progra',
      edition: '2023',
    },
    { name: 'Wise: retiring in Singapore', url: 'https://wise.com/sg/blog/retiring-in-singapore', edition: '2025' },
    { name: 'MOH: MediShield Life', url: 'https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/medishield-life' },
    { name: 'HSBC Life Singapore: InternationalExclusive health plan', url: 'https://hsbc.com.sg/insurance/products/health/international' },
    { name: 'GOV.UK: Singapore travel advice, health', url: 'https://www.gov.uk/foreign-travel-advice/singapore/health' },
    { name: 'GOV.UK: Singapore travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/singapore/safety-and-security' },
    {
      name: 'Time Out: Singapore, Japan and Malaysia among the most peaceful countries in 2026',
      url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
      edition: '2026',
    },
    { name: 'TravelAdvisory.io: Singapore (US advisory, Mar 2026)', url: 'https://www.traveladvisory.io/advisory/singapore', edition: '2026' },
    { name: 'Wikipedia: Climate of Singapore', url: 'https://en.wikipedia.org/wiki/Climate_of_Singapore' },
    { name: 'Wikipedia: Singapore Changi Airport', url: 'https://en.wikipedia.org/wiki/Singapore_Changi_Airport' },
    { name: 'Wise: opening an IBKR account in Singapore', url: 'https://wise.com/sg/blog/ibkr-account-opening', edition: '2026' },
    { name: 'Charles Schwab Singapore: working with Schwab as an accredited investor', url: 'https://www.schwab.com.sg/become-accredited-investor' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
