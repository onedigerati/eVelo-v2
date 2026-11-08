import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Canals, excellent care, but Box 3 taxes the portfolio every year',
  summary:
    'Amsterdam is safe (the Netherlands is 17th in the 2026 Global Peace Index), has world-class museums such as the Rijksmuseum and Van Gogh Museum, English is spoken almost everywhere, and every resident gets the same mandatory Dutch health insurance whatever their age. For buy-borrow-die it is one of the worst bases in Europe: Box 3 taxes a deemed 6% return on the whole portfolio at 36% each year (about 2.2% of its value, sales or no sales), children may pay up to 20% inheritance tax on the worldwide estate (the US estate treaty may limit this for shorter stays), there is no retirement visa, and housing costs are among Europe\'s highest.',
  scores: { cost: 1, healthcare: 5, safety: 4, visa: 2, climate: 3, community: 5, tax: 1, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Every resident must take Dutch basic health insurance, which insurers must sell to anyone regardless of age or health, at about €159/month (2026 average) with a €385 yearly deductible; Amsterdam UMC (two academic hospitals) and OLVG are close by, and GPs act as gatekeepers to specialists.',
    safety:
      'The Netherlands is 17th of 163 in the 2026 Global Peace Index; violent crime is low, while pickpocketing in the centre and bicycle theft are common.',
    visa: 'No retirement or passive-income permit: the wealthy-investor permit closed to new applicants in 2024, and the main route left for a US citizen is the Dutch-American Friendship Treaty (DAFT) self-employment permit, which needs at least €4,500 invested in a real Dutch business that the IND may check is being run, with older applicants reportedly scrutinised more closely (secondary source).',
    tax: 'Box 3 replaces a tax on actual investment income: a deemed return of 6.00% on investments (minus 2.70% on debts) above a €59,357 allowance is taxed at 36% (2026), about 2.2% of the net portfolio a year whether or not anything is sold; a lower actual return can now be claimed instead, and the move to taxing actual returns is uncertain: the Senate postponed its vote and in September 2026 the cabinet asked it to pause the bill, so a 2028 start is in doubt (check current rules).',
    estate:
      'Inheritance tax reaches the worldwide estate of a Dutch resident: children pay 10% up to €158,669 and 20% above it (2026) after an exemption of about €26,000; under the US–Netherlands estate tax treaty (Art. 4(2)) a US citizen who is not Dutch, has lived there under 7 of the last 10 years and had no clear intention to stay may be treated as US-domiciled (check with an adviser), and the treaty otherwise gives credit relief; and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Dutch residents (EU clients through its Irish entity), and Schwab International reportedly accepts them, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Mild maritime: cool summers (July highs about 22 °C / 72 °F), damp winters just above freezing (January highs about 6 °C / 43 °F), frequent wind and drizzle, and about 830 mm of rain spread through the year.',
    community:
      'A large international city where nearly everyone speaks English, with a big English-speaking expat population (mostly working-age); the retiree community is smaller, but daily life rarely needs Dutch.',
    access:
      'Schiphol is a KLM and Delta hub with nonstops to more than a dozen US cities, including New York, Atlanta, Detroit, Minneapolis, Chicago, Boston, Washington, Houston, Los Angeles, San Francisco and Seattle; trains reach the centre in about 15 minutes.',
  },
  drawbacks: [
    'Box 3 taxes about 2.2% of the portfolio a year, so buy-borrow-die loses its main advantage',
    'No retirement visa: the DAFT route means running a real business',
    'Very high rents and house prices, and a grey, wet winter',
  ],
  sources: [
    { name: 'PwC: Netherlands, other taxes', url: 'https://taxsummaries.pwc.com/netherlands/individual/other-taxes', edition: '2026' },
    {
      name: 'PwC: Netherlands, income determination',
      url: 'https://taxsummaries.pwc.com/netherlands/individual/income-determination',
      edition: '2026',
    },
    {
      name: 'SRA: Box 3 actual-return bill not yet adopted (Senate)',
      url: 'https://www.sra.nl/nieuws/600041/2026/09/nog-geen-duidelijkheid-over-box-3-vanaf-2028',
      edition: '2026',
    },
    {
      name: 'HBN Law & Tax: Box 3 update and actual-return relief',
      url: 'https://hbnlawtax.com/tax-instant-news/box-3-update-senate-review-and-practical-implementation-of-actual-return-relief/',
      edition: '2026',
    },
    {
      name: 'Taxes for Expats: Netherlands inheritance tax 2026',
      url: 'https://www.taxesforexpats.com/country-guides/netherlands/inheritance-tax-netherlands.html',
      edition: '2026',
    },
    {
      name: 'Inview: US–Netherlands estate tax convention, Article 4',
      url: 'https://www.inview.nl/openCitation/id21560f434c95e312c1de2b7d8cd88e26/convention-between-the-kingdom-of-the-netherlands-and-the-united-states-of-america-for-the-avoidance-of-double-taxation-and-the-prevention-of-fiscal-evasion-with-respect-to-taxes-on-estates-and-inheritances-artikel-4',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Kroes Advocaten: abolition of the high-net-worth investor permit',
      url: 'https://www.kroesadvocaten.nl/en/abolition-of-high-net-worth-individual-immigration-program-golden-visa/',
    },
    {
      name: 'Everaert: the DAFT permit for older American entrepreneurs',
      url: 'https://www.everaert.nl/en/blog/thinking-of-starting-a-business-in-the-netherlands-here-is-what-older-american-entrepreneurs-need-to-know-about-the-daft-visa/',
    },
    { name: 'Work in NL: cost of Dutch health insurance', url: 'https://www.workinnl.nl/en/healthcare/health-insurance/cost/default.aspx', edition: '2026' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Amsterdam Airport Schiphol', url: 'https://en.wikipedia.org/wiki/Amsterdam_Airport_Schiphol' },
    { name: 'Wikipedia: Amsterdam', url: 'https://en.wikipedia.org/wiki/Amsterdam' },
  ],
}

export default profile
