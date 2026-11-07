# Stage 6 evidence: Atlas tax lines and verification (2026-11-06)

## Check 1: tax lines in "Your plan here"
Playwright at a $5M portfolio ([playwright-output.txt](playwright-output.txt)):
- Nice (taxed, inheritance): plan holds 87%; inheritance tax at 85 $9.2M median; wealth tax none on a portfolio; estate $13M (−$8.8M vs St. Louis) — [profile-nice-phone-dark.png](profile-nice-phone-dark.png)
- Valencia (taxed, wealth; Tarragona has no profile, so the Spanish wealth-tax case uses Valencia): plan holds 64%; wealth tax over the plan $4.5M; inheritance none for US-resident heirs; estate $14M — [profile-valencia-desktop-light.png](profile-valencia-desktop-light.png). Tarragona is covered by its list row and the Compare sheet's Local taxes row (engine: $4.77M median wealth tax).
- Paphos (none): one muted line, no wealth or inheritance tax for Cyprus — profile-paphos-*.png
- Zurich (no data): Atlas row hint "tax not modelled" and Compare row "Not modelled · Switzerland not researched" — row-zurich-*.png, compare-*.png
- No move within the plan: "You don't move within the plan, so no local tax applies" — profile-valencia-no-move-desktop-light.png

## Check 2: phone and desktop, light and dark
```
desktop-light atlas: scrollWidth 1400 <= 1400 OK theme=light
desktop-light profile Nice: scrollWidth 1400 <= 1400 OK theme=light
desktop-light profile Paphos: scrollWidth 1400 <= 1400 OK theme=light
desktop-light profile Valencia: scrollWidth 1400 <= 1400 OK theme=light
desktop-light compare: scrollWidth 1400 <= 1400 OK theme=light
desktop-dark atlas: scrollWidth 1400 <= 1400 OK theme=dark
desktop-dark profile Nice: scrollWidth 1400 <= 1400 OK theme=dark
desktop-dark profile Paphos: scrollWidth 1400 <= 1400 OK theme=dark
desktop-dark profile Valencia: scrollWidth 1400 <= 1400 OK theme=dark
desktop-dark compare: scrollWidth 1400 <= 1400 OK theme=dark
phone-light atlas: scrollWidth 390 <= 390 OK theme=light
phone-light profile Nice: scrollWidth 390 <= 390 OK theme=light
phone-light profile Paphos: scrollWidth 390 <= 390 OK theme=light
phone-light profile Valencia: scrollWidth 390 <= 390 OK theme=light
phone-light compare: scrollWidth 390 <= 390 OK theme=light
phone-dark atlas: scrollWidth 390 <= 390 OK theme=dark
phone-dark profile Nice: scrollWidth 390 <= 390 OK theme=dark
phone-dark profile Paphos: scrollWidth 390 <= 390 OK theme=dark
phone-dark profile Valencia: scrollWidth 390 <= 390 OK theme=dark
phone-dark compare: scrollWidth 390 <= 390 OK theme=dark
ERRORS []
ERRORS []
```

## Check 3: tests, typecheck, build, review
```
 Test Files  15 passed (15)
      Tests  159 passed (159)
typecheck: clean
dist/assets/index-CA_t8Bo3.js                                   507.47 kB │ gzip: 165.40 kB
✓ built in 676ms
found 0 vulnerabilities
```
Review: [review.md](review.md).
