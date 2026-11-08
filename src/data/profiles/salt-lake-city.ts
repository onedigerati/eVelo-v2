import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A Delta hub with top hospitals, a 4.45% flat tax and the Wasatch on the doorstep',
  summary:
    'Utah taxes dividends, interest and gains at a flat 4.45% (2026) and has no estate or inheritance tax, so a buy-borrow-die retiree based in Salt Lake City pays little to the state on the portfolio and nothing on the estate, with full access to US brokers and securities-based lending. The city adds two Level 1 trauma centres, the Huntsman Cancer Institute, ski resorts 40 minutes away and a Delta hub with nonstops to Europe and Seoul. The costs are winter inversion smog, property crime downtown and a culture shaped by the LDS church that not every newcomer warms to.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 3, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'University of Utah Hospital (Level 1 trauma, with the NCI-designated comprehensive Huntsman Cancer Institute) and Intermountain Medical Center in Murray (Level 1 trauma) serve the whole Mountain West; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Salt Lake City police reported overall crime down 4.6% and homicides down 27% in 2025, but property crime and homelessness downtown remain the everyday concerns, and the suburbs are calmer.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Utah taxes all income, dividends, interest and realised gains included, at a flat 4.45% from 2026 (cut from 4.5% by SB 60, retroactive to 1 January 2026); Utah allows no city or county income tax.',
    estate:
      'No state estate or inheritance tax: Utah\'s inheritance tax was a pick-up of the federal state death tax credit and ended after 2004, and the Tax Commission requires no returns, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Utah residents.',
    climate:
      'Four seasons at 4,200 ft (1,290 m): hot, dry summers near 100 °F (38 °C) and snowy winters, when inversions can trap smog in the valley for days; summer wildfire smoke and dust from the shrinking Great Salt Lake add to the air-quality problem.',
    community:
      'A growing city with many newcomers from other states; the LDS church shapes Utah\'s culture and liquor laws, though Salt Lake City itself is mixed and more liberal, and retirees are fewer than in Arizona or Nevada.',
    access:
      'Salt Lake City International (SLC), a Delta hub with a new terminal, has nonstops to most US cities plus Amsterdam, Paris, London, Seoul (daily since June 2025, Utah\'s first nonstop to Asia), Mexico City and Mexican resorts.',
  },
  drawbacks: [
    'Winter inversions that trap smog in the valley',
    'Property crime and homelessness downtown',
    'A church-shaped culture and liquor laws that some newcomers find confining',
  ],
  sources: [
    { name: 'Utah State Tax Commission: income tax rates by year', url: 'https://incometax.utah.gov/paying/tax-rates' },
    {
      name: 'EY Tax News: Utah law lowers income tax rate to 4.45% retroactive to January 1, 2026',
      url: 'https://taxnews.ey.com/news/2026-0913-utah-law-lowers-state-income-tax-rate-retroactive-to-january-1-2026',
      edition: '2026',
    },
    { name: 'Utah Legislature: SB 60 (2026), enrolled', url: 'https://le.utah.gov/Session/2026/bills/enrolled/SB0060.pdf', edition: '2026' },
    { name: 'Utah State Tax Commission: inheritance tax', url: 'https://tax.utah.gov/utah-taxes/inheritance-tax' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    { name: 'KUTV: crime rate drops across Salt Lake City in 2025', url: 'https://kutv.com/news/local/crime-rate-drops-across-salt-lake-city-in-2025', edition: '2026' },
    {
      name: 'Delta News Hub: from Salt Lake to Seoul, a new chapter in global connectivity begins',
      url: 'https://news.delta.com/salt-lake-seoul-new-chapter-global-connectivity-begins',
      edition: '2025',
    },
  ],
}

export default profile
