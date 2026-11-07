import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Portugal\'s safety and visa at lower cost',
  summary:
    'Porto offers the same strengths as the rest of Portugal (7th in the Global Peace Index, a low D7 income bar, EU healthcare) for noticeably less than Lisbon. It is a compact, walkable river city with good hospitals and a growing international community.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 4, safety: 5, visa: 4, climate: 3, community: 3, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare: 'Large public hospitals (São João, Santo António) with typical SNS waits; expats widely use the private CUF, Lusíadas and Trofa hospitals.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; Porto has low crime apart from petty theft in the tourist centre.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a spouse) plus housing and savings; AIMA processing backlogs are common.',
    tax: 'NHR is closed to new arrivals and its IFICI successor excludes pensions, so foreign pensions are taxed at progressive rates up to 48% and investment income commonly at 28%; the US–Portugal treaty applies (check current rules).',
    climate: 'Atlantic: warm summers and cool, rainy, grey winters; cooler and wetter than Lisbon or the Algarve.',
    community: 'A smaller, newer English-speaking scene than Lisbon or the Algarve, growing fast with remote workers and retirees.',
    access: 'United has flown Newark–Porto in past summers, but 2026 service could not be confirmed; most trips connect via Lisbon or a European hub.',
  },
  drawbacks: [
    'Rainy, damp winters, and many older homes are poorly heated',
    'Fewer US nonstops than Lisbon',
    'Rents are rising fast with tourism, and there is no NHR tax break for newcomers',
  ],
  sources: [S.d7, S.ptTax, S.gpiTop50, S.united],
}

export default profile
