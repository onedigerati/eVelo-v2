# Stage 1 · Photo pipeline — evidence
Verified 2026-11-07 on b3a67c3 plus uncommitted changes (scripts/photos*.mjs, scripts/photo-sheet.mjs, src/data/photos.ts, src/data/photos/, src/data/__tests__/photos.test.ts, package.json/lock, ProfileSheet.tsx import), by an agent that built nothing. Saved by the PM, because the verifier's harness refused report writes; the text is the verifier's.

| Check | Result | Evidence |
|---|---|---|
| `npm run photos` reads each city's photo list (Commons file titles plus captions), fetches author and licence from the Commons API, downloads each photo and writes a resized WebP under `src/data/photos/<cityId>/` (proof: run the command for lisbon twice; the second run downloads nothing) | pass | [photos-lisbon-twice.txt](photos-lisbon-twice.txt): with lisbon's 5 .webp deleted, run 1 fetched licences from Commons and wrote 5 WebPs ("downloaded 5, skipped 0"); run 2 printed "all 5 photos up to date, nothing downloaded". md5 of all 5 .webp and photos.json identical to before. Wrong city id exits 1 with a clear message: [photos-bad-city.txt](photos-bad-city.txt) |
| A photo whose licence isn't CC0, public domain, CC BY or CC BY-SA is refused with its file title, and nothing is written (proof: test) | pass | [tests-photos.txt](tests-photos.txt): `refuses a non-free licence with the file title and writes nothing` asserts the rejection names `File:Test photo 3.jpg`, the city folder still holds only photos.json, photos.json is byte-identical, and no image URL was fetched; plus `refuses "CC BY-NC 2.0"/"CC BY-ND 4.0"/"CC BY-NC-SA 4.0"/"Fair use"/"GFDL"/"" naming the file` and `refuses a missing licence` |
| Every city with photos has exactly 5, each with a file on disk, alt text, a one-line caption, author, licence name and URL, and an https Commons source URL, with no file used twice (proof: test) | pass | [tests-photos.txt](tests-photos.txt): `gives every city exactly 5 complete, credited photos under 200 kB`, `never uses a Commons file twice`, `has no stray image files` |
| The five pilot cities (lisbon, algarve, panama-city, boquete, kuala-lumpur) have their photos, and each is under 200 kB (proof: test + command) | pass | [photo-sizes.txt](photo-sizes.txt): 5 WebP per pilot city, 25 total, largest 199,614 bytes, 0 over 200,000; test `has the five pilot cities` |
| A contact sheet of the pilot photos with captions is saved to the evidence, and each photo was looked at and shows the place its caption names (proof: run the product: contact-sheet screenshot) | pass | [contact-sheet.html](contact-sheet.html) ([contact-sheet-run.txt](contact-sheet-run.txt)), [contact-sheet.png](contact-sheet.png) (full page, 25 images loaded, 0 broken, 0 console errors). All 25 viewed at full size; per-photo notes below |
| Photos ship through Vite as hashed files in `dist/assets`, so `scripts/artifact-page.mjs` picks them up for the preview with no change (proof: command: `npm run build` lists them) | pass | [build.txt](build.txt) lists 25 hashed .webp; `node scripts/artifact-page.mjs` → 53-file manifest, 25 of 25 .webp in dist/artifact-files.json |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · no lint script · tests 242/242 in 21 files, baseline 214 ([tests.txt](tests.txt); photo tests 28/28 in [tests-photos.txt](tests-photos.txt)) · build pass ([build.txt](build.txt); the >500 kB chunk warning is inherited — main `index-*.js` is 532.79 kB, the same as the landing-page stage)
Audit: `npm audit --omit=dev`: 0 vulnerabilities; full `npm audit` (incl. sharp 0.35.5, dev only): 0 ([audit.txt](audit.txt))

## Photo review (all 25 looked at)
Each shows what its caption says, in the place it names; no watermarks (corners checked at full size).

