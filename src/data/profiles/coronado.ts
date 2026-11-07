import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Pacific beach town with Panama\'s tax profile',
  summary:
    'Coronado brings Panama\'s BBD profile to the beach: territorial tax, so US dividends are untaxed, no wealth or inheritance tax, and the US dollar. About 4,000 expats live in a town of about 10,000, many of them retirees. Serious hospital care and Tocumen\'s US flights are 1–1.5 hours away in Panama City.',
  scores: { cost: 4, healthcare: 3, safety: 4, visa: 3, climate: 3, community: 4, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Local private clinics plus Clinical Hospital San Fernando; serious care is in Panama City, about 1–1.5 hours away, at hospitals such as Punta Pacífica (affiliated with Johns Hopkins Medicine); local private cover runs about $350–700+/month in your 60s.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (secondary source), with its Level 4 areas in Darién and the Mosquito Gulf, far from Coronado; UK advice (October 2026) names no restriction for the area, and petty theft is the main concern.',
    visa:
      'A US portfolio alone does not qualify: Friendly Nations needs $200k+ in Panamanian real estate or a local fixed-term deposit (a beach condo can count; the US being on the list is unverified), and Qualified Investor starts at $300k in local property; Pensionado is permanent on a $1,000/month lifetime pension, which portfolio income does not meet.',
    tax: 'No wealth tax; Panama taxes only Panamanian-source income, so US brokerage dividends and interest are generally untaxed locally (PwC states the territorial principle, not the specific items).',
    estate:
      'Panama has no inheritance, estate or gift tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Panama residents, and Schwab One International\'s application reportedly lists Panama (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'Tropical but on Panama\'s drier coast: about 22–32°C, with a dry season January–April and rain May–December.',
    community: 'About 4,000 expats in a town of about 10,000 (2025, secondary source), many of them retirees, so English-speaking social life is easy to find.',
    access:
      'Tocumen is about 1.5 hours by road, with about 20 US destinations (mostly Copa, plus American to Miami, Delta to Atlanta and United to Houston and Newark); nearby Río Hato has only some Canadian charters.',
  },
  drawbacks: [
    'Hospitals and the airport are 1–1.5 hours away in Panama City',
    'Without a pension, residency means placing $200k or more in Panama',
    'Hot, and a long rainy season, even if drier than the capital',
  ],
  sources: [
    { name: 'Expatra: Living in Coronado, Panama', url: 'https://www.expatra.com/living-in-coronado-panama/', edition: '2025' },
    {
      name: 'Reside Panama: Healthcare in Panama, hospitals, insurance and costs 2026',
      url: 'https://www.residepanama.com/en/reside-panama-blog/healthcare-in-panama-an-expat-guide-to-hospitals-insurance-costs-2026',
    },
    { name: 'Reside Panama: Panama visa options for expats in 2026', url: 'https://www.residepanama.com/en/reside-panama-blog/panama-visa-options-for-expats-in-2026-the-complete-guide' },
    { name: 'PwC Worldwide Tax Summaries: Panama, taxes on personal income', url: 'https://taxsummaries.pwc.com/panama/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Panama, other taxes', url: 'https://taxsummaries.pwc.com/panama/individual/other-taxes', edition: '2026' },
    { name: 'GOV.UK: Panama travel advice', url: 'https://www.gov.uk/foreign-travel-advice/panama' },
    { name: 'Travel Advisory: Panama (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/panama' },
    { name: 'Wikipedia: Tocumen International Airport', url: 'https://en.wikipedia.org/wiki/Tocumen_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.gpiPoster,
  ],
}

export default profile
