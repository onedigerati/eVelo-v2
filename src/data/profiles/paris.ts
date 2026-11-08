import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'World-class city and hospitals, with France\'s death taxes',
  summary:
    'Paris offers France\'s top-rated healthcare (France scored best for healthcare in International Living\'s 2026 index), the easy visitor visa, a deep cultural life and nonstops to about two dozen US cities. For buy-borrow-die it has the same handicaps as the rest of France: a resident\'s worldwide estate is taxed at up to 45% when it passes to children, dividends pay 31.4%, and at about €9,700/m² a good-sized flat can push a buyer into the IFI real-estate wealth tax.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 4, climate: 3, community: 4, tax: 2, estate: 1, lending: 3 },
  facts: {
    healthcare:
      'Visitor-visa holders can join the public PUMa system after 3 months\' residence (most add a top-up mutuelle, about €120–132/month at 70); the 2026 social security law added a health contribution for residents with no French work income who pay no French social levies under a treaty, but its amount and scope await a decree (none as of Oct 2026); Paris has the AP-HP public teaching hospitals, and the private, bilingual American Hospital of Paris in Neuilly is accredited by The Joint Commission.',
    safety:
      'France fell to 99th in the 2026 Global Peace Index, mostly on militarisation and nuclear factors, while homicide is very low; the US rates France Level 2 for terrorism and civil unrest, strikes and demonstrations are frequent in Paris, and pickpocketing and phone theft are common on the Métro and at the big sights.',
    visa: 'Long-stay visitor visa (VLS-TS visiteur): at least €1,477.93 net/month (€17,735/year) of passive income or resources, health insurance for the whole stay and a pledge not to work; renewed yearly at the prefecture at first; from May 2026 the first residence card costs €350 and renewals €250.',
    tax: 'No wealth tax on a portfolio, but IFI taxes net real estate over €1.3M at 0.5–1.5%, and Paris flats average about €9,700/m² (Sept 2026), so a buyer of about 135 m² or more is in scope (the proposed tax on financial assets was dropped from the 2026 budget); dividends, interest and gains pay a 31.4% flat tax (PFU) from 2026 (12.8% plus 18.6% social levies), and a 6.5% PUMa levy can hit capital income above €24,030 for a resident with no pension or earnings; check current rules.',
    estate:
      'France taxes a French-resident decedent\'s worldwide estate: each child gets a €100k allowance, then 5–45% (20% from €15,933 to €552,324, 45% above €1,805,677); under the US–France estate treaty a US citizen (not French) who clearly intends to keep a US domicile and has lived in France under 5 of the last 7 years is treated as US-domiciled, so France taxes only French real estate and goods in France; after that, or for anyone settled in France for good, the worldwide estate is in reach, with treaty credits against double tax.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept France residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Temperate and changeable: July highs about 26°C and January highs about 8°C (lows near 3°C), about 640 mm of rain spread through the year and grey winters; heatwaves now bring a few days above 32°C most summers (record 42.6°C in 2019).',
    community:
      'A large, long-established English-speaking community, Americans included; about one Paris resident in five is an immigrant (2012 census), and daily life and paperwork still run in French.',
    access:
      'Charles de Gaulle has nonstops to about two dozen US cities on Air France, Delta, United and American, including New York, Newark, Boston, Washington, Atlanta, Chicago, Miami, Dallas, Houston, Los Angeles, San Francisco and Seattle.',
  },
  drawbacks: [
    'Inheritance tax of up to 45% on the worldwide estate passing to children',
    '31.4% on dividends and interest, IFI on a large flat, and among the costliest cities in Europe',
    'French bureaucracy (prefecture renewals, PUMa enrolment) is slow and in French',
  ],
  sources: [
    S.il,
    S.gpiTop50,
    { name: 'PwC: France, other taxes', url: 'https://taxsummaries.pwc.com/france/individual/other-taxes', edition: '2026' },
    { name: 'Service-Public: inheritance tax (droits de succession)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14198' },
    {
      name: 'SF Tax Counsel: a closer look at the US–France estate and gift tax treaty',
      url: 'https://sftaxcounsel.com/blog/a-closer-look-at-the-u-s-france-estate-and-gift-tax-treaty/',
    },
    { name: 'Service-Public: long-stay visitor visa', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F302?lang=en' },
    { name: 'The Local: the French 5-year rule for inheritance tax', url: 'https://www.thelocal.fr/20230921/explained-the-french-5-year-rule-for-inheritance-tax', edition: '2023' },
    { name: 'Service-Public: residence permit fees from 1 May 2026', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18881', edition: '2026' },
    { name: 'Easy France Now: the health contribution (CSS art. L160-1-1)', url: 'https://easyfrancenow.com/updates/health-contribution', edition: '2026' },
    { name: 'Indy: PUMa tax simulator', url: 'https://www.indy.fr/guide/fiscalite/gestion-financiere/simulateur-taxe-puma/' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Expat.com: France raises flat tax to 31.4%', url: 'https://www.expat.com/en/expat-mag/12501-france-raises-flat-tax-to-314-percent-what-it-means-for-expats.html' },
    {
      name: 'SeLoger: Paris property market, 2026 review',
      url: 'https://edito.seloger.com/actualites/france/immobilier-paris-2026-bilan-de-l-annee-perspectives-2027-article-23824.html',
      edition: '2026',
    },
    {
      name: 'Travel Market Report: State Department Level 2 advisory for France',
      url: 'https://travelmarketreport.com/destinations/articles/u-s-state-department-issues-level-2-travel-warning-for-france',
      edition: '2025',
    },
    { name: 'Wikipedia: American Hospital of Paris', url: 'https://en.wikipedia.org/wiki/American_Hospital_of_Paris' },
    { name: 'Wikipedia: Paris (climate, demographics)', url: 'https://en.wikipedia.org/wiki/Paris' },
    { name: 'Wikipedia: Charles de Gaulle Airport', url: 'https://en.wikipedia.org/wiki/Charles_de_Gaulle_Airport' },
  ],
}

export default profile
