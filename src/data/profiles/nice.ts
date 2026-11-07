import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Riviera city with France\'s top-rated healthcare',
  summary:
    'France is 7th in International Living\'s 2026 index and scored best of all for healthcare, and Nice adds the Riviera\'s mild winters, a big English-speaking community and a year-round New York nonstop. For buy-borrow-die it ranks last of the 50: France taxes a resident\'s worldwide estate at up to 45% when it passes to children, and dividends pay 31.4%.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 4, climate: 4, community: 4, tax: 2, estate: 1, lending: 3 },
  facts: {
    healthcare:
      'Visitor-visa holders can join the public PUMa system after 3 months\' residence (most add a top-up mutuelle, about €120–132/month at 70); a contribution for non-EU visitor-visa holders passed in the 2026 social security law but its amount awaits a decree; the CHU de Nice and private clinics are strong.',
    safety:
      'France fell to 99th in the 2026 Global Peace Index, mostly on militarisation and nuclear factors, while homicide is very low; in Nice, pickpocketing and car break-ins are the common issues, and security stays visible since the 2016 attack.',
    visa: 'Long-stay visitor visa (VLS-TS visiteur): at least €1,477.93 net/month (€17,735/year) of passive income or resources, health insurance for the whole stay and a pledge not to work; renewed yearly at the prefecture at first, with the residence-card fee raised to €300 in the 2026 budget.',
    tax: 'No wealth tax on a portfolio (IFI covers net real estate over €1.3M only, and the proposed tax on financial assets was dropped from the 2026 budget); dividends, interest and gains pay a 31.4% flat tax from 2026 (12.8% plus 18.6% social levies), and a 6.5% PUMa levy can hit capital income above €24,030 for a resident with no pension or earnings; check current rules.',
    estate:
      'France taxes a French-resident decedent\'s worldwide estate: each child gets a €100k allowance, then 5–45% (20% from €15,933 to €552,324, 45% above €1,805,677); the US–France estate treaty gives credits, not an exemption, so a retiree domiciled in France faces French tax on the US portfolio.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept France residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: about 300 sunny days, winter days around 13°C and hot summers near 28–30°C, with occasional heatwaves.',
    community: 'A large English-speaking community of British, American and Northern European residents along the Riviera, though daily life and paperwork run in French.',
    access:
      'La Compagnie (business class only) flies Newark–Nice year-round from the 2026–27 winter, and US carriers add summer New York flights; check current schedules.',
  },
  drawbacks: [
    'Inheritance tax of up to 45% on the worldwide estate passing to children',
    '31.4% on dividends and interest, plus a possible 6.5% PUMa levy, and one of the costliest places on this list',
    'French bureaucracy (prefecture renewals, PUMa enrolment) is slow and in French',
  ],
  sources: [
    S.il,
    { name: 'PwC: France, other taxes', url: 'https://taxsummaries.pwc.com/france/individual/other-taxes', edition: '2026' },
    { name: 'Service-Public: inheritance tax (droits de succession)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14198' },
    {
      name: 'SF Tax Counsel: a closer look at the US–France estate and gift tax treaty',
      url: 'https://sftaxcounsel.com/blog/a-closer-look-at-the-u-s-france-estate-and-gift-tax-treaty/',
    },
    { name: 'Service-Public: long-stay visitor visa', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F302?lang=en' },
    { name: 'Indy: PUMa tax simulator', url: 'https://www.indy.fr/guide/fiscalite/gestion-financiere/simulateur-taxe-puma/' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    {
      name: 'Connexion: French MPs back health fee for visitor visas',
      url: 'https://www.connexionfrance.com/news/french-mps-back-new-health-fee-for-visitor-visas-and-target-americans/752385',
    },
    { name: 'Expat.com: France raises flat tax to 31.4%', url: 'https://www.expat.com/en/expat-mag/12501-france-raises-flat-tax-to-314-percent-what-it-means-for-expats.html' },
    {
      name: 'AviationPros: Nice gains first year-round New York service',
      url: 'https://www.aviationpros.com/airport-business/news/55384892/nice-airport-gains-first-year-round-new-york-service-as-la-compagnie-extends-route',
    },
  ],
}

export default profile
