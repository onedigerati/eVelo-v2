import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Island lifestyle and easy visas, but worldwide tax on dividends',
  summary:
    'Bali is 22nd in International Living\'s 2026 index and Indonesia was 8th in Expat Insider 2025, with a large international community and no wealth, inheritance or gift tax. For BBD it ranks near the bottom: residents are taxed on worldwide income at up to 35%, US dividends included whether or not they are brought in, and the foreign-income exemption is for experts, not retirees. Healthcare is limited, and the retirement KITAS is for ages 55 and over.',
  scores: { cost: 4, healthcare: 2, safety: 3, visa: 3, climate: 3, community: 4, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals (BIMC, Siloam) handle routine and emergency care with English-speaking staff, but complex cases are usually evacuated to Jakarta or Singapore, so evacuation cover is essential; international cover runs about USD 2,500–6,000 a year at 55–70, and optional public BPJS cover about USD 12 a month.',
    safety:
      'Indonesia is 69th in the 2026 Global Peace Index; UK advice reports frequent bag-snatching, card fraud, drink spiking and deaths from methanol-tainted drinks in Bali, a sharp rise in scooter accidents, and earthquake, tsunami and volcano risk.',
    visa: 'Second Home Visa (E33): about USD 130,000 (IDR 2bn) on deposit at a state-owned bank, or a USD 1m apartment, for 5 or 10 years with no age limit; Silver Hair (E33E): 5 years on a USD 50,000 deposit; the retirement KITAS (E33F) is for ages 55+ (some listings say 60), renewed yearly, needs a sponsor and a hired Indonesian household worker, and sources disagree on its income bar (USD 1,500 or 3,000/month).',
    tax: 'No wealth tax, but residents (183+ days, or a KITAS read as intent to reside) are taxed on worldwide income at 5–35%, and foreign dividends are ordinary income taxed yearly whether or not they are remitted; the 4-year foreign-income exemption is only for foreigners with certain expertise, with no retiree category; a US–Indonesia income tax treaty applies (get local advice).',
    estate:
      'No inheritance, estate or gift tax, so US assets pass to US-resident children with no Indonesian tax; there is no US estate treaty, but nothing to double-tax, and US estate tax applies only above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Indonesia residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Indonesia in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Tropical: hot and humid all year, with a rainy season (roughly October–March) that brings local flooding; Ubud\'s hills are a little cooler.',
    community: 'A very large international community, skewed to younger digital nomads in Canggu; retirees tend to prefer Sanur and Ubud.',
    access: 'No US nonstops: connect via Singapore, Doha, Dubai, Tokyo, Seoul, Taipei or Hong Kong, typically 24+ hours; the airport closes for the Nyepi day of silence each March.',
  },
  drawbacks: [
    'US dividends taxed at up to 35% every year, with no retiree exemption',
    'Serious medical care usually means evacuation to Jakarta or Singapore',
    'Visa rules shift often and the retirement KITAS needs a paid sponsor; traffic and overtourism in the south',
  ],
  sources: [
    { name: 'PwC: Indonesia, taxes on personal income', url: 'https://taxsummaries.pwc.com/indonesia/individual/taxes-on-personal-income' },
    { name: 'PwC: Indonesia, income determination', url: 'https://taxsummaries.pwc.com/indonesia/individual/income-determination' },
    { name: 'PwC: Indonesia, other taxes', url: 'https://taxsummaries.pwc.com/indonesia/individual/other-taxes' },
    { name: 'DJP (Indonesian tax office): tax returns for foreign citizens', url: 'https://pajak.go.id/en/artikel/tax-return-reporting-foreign-citizens-indonesia' },
    { name: 'Liberty Mundo: Retire in Indonesia, the E33F visa and residency guide (2026)', url: 'https://www.libertymundo.com/retire-in-indonesia/' },
    { name: 'Emerhub: Indonesia retirement visa', url: 'https://emerhub.com/indonesia/visas/retirement-visa/' },
    { name: 'BIMC Hospital Bali: Emergency medical evacuation program', url: 'https://bimcbali.com/medical-evacuation-program' },
    { name: 'GOV.UK: Indonesia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/indonesia/safety-and-security' },
    { ...S.timeoutGpi, name: 'Time Out: Indonesia 69th in the Global Peace Index 2026' },
    { name: 'Wikipedia: I Gusti Ngurah Rai International Airport', url: 'https://en.wikipedia.org/wiki/I_Gusti_Ngurah_Rai_International_Airport' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.il,
  ],
}

export default profile
