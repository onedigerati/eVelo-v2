import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Malaysia\'s tax profile on a quiet duty-free island',
  summary:
    'Langkawi has Malaysia\'s BBD strengths (no wealth, estate or gift tax, foreign income exempt through 2036, 12th in the 2026 Global Peace Index) on a cheap, quiet resort island. It ranks well below Penang because there is no private hospital on the island: the only hospital is the public Hospital Sultanah Maliha, and private care means a flight to Penang.',
  scores: { cost: 5, healthcare: 2, safety: 4, visa: 3, climate: 3, community: 2, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'There is no private or specialist hospital on the island: Hospital Sultanah Maliha (public, 7 km from Kuah) is the only one, non-emergency waits can reportedly run to months and foreigners pay foreigner rates; private care (Island Hospital, Gleneagles, Pantai) is a short AirAsia or Firefly flight away in Penang, where private hospitals add 6% service tax for foreign patients.',
    safety:
      'Malaysia is 12th in the 2026 Global Peace Index and reportedly at US Level 1 (Feb 2026; only eastern Sabah is higher; secondary); UK advice warns of bag-snatching, card fraud and drink spiking, and of overloaded passenger boats.',
    visa: 'Federal MM2H applies: Silver needs a USD 150,000 fixed deposit with a Malaysian bank (up to half withdrawable after approval) plus a compulsory home of at least RM600k that cannot be sold for 10 years, or more if Kedah\'s foreign-buyer floor is higher (unverified); a renewable 5-year pass, no minimum stay from age 50.',
    tax: 'No wealth tax; foreign-sourced income received in Malaysia by resident individuals (182+ days) is exempt, subject to conditions, through 31 Dec 2036, so US dividends, interest and loan draws are untaxed locally; the island\'s duty-free status (since 1987) covers goods, not income tax.',
    estate:
      'No inheritance, estate or gift tax, so US assets pass to US-resident children with no Malaysian tax; there is no US estate treaty, but nothing to double-tax, and US estate tax applies only above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Malaysia residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Malaysia in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Tropical monsoon: hot and humid all year with more than 2,400 mm of rain; December–February is dry and September the wettest month.',
    community:
      'A small expat retiree community on an island of about 65,000 people (no headcount found); English is widely used in Malaysia, but services are thinner than in Penang or Kuala Lumpur.',
    access:
      'No US nonstops: Langkawi airport flies to Kuala Lumpur, Penang, Johor Bahru, Singapore, Dubai and Bengaluru, so the US means two or more connections; no ferry to Penang is listed.',
  },
  drawbacks: [
    'No private hospital on the island; private care is a flight away in Penang',
    'MM2H\'s USD 150k deposit and a home that cannot be sold for 10 years',
    'A small expat community and long trips to the US',
  ],
  sources: [
    S.mm2h,
    {
      name: 'Asia Lifestyle Magazine: MM2H 2026 requirements, tiers and deposits',
      url: 'https://www.asialifestylemagazine.com/mm2h-2026-requirements-tiers-deposits-how-to-apply/',
      edition: '2026',
    },
    { name: 'PwC: Malaysia, income determination', url: 'https://taxsummaries.pwc.com/malaysia/individual/income-determination' },
    { name: 'PwC: Malaysia, other taxes', url: 'https://taxsummaries.pwc.com/malaysia/individual/other-taxes' },
    S.myTax,
    { name: 'Penang Travel Tips: Hospital Langkawi (Sultanah Maliha)', url: 'https://www.penang-traveltips.com/malaysia/kedah/langkawi/hospital-langkawi.htm' },
    { name: 'Kosmo: Langkawi still without a private hospital', url: 'https://www.kosmo.com.my/?p=586379', edition: '2024' },
    {
      name: 'RinggitPlus: private hospitals ask MOF to delay 6% SST on foreign patients',
      url: 'https://ringgitplus.com/en/blog/personal-finance-news/private-hospitals-ask-mof-to-delay-6-sst-on-foreign-patients.html',
    },
    { name: 'Wikipedia: Langkawi', url: 'https://en.wikipedia.org/wiki/Langkawi' },
    { name: 'Wikipedia: Langkawi International Airport', url: 'https://en.wikipedia.org/wiki/Langkawi_International_Airport' },
    { name: 'Travel Advisory: Malaysia (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/malaysia' },
    { name: 'GOV.UK: Malaysia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/malaysia/safety-and-security' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.timeoutGpi,
  ],
}

export default profile
