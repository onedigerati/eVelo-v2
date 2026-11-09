# Stage 2 · Card editing and tip — evidence
Verified 2026-11-08 by a fresh agent on 8c8486c (build + Playwright, St. Louis → Bangkok); four defects it found were fixed and re-checked by another fresh agent on the fix tree (committed with this report).

| Check | Result | Evidence |
|---|---|---|
| Tapping a row's amount lets you type dollars; Enter sets it, Esc cancels; the %, bar, card total, delta chip and odds update, and the card total equals the Outlook's destination spend (proof: run the product, a test can't judge the live card) | pass | [run-log.txt](run-log.txt) CHECK 1: "$18k" → $18K −31%, odds 80%→82%; "18,000" → card = Outlook ($92,193); Esc reverts, focus returns. [02-housing-18k.png](02-housing-18k.png), [03-outlook-cost-card-fixed.png](03-outlook-cost-card-fixed.png); re-check after fixes: card $76,328 = Outlook, [recheck-now-housing-18k.png](recheck-now-housing-18k.png) |
| Setting % on a row that has a fixed amount replaces it, and vice versa; × and "Reset all" clear both kinds for this city (proof: test for the override logic; run the product) | pass | `spendOverrides.test.ts` in [tests.txt](tests.txt); [05-mixed-overrides.png](05-mixed-overrides.png), [06-after-reset-all.png](06-after-reset-all.png) (a planted Chiang Mai amount survives Reset all), [recheck-now-reset-all.png](recheck-now-reset-all.png) |
| A fixed row keeps its dollars when the home budget or the premium slider moves; a percentage row follows; a $0 home row shows dollars only (proof: run the product, screenshots before/after) | pass | [07-before-budget-change.png](07-before-budget-change.png) → [08-after-budget-200k.png](08-after-budget-200k.png) → [09-after-premium-up.png](09-after-premium-up.png); [10-zero-home-travel.png](10-zero-home-travel.png) |
| The ⓘ tip says what the % compares against (your home city's spending), that you can set the % or the $, that a typed $ stays fixed, and how to undo (proof: run the product, screenshot) | pass | [12-tip-light.png](12-tip-light.png), [14-desktop-dark-tip.png](14-desktop-dark-tip.png), [15-phone-375-light-tip.png](15-phone-375-light-tip.png), [16-phone-375-dark-tip.png](16-phone-375-dark-tip.png) |
| Keyboard and screen reader can reach and edit both fields, labelled per category; it looks right in light, dark and at phone width (proof: run the product, screenshots + accessibility tree) | pass | Tab walk in [run-log.txt](run-log.txt), [a11y-tree.txt](a11y-tree.txt), [recheck-4-keyboard.png](recheck-4-keyboard.png); 375px scrollWidth 375 idle/editing/tip open: `15-*`, `16-*`, `recheck-phone-375-*` |

Stage 1 re-run: all its checks are tests, green in [tests.txt](tests.txt).

Project checks: tests 547/547 on 8c8486c, 555/555 after fixes · typecheck clean ([typecheck.txt](typecheck.txt)) · build ok, chunk-size warning only ([build.txt](build.txt)) · `npm audit --omit=dev` 0 vulnerabilities ([audit.txt](audit.txt)) · lint: none configured · no console errors.

## Defects found and fixed
1. "1b" accepted (capped at $1B), "+18,181,718%" overflowed into the × ([04-junk-1b.png](04-junk-1b.png)) → typed $ capped at $10M/yr, % label shows ">+999%": [recheck-1-1b-rejected.png](recheck-1-1b-rejected.png), [recheck-1-10m-card.png](recheck-1-10m-card.png), [recheck-1-10m-outlook.png](recheck-1-10m-outlook.png).
2. Rejected input ("abc", "-5", "1e12") reverted silently → field stays open with aria-invalid, outline and a role=alert hint: [recheck-2-abc-invalid.png](recheck-2-abc-invalid.png), [recheck-2-12abc-invalid.png](recheck-2-12abc-invalid.png).
3. Outlook cost card put a $0-home row's amount under the % column ([11-outlook-cost-card-zero-home.png](11-outlook-cost-card-zero-home.png)) → $ column, empty %: [recheck-3-outlook-travel-zero-home.png](recheck-3-outlook-travel-zero-home.png).
4. Tab out of an edit skipped the row's × → $ → % → × → next row: [recheck-4-keyboard.png](recheck-4-keyboard.png).

## Deferred
- A $0 home category with no fixed amount reads "$0 ±0%" in the Outlook cost card while the plan card shows no % (cosmetic).
- The Outlook cost card's "→" overlaps the home number at a $174,500 home total (pre-existing).
