# Content review · Bogotá, Buenos Aires (2026-11-07)
Independent reviewer, against `src/data/profiles/README.md` and current sources. No score changes.

**Bogotá**
- Investor visa threshold wrong: ~$145k → 350× the 2026 minimum wage (COP 1,750,905) ≈ COP 613M ≈ $190k. https://colombiamove.com/blog/colombia-real-estate-investor-visa-m10-2026/ (replaced an outdated source; added https://colombiamove.com/blog/es/colombia-pensionado-visa-income-requirements-2026/). Both M visas lead to residency after 5 years.
- Rentista ≈ $5,440 → ≈ $5,400 at `fx.json`'s rate; confirmed a visitor visa.
- Wealth tax: 72,000 UVT confirmed (Sentencia C-079/2026, 15 Apr 2026, struck down Decreto 1474's 40,000 UVT); Decreto 173/2026 taxes companies only; an Oct 2026 bill (95,500 UVT, tax ending after 2030) noted as pending. https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_11166_2026.htm
- Hospitals: "about 10 of the top 25" → "about nine".
- Cost 5 consistent: every profile with a cost index ≤ 32 scores 5; Bogotá is 30.

**Buenos Aires**
- Flights: Aerolíneas no longer flies to JFK → "American, and Delta seasonally".
- Currency controls: "moved freely" overstated. The 90-day MEP/CCL bar returned Sept 2025 (A 8336) and since Apr 2026 (A 8417) also applies after sending dollars abroad (Bloomberg Línea). Summary now "most currency controls".
- Tax: added the flat 15% on gains from foreign shares and ETFs (secondary source, 2019); the 35% band given as ARS 53M (2025).
- Confirmed: rentista 5× minimum wage (Disposición 1732/2023; ARS 398,800 Nov 2026); Bienes Personales threshold, rates and gross base; REIBP closed to newcomers; no inheritance tax in CABA.

**Left alone**: Colombia estate 2 (matches Medellín); Newsweek 2023 edition; safety advisories via traveladvisory.io (travel.state.gov returned 403).
**Photos**: captions, alt text and credits match Commons; no "Originally uploaded".
typecheck clean; `vitest src/data`: failures only from US cities in progress.
