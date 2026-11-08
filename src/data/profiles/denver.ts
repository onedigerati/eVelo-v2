import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A low flat state tax and top-tier hospitals at the foot of the Rockies',
  summary:
    'Colorado taxes dividends, interest and gains at a flat 4.4% (a graduated tax with up to 8.4% above $500k, Amendment 87, is narrowly ahead in the uncertified November 2026 count) and has no estate or inheritance tax, so a buy-borrow-die retiree based in Denver keeps most of the portfolio\'s income and passes it on untouched by the state, with full access to US brokers and securities-based lending. Denver adds two Level 1 trauma centres, an NCI comprehensive cancer centre on the Anschutz campus, the mountains an hour away and one of the world\'s busiest airports. The costs are housing well above the US average, thin air at 5,280 ft and summer hail and wildfire smoke.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 4, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'UCHealth University of Colorado Hospital on the Anschutz Medical Campus in Aurora (Level 1 trauma, home of the NCI-designated CU Cancer Center) and Denver Health (Level 1 trauma) lead the region, with National Jewish Health for lung disease; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Denver recorded 37 homicides in 2025, down from 70 in 2024 and 96 in 2021, though the count rose again in 2026 (up about 37% by 1 July), and car theft and property crime are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Colorado taxes all income, dividends, interest and realised gains included, at a flat 4.4% (2025 and 2026; TABOR surpluses can trigger a temporary cut, as to 4.25% for 2024); Amendment 87, narrowly ahead but not yet certified after the November 2026 vote, would from 2027 replace it with six brackets from 3.7% to 4.4% up to $500k of income and 7.4%, 7.9% and 8.4% above $500k, $750k and $1M; Denver levies no income tax on investment income, only an occupational privilege tax of $5.75 a month on employees\' wages.',
    estate:
      'No state estate or inheritance tax: Colorado\'s estate tax was a pick-up of the federal state death tax credit and has been zero for deaths after 2004, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Colorado residents.',
    climate:
      'High, dry and sunny at 5,280 ft (1,609 m): summer highs near 90 °F (32 °C) with afternoon storms and hail, winter snow that usually melts within days; wildfire smoke and ozone alerts recur in summer, and the altitude can tax heart and lungs.',
    community:
      'A big draw for newcomers from other states; retirees tend to settle in the southern and western suburbs (Highlands Ranch, Littleton, Lakewood) and the foothill towns, with the ski areas and hiking within 1–2 hours.',
    access:
      'Denver International (DEN), a United and Southwest hub, has nonstops to most US cities and about 35 international destinations in 19 countries, including London Heathrow, Frankfurt, Munich, Rome, Tokyo Narita and much of Mexico; United adds daily Paris from 27 May 2027.',
  },
  drawbacks: [
    'Housing and living costs well above the US average',
    'Altitude, summer hail and wildfire smoke',
    'Amendment 87, if certified, would tax income above $500k at 7.4–8.4% from 2027',
  ],
  sources: [
    {
      name: 'Colorado Department of Revenue: individual income tax guide (rates by year)',
      url: 'https://tax.colorado.gov/individual-income-tax-guide',
    },
    {
      name: 'Thomson Reuters: Colorado temporary income tax rate reductions in revised TABOR refund mechanisms',
      url: 'https://tax.thomsonreuters.com/news/colorado-includes-temporary-income-tax-and-sales-use-tax-rate-reductions-in-revised-tabor-refund-mechanisms/',
    },
    {
      name: 'City and County of Denver: business taxes (occupational privilege tax)',
      url: 'https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/Our-Divisions/Treasury/Business-Tax-Information',
    },
    { name: 'Colorado Legislative Council: estate tax', url: 'https://leg.colorado.gov/agencies/legislative-council-staff/estate-tax' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'CBS Colorado: Denver homicides fell 48% in 2025',
      url: 'https://www.cbsnews.com/colorado/news/denver-homicides-fall-48-percent-in-2025',
      edition: '2026',
    },
    {
      name: 'Axios Denver: Denver crime keeps falling, except for homicides',
      url: 'https://www.axios.com/local/denver/2026/07/08/denver-homicides-increasing-crime',
      edition: '2026',
    },
    {
      name: 'Denver Gazette: homicides up in Denver while other crime falls',
      url: 'https://www.denvergazette.com/2026/07/10/homicides-up-in-denver-while-other-crime-falls-police-data-show/',
      edition: '2026',
    },
    {
      name: 'Tax Foundation: Colorado Amendment 87 and Proposition 136',
      url: 'https://taxfoundation.org/blog/colorado-income-tax-amendment-87-proposition-136/',
      edition: '2026',
    },
    {
      name: 'Chalkbeat Colorado: 2026 voter guide to Amendment 87',
      url: 'https://www.chalkbeat.org/colorado/2026/10/01/voter-guide-amendment-87-ballot-measure-school-funding/',
      edition: '2026',
    },
    {
      name: 'Colorado Politics: tiered income tax initiative still too close to call',
      url: 'https://www.coloradopolitics.com/2026/11/04/colorados-tiered-income-tax-initiative-still-too-close-to-call/',
      edition: '2026',
    },
    {
      name: 'Denver Gazette: Denver airport takes No. 1 spot for most domestic destinations',
      url: 'https://www.denvergazette.com/2025/12/30/denver-airport-takes-1-spot-for-most-domestic-destinations/',
      edition: '2025',
    },
    {
      name: 'Denver7: United announces daily nonstop Denver–Paris from May 2027',
      url: 'https://www.denver7.com/news/local-news/united-announces-new-daily-nonstop-flight-between-denver-paris-starting-in-may-2027',
    },
  ],
}

export default profile
