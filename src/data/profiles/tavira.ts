import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Quiet eastern Algarve town with Portugal\'s BBD tax profile',
  summary:
    'Tavira has the same Portuguese rules as the rest of the Algarve: no wealth tax, children inherit free and the D7 visa accepts dividend income. It is a smaller, calmer town with an older, settled foreign community, the accredited CUF Faro hospital 30 to 40 minutes away and a seasonal Faro–Newark flight; the catch is that the town itself has no 24-hour emergency unit.',
  scores: { cost: 4, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 4, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Tavira has no 24-hour urgency unit (the nearest is at Vila Real de Santo António, about 30 minutes east), only the public Centro de Saúde with after-hours cover and small private clinics; the public Hospital de Faro and the private Hospital CUF Faro (formerly HPA, reportedly JCI-accredited) are 28 km away, about 30–40 minutes, and complex cases go to Lisbon.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index, and the US rates it Level 1 (secondary source); violent crime is low, and theft in Algarve towns is mostly opportunistic.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws do not count as income, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay a 28% flat rate (or the progressive scale by choice), with the 15% US withholding creditable under the treaty; NHR is closed and its IFICI successor is for workers, so there is no retiree regime; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Hot-summer Mediterranean: about 3,150 hours of sun, a mean of about 18°C and about 480 mm of rain a year, falling mostly in winter; no hurricanes, though the region carries historic earthquake and tsunami risk (1755).',
    community:
      'A municipality of about 26,000 with an older, settled foreign community, mostly British, French and German; English-speaking lawyers and doctors are easy to find, but the scene is smaller than in the western Algarve resorts.',
    access: 'Faro airport is 35–40 minutes away (10.4M passengers in 2025); United flies Newark–Faro seasonally (May–Sep 2026), and the rest of the year trips connect via Lisbon or a European hub.',
  },
  drawbacks: [
    'No 24-hour emergency unit in town; hospitals are in Faro, 30–40 minutes away',
    'Only a seasonal US nonstop, from Faro',
    '28% on dividends and interest with no retiree regime, and Schwab margin can\'t be drawn as cash',
  ],
  sources: [
    { name: 'Expatsi: Tavira, Portugal', url: 'https://expatsi.com/cities/portugal/tavira' },
    { name: 'Wikipedia: Tavira', url: 'https://en.wikipedia.org/wiki/Tavira' },
    { name: 'Wikipedia: Faro Airport', url: 'https://en.wikipedia.org/wiki/Faro_Airport' },
    { name: 'Travel Advisory: Portugal', url: 'https://www.traveladvisory.io/advisory/portugal' },
    { name: 'PwC: Portugal, other taxes', url: 'https://taxsummaries.pwc.com/portugal/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Portugal, taxes on personal income', url: 'https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'Portugalist: D7 visa requirements', url: 'https://www.portugalist.com/d7-visa-requirements/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    S.united,
    S.gpiTop50,
  ],
}

export default profile
