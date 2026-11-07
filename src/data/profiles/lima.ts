import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Mild coastal capital, easy rentista visa, taxed dividends',
  summary:
    'Peru has no wealth or inheritance tax, and its rentista status runs indefinitely on $1,000 a month of foreign income. Lima has good private clinics in Miraflores and San Isidro and a mild, almost rainless climate. The cost for BBD is income tax: residents\' foreign dividends and interest are taxed at up to 30%, with no US income tax treaty and no newcomer relief.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 2, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Private clinics such as Clínica Anglo Americana, Clínica Internacional, Clínica San Felipe and Clínica Delgado give good care; public EsSalud\'s voluntary "+Salud" costs PEN 215/month at 60+ but has long waits, and new private plans get harder to buy after 65 (one forum report says Pacífico takes new members to 65).',
    safety:
      'Peru is at US State Dept Level 2 and "deteriorating" (September 2026, secondary source), with Level 4 for VRAEM and several Andean and Amazon areas; the UK reports gunpoint robberies in Miraflores and Barranco, fake taxis and express kidnappings, and protests that can escalate quickly.',
    visa:
      'Rentista residence on permanent income of at least $1,000/month from a pension or other foreign income, indefinite while the income continues and with no right to work (2023 news source); an investor route exists, but its amount is unverified.',
    tax: 'No wealth tax; residents (183+ days in 12 months) add net foreign-source income, including US dividends and interest, to work income at progressive rates of 8–30%, with 30% above 45 UIT (about $72k; 2026), a foreign tax credit capped at Peru\'s average rate, no US income tax treaty and no newcomer regime.',
    estate:
      'Peru has no inheritance tax (a secondary source; PwC lists none), and inheritances are also outside the property transfer tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Peru residents should be accepted, but margin terms are unconfirmed; whether Schwab One International accepts Peru was not checked.',
    climate:
      'Mild and nearly rainless: sunny, muggy summers (December–April, highs 25–30°C) and grey, cool winters (June–October, highs 16–19°C) under low cloud and morning garúa drizzle; earthquake risk.',
    community:
      'A modest expat community, concentrated in Miraflores, Barranco and San Isidro, with a growing number of international restaurants but no large US-retiree enclave; Spanish is needed.',
    access:
      'Jorge Chávez (new terminal since June 2025) has nonstops to Miami, Atlanta, Houston, Los Angeles and New York-JFK on American, Delta, United, LATAM and Sky; United\'s Newark route ends in March 2027.',
  },
  drawbacks: [
    'Foreign dividends and interest taxed at up to 30%, with no treaty and no newcomer holiday',
    'Grey, overcast winters for about half the year',
    'Street crime in the expat districts, chronic political instability and earthquake risk',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Peru, taxes on personal income', url: 'https://taxsummaries.pwc.com/peru/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Peru, foreign tax relief and tax treaties', url: 'https://taxsummaries.pwc.com/peru/individual/foreign-tax-relief-and-tax-treaties', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Peru, other taxes', url: 'https://taxsummaries.pwc.com/peru/individual/other-taxes', edition: '2026' },
    { name: 'Perú Gestiona: Inheritance tax in Peru', url: 'https://perugestiona.pe/herencias/impuesto-herencia-peru/' },
    {
      name: 'Gestión: What foreigners setting up in Peru should consider (rentista)',
      url: 'https://gestion.pe/tendencias/extranjeros-que-desean-establecer-negocios-en-el-peru-que-aspectos-deben-tomar-en-cuenta-noticia/',
      edition: '2023',
    },
    { name: 'Rio Times: Healthcare in Peru for expats 2026', url: 'https://www.riotimesonline.com/healthcare-peru-expats-2026/' },
    { name: 'International Living: Lima vs Arequipa for retirees', url: 'https://internationalliving.com/lima-vs-arequipa-which-peruvian-city-is-better-for-retirees' },
    { name: 'GOV.UK: Peru travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/peru/safety-and-security' },
    { name: 'Travel Advisory: Peru (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/peru' },
    { name: 'Wikipedia: Lima (climate)', url: 'https://en.wikipedia.org/wiki/Lima' },
    { name: 'Wikipedia: Jorge Chávez International Airport', url: 'https://en.wikipedia.org/wiki/Jorge_Ch%C3%A1vez_International_Airport' },
  ],
}

export default profile
