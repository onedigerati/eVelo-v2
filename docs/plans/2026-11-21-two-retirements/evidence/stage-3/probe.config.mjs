export default { root: process.env.PROBE_ROOT, test: { environment: 'node', include: ['docs/evidence/stage-3/*.probe.ts'], testTimeout: 600000 } }
