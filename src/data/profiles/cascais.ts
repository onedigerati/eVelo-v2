import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Lisbon\'s tax profile on the Atlantic coast',
  summary:
    'Cascais has Portugal\'s buy-borrow-die profile (no wealth tax, children inherit free, a D7 visa that accepts dividends) in a safe seaside town on the commuter line to Lisbon, close to the capital\'s hospitals and US nonstops. It is one of Portugal\'s wealthiest and most expensive municipalities, with about 56,000 foreign residents.',
  scores: { cost: 2, healthcare: 4, safety: 5, visa: 4, climate: 4, community: 4, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'The private Hospital CUF Cascais is in town, with CUF Tejo and CUF Descobertas in Lisbon; the public Hospital de Cascais (SNS, run as a PPP) won an IHF silver award in Oct 2026, though its current JCI status is unverified; local private plans often close to new joiners around 65.',
    safety:
      'Portugal is 7th in the 2026 Global Peace Index, and the US rates it Level 1 (Dec 2025, secondary source); Cascais and Estoril have low crime, with petty theft at beaches and stations in summer.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws do not count as income, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay a 28% flat rate (or the progressive scale by choice), with the 15% US withholding creditable under the treaty; NHR is closed and its IFICI successor is for workers, so there is no retiree regime; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Warm-summer Mediterranean: January days about 15°C and August about 26°C, with about 636 mm of rain falling mostly in winter and almost none in summer (older Monte Estoril normals).',
    community:
      'AIMA counted about 56,000 foreign residents in the municipality in 2025, among the most in Portugal; Brazilians lead, followed by Italians, Britons (over 2,600 in 2020–23) and other Europeans, and about 15 international schools serve the area.',
    access:
      'Commuter trains on the 25 km Cascais Line and the A5 motorway link the town to Lisbon, whose airport has nonstops to about ten US cities on TAP, United, Delta and American.',
  },
  drawbacks: [
    'Among Portugal\'s most expensive property markets and living costs',
    'Cool, wet winters, and Atlantic wind on the coast',
    '28% on dividends and interest with no retiree regime, and Schwab margin can\'t be drawn as cash',
  ],
  sources: [
    { name: 'PwC: Portugal, other taxes', url: 'https://taxsummaries.pwc.com/portugal/individual/other-taxes', edition: '2026' },
    { name: 'Portugalist: D7 visa requirements', url: 'https://www.portugalist.com/d7-visa-requirements/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'CUF: where to find us (international)', url: 'https://cuf.pt/en/cuf-services/internacional-cuf/where-find-us' },
    {
      name: 'DN: Hospital de Cascais wins silver in international award (Oct 2026)',
      url: 'https://www.dn.pt/sociedade/hospital-de-cascais-recebe-prata-em-prmio-internacional-e-integra-grupo-de-oito-finalistas',
    },
    { name: 'Travel Advisory: Portugal', url: 'https://www.traveladvisory.io/advisory/portugal' },
    { name: 'The Golden Portugal: AIMA report 2025 analysis', url: 'https://www.thegoldenportugal.com/aima-report-2025-analysis/', edition: '2025' },
    {
      name: 'Câmara Municipal de Cascais: appeal for resident expatriates to register to vote',
      url: 'https://www.cascais.pt/noticia/cascais-apela-ao-recenseamento-de-expatriados-residentes-no-concelho?page=1',
    },
    { name: 'Wikipedia: Cascais', url: 'https://en.wikipedia.org/wiki/Cascais' },
    { name: 'Wikipedia: Lisbon Airport (airlines and destinations)', url: 'https://en.wikipedia.org/wiki/Lisbon_Airport' },
    S.gpiTop50,
  ],
}

export default profile