- **lisbon**: 1 Alfama rooftops down to the Tagus, ok · 2 Praça do Comércio from the river with the arch and castle hill, ok · 3 Tram 28 ("M. Moniz 28") on a cobbled old-town street, ok · 4 pastel de nata in a hand, ok (generic; caption doesn't claim Lisbon is visible) · 5 Praia da Rainha, Cascais, ok, captioned as Cascais per the decision
- **algarve**: 1 Praia da Marinha, ok · 2 Ponta da Piedade cliffs and lighthouse at sunset, ok · 3 Tavira's old bridge over the Gilão, ok · 4 green-tiled corner building in Lagos, ok but heavily warm/over-saturated, the weakest-looking photo; alt says "three-storey" but it is ground + three upper storeys · 5 Loulé market interior, ok
- **panama-city**: 1 skyline around the bay with marina, ok · 2 Casco Viejo balconied facades, ok · 3 UASC container ship in Miraflores Locks, ok (a light pole cuts down the middle) · 4 Calypso ferries at Isla Perico, Amador, ok · 5 Metropolitan Natural Park, ok but dull: overcast, the city a small strip on the horizon
- **boquete**: 1 aerial of the town in its valley, ok · 2 flower path beside the Caldera river, ok · 3 Finca Lérida coffee rows and building, ok · 4 cloud forest ridges, plausibly Barú's slopes (the peak itself isn't identifiable) · 5 grassy trail under pines with a cabin, ok but generic
- **kuala-lumpur**: 1 Petronas Towers at dusk, ok · 2 Perdana Botanical Gardens lake with towers, ok · 3 Batu Caves stairs and Murugan statue, ok (896 px, the smallest) · 4 Jalan Alor food stalls at night, ok · 5 Sultan Abdul Samad Building, ok

Credit lines:
- lisbon 1 author is "Dale Cruse - 10M views", the Flickr display name with a view-count boast; it should read "Dale Cruse".
- "Chainwit." (kuala-lumpur 3) and "Bernard Spragg. NZ" (kuala-lumpur 5) carry odd periods, but they match the authors' own Commons/Flickr names; acceptable.

## Notes that differ from the builder's claims
- The plan's width step-down decision gave pilot counts adding to 22; on disk: 16 landscape at 1280 wide + 1 portrait at 1280 tall, 5 at 1152, 2 at 1024, 1 at 896 = 25. (Plan corrected.)
- Everything else matches: 242 tests, 25 hashed assets, every manifest entry present, lisbon re-run idempotent and byte-identical.
- For stage 2: `src/data/photos.ts` globs every `photos.json` eagerly; at 75 cities that's ~375 entries of credit text in whichever chunk imports it. Keep it in the lazy profile chunk.

## Fix round (after verification) — re-checked by the PM
- lisbon 1 author now "Dale Cruse": `cleanAuthor` strips trailing view-count boasts generally (cases added to its test); stored value corrected; `npm run photos lisbon` re-run downloads nothing and keeps it.
- panama-city 5 replaced: "File:Plaza de la Catedral o de la independencia de Panama.JPG" (Isaías Montilla, CC BY-SA 3.0), Plaza de la Independencia and the cathedral tower in Casco Viejo — looked at, correct.
- algarve 4 replaced: "File:Silves - Castle of Silves - 20171020114455.jpg" (Joachim Schulz Emsland, CC BY-SA 4.0), Silves castle above the town, natural colour — looked at, correct.
- Re-run: [contact-sheet.html](contact-sheet.html) and [contact-sheet.png](contact-sheet.png) regenerated (25 photos, new ones shown); [tests.txt](tests.txt) 242/242 in 21 files (262/262 after the review fixes); [typecheck.txt](typecheck.txt) clean; [build.txt](build.txt) lists 25 .webp; [photo-sizes.txt](photo-sizes.txt) largest 199,614 bytes.

## Review (keel:review, security pass) — fix 3 · defer 6 · reject 5
No blockers. Verified against the live Commons API: all 25 stored licences match; only panama-city 2 sets a custom Attribution, and it matches.
Fixed in a second builder round: credit prefers Commons `Attribution` (licensor's requested credit), then Artist, then Credit; placeholder authors ("Own work", "Unknown author", …) refused; missing tests added. Also taken from the defer list because stages 3–5 add ~350 photos: IGO kept upper-case, duplicate check on normalised titles, originals under 1000 px refused, download URL must be https on upload.wikimedia.org, fetch timeouts, `cleanAuthor` no longer throws on bad entities and strips bidi/invisible characters.
Deferred to stage 2: `src/data/photos.ts` throws at module load if a listed .webp is missing, which would take down the whole Atlas; skip the city and log instead. Consider "resized" in the full-size credit (CC 4.0 "indicate if modified").
Rejected: path traversal (ids and filenames come from the developer, never from fetched data), unescaped width/height in the local contact sheet (validated integers), `PD-*` catch-all (Commons hosts only PD-in-US-and-origin files), multi-licence short names refused (fails safe), stored metadata not rechecked on re-run (intended).
