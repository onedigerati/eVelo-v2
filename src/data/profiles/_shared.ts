// Source entries shared by several profiles. Not a profile: the glob in expatPicks.ts skips files starting with "_".
// Builders: don't edit this file in parallel; put new sources inline in your profile.

import type { ExpatSource } from '../expatPicks'

export const S = {
  d7: { name: 'Portugalist: D7 requirements 2026', url: 'https://www.portugalist.com/d7-changes-2026' },
  ptTax: {
    name: 'Portugal Resident: new tax reality for incoming residents 2026',
    url: 'https://www.portugalresident.com/portugals-new-tax-reality-what-incoming-residents-need-to-know-in-2026/',
  },
  united: {
    name: 'AeroRoutes: United NS26 intercontinental changes',
    url: 'https://www.aeroroutes.com/eng/260326-uans26inc',
  },
  gpiTop50: { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
  gpiPoster: {
    name: 'IEP Global Peace Index 2026 map poster',
    url: 'https://www.visionofhumanity.org/wp-content/uploads/2026/06/Global-Peace-Index-2026-A3-map-poster.pdf',
    edition: '2026',
  },
  il: {
    name: '401(k) Specialist: International Living Global Retirement Index 2026',
    url: 'https://401kspecialistmag.com/greece-tops-2026-global-retirement-index-for-first-time/',
    edition: '2026',
  },
  lios: {
    name: '401(k) Specialist: Live and Invest Overseas top retirement destinations 2026',
    url: 'https://401kspecialistmag.com/6-top-international-retirement-destinations-for-2026/4',
    edition: '2026',
  },
  iprem: {
    name: 'Costa Luz Lawyers: IPREM 2026 for the non-lucrative visa',
    url: 'https://www.costaluzlawyers.com/resources/iprem-non-lucrative-visa-2026/',
  },
  spainAir: {
    name: 'Turespaña: air connectivity to Spain 2026',
    url: 'https://www.tourspain.es/en/b2b/air-connectivity-frequencies-routes-spain-2026/',
  },
  mm2h: { name: 'MM2H official guidelines (MOTAC)', url: 'https://www.mm2h.gov.my/apply/guidelines' },
  myTax: {
    name: 'The Star: foreign-sourced income exemption extension',
    url: 'https://www.thestar.com.my/news/true-or-not/2024/10/19/quickcheck-has-the-tax-exemption-on-foreign-sourced-income-been-extended',
  },
  seaGpi: {
    name: 'SEA Stats: Southeast Asia\'s most peaceful countries 2026',
    url: 'https://seasiastats.com/statistic/southeast-asias-most-and-least-peaceful-countries-in-2026-1NV7O',
  },
  pensionado: { name: 'Relofirm: Panama Pensionado requirements (updated Oct 2026)', url: 'https://www.relofirm.com/?p=60' },
  mxAdvisory: {
    name: 'Jetpac: Is it safe to travel to Mexico (state advisory levels, 2026)',
    url: 'https://blog.jetpacglobal.com/blog/is-it-safe-to-travel-to-mexico-right-now/',
  },
  mxResidency: {
    name: 'Mexperience: Financial criteria for residency in Mexico (2026 UMA)',
    url: 'https://mexperience.com/financial-criteria-for-residency-in-mexico/',
  },
  unitedSummer: {
    name: 'United: new summer flights to Split, Bari, Glasgow and Santiago de Compostela (Apr 2026)',
    url: 'https://united.mediaroom.com/2026-04-28-United-Airlines-Launches-New-Summer-Flights-to-Split,-Bari,-Glasgow-and-Santiago-De-Compostela',
  },
  timeoutGpi: {
    name: 'Time Out: most peaceful countries in Asia 2026',
    url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
    edition: '2026',
  },
  thRetire: { name: 'Issa Compass: Thailand retirement visa 2026', url: 'https://www.issacompass.com/insights/retirement-visa-thailand' },
  forbes: {
    name: 'UPI: Forbes best places for Americans to retire abroad, Latin America (Aug 2026)',
    url: 'https://www.upi.com/Top_News/World-News/2026/08/03/latam-Forves-retirment-list-latin-america/4111785782949/',
    edition: '2026',
  },
} satisfies Record<string, ExpatSource>
