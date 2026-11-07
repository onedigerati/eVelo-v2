import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Safe, affordable Danube capital where children inherit free',
  summary:
    'Hungary is 15th in the 2026 Global Peace Index, has no wealth tax and exempts inheritances by children, and a €250k real-estate fund investment gives a residence permit of up to 10 years. Holding is costlier than elsewhere in the region: US dividends and interest carry 15% income tax plus up to 13% social contribution.',
  scores: { cost: 3, healthcare: 3, safety: 5, visa: 3, climate: 2, community: 3, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Budapest\'s private clinics offer short waits and English-speaking doctors (a GP visit about HUF 20–35k), while public hospitals have long waits; public cover needs a TAJ card, which non-EU residents without a job report struggling to get, so plan on private international insurance.',
    safety: 'Hungary is 15th in the 2026 Global Peace Index; violent crime is low, and the main risks are pickpocketing and tourist scams in the centre.',
    visa: 'Guest investor residence permit: at least €250k in a central-bank-registered real-estate fund held 5 years (or a €1m university donation), valid up to 10 years and renewable for 10 more, with family reunification and 21-day processing; buying property directly is not a listed route.',
    tax: 'No wealth tax; residents are taxed on worldwide income at a flat 15%, and interest and non-EEA dividends (including US-listed ones) also carry the 13% social contribution tax until a yearly cap of about HUF 7.75m of income (2026), so roughly 28% up to the cap and 15% above it.',
    estate: 'Inheritance tax is 18% (9% on homes), but transfers to children and a surviving spouse are exempt, so a US portfolio passes to US-resident children with no Hungarian tax; there is no US estate treaty.',
    lending:
      'IBKR reportedly serves Hungarian residents (likely through its EU entity), with margin terms per country unknown; Schwab International is reportedly unavailable, as Hungary is off its reported list.',
    climate: 'Continental: hot summers (July highs about 29°C) and cold winters, with January highs about 5°C and lows below freezing; about 1,900 hours of sun a year.',
    community:
      'An active, mixed expat scene with some retirees, organised mostly through Facebook groups and InterNations; English works in central Budapest, less so in the outer districts and among older Hungarians.',
    access: 'American\'s daily summer Philadelphia–Budapest flight (from May 2026) is the only US nonstop; the rest of the year, connect through a European hub.',
  },
  drawbacks: [
    'Up to 28% on US dividends and interest until the social-contribution cap',
    'The €250k fund stake is locked up for 5 years',
    'Cold winters, a hard language, and public healthcare that is hard to join',
  ],
  sources: [
    { name: 'PwC: Hungary, taxes on personal income', url: 'https://taxsummaries.pwc.com/hungary/individual/taxes-on-personal-income' },
    { name: 'PwC: Hungary, other taxes', url: 'https://taxsummaries.pwc.com/hungary/individual/other-taxes' },
    { name: 'Hungarian Immigration Office: residence permit for guest investors', url: 'https://oif.gov.hu/factsheets/residence-permit-for-guest-investor' },
    { name: 'Daily News Hungary: healthcare and insurance for expats', url: 'https://dailynewshungary.com/moving-to-hungary-expats-healthcare-insurance' },
    { name: 'Daily News Hungary: can foreigners retire in Hungary', url: 'https://dailynewshungary.com/can-foreigners-retire-in-hungary/' },
    S.gpiTop50,
    { name: 'One Mile at a Time: American adds Budapest and Prague', url: 'https://onemileatatime.com/news/american-new-europe-flights-budapest-prague/' },
    { name: 'Wikipedia: Budapest (climate)', url: 'https://en.wikipedia.org/wiki/Budapest' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
