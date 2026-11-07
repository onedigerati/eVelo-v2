import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Safe central European capital with a 15% dividend option',
  summary:
    'The Czech Republic is 13th in the 2026 Global Peace Index, has no wealth or inheritance tax, and lets foreign dividends and interest be taxed at a flat 15%. Prague adds good hospitals, a large international population and summer nonstops from the US; the catch is that a retiree\'s visa is discretionary.',
  scores: { cost: 3, healthcare: 4, safety: 5, visa: 2, climate: 2, community: 4, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Prague has the country\'s best hospitals and expat medical services; non-EU residents without a Czech employer must buy commercial "comprehensive" health insurance (at least €400k cover), now from any approved insurer rather than only PVZP, and senior premiums can be high.',
    safety: 'The Czech Republic is 13th in the 2026 Global Peace Index; violent crime is low, and pickpocketing in the tourist centre and on trams is the main risk.',
    visa: 'There is no retirement or investor visa: the route is a long-term visa for "other purposes" (up to 12 months, decided in 90–120 days), with a purpose statement, modest proof of funds, housing and €400k+ health insurance; renewal into a long-term residence permit is reportedly discretionary.',
    tax: 'No wealth tax; residents are taxed on worldwide income, but foreign dividends and bond interest can go in a separate base at a flat 15% (otherwise 15%/23%), and securities held over 3 years are exempt from capital gains tax, with no cap from 2026; a credit for US withholding is presumably available under the US–Czech treaty (unverified).',
    estate: 'There is no inheritance tax, and gifts from close relatives are exempt, so a US portfolio passes to US-resident children with no Czech tax; there is no US estate treaty.',
    lending:
      'IBKR reportedly serves Czech residents (likely through its EU entity), with margin terms per country unknown; Schwab International is reportedly unavailable, as the Czech Republic is off its reported list.',
    climate: 'Central European: July highs average about 27°C, while winters are cold and grey, with January highs about 4°C, lows just below freezing and only about 1,700 hours of sun a year.',
    community:
      'About 350,000 foreigners, roughly a quarter of residents (2025), mostly from elsewhere in Europe; the English-speaking scene is long established but younger and work-oriented, with few retirees.',
    access: 'American flies Philadelphia–Prague daily in summer (from May 2026) and Delta flies from New York JFK; in winter, connect through a European hub.',
  },
  drawbacks: [
    'The visa is discretionary and renewed year by year at first',
    'Long, grey winters with little sun',
    'Senior-age comprehensive health insurance can be costly to obtain',
  ],
  sources: [
    { name: 'PwC: Czech Republic, taxes on personal income', url: 'https://taxsummaries.pwc.com/czech-republic/individual/taxes-on-personal-income' },
    { name: 'PwC: Czech Republic, income determination', url: 'https://taxsummaries.pwc.com/czech-republic/individual/income-determination' },
    { name: 'PwC: Czech Republic, other taxes', url: 'https://taxsummaries.pwc.com/czech-republic/individual/other-taxes' },
    {
      name: 'Czech Embassy Tel Aviv: long-term visa for other purposes',
      url: 'https://mzv.gov.cz/telaviv/en/visa_and_consular_services/visas/long_term_visas_and_residence_permits/long_term_visa_for_other_purposes.html',
    },
    { name: 'Expats.cz: law ends the PVZP health monopoly for non-EU foreigners', url: 'https://expats.cz/czech-news/article/pavel-signs-law-ending-pvzp-health-monopoly-for-non-eu-foreigners' },
    S.gpiTop50,
    {
      name: 'CzechTrade: 25% of Prague residents are foreigners',
      url: 'https://www.czechtradeoffices.com/eg/news/25-of-residents-in-prague-are-foreigners,-but-is-the-city-building-fast-enough',
    },
    { name: 'One Mile at a Time: American adds Budapest and Prague', url: 'https://onemileatatime.com/news/american-new-europe-flights-budapest-prague/' },
    { name: 'Wikipedia: Prague (climate)', url: 'https://en.wikipedia.org/wiki/Prague' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
