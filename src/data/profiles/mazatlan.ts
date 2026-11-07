import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Pacific port city with snowbirds, under a Level 4 state rating',
  summary:
    'Mazatlán has a long beachfront, private hospitals, a sizeable snowbird community and several US nonstops, at prices below Puerto Vallarta. It ranks near the foot of the list because the US rates Sinaloa Level 4, "do not travel", with Mazatlán included, even though the UK carves the city out of its Sinaloa warning; and Mexico taxes residents\' dividends at up to 35% plus a separate 10%.',
  scores: { cost: 4, healthcare: 3, safety: 1, visa: 5, climate: 3, community: 4, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals in the city (Hospital Marina Mazatlán, Hospital Alhma Medical Center, Hospital Médica de la Ciudad) with many English-speaking doctors (secondary source); none is known to be JCI-accredited, complex cases such as cancer go to Guadalajara or the US, and IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'The US rates Sinaloa Level 4, "do not travel" (crime and terrorism, May 2026 update), with Mazatlán listed at Level 4 and tighter rules for US government staff (secondary sources); the UK advises against all but essential travel to Sinaloa except "the cities of Los Mochis and Mazatlán" (October 2026), and Mexico is 137th of 163 in the 2026 Global Peace Index.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical savanna: highs about 25°C in January and 33°C in August, about 800 mm of rain falling mostly July–September, and a long dry season; Pacific hurricanes are a risk, and Willa (Category 3, October 2018) forced evacuations and closed the airport.',
    community:
      'A city of about 442,000 (2020) with a sizeable community of American and Canadian retirees and winter snowbirds, though "not as jammed with Americans and Canadians" as Puerto Vallarta (secondary source; no headcount found).',
    access:
      'Mazatlán airport (MZT) has year-round nonstops to Los Angeles (Alaska), Dallas and Phoenix (American) and Houston (United), seasonal Minneapolis (Delta, Sun Country), and many seasonal WestJet flights to Canada.',
  },
  drawbacks: [
    'The US rates Sinaloa, Mazatlán included, Level 4 "do not travel", which can matter to insurers and family',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
    'Hot, humid summers with Pacific hurricane risk',
  ],
  sources: [
    { name: 'GOV.UK: Mexico travel advice (Sinaloa exceptions)', url: 'https://www.gov.uk/foreign-travel-advice/mexico', edition: '2026' },
    { name: 'LatAm Travellers: Is Mexico safe in 2026? State-by-state advisory', url: 'https://latamtravellers.com/blogs/news/is-mexico-safe-in-2026-state-by-state-advisory', edition: '2026' },
    {
      name: 'Travel Market Report: US updated Mexico travel advisory 2026',
      url: 'https://www.travelmarketreport.com/destinations/articles/us-updated-mexico-travel-advisory-2026-terrorism-crime-and-kidnapping',
      edition: '2026',
    },
    { name: 'Retire Young Travel Smart: Mazatlán healthcare', url: 'https://retireyoungtravelsmart.com/mazatlan-healthcare/' },
    { name: 'Wikipedia: Mazatlán (climate)', url: 'https://en.wikipedia.org/wiki/Mazatl%C3%A1n' },
    { name: 'Wikipedia: Mazatlán International Airport', url: 'https://en.wikipedia.org/wiki/Mazatl%C3%A1n_International_Airport' },
    { name: 'Wikipedia: Hurricane Willa', url: 'https://en.wikipedia.org/wiki/Hurricane_Willa' },
    { name: 'Earth Vagabonds: What brings expats to Mazatlán', url: 'https://earthvagabonds.com/?p=42514' },
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
