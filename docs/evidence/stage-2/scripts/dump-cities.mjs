import { createServer } from '/home/jonah/repos/eVelo-v2/node_modules/vite/dist/node/index.js'
import fs from 'node:fs'
const s = await createServer({ root: '/home/jonah/repos/eVelo-v2', server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const m = await s.ssrLoadModule('/src/data/cities.ts')
fs.writeFileSync(process.argv[2], JSON.stringify(m.CITIES.map(c => ({ id: c.id, name: c.name, country: c.country, region: c.region, currency: c.currency, countryCode: c.countryCode }))))
await s.close()
