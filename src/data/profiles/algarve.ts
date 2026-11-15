import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Sunny coast, big English-speaking retiree scene',
  summary:
    'For a buy-borrow-die retiree, Portugal has no wealth tax, children inherit free and the D7 visa accepts dividend income, and the Algarve adds about 300 days of sun and an established English-speaking retiree community. Portugal is 7th in the Global Peace Index, Live and Invest Overseas has the Algarve 2nd for 2026, and International Living has Portugal 4th. The weak point is the borrow step: Schwab and IBKR both reportedly bar EU residents from drawing margin as cash.',
  scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 5, tax: 3, estate: 5, lending: 2 },
  facts: {
    healthcare:
      'Residents can use the public SNS, but the region has few public hospitals and long waits; most expats also carry private cover (CUF, which took over the HPA hospitals in 2026, and Lusíadas) and generally look to Lisbon for complex care; local private plans often close to new joiners around 65, so international cover (e.g. Cigna, no upper entry age) is the late-mover option.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; violent crime is low, and theft in resort towns is mostly opportunistic.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws are not on the consulates\' list of income and are believed not to count, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay a 28% flat rate (or the progressive scale by choice), with US tax on them creditable up to the treaty caps (15% on dividends, 10% on interest); NHR is closed and its IFICI successor is for workers, so there is no retiree regime; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, and IBKR\'s EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: about 300 sunny days, hot dry summers and mild winters around 15–17°C.',
    community:
      'One of Europe\'s largest English-speaking retiree populations (British, Irish, North American), concentrated in Lagos, Tavira, Loulé and the golf resorts.',
    access: 'Faro airport, just west of Faro, serves the whole Algarve coast; Lisbon, with a far wider choice of flights, is about 2.5–3 hours by motorway or train.',
  },
  drawbacks: [
    'Public hospital capacity in the region is thin, so complex care often means a trip to Lisbon',
    'Very seasonal: some resort towns are quiet in winter, while summer brings crowds and higher prices',
    '28% on dividends and interest with no retiree regime, and Schwab and IBKR both reportedly bar drawing margin as cash',
  ],
  sources: [
    { name: 'PwC: Portugal, other taxes', url: 'https://taxsummaries.pwc.com/portugal/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Portugal, income determination', url: 'https://taxsummaries.pwc.com/portugal/individual/income-determination', edition: '2026' },
    { name: 'PwC: Portugal, other tax credits and incentives', url: 'https://taxsummaries.pwc.com/portugal/individual/other-tax-credits-and-incentives', edition: '2026' },
    { name: 'IRS: US–Portugal income tax convention', url: 'https://www.irs.gov/pub/irs-trty/portugal.pdf' },
    { name: 'Portuguese Ministry of Foreign Affairs: residency visa documents', url: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/residency' },
    { name: 'LYNX: withdrawals from accounts carried by Interactive Brokers', url: 'https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/' },
    { name: 'Portugalist: D7 visa requirements', url: 'https://www.portugalist.com/d7-visa-requirements/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'HPA Saúde: the HPA Group is now CUF', url: 'https://www.grupohpa.com/en/blog/hpa-group-is-now-cuf/', edition: '2026' },
    S.united,
    S.gpiTop50,
  ],
}

export default profile
