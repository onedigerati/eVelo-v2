import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Capital city amenities, best US flight links',
  summary:
    'Lisbon has Portugal\'s buy-borrow-die profile (no wealth tax, children inherit free, a D7 visa that accepts dividends) with the country\'s best hospitals and the most nonstop US flights on the Iberian peninsula. Portugal is 7th in the Global Peace Index; Lisbon costs more than the Algarve or Porto, but offers big-city culture and a large international community.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 4, climate: 4, community: 4, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Residents can join the public SNS (good, but with waits), and a dense private network of CUF, Luz and Lusíadas hospitals has English-speaking doctors; local private plans often close to new joiners around 65.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; pickpocketing in tourist areas and on trams is the main issue.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws do not count as income, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay a 28% flat rate (or the progressive scale by choice), with the 15% US withholding creditable under the treaty; NHR is closed and its IFICI successor is for workers, so there is no retiree regime; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mild Atlantic-Mediterranean climate: warm dry summers, and wet but mild winters around 15°C.',
    community: 'Large, mixed international crowd of retirees, remote workers and digital nomads; English is widely spoken.',
    access:
      'The most US nonstops in the region: TAP flies to Boston, Chicago, LA, Miami, Newark, New York, San Francisco and Washington (Orlando from Oct 2026), plus United, Delta and American routes.',
  },
  drawbacks: [
    'Housing costs have climbed fast and are high relative to local incomes',
    'Hilly, cobbled streets are hard going for anyone with limited mobility',
    '28% on dividends and interest with no retiree regime, and Schwab margin can\'t be drawn as cash',
  ],
  sources: [
    { name: 'PwC: Portugal, other taxes', url: 'https://taxsummaries.pwc.com/portugal/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Portugal, taxes on personal income', url: 'https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'Portugalist: D7 visa requirements', url: 'https://www.portugalist.com/d7-visa-requirements/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Wikipedia: Lisbon Airport (airlines and destinations)', url: 'https://en.wikipedia.org/wiki/Lisbon_Airport' },
    S.gpiTop50,
  ],
}

export default profile
