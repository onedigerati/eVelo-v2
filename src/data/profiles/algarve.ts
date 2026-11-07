import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Sunny coast, big English-speaking retiree scene',
  summary:
    'Portugal is among the world\'s safest countries (7th in the Global Peace Index) and has the cheapest EU passive-income visa, and the Algarve adds about 300 days of sun and an established English-speaking retiree community. It ranks high on both retiree indexes: Live and Invest Overseas has it 2nd for 2026, and International Living has Portugal 4th.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 5, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Residents can use the public SNS, but the region has few public hospitals and long waits; most expats also carry private cover (HPA, Lusíadas, CUF) and go to Lisbon for complex care.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; violent crime is low, and theft in resort towns is mostly opportunistic.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a spouse) plus housing and savings; AIMA processing backlogs are common.',
    tax: 'NHR is closed to new arrivals and its IFICI successor excludes pensions, so foreign pensions are taxed at progressive rates up to 48% and investment income commonly at 28%; the US–Portugal treaty applies (check current rules).',
    climate: 'Mediterranean: about 300 sunny days, hot dry summers and mild winters around 15–17°C.',
    community:
      'One of Europe\'s largest English-speaking retiree populations (British, Irish, North American), concentrated in Lagos, Tavira, Loulé and the golf resorts.',
    access: 'United flies Newark–Faro seasonally (4 weekly, May–Sep 2026); the rest of the year, connect via Lisbon or a European hub.',
  },
  drawbacks: [
    'Public hospital capacity in the region is thin, so complex care often means a trip to Lisbon',
    'Very seasonal: some resort towns are quiet in winter, while summer brings crowds and higher prices',
    'Without NHR, a foreign pension or a large taxable portfolio draw can face high Portuguese rates',
  ],
  sources: [S.d7, S.ptTax, S.united, S.gpiTop50],
}

export default profile
