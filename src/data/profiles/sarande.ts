import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost Albanian Riviera town facing Corfu',
  summary:
    'Albania suits the tax side of buy-borrow-die: no wealth tax, children inherit free and dividends pay 8%, and US citizens can stay a year without a visa. Sarandë is a warm, cheap seaside town across the strait from Corfu, but it ranks low for the rest: no English-speaking hospital is listed there, the long-term permit is for pensioners, and the property route is unclear.',
  scores: { cost: 4, healthcare: 2, safety: 4, visa: 3, climate: 4, community: 2, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'The UK embassy\'s list of English-speaking medical facilities (Mar 2026) names hospitals in Tirana, Durrës and Fier but none in Sarandë; serious care means Tirana (reportedly 4–5 hours by road) or Corfu by ferry, and the permit needs private cover anyway (Cigna Global has no upper entry age).',
    safety:
      'Albania is 36th in the 2026 Global Peace Index; UK travel advice says crime targeting foreigners is rare, with pickpocketing in tourist areas, but driving is hazardous (road deaths among Europe\'s highest) and wildfires are common from April to October.',
    visa: 'US citizens can stay up to a year visa-free, with more than 90 days outside Albania before a new year; the pensioner permit (Law 79/2021) needs about ALL 1.2m a year of pension paid into an Albanian bank, and portfolio income alone does not qualify; a property route reportedly changed in 2026 (possibly €300k), so confirm it with a lawyer.',
    tax: 'No wealth tax (only a 0.05% yearly tax on residential buildings); residents are taxed on worldwide income, with dividends at 8% and interest and gains at 15%; there is no US income tax treaty, so whether US tax is credited against the 8% is unconfirmed, and there is no newcomer regime.',
    estate:
      'Albania\'s 15% inheritance tax exempts first- and second-degree heirs, so children pay nothing whether or not it reaches US assets; there is no US estate treaty, which matters little here.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, so Albania is likely covered, with margin terms unknown; Schwab International is probably unavailable (Albania is not on its reported list), and as a non-EU country, the EU PRIIPs limit on buying US ETFs should not apply.',
    climate: 'Hot-summer Mediterranean: July and August highs about 33°C, January highs about 13°C with lows near 5°C, and about 1,075 mm of rain a year, mostly from October to December.',
    community:
      'A town of about 22,600 (2023) with a growing but small foreign-resident scene; about 3,000 Italian pensioners had registered as residents across Albania by 2023, and English is spoken mostly in tourism.',
    access: 'There is no airport in town: ferries to Corfu take about 25–75 minutes (fewer sailings in winter), and Corfu or Tirana are the usual airports; no US nonstop to Albania could be confirmed for 2026.',
  },
  drawbacks: [
    'Weak local healthcare, with serious care in Tirana or Corfu',
    'The long-term permit needs a pension, and the property route is unclear',
    'Hazardous roads and no airport in town',
  ],
  sources: [
    { name: 'PwC: Albania, taxes on personal income', url: 'https://taxsummaries.pwc.com/albania/individual/taxes-on-personal-income' },
    { name: 'PwC: Albania, income determination', url: 'https://taxsummaries.pwc.com/albania/individual/income-determination' },
    { name: 'PwC: Albania, other taxes', url: 'https://taxsummaries.pwc.com/albania/individual/other-taxes' },
    {
      name: 'Exit News: law on foreigners paves way for pensioner immigrants',
      url: 'https://exit.al/en/approved-law-on-foreigners-paves-way-for-pensioner-and-digital-nomad-immigrants-in-albania',
    },
    { name: 'Exit News: Albania restores one-year stay for US citizens', url: 'https://exit.al/en/albanian-government-does-u-turn-on-us-residency-requirements' },
    { name: 'IMI Daily: residency in the Balkans through investment', url: 'https://www.imidaily.com/analysis/how-to-get-residency-in-the-balkans-through-investment/' },
    {
      name: 'GOV.UK: English-speaking medical facilities in Albania',
      url: 'https://www.gov.uk/government/publications/albania-list-of-medical-facilities/list-of-english-speaking-medical-facilities-for-british-nationals-in-albania--2',
      edition: '2026',
    },
    { name: 'GOV.UK: Albania travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/albania/safety-and-security' },
    {
      name: 'Top Channel: over 3,000 Italian retirees registered as residents in Albania',
      url: 'https://top-channel.tv/english/over-three-thousand-italian-retirees-registered-as-residents-in-albania',
    },
    { name: 'Wikipedia: Sarandë', url: 'https://en.wikipedia.org/wiki/Sarand%C3%AB' },
    { name: 'Ferryhopper: Corfu to Sarandë ferry', url: 'https://www.ferryhopper.com/en/ferry-routes/direct/corfu-sarande' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
  ],
}

export default profile
