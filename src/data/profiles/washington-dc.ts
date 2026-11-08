import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Free museums, strong hospitals and great flights, at a 10.75% top tax rate',
  summary:
    'Washington gives a buy-borrow-die retiree free world-class museums, leafy rowhouse neighbourhoods, strong hospitals with Johns Hopkins an hour away, and three airports with nonstops worldwide, plus full access to US brokers and securities-based lending. The District taxes dividends, interest and gains as ordinary income at up to 10.75%, and its estate tax starts at about $5M with no spousal portability, so planning matters. Housing is expensive and violent crime, though down sharply since 2023, is still high for a US city.',
  scores: { cost: 1, healthcare: 5, safety: 2, visa: 5, climate: 3, community: 4, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'MedStar Washington Hospital Center (the District\'s largest hospital and a Level 1 trauma centre), MedStar Georgetown with its Lombardi comprehensive cancer centre and GW University Hospital, with the NIH Clinical Center in Bethesda and Johns Hopkins in Baltimore within an hour; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the District recorded 127 homicides in 2025, down 32% from 2024 and from 274 in 2023, but that is still about 18 per 100,000, concentrated east of the Anacostia River; the federal law-enforcement surge from August 2025 and disputes over crime data are part of the picture.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'The District taxes dividends, interest and realised gains as ordinary income at 4% to 10.75%: 8.5% from $60,000, 9.25% from $250,000, 9.75% from $500,000 and 10.75% above $1M of taxable income, with no lower rate for long-term gains; there is no separate state tax on top.',
    estate:
      'DC estate tax: $4,988,400 exclusion for deaths in 2026, with rates from 11.2% on the first dollar above it to 16% above $10M; no cliff, and the D.C. Code makes no provision for portability between spouses, so couples generally need a bypass trust; no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to District residents.',
    climate:
      'Hot, humid summers with highs near 90 °F (32 °C) from June to September, mild winters with short cold spells and about 13 inches (33 cm) of snow in a typical year, and fine springs (cherry blossom in late March and April) and autumns.',
    community:
      'A city of newcomers from across the US and the world, with large diplomatic, academic and policy communities; many retirees stay after federal careers, and Capitol Hill, Georgetown and the close-in Maryland and Virginia suburbs are popular.',
    access:
      'Dulles (IAD) is a United hub with nonstops to Europe, Asia, Africa, the Middle East and Latin America; Reagan National (DCA), on the Metro, covers the US, and BWI adds low-cost flights; Amtrak reaches New York in under three hours.',
  },
  drawbacks: [
    'Housing among the most expensive in the US, though property tax is moderate at $0.85 per $100 of assessed value for homes',
    'DC estate tax from about $5M, with no portability between spouses',
    'Violent crime still high in parts of the city, and hot, humid summers',
  ],
  sources: [
    { name: 'DC Office of Tax and Revenue: individual and fiduciary income tax rates', url: 'https://otr.cfo.dc.gov/page/dc-individual-and-fiduciary-income-tax-rates' },
    { name: 'DC Office of Tax and Revenue: real property tax rates', url: 'https://otr.cfo.dc.gov/page/real-property-tax-rates' },
    {
      name: 'DC Office of Tax and Revenue: 2026 Form D-76 estate tax instructions ($4,988,400 exclusion)',
      url: 'https://otr.cfo.dc.gov/sites/default/files/dc/sites/otr/publication/attachments/2026_D-76_v1.0_final.pdf',
      edition: '2026',
    },
    { name: 'D.C. Code §47-3702 (estate tax rates)', url: 'https://code.dccouncil.gov/us/dc/council/code/sections/47-3702' },
    {
      name: 'Crowdfunded Wealth: DC estate tax 2026, $4,988,400 exclusion, 16% top rate',
      url: 'https://www.crowdfundedwealth.com/articles/district-of-columbia-estate-tax-2026-4988400-exclusion-d-76-no-portability-16-percent',
      edition: '2026',
    },
    { name: 'Metropolitan Police Department: year-to-date crime comparison', url: 'https://mpdc.dc.gov/dailycrime' },
    {
      name: 'Axios Washington DC: violent crime drops for second straight year',
      url: 'https://www.axios.com/local/washington-dc/2026/01/05/violent-crime-dc-decrease-2025-donald-trump-federal-takeover',
      edition: '2026',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
