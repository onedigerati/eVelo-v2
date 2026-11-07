import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Capital city amenities, best US flight links',
  summary:
    'Lisbon pairs Portugal\'s safety (7th in the Global Peace Index) and low D7 visa threshold with the country\'s best hospitals and the most nonstop US flights on the Iberian peninsula. It costs more than the Algarve or Porto, but offers big-city culture and a large international community.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 4, climate: 4, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Residents can join the public SNS (good, but with waits), and a dense private network of CUF, Luz and Lusíadas hospitals has English-speaking doctors.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; pickpocketing in tourist areas and on trams is the main issue.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a spouse) plus housing and savings; AIMA processing backlogs are common.',
    tax: 'NHR is closed to new arrivals and its IFICI successor excludes pensions, so foreign pensions are taxed at progressive rates up to 48% and investment income commonly at 28%; the US–Portugal treaty applies (check current rules).',
    climate: 'Mild Atlantic-Mediterranean climate: warm dry summers, and wet but mild winters around 15°C.',
    community: 'Large, mixed international crowd of retirees, remote workers and digital nomads; English is widely spoken.',
    access: 'The most US nonstops in the region: TAP flies to several US cities, and United flies daily from Washington Dulles.',
  },
  drawbacks: [
    'Housing costs have climbed fast and are high relative to local incomes',
    'Hilly, cobbled streets are hard going for anyone with limited mobility',
    'No NHR tax break for newcomers, heavy tourism, and some local resentment of foreigners',
  ],
  sources: [S.d7, S.ptTax, S.united, S.gpiTop50],
}

export default profile
