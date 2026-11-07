import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Small Central Valley town near the airport',
  summary:
    'Atenas is a small Central Valley town with over 1,500 expats, marketed for decades as having "the best climate in the world". San José\'s airport is about 30–45 minutes away and its top private hospitals under an hour. It shares Costa Rica\'s BBD profile: no wealth or inheritance tax, and foreign dividends untaxed today. It also shares the risk of Bill 25.796, which would tax them at about 15%.',
  scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 5, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Atenas has a 24-hour clinic; Hospital CIMA in Escazú (JCI-accredited per a secondary source) and JCI-accredited Clínica Bíblica are under an hour away with English-speaking staff; residents must also join the CCSS ("Caja") public system at a share of declared income.',
    safety:
      'Costa Rica is 62nd of 163 in the 2026 Global Peace Index and US State Dept Level 2 for crime (April 2026, secondary source); Atenas is a quiet farm town, but burglary and petty theft are the common complaints nationwide.',
    visa:
      'Rentista suits a portfolio-funded retiree: stable income of at least $2,500/month for 2 years (no compulsory deposit on the official checklist checked in September 2026), though whether brokerage dividends count as "stable" income is unaddressed; Inversionista needs about $150k and Pensionado a $1,000/month pension.',
    tax: 'No wealth tax; taxation is source-based today, so foreign dividends and interest are untaxed, but Bill 25.796 (filed 22 September 2026, in committee) would tax all residents\' foreign interest, dividends and gains at a reported 15%, deducting rather than crediting foreign tax; check its status.',
    estate:
      'Costa Rica has no inheritance tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Costa Rica residents, and Schwab One International\'s application reportedly lists Costa Rica (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'Days in the 70s–80s°F and nights in the 60s all year, with afternoon rains roughly May–November.',
    community: 'Over 1,500 expats (2025, secondary source), mostly North American retirees, in a town where Spanish still dominates daily life.',
    access:
      'Juan Santamaría (SJO) is about 30–45 minutes away, with broad US nonstops: American (Charlotte, Dallas, Miami), United (Houston, Newark, San Francisco), Delta (Atlanta), Southwest, JetBlue, Alaska (Los Angeles) and Avianca.',
  },
  drawbacks: [
    'Bill 25.796 would add a 15% tax on foreign dividends and interest if it passes',
    'Only a clinic in town; hospitals mean a drive toward San José',
    'Costa Rica is pricier than most of Latin America, and a car is close to essential',
  ],
  sources: [
    { name: 'International Living: We test-drove Atenas for retirement', url: 'https://internationalliving.com/we-test-drove-atenas-for-retirement' },
    { name: 'Expatra: What it\'s like living in Atenas, Costa Rica', url: 'https://www.expatra.com/what-its-like-living-in-atenas-costa-rica-as-an-expat/', edition: '2025' },
    { name: 'Wikipedia: Hospital CIMA', url: 'https://en.wikipedia.org/wiki/Hospital_CIMA' },
    { name: 'Wikipedia: Juan Santamaría International Airport', url: 'https://en.wikipedia.org/wiki/Juan_Santamar%C3%ADa_International_Airport' },
    { name: 'Delfino: Expediente 25.796, foreign passive income bill', url: 'https://delfino.cr/asamblea/proyecto/25796' },
    { name: 'PwC Worldwide Tax Summaries: Costa Rica, taxes on personal income', url: 'https://taxsummaries.pwc.com/costa-rica/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'CRIE: Costa Rica Rentista residency deposit requirements', url: 'https://crie.cr/costa-rica-rentista-residency-bank-deposit-requirements/' },
    { name: 'Travel Advisory: Costa Rica (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/costa-rica' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.gpiPoster,
  ],
}

export default profile
