import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Quiet Baja waterfront city, the calmest-rated Mexican coast',
  summary:
    'La Paz is the safest-rated Mexican coast in this list: the US puts Baja California Sur at Level 2 and the UK says the state is unaffected by its warnings. Residency on savings is easy and there is no estate tax, but Mexico taxes residents\' dividends at up to 35% plus a separate 10%, local hospitals are mid-tier, and the only US nonstop is to Los Angeles.',
  scores: { cost: 3, healthcare: 3, safety: 4, visa: 5, climate: 3, community: 3, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private Hospital Fidepaz and The Medical Centre (across the road) handle X-rays, specialist visits and short stays, alongside the public Salvatierra, IMSS, ISSSTE and naval hospitals; some specialist treatment is unavailable and residents go to Guadalajara (secondary source), no hospital is JCI-accredited, and IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index, but the US rates Baja California Sur Level 2, "exercise increased caution" (May 2026 update, secondary source), and the UK says the state is "unaffected" by its Mexico warnings (October 2026).',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Hot desert: January highs about 25°C and August highs near 38°C, with only about 185 mm of rain a year, mostly in August–September; Pacific hurricanes reach it, and Odile (Category 3, September 2014) damaged the harbour and the airport.',
    community:
      'A city of about 250,000 (2020) with a modest, settled foreign community: Mexico\'s immigration institute counted 19,765 resident foreigners in all of Baja California Sur in February 2024 (secondary source), with no figure for La Paz itself.',
    access:
      'La Paz airport (LAP) has one US nonstop, Alaska to Los Angeles, plus domestic flights to Mexico City, Guadalajara and Tijuana; Los Cabos (SJD), about 2 hours by road, has many more US routes.',
  },
  drawbacks: [
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
    'Only one US nonstop, and some specialist care means flying to Guadalajara',
    'Very hot summers and Pacific hurricane exposure',
  ],
  sources: [
    { name: 'GOV.UK: Mexico travel advice', url: 'https://www.gov.uk/foreign-travel-advice/mexico', edition: '2026' },
    {
      name: 'Travel Market Report: US updated Mexico travel advisory 2026',
      url: 'https://www.travelmarketreport.com/destinations/articles/us-updated-mexico-travel-advisory-2026-terrorism-crime-and-kidnapping',
      edition: '2026',
    },
    { name: 'Wikipedia: La Paz, Baja California Sur (climate, hospitals)', url: 'https://en.wikipedia.org/wiki/La_Paz,_Baja_California_Sur' },
    { name: 'Medical options for foreigners in La Paz', url: 'https://owl-falcon-pc56.squarespace.com/medical-options-for-foreigners' },
    { name: 'Wikipedia: Manuel Márquez de León International Airport', url: 'https://en.wikipedia.org/wiki/Manuel_M%C3%A1rquez_de_Le%C3%B3n_International_Airport' },
    { name: 'Wikipedia: Hurricane Odile', url: 'https://en.wikipedia.org/wiki/Hurricane_Odile' },
    { name: 'Posta: foreign residents in Baja California Sur', url: 'https://www.posta.com.mx/mexico/aumento-de-extranjeros-en-bcs-gentrificacion-a-la-vista/vl1543433' },
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
