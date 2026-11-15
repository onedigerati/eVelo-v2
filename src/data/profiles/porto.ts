import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Portugal\'s BBD tax profile at lower cost',
  summary:
    'Porto has the same buy-borrow-die strengths as the rest of Portugal (no wealth tax, children inherit free, a D7 visa that accepts dividends, 7th in the Global Peace Index) for noticeably less than Lisbon. It is a compact, walkable river city with good hospitals and a growing international community. The weak point is the borrow step: Schwab and IBKR both reportedly bar EU residents from drawing margin as cash.',
  scores: { cost: 3, healthcare: 4, safety: 5, visa: 4, climate: 3, community: 3, tax: 3, estate: 5, lending: 2 },
  facts: {
    healthcare:
      'Large public hospitals (São João, Santo António) with typical SNS waits; expats widely use the private CUF, Lusíadas and Trofa hospitals, and CUF Porto cites JCI accreditation.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; Porto has low crime apart from petty theft in the tourist centre.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws are not on the consulates\' list of income and are believed not to count, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay a 28% flat rate (or the progressive scale by choice), with US tax on them creditable up to the treaty caps (15% on dividends, 10% on interest); NHR is closed and its IFICI successor is for workers, so there is no retiree regime; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, and IBKR\'s EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Atlantic: warm summers and cool, rainy, grey winters; cooler and wetter than Lisbon or the Algarve.',
    community: 'A smaller, newer English-speaking scene than Lisbon or the Algarve, growing fast with remote workers and retirees.',
    access: 'Francisco Sá Carneiro (OPO) is about 11 km north of the centre, linked by metro; trains reach Lisbon in about 3 hours, and Lisbon is the main connecting hub.',
  },
  drawbacks: [
    'Rainy, damp winters, and many older homes are poorly heated',
    'Fewer US nonstops than Lisbon',
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
    { name: 'CUF: where to find us (international)', url: 'https://cuf.pt/en/cuf-services/internacional-cuf/where-find-us' },
    S.gpiTop50,
  ],
}

export default profile
