import type { SimulationResult } from '../engine/types'

/** Engine stats may carry inflation-adjusted figures (additive fields); fall back to nominal. */
type Stats = SimulationResult['stats'] & { expReturnReal?: number; cagrMedianReal?: number }

export function returnStats(stats: SimulationResult['stats']) {
  const s = stats as Stats
  const real = s.expReturnReal != null && s.cagrMedianReal != null
  return {
    real,
    expReturn: real ? s.expReturnReal! : s.expReturn,
    cagrMedian: real ? s.cagrMedianReal! : s.cagrMedian,
    expReturnNominal: s.expReturn,
    cagrMedianNominal: s.cagrMedian,
  }
}
