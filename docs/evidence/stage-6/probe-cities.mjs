import { runnerImport } from 'vite'
const R='/home/jonah/src/repos/eVelo-v2/'
const { CITIES } = (await runnerImport(R+'src/data/cities.ts')).module
const { localTaxWords } = (await runnerImport(R+'src/ui/income/compare.ts')).module
for (const c of CITIES) { const w = localTaxWords(c); if (w) console.log(c.id, c.name, '|', w) }
console.log(CITIES.filter(c=>['chicago','austin','denver','seattle','barcelona','lisbon'].includes(c.id)).map(c=>c.id))
