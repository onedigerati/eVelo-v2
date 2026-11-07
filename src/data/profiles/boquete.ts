import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Cool highland town, big North American community',
  summary:
    'Live and Invest Overseas ranked Boquete 1st for 2026, and Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider. It brings Panama\'s BBD tax profile to a spring-like mountain town: territorial tax, so US dividends are untaxed, and no wealth or inheritance tax. Private hospitals are in David, about an hour away.',
  scores: { cost: 4, healthcare: 3, safety: 4, visa: 3, climate: 4, community: 4, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Town clinics handle routine care (visits often $20–40); private hospitals (Hospital Chiriquí, Mae Lewis) are under an hour away in David, and specialist cases fly to Panama City, about an hour; most expats insure privately, as the public CSS is tied to payroll contributions.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); Boquete itself is a quiet small town where petty theft is the main concern.',
    visa:
      'A US portfolio alone does not qualify: Friendly Nations needs $200k+ in Panamanian real estate or a local fixed-term deposit (the US being on the list is unverified), and Qualified Investor starts at $300k in local property (one source reports a rise to $500k in September 2026); Pensionado gives permanent residency at any age on a $1,000/month lifetime pension ($750 with $100k+ of Panama property), which portfolio income does not meet.',
    tax: 'No wealth tax; Panama taxes only Panamanian-source income, so US brokerage dividends and interest are generally untaxed locally (PwC states the territorial principle, not the specific items), though US tax still applies.',
    estate:
      'Panama has no inheritance, estate or gift tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies to the worldwide estate above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Panama residents, and Schwab One International\'s application reportedly lists Panama (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate:
      'At about 1,200 m (3,900 ft), spring-like all year; a long May–November wet season, and misty drizzle and wind in the dry season.',
    community: 'About 25,000 people, over a fifth of them expats (mostly from the US and Canada), so an English-speaking social life is easy to find.',
    access:
      'No direct US flights: fly David–Panama City on Copa (or drive about 7 hours), then connect at Tocumen, which has about 20 US destinations.',
  },
  drawbacks: [
    'Specialist and emergency care means a trip to David or a flight to Panama City',
    'Without a pension, residency means parking $200k or more in Panama',
    'Prices are rising with expat demand, and the long rainy season wears on some people',
  ],
  sources: [
    S.lios,
    { name: 'PwC Worldwide Tax Summaries: Panama, taxes on personal income', url: 'https://taxsummaries.pwc.com/panama/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Panama, other taxes', url: 'https://taxsummaries.pwc.com/panama/individual/other-taxes', edition: '2026' },
    { name: 'Reside Panama: Panama visa options for expats in 2026', url: 'https://www.residepanama.com/en/reside-panama-blog/panama-visa-options-for-expats-in-2026-the-complete-guide' },
    {
      name: 'Reside Panama: Healthcare in Panama, hospitals, insurance and costs 2026',
      url: 'https://www.residepanama.com/en/reside-panama-blog/healthcare-in-panama-an-expat-guide-to-hospitals-insurance-costs-2026',
    },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.il,
    S.pensionado,
    S.gpiPoster,
  ],
}

export default profile
