import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Caribbean beach town near Cancún\'s flights',
  summary:
    'Playa del Carmen is a Riviera Maya beach town about 70 km from Cancún, the busiest international airport in Mexico. Residency on savings is easy and there is no estate tax, but its own hospital is small, gang clashes have reached the tourist areas, hurricanes are a risk and Mexico taxes dividends at up to 35% plus 10%.',
  scores: { cost: 3, healthcare: 3, safety: 2, visa: 5, climate: 3, community: 3, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Hospiten Riviera Maya has 23 beds, 2 ICU beds and 24-hour emergency care, with no JCI accreditation claimed; larger private hospitals are in Cancún, about 70 km away (Galenia\'s reported JCI status is unverified); IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index; Quintana Roo is reportedly US Level 2 (secondary source), and the UK warns that rival criminal gangs have clashed in popular Cancún tourist destinations and surrounding areas, with assaults on travellers in Cancún, Tulum and Playa del Carmen.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Hot all year: highs about 28 °C in winter rising to 33 °C in late summer, rain June–November, and hurricane exposure (Wilma struck in 2005).',
    community:
      'Quintana Roo is among the top states for new US temporary residents, but the foreign community reportedly leans to remote workers and tourists more than retirees (secondary source).',
    access:
      'Cancún airport (CUN), about 70 km away, is Mexico\'s busiest for international passengers, with seasonal or year-round service to about 44 US cities on nine US airlines plus Mexican carriers.',
  },
  drawbacks: [
    'A small local hospital: anything serious means Cancún, 70 km away',
    'Cartel clashes in the tourist corridor, and hurricane exposure',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
  ],
  sources: [
    { name: 'Hospiten: Hospiten Riviera Maya', url: 'https://hospiten.com/en/hospitals/hospiten-riviera-maya' },
    { name: 'Wikipedia: Playa del Carmen', url: 'https://en.wikipedia.org/wiki/Playa_del_Carmen' },
    { name: 'Wikipedia: Cancún International Airport', url: 'https://en.wikipedia.org/wiki/Canc%C3%BAn_International_Airport' },
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Quintana Roo Level 2, 2026)' },
    { name: 'GOV.UK: Mexico travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/mexico/safety-and-security', edition: '2026' },
    { name: 'Mexico News Daily: US citizens moving to Mexico in record numbers', url: 'https://mexiconewsdaily.com/news/us-citizens-moving-to-mx-record-numbers/' },
    { name: 'PwC: Mexico, taxes on personal income', url: 'https://taxsummaries.pwc.com/mexico/individual/taxes-on-personal-income' },
    { name: 'PwC: Mexico, other taxes', url: 'https://taxsummaries.pwc.com/mexico/individual/other-taxes' },
    {
      name: 'Consulate of Mexico in San Diego: temporary resident visa, economic solvency',
      url: 'https://consulmex.sre.gob.mx/sandiego/images/visas/ingles/5a_Temporary_Resident_Visa_-_Economic_Solvency.pdf',
      edition: '2026',
    },
    S.mxResidency,
    { name: 'IMSS: Seguro de Salud para la Familia', url: 'https://imss.gob.mx/faq/seguro-familia', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.gpiPoster,
  ],
}

export default profile
