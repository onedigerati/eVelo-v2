import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Spring-like Central Valley, tax-free today, a bill pending',
  summary:
    'Costa Rica is 3rd in International Living\'s 2026 index. The Central Valley around San José (Escazú, Santa Ana) pairs mild weather all year with the country\'s best private hospitals. Today there is no wealth or inheritance tax and foreign dividends are untaxed. Bill 25.796, filed in September 2026, would tax residents\' foreign dividends and interest at about 15%, so it ranks lower on that risk.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 4, climate: 5, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Residents must join the CCSS ("Caja") public system at a share of declared income (reported at $200–400/month on $1,500–2,500 in 2022); private Hospital Clínica Bíblica is JCI-accredited and on Newsweek\'s 2026 list of Latin America\'s top private hospitals, with CIMA and Metropolitano also nearby.',
    safety:
      'Costa Rica is 62nd of 163 in the 2026 Global Peace Index and US State Dept Level 2; homicides peaked at 905 in 2023 and were 873 in 2025, with 2026 projected below 800.',
    visa:
      'Rentista suits a portfolio-funded retiree: stable income of at least $2,500/month for 2 years (the "$60k" often quoted is 24 × $2,500; the official checklist checked in September 2026 lists no compulsory deposit), though whether brokerage dividends count as "stable" income is unaddressed; Inversionista needs about $150k, and Pensionado a $1,000/month pension; expect 6–18 months.',
    tax: 'No wealth tax; taxation is source-based today, so foreign dividends and interest are untaxed, but Bill 25.796 (filed 22 September 2026, in committee) would tax all residents\' foreign interest, dividends and gains at a reported 15%, deducting rather than crediting foreign tax and with no rentista exemption mentioned; check its status.',
    estate:
      'Costa Rica has no inheritance tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Costa Rica residents, and Schwab One International\'s application reportedly lists Costa Rica (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'At 1,000–1,200 m the Central Valley is spring-like all year (about 20–27°C), with afternoon rains May–November.',
    community: 'A long-established US and Canadian community in Escazú, Santa Ana, Atenas and Grecia; English is common in services.',
    access:
      'SJO has broad US nonstops (American, United, Delta, Southwest, JetBlue, Alaska, Avianca): about 2.5–3 hours to Miami, Houston and Atlanta; Liberia also serves the US.',
  },
  drawbacks: [
    'Bill 25.796 would add a 15% tax on foreign dividends and interest, removing the main BBD advantage if it passes',
    'One of Latin America\'s pricier countries, and a strong colón has pushed costs up for dollar earners',
    'Gang violence has stayed high since 2023, and petty theft and burglary are common',
  ],
  sources: [
    { name: 'Delfino: Expediente 25.796, foreign passive income bill', url: 'https://delfino.cr/asamblea/proyecto/25796' },
    { name: 'KPMG Costa Rica: Newsflash on the foreign passive income bill (Sept 2026)', url: 'https://kpmg.com/cr/es/insights/2026/09/newsflash-29-sep.html' },
    { name: 'PwC Worldwide Tax Summaries: Costa Rica, taxes on personal income', url: 'https://taxsummaries.pwc.com/costa-rica/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: inheritance and gift tax rates', url: 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates', edition: '2026' },
    { name: 'CRIE: Costa Rica Rentista residency deposit requirements', url: 'https://crie.cr/costa-rica-rentista-residency-bank-deposit-requirements/' },
    { name: 'Tico Times: Costa Rican hospital among Latin America\'s best (Feb 2026)', url: 'https://ticotimes.net/2026/02/06/costa-rican-hospital-climbs-ranks-among-latin-americas-best-in-2026' },
    {
      name: 'Tico Times: US travel advisory, Costa Rica Level 2 (Mar 2026)',
      url: 'https://ticotimes.net/2026/03/27/u-s-travel-advisory-highlights-costa-rica-as-a-safer-choice-in-central-america',
    },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.il,
    S.gpiPoster,
  ],
}

export default profile
