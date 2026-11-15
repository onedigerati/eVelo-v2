import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Mild coastal capital, easy rentista visa, taxed dividends',
  summary:
    'Peru has no wealth or inheritance tax, and its rentista status runs indefinitely on $1,000 a month of foreign income. Lima has good private clinics in Miraflores and San Isidro and a mild, almost rainless climate. The cost for BBD is income tax: residents\' foreign dividends and interest are taxed at up to 30%, with no US income tax treaty and no newcomer relief.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 2, tax: 3, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private clinics such as Clínica Anglo Americana, Clínica Internacional, Clínica San Felipe and Clínica Delgado give good care; public EsSalud\'s voluntary "+Salud" plan (PEN 215/month at 60+) is closed to new members until the end of 2027, and new private plans get harder to buy after 65 (one forum report says Pacífico takes new members to 65).',
    safety:
      'Peru is at US State Dept Level 2 and "deteriorating" (September 2026, secondary source), with Level 4 for VRAEM and several Andean and Amazon areas; the UK reports gunpoint robberies in Miraflores and Barranco, fake taxis and express kidnappings, and protests that can escalate quickly.',
    visa:
      'Rentista residence on permanent income of at least $1,000/month from a pension or other foreign income, indefinite while the income continues (Legislative Decree 1350) and reportedly with no right to work; an investor route exists, but its amount is unverified.',
    tax: 'No wealth tax; residents (183+ days in 12 months) add net foreign-source income, including US dividends and interest, to work income at progressive rates of 8–30%, with 30% above 45 UIT (about $72k; 2026), a foreign tax credit capped at Peru\'s average rate, no US income tax treaty and no newcomer regime.',
    estate:
      'Peru has no inheritance tax (a secondary source; PwC lists none), and inheritances are also outside the property transfer tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Peru residents should be accepted, but margin terms are unconfirmed; Schwab One International\'s application reportedly lists Peru (October 2026), with no known margin restriction outside Europe.',
    climate:
      'Mild and nearly rainless: sunny, muggy summers (December–April, highs 25–30°C) and grey, cool winters (June–October, highs 16–19°C) under low cloud and morning garúa drizzle; earthquake risk.',
    community:
      'A modest expat community, concentrated in Miraflores, Barranco and San Isidro, with a growing number of international restaurants but no large US-retiree enclave; Spanish is needed.',
    access:
      'Jorge Chávez, in Callao west of the centre, opened a new terminal in June 2025 and is the hub for Cusco and the rest of Peru; Lima traffic can make the ride to Miraflores long.',
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
    { name: 'El Popular: EsSalud suspends new +Salud affiliations until 2027', url: 'https://elpopular.pe/actualidad/2026/09/19/ya-no-podras-afiliarte-a-essalud-atencion-suspenden-nuevas-afiliaciones-al-salud-hasta-2027-revisa-hasta-cuando-1013099', edition: '2026' },
    { name: 'El Peruano via ecoi.net: Legislative Decree 1350, Migration Law (rentista)', url: 'https://www.ecoi.net/en/file/local/1394671/1930_1488285039_58aeff9d4.pdf', edition: '2017' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Lima (climate)', url: 'https://en.wikipedia.org/wiki/Lima' },
    { name: 'Wikipedia: Jorge Chávez International Airport', url: 'https://en.wikipedia.org/wiki/Jorge_Ch%C3%A1vez_International_Airport' },
  ],
}

export default profile
