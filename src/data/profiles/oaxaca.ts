import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Colonial culture capital in the southern highlands',
  summary:
    'Oaxaca is a culture-rich colonial city with a warm, dry highland climate, low costs and nonstops to Dallas, Houston and Los Angeles. It shares Mexico\'s easy residency on savings and absence of estate tax, but also its dividend tax, and its hospitals are thin for older retirees, with the nearest JCI care in Puebla or Mexico City.',
  scores: { cost: 4, healthcare: 2, safety: 3, visa: 5, climate: 4, community: 3, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals (Hospital Ángeles, Clínica de Especialidades, Centro Médico de Oaxaca) and a public high-specialty regional hospital, none JCI-accredited; the nearest JCI care is in Puebla or Mexico City, hours away by road, and severe cases may need medical evacuation (secondary source).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index; Oaxaca state is reportedly US Level 2, "exercise increased caution" (secondary source), and the UK names no no-go areas but flags protests and blockades that can cut access to the airport.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'At 1,555 m: warm, dry days (highs about 27 °C in December and 33 °C in April), cool nights (January lows about 9 °C) and rain May–October.',
    community:
      'Popular with Americans and other foreigners, but no residency figures were found and the community is smaller than Lake Chapala\'s or San Miguel\'s; expect more Spanish in daily life.',
    access: 'Oaxaca airport (OAX) has nonstops to Dallas (American), Houston (United Express) and Los Angeles (Volaris).',
  },
  drawbacks: [
    'Thin hospitals: serious care means hours by road to Puebla or Mexico City',
    'Protests and road blockades can disrupt travel, including to the airport',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
  ],
  sources: [
    { name: '360 Nations: Oaxaca healthcare', url: 'https://360nations.com/north-america/mexico/regions/oaxaca/healthcare.html' },
    { name: 'Hospital Ángeles: Joint Commission International', url: 'https://en.hospitalangeles.com/joint-commission-international' },
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Oaxaca Level 2, 2026)' },
    { name: 'GOV.UK: Mexico travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/mexico/safety-and-security', edition: '2026' },
    { name: 'Wikipedia: Oaxaca International Airport', url: 'https://en.wikipedia.org/wiki/Oaxaca_International_Airport' },
    { name: 'Wikipedia: Oaxaca City', url: 'https://en.wikipedia.org/wiki/Oaxaca_City' },
    { name: 'Mexico News Daily: US citizens moving to Mexico in record numbers', url: 'https://mexiconewsdaily.com/news/us-citizens-moving-to-mx-record-numbers/' },
    { name: 'PwC: Mexico, taxes on personal income', url: 'https://taxsummaries.pwc.com/mexico/individual/taxes-on-personal-income' },
    { name: 'PwC: Mexico, other taxes', url: 'https://taxsummaries.pwc.com/mexico/individual/other-taxes' },
    {
      name: 'Consulate of Mexico in San Diego: temporary resident visa, economic solvency',
      url: 'https://consulmex.sre.gob.mx/sandiego/images/visas/ingles/5a_Temporary_Resident_Visa_-_Economic_Solvency.pdf',
      edition: '2026',
    },
    S.mxResidency,
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.gpiPoster,
  ],
}

export default profile
