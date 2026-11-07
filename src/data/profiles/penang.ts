import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Island food capital with medical-tourism hospitals',
  summary:
    'Penang has Malaysia\'s strengths (12th in the Global Peace Index, foreign income tax-exempt through 2036, wide use of English) on a smaller, cheaper island. Its private hospitals are a regional medical-tourism hub.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 5, healthcare: 4, safety: 4, visa: 2, climate: 3, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare: 'Accredited private hospitals (Island Hospital, Gleneagles Penang, Loh Guan Lye) draw medical tourists, at a fraction of US prices.',
    safety: 'Malaysia is 12th in the 2026 Global Peace Index; Penang is generally safe, with petty theft the main concern.',
    visa: 'Federal MM2H applies (Silver: about USD 150,000 on fixed deposit plus a property purchase); Penang\'s state property minimum may be higher than the national floor.',
    tax: 'Foreign-sourced income received by resident individuals is exempt through 31 Dec 2036, provided it was taxed where it arose; check current rules.',
    climate: 'Tropical: hot and humid all year, with monsoon rains and occasional haze; sea breezes help a little.',
    community: 'A long-established Western retiree community in George Town, Tanjung Bungah and Batu Ferringhi; English is widely spoken.',
    access: 'No US nonstops; connect via Singapore, Kuala Lumpur or another Asian hub, often with two stops.',
  },
  drawbacks: [
    'Very long trips to the US, often with two connections',
    'A high MM2H deposit and property requirement, and the property cannot be sold for 10 years',
    'Traffic congestion, and coastal high-rise development changing the island',
  ],
  sources: [
    S.mm2h,
    {
      name: 'Asia Lifestyle Magazine: MM2H 2026 requirements',
      url: 'https://www.asialifestylemagazine.com/mm2h-visa-2026-what-malaysias-second-home-programme-now-requires/',
    },
    S.myTax,
    S.seaGpi,
  ],
}

export default profile
