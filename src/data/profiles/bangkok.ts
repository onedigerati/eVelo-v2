import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'World-class private hospitals, big-city Asian hub',
  summary:
    'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Bangkok\'s private hospitals are among Asia\'s leading medical-tourism centres. It has the same 50+ retirement visa as Chiang Mai, plus a 10-year LTR visa for wealthier retirees that reportedly exempts foreign income from Thai tax.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Internationally accredited private hospitals (Bumrungrad, Bangkok Hospital, Samitivej) with English-speaking, often US-trained specialists, well below US prices; foreigners rely on private insurance.',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor and political protests recur.',
    visa:
      'Retirement visa (Non-O or O-A, age 50+): 800,000 baht held in a Thai bank, with yearly extensions and 90-day reporting; or the 10-year LTR "Wealthy Pensioner" visa (50+): $80,000/year of passive income, investment returns included (or $40,000 plus $250,000 invested in Thailand), with yearly instead of 90-day reporting.',
    tax: 'Since 2024, residents present 180+ days a year are taxed on foreign income remitted into Thailand, at up to 35%; LTR holders are reportedly exempt on foreign income, proposed relief for everyone else has not been enacted, and the US–Thailand treaty applies (check current rules).',
    climate: 'Hot and humid all year (about 30–35°C), with a wet season (roughly June–October) that floods streets, and smoggy air in the dry months.',
    community: 'A large expat community along Sukhumvit and in Sathorn, with plenty of English-language services, though more working expats than retirees.',
    access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei or Hong Kong (United flies Los Angeles–Bangkok via Hong Kong), typically 18–22 hours.',
  },
  drawbacks: [
    'Relentless heat, rainy-season flooding and dry-season air pollution',
    'Foreign income you bring into Thailand can be taxed unless you qualify for the LTR visa',
    'A sprawling, congested city, and far from the US',
  ],
  sources: [
    {
      name: 'Issa Compass: Wealthy Pensioner LTR visa requirements (updated Oct 2026)',
      url: 'https://www.issacompass.com/insights/wealthy-pensioner-ltr-visa-income-requirements-the-10-year-structure-and-how-to-',
    },
    S.thRetire,
    {
      name: 'Thai Law Online: Thailand foreign income remittance tax, what applies in 2026',
      url: 'https://www.thailawonline.com/thailand-foreign-income-tax-2026-what-actually-applies/',
    },
    S.seaGpi,
  ],
}

export default profile
