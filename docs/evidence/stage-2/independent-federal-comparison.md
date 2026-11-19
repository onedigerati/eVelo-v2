$ OUT=table.md npx vitest run --config vitest.config.ts cmp.test.ts   (scratchpad; independent calculator in independent-calculator.ts.txt, harness in independent-compare.test.ts.txt) -> 1 passed

| Case | Income | Indep federal | incomeTax federal | Indep NIIT | Code NIIT | Indep taxable SS | Code taxable SS | max abs diff |
|---|---|---|---|---|---|---|---|---|
| single: QD crosses 0->15 (65+: 0, priceLevel 1) | {"other":30000,"qd":40000} | 2087.50 | 2087.50 | 0.00 | 0.00 | 0.00 | 0.00 | 0.0e+0 |
| mfj: QD crosses 0->15, NIIT off (65+: 0, priceLevel 1) | {"int":60000,"qd":90000} | 5675.00 | 5675.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.0e+0 |
| mfj: QD crosses 15->20, NIIT on (65+: 0, priceLevel 1) | {"int":300000,"qd":400000} | 129273.00 | 129273.00 | 17100.00 | 17100.00 | 0.00 | 0.00 | 0.0e+0 |
| single: LTCG crosses 15->20, NIIT on (65+: 0, priceLevel 1) | {"int":100000,"ltcg":500000,"tsy":20000} | 111450.00 | 111450.00 | 15960.00 | 15960.00 | 0.00 | 0.00 | 0.0e+0 |
| single: NIIT off (MAGI 150k) (65+: 0, priceLevel 1) | {"int":100000,"qd":50000} | 20670.00 | 20670.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.0e+0 |
| single: NIIT on, capped by MAGI excess (65+: 0, priceLevel 1) | {"int":150000,"ltcg":100000} | 41634.00 | 41634.00 | 1900.00 | 1900.00 | 0.00 | 0.00 | 0.0e+0 |
| mfj: SS at 50% with muni (65+: 2, priceLevel 1) | {"ss":30000,"muni":10000,"other":8000} | 0.00 | 0.00 | 0.00 | 0.00 | 500.00 | 500.00 | 0.0e+0 |
| single: SS at 85% cap with muni (65+: 1, priceLevel 1) | {"ss":40000,"muni":30000,"int":20000} | 3334.00 | 3334.00 | 0.00 | 0.00 | 34000.00 | 34000.00 | 0.0e+0 |
| single: SS mid-85% with muni (65+: 1, priceLevel 1) | {"ss":30000,"muni":15000,"int":10000} | 0.00 | 0.00 | 0.00 | 0.00 | 9600.00 | 9600.00 | 0.0e+0 |
| single: 65+, senior deduction partly phased out (65+: 1, priceLevel 1) | {"other":80000} | 7065.00 | 7065.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.0e+0 |
| mfj: priceLevel 1.5, NIIT+SS+65+ (65+: 2, priceLevel 1.5) | {"int":150000,"qd":100000,"ss":50000,"muni":20000} | 43745.67 | 43745.67 | 4781.67 | 4781.67 | 42500.00 | 42500.00 | 0.0e+0 |
| single: priceLevel 1.5, NIIT near threshold (65+: 0, priceLevel 1.5) | {"int":90000,"qd":60000} | 20603.33 | 20603.33 | 633.33 | 633.33 | 0.00 | 0.00 | 0.0e+0 |

Worst absolute difference: 0.00e+0 USD
