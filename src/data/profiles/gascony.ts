import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Rolling rural France around Auch, with France\'s death taxes',
  summary:
    'Gascony (the Gers, around Auch) offers quiet villages, Pyrenees views and France\'s easy visitor visa and public health system, with a long-standing British presence. For buy-borrow-die it ranks near the bottom: France taxes a resident\'s worldwide estate at up to 45% when it passes to children, dividends pay 31.4%, and the nearest teaching hospital is in Toulouse, about 70 km from Auch.',
  scores: { cost: 2, healthcare: 3, safety: 4, visa: 4, climate: 4, community: 3, tax: 2, estate: 1, lending: 3 },
  facts: {
    healthcare:
      'Visitor-visa holders can join the public PUMa system after 3 months\' residence (most add a top-up mutuelle, about €120–132/month at 70); Auch\'s public hospital has 562 beds and places and is due to be rebuilt on a new site around 2028–30, specialists are sparser in rural Gers, and the CHU de Toulouse is about 70 km east.',
    safety:
      'France fell to 99th in the 2026 Global Peace Index, mostly on militarisation and nuclear factors, and UK advice says terrorists are very likely to try attacks in France, mainly in cities; rural Gers sees little crime, and wildfire risk is highest in the south and south-west.',
    visa: 'Long-stay visitor visa (VLS-TS visiteur): at least €1,477.93 net/month (€17,735/year) of passive income or resources, health insurance for the whole stay and a pledge not to work; renewed yearly at the prefecture at first; from May 2026 the first residence card costs €350 and renewals €250.',
    tax: 'No wealth tax on a portfolio (IFI covers net real estate over €1.3M only, unlikely at rural Gers prices, and the proposed tax on financial assets was dropped from the 2026 budget); dividends, interest and gains pay a 31.4% flat tax from 2026 (12.8% plus 18.6% social levies), and a 6.5% PUMa levy can hit capital income above €24,030 for a resident with no pension or earnings; check current rules.',
    estate:
      'France taxes a French-resident decedent\'s worldwide estate: each child gets a €100k allowance, then 5–45% (20% from €15,933 to €552,324, 45% above €1,805,677); under the US–France estate treaty a US citizen (not French) who clearly intends to keep a US domicile and has lived in France under 5 of the last 7 years is treated as US-domiciled, so France taxes only French real estate and goods in France; after that, or for anyone settled in France for good, the worldwide estate is in reach, with treaty credits against double tax.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept France residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mild south-western climate: Auch averages July highs about 28°C and January highs about 10°C with lows near 2°C, about 700 mm of rain and 1,980 hours of sun a year (1991–2020).',
    community:
      'The Gers has long drawn British and other European buyers: about 1,300 of its 6,400 second homes are foreign-owned, 49% of them by Britons, and long-term foreign residents join village associations; Auch itself has about 22,000 people, and daily life runs in French.',
    access: 'Toulouse–Blagnac is the nearest major airport (Auch is about 70 km west of Toulouse, with TER trains to Toulouse-Matabiau); there are no US nonstops from Toulouse, so connect via Paris or another hub.',
  },
  drawbacks: [
    'Inheritance tax of up to 45% on the worldwide estate passing to children',
    'Long drives to specialist and teaching-hospital care in Toulouse',
    '31.4% on dividends and interest, a car-dependent rural life, and paperwork in French',
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
    { name: 'The Local: the French 5-year rule for inheritance tax', url: 'https://www.thelocal.fr/20230921/explained-the-french-5-year-rule-for-inheritance-tax', edition: '2023' },
    { name: 'Service-Public: residence permit fees from 1 May 2026', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18881', edition: '2026' },
    { name: 'Indy: PUMa tax simulator', url: 'https://www.indy.fr/guide/fiscalite/gestion-financiere/simulateur-taxe-puma/' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Wikipedia: Auch (climate)', url: 'https://en.wikipedia.org/wiki/Auch' },
    { name: 'Wikipédia: Auch (santé, transports)', url: 'https://fr.wikipedia.org/wiki/Auch' },
    { name: 'Connexion: French property watch, living in Gers', url: 'https://www.connexionfrance.com/practical/french-property-watch-high-class-living-in-gers/197093' },
    { name: 'GOV.UK: France travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/france/safety-and-security' },
    S.gpiTop50,
  ],
}

export default profile
