import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Quiet highland farm town below Volcán Barú, Panama\'s tax profile',
  summary:
    'Volcán is a cheaper, smaller Boquete: the same Panama BBD profile (territorial tax, so US dividends are untaxed, no wealth or inheritance tax, the US dollar) in a spring-like highland town at about 1,400 m. It ranks low because it adds little beyond Boquete: a basic emergency hospital, private hospitals 40 minutes to an hour away in David, a small expat community and only small, dated healthcare data.',
  scores: { cost: 4, healthcare: 2, safety: 4, visa: 3, climate: 4, community: 2, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Volcán\'s hospital (opened 2014) is a basic emergency facility; more care is in Concepción, about 30 minutes away, and David\'s private hospitals (Hospital Chiriquí, Mae Lewis) are 40 minutes to an hour away (secondary source, 2018); specialist cases fly to Panama City, and the public CSS is tied to payroll contributions, so most expats insure privately.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (secondary source), with its Level 4 areas in Darién and the Mosquito Gulf, far from Chiriquí; UK advice (October 2026) names no restriction for the area.',
    visa:
      'A US portfolio alone does not qualify: Friendly Nations needs $200k+ in Panamanian real estate or a local fixed-term deposit (the US being on the list is unverified), and Qualified Investor starts at $300k in local property; Pensionado gives permanent residency at any age on a $1,000/month lifetime pension, which portfolio income does not meet.',
    tax: 'No wealth tax; Panama taxes only Panamanian-source income, so US brokerage dividends and interest are generally untaxed locally (PwC states the territorial principle, not the specific items), though US tax still applies.',
    estate:
      'Panama has no inheritance, estate or gift tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies to the worldwide estate above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Panama residents, and Schwab One International\'s application reportedly lists Panama (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate:
      'Spring-like at about 1,400 m (4,600 ft): highs in the mid-20s °C and cool nights, with no need for air conditioning or heating; but very wet, about 2,900 mm a year, with a dry season from mid-December for about four months, under Volcán Barú.',
    community:
      'A farm town of about 12,700 (2010) with an expat community of "just around 250 people" (2018, secondary source), much smaller than Boquete\'s; Spanish is needed day to day.',
    access:
      'David airport (DAV) has only domestic flights to Panama City; US flights connect at Tocumen (PTY), which has about 20 US destinations.',
  },
  drawbacks: [
    'Only a basic emergency hospital in town; David is up to an hour away and specialists are in Panama City',
    'Without a pension, residency means parking $200k or more in Panama',
    'A small expat scene and a very wet climate',
  ],
  sources: [
    { name: 'International Living: Volcán, Panama', url: 'https://internationalliving.com/countries/panama/volcan-panama', edition: '2018' },
    { name: 'Wikipedia: Volcán, Chiriquí', url: 'https://en.wikipedia.org/wiki/Volc%C3%A1n,_Chiriqu%C3%AD' },
    { name: 'Wikipedia: Enrique Malek International Airport', url: 'https://en.wikipedia.org/wiki/Enrique_Malek_International_Airport' },
    { name: 'Wikipedia: Tocumen International Airport', url: 'https://en.wikipedia.org/wiki/Tocumen_International_Airport' },
    { name: 'GOV.UK: Panama travel advice', url: 'https://www.gov.uk/foreign-travel-advice/panama', edition: '2026' },
    { name: 'Travel Advisory: Panama (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/panama' },
    { name: 'PwC Worldwide Tax Summaries: Panama, taxes on personal income', url: 'https://taxsummaries.pwc.com/panama/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Panama, other taxes', url: 'https://taxsummaries.pwc.com/panama/individual/other-taxes', edition: '2026' },
    { name: 'Reside Panama: Panama visa options for expats in 2026', url: 'https://www.residepanama.com/en/reside-panama-blog/panama-visa-options-for-expats-in-2026-the-complete-guide' },
    {
      name: 'Reside Panama: Healthcare in Panama, hospitals, insurance and costs 2026',
      url: 'https://www.residepanama.com/en/reside-panama-blog/healthcare-in-panama-an-expat-guide-to-hospitals-insurance-costs-2026',
    },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.pensionado,
    S.gpiPoster,
  ],
}

export default profile
