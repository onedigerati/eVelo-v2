# Stage 8 · re-run of earlier stages' source re-reads

The plan's last stage re-runs every earlier hand-proven check. These rows are stage 1–7's source re-reads (each stage's `source-reread.md`), re-read on 2026-11-15 in the main session with WebFetch, each against what that stage's re-read recorded. **73 of 73 still match.**

Notes on four reads:
- **Transient failures:** hisenda.gva.es (stage 2) failed DNS once, and dpbh.nv.gov (stage 7) failed once. Both loaded on retry and match.
- **Narrow re-asks:** two first answers came back "no" because the prompt bundled several conditions. A narrow re-ask settled each, and both match the earlier record:
  - Uruguay (stage 5): the base is wealth "located In Uruguay".
  - Paraguay (stage 5): adults have no means requirement.
- **Bulgaria (stage 3):** the 620.20 minimum-wage benchmark sits under Art. 24(2) alongside the minimum pension, as before.
- **Texas (stage 7):** one summary listed 4 Dallas Level I facilities. A direct read of the table shows all 5, Texas Health Presbyterian Hospital Dallas among them.
- **Illinois (stage 7):** the attorney general's PDF text was recovered with Python's zlib again: "$4,000,000" and the "$285,714" example.

| Stage | Claim | Source | Still matches |
|---|---|---|---|
| 1 | pt-visa-d7-income-minimum | https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/means-of-subsistence | yes |
| 1 | pt-tax-dividends-interest-28 | https://taxsummaries.pwc.com/portugal/individual/income-determination | yes |
| 1 | pt-tax-no-wealth-tax, pt-estate-stamp-duty-10 | https://taxsummaries.pwc.com/portugal/individual/other-taxes | yes |
| 1 | pt-estate-no-us-treaty | https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international | yes |
| 1 | pt-estate-us-exemption-2026 | https://www.irs.gov/businesses/small-businesses-self-employed/whats-new-estate-and-gift-tax | yes |
| 1 | pt-lending-priips-new-buys, pt-lending-priips-holdings-kept | https://www.lynxbroker.com/service/products-and-regulations/regulations/key-information-document/ | yes |
| 1 | pt-healthcare-algarve-private-groups, pt-healthcare-madeira-private | https://www.grupohpa.com/en/blog/hpa-group-is-now-cuf/ | yes |
| 1 | pt-healthcare-private-plans-close-65 | https://www.doutorfinancas.pt/seguros/ate-que-idade-se-pode-fazer-um-seguro-de-saude/ | yes |
| 2 | es-tax-valencia-exemption-2m | https://hisenda.gva.es/es/web/tributos/beneficis-fiscals | yes |
| 2 | fr-tax-ifi-threshold, fr-tax-no-wealth-tax-on-portfolio | https://www.service-public.gouv.fr/particuliers/vosdroits/F138 | yes |
| 2 | it-estate-rate-allowance | https://www.agenziaentrate.gov.it/portale/schede/pagamenti/imposta-di-successione/aliquote-e-franchigie | yes |
| 2 | ie-tax-remittance-basis | https://taxsummaries.pwc.com/ireland/individual/income-determination | yes |
| 2 | uk-estate-long-term-resident | https://www.gov.uk/guidance/inheritance-tax-if-youre-a-long-term-uk-resident | yes |
| 2 | nl-healthcare-premium | https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/vraag-en-antwoord/premie-zorgverzekering | yes |
| 2 | de-visa-section-7 | https://www.gesetze-im-internet.de/aufenthg_2004/__7.html | yes |
| 2 | ch-healthcare-kvg-three-months | https://www.bag.admin.ch/de/krankenversicherung-versicherungspflicht-fuer-in-der-schweiz-wohnhafte-versicherte | yes |
| 2 | at-visa-income-2026, at-visa-permit-no-work | https://www.oesterreich.gv.at/de/themen/menschen_aus_anderen_staaten/aufenthalt/3/2/Seite.120302 | yes |
| 2 | mt-visa-grp-thresholds | https://gvzh.mt/services/practice-areas/citizenship-residence/global-residence-programme/ | yes |
| 2 | at-lending-schwab-unavailable, ch-lending-schwab-cash-out-outside-eu and the shared Schwab claims | https://yourtaxbase.com/blog/charles-schwab-for-expats | yes |
| 3 | gr-tax-dividends-5 | https://taxsummaries.pwc.com/greece/individual/income-determination | yes |
| 3 | cy-estate-no-inheritance-tax | https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates | yes |
| 3 | tr-lending-priips-not-applicable | https://www.lynxbroker.com/service/products-and-regulations/regulations/key-information-document/ | yes |
| 3 | ge-visa-365-days | https://madloba.info/en/faq/visa-and-border/how-long-can-you-stay-visa-free/ | yes |
| 3 | hr-healthcare-kbc-split | https://www.kbsplit.hr/en/about-us/locations | yes |
| 3 | me-tax-no-wealth-tax | https://taxsummaries.pwc.com/quick-charts/net-wealth-worth-tax-rates | yes |
| 3 | al-estate-heirs-exempt | https://taxsummaries.pwc.com/albania/individual/other-taxes | yes |
| 3 | bg-visa-means-minimum-wage | https://innovires.com/en/blog/viza-d-bulgaria.html | yes |
| 3 | hu-visa-guest-investor-terms | https://oif.gov.hu/factsheets/residence-permit-for-guest-investor | yes |
| 3 | cz-healthcare-comprehensive-insurance | https://www.grantthornton.cz/en/news/the-end-of-the-monopoly-of-pvzp-and-other-changes-in-the-health-insurance-of-foreigners/ | yes |
| 3 | ae-tax-no-income-wealth-cgt | https://taxsummaries.pwc.com/united-arab-emirates/individual/other-taxes | yes |
| 3 | za-estate-duty-rates | https://www.sars.gov.za/types-of-tax/estate-duty/ | yes |
| 3 | mu-lending-fidelity-vanguard | https://yourtaxbase.com/blog/best-brokerage-for-us-expats | yes |
| 4 | mx-tax-no-wealth-tax | https://taxsummaries.pwc.com/mexico/individual/other-taxes | yes |
| 4 | mx-visa-solvency-savings | https://mexperience.com/financial-criteria-for-residency-in-mexico/ | yes |
| 4 | gt-lending-schwab (corrected) | https://yourtaxbase.com/blog/charles-schwab-for-expats | yes |
| 4 | gt-tax-iusi (corrected) | https://agn.gt/presidente-arevalo-sanciona-ley-de-reformas-al-iusi/ | yes |
| 4 | hn-healthcare-replacement (corrected) | https://www.laprensa.hn/teinteresa/avances-en-modernizacion-de-hospitales-atencion-primaria-DP28639318 | yes |
| 4 | bz-visa-qrp-age | https://www.belizetourismboard.org/programs-events/retirement-program/ | yes |
| 4 | pa-visa-qualified-investor-pc (corrected) | https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa | yes |
| 4 | pa-estate-none | https://taxsummaries.pwc.com/panama/individual/other-taxes | yes |
| 4 | cr-estate-none | https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates | yes |
| 4 | do-healthcare-facilities | https://playamax.com/?p=6331 | yes |
| 5 | co-visa-rentista-income | https://cancilleria.gov.co/atencion-y-servicio-al-ciudadano/tramites-y-servicios/visa/tipos-de-visa | yes |
| 5 | ca-estate-none | https://taxsummaries.pwc.com/canada/individual/other-taxes | yes |
| 5 | ec-visa-rentista | https://www.gob.ec/mremh/tramites/concesion-visa-residencia-temporal-rentista | yes |
| 5 | pe-health-essalud (corrected) | https://elpopular.pe/actualidad/2026/09/19/ya-no-podras-afiliarte-a-essalud-atencion-suspenden-nuevas-afiliaciones-al-salud-hasta-2027-revisa-hasta-cuando-1013099 | yes |
| 5 | cl-lending-schwab (corrected) | https://yourtaxbase.com/blog/charles-schwab-for-expats | yes |
| 5 | ar-tax-residence-13th-month | https://taxsummaries.pwc.com/argentina/individual/residence | yes |
| 5 | uy-tax-wealth-local | https://taxsummaries.pwc.com/uruguay/individual/other-taxes | yes |
| 5 | py-visa-temporary | https://www.migraciones.gov.py/index.php/tramites/residencia-temporal | yes |
| 6 | th-visa-oa-insurance (corrected) | https://oslo.thaiembassy.org/en/page/non-immigrant-o-a-long-stay | yes |
| 6 | my-tax-no-wealth | https://taxsummaries.pwc.com/malaysia/individual/other-taxes | yes |
| 6 | vn-tax-worldwide | https://taxsummaries.pwc.com/vietnam/individual/taxes-on-personal-income | yes |
| 6 | id-visa-e33 (corrected) | https://www.imigrasi.go.id/wna/daftar-visa-indonesia/E33 | yes |
| 6 | ph-visa-srrv-deposits | https://hansgoldstein.com/moving-abroad/philippines-srrv-pension-requirement/ | yes |
| 6 | jp-estate-rates | https://taxsummaries.pwc.com/japan/individual/other-taxes | yes |
| 6 | au-tax-cgt-discount-2027 (corrected) | https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-australia-legislation-amending-capital-gains-tax-and-introduce-new-tax-reform-measures-passes-parliament-with-amendments.html | yes |
| 6 | tw-health-nhi-rate (corrected) | https://www.taipeitimes.com/News/taiwan/archives/2025/11/20/2003847537 | yes |
| 6 | kr-estate-rates | https://pbl.legal/insights/international-estate-planning-a-guide-to-korean-inheritance-law/ | yes |
| 6 | sg-lending-schwab-accredited | https://themoneybees.co/blog/td-ameritrade | yes |
| 6 | nz-health-insurer-ages (corrected) | https://cignaglobal.com/international-health-plans | yes |
| 7 | us-tax-co-amendment-87-status (corrected) | hppr.org, 9 Nov 2026 | yes |
| 7 | us-estate-wa-exemption (confirmed) | dor.wa.gov estate tax tables | yes |
| 7 | us-tax-or-arts-tax (corrected) | portland.gov/revenue/arts-tax | yes |
| 7 | us-health-lv-two-level1 (corrected) | dpbh.nv.gov NV Trauma, updated 15 Oct 2026 | yes |
| 7 | us-tax-la-measure-ula (corrected) | hansonbridgett.com, July 2026 | yes |
| 7 | us-estate-mn-reach (corrected) | revisor.mn.gov §291.005 | yes |
| 7 | us-health-dal-parkland (corrected) | dshs.texas.gov trauma facilities, current as of 28 Oct 2026 | yes |
| 7 | us-health-avl-immediate-jeopardy (corrected) | wlos.com, 5 Aug 2026 | yes |
| 7 | us-estate-il-exclusion-4m (confirmed) | Illinois AG estate tax fact sheet (PDF, text recovered with Python's zlib) | yes |
| 7 | us-tax-fl-amendment-3-result (corrected) | nbcmiami.com, 3–4 Nov 2026 | yes |
| 7 | us-estate-pa-inheritance-rates (confirmed) | pa.gov inheritance tax | yes |
| 7 | us-tax-az-ltcg-subtraction (corrected) | azleg.gov ARS 43-1022 | yes |
