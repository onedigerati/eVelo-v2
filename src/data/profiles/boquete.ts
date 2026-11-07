import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Cool highland town, big North American community',
  summary:
    'Live and Invest Overseas ranked Boquete 1st for 2026, and Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider. Retirees with a pension of $1,000 a month get permanent residency, foreign income is generally untaxed, and the currency is the US dollar.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 4, healthcare: 3, safety: 4, visa: 4, climate: 4, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Town clinics handle routine care (visits often $20–40); private hospitals are 40 minutes away in David and serious cases go to Panama City; most expats use private insurance, as the public CSS mainly serves contributors.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); Boquete itself is a quiet small town where petty theft is the main concern.',
    visa:
      'Pensionado gives permanent residency at any age but needs a lifetime pension of at least $1,000/month ($750 with $100k+ of Panama property); Social Security counts, portfolio income does not, and the Qualified Investor alternative was reportedly raised to $500k in September 2026.',
    tax: 'Territorial: foreign pensions and US brokerage dividends and gains are generally not taxed in Panama, though US tax still applies; check current rules.',
    climate:
      'At about 1,200 m (3,900 ft), spring-like all year; a long May–November wet season, and misty drizzle and wind in the dry season.',
    community: 'About 25,000 people, over a fifth of them expats (mostly from the US and Canada), so an English-speaking social life is easy to find.',
    access:
      'No direct US flights: fly David–Panama City on Copa (or drive about 7 hours), then connect at Tocumen, which has many US nonstops.',
  },
  drawbacks: [
    'Specialist and emergency care means a trip to David or a flight to Panama City',
    'Pensionado needs a true pension, so a portfolio-only retiree needs another route, and the investor visa is costly',
    'Prices are rising with expat demand, and the long rainy season wears on some people',
  ],
  sources: [S.lios, S.il, S.pensionado, S.gpiPoster],
}

export default profile
