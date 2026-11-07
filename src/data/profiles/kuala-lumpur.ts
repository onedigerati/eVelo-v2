import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Modern, English-friendly city, tax-free foreign income',
  summary:
    'Malaysia is 12th in the 2026 Global Peace Index and 10th in International Living\'s 2026 index, and it exempts residents\' foreign income from tax through 2036. Kuala Lumpur offers first-rate private hospitals and widespread English at a fraction of US costs, but its residence program is expensive to enter.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 2, climate: 3, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Excellent, affordable private hospitals (Gleneagles, Prince Court, Sunway) with English-speaking, often Western-trained doctors; foreigners pay out of pocket or use private insurance.',
    safety: 'Malaysia is 12th in the 2026 Global Peace Index; violent crime is low, and bag-snatching and petty theft are the main risks.',
    visa:
      'MM2H Silver: a fixed deposit of about USD 150,000 and a property purchase (reportedly at least about RM600,000, higher in some states); a renewable 5-year pass, with no minimum stay reported for applicants 50 and over.',
    tax: 'Foreign-sourced income received by resident individuals is exempt through 31 Dec 2036, provided it was taxed where it arose; check current rules.',
    climate: 'Hot and humid all year (about 32°C), with heavy afternoon storms and occasional haze from regional fires.',
    community: 'A large, established expat community (Mont Kiara, Bangsar); English is an everyday business language.',
    access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei, Doha or Dubai, typically 20+ hours.',
  },
  drawbacks: [
    'MM2H\'s entry cost (about USD 150k on deposit plus a property that cannot be sold for 10 years) is the highest of these cities',
    'A long trip home to the US, with no nonstop flights',
    'Relentless heat and humidity, and a city built around cars',
  ],
  sources: [
    S.mm2h,
    S.myTax,
    {
      name: 'Bloomberg Tax: Malaysia gazettes order extending foreign income exemption',
      url: 'https://news.bloombergtax.com/daily-tax-report-international/malaysia-gazettes-order-extending-income-tax-exemption-on-foreign-income',
    },
    {
      name: 'Time Out: Malaysia among most peaceful countries 2026',
      url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
      edition: '2026',
    },
  ],
}

export default profile
