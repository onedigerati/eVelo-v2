import { describe, expect, it } from 'vitest'
import { stepScrollTarget } from '../stepScroll'

const base = { viewport: 900, maxScroll: 5000, margin: 12 }

describe('step press scroll', () => {
  it("doesn't move when the chart and the step are already on screen", () => {
    const r = stepScrollTarget({ ...base, scrollY: 300, chart: { top: 400, bottom: 800 }, step: { top: 1000, bottom: 1150 } })
    expect(r).toEqual({ top: 300, stepVisible: true })
  })

  it('stacked layout: scrolls the least that shows both, keeping the step on screen (no bounce)', () => {
    // 1000×900: chart well above, step below the fold.
    const chart = { top: 700, bottom: 1150 }
    const step = { top: 1400, bottom: 1540 }
    const r = stepScrollTarget({ ...base, scrollY: 1300, chart, step })
    expect(r.top).toBe(chart.top - 12) // chart top at the viewport's head …
    expect(step.bottom).toBeLessThanOrEqual(r.top + 900 - 12) // … and the step still fully on screen
    expect(r.stepVisible).toBe(true)
    // Pressing again from there doesn't move.
    expect(stepScrollTarget({ ...base, scrollY: r.top, chart, step }).top).toBe(r.top)
    // From above, it scrolls down only until the step's bottom shows.
    expect(stepScrollTarget({ ...base, scrollY: 0, chart, step }).top).toBe(step.bottom + 12 - 900)
  })

  it('gives the same answer wherever an in-flight scroll happens to be', () => {
    const chart = { top: 700, bottom: 1150 }
    const step = { top: 1400, bottom: 1540 }
    const targets = [900, 1000, 1100, 1300, 1600].map((y) => stepScrollTarget({ ...base, scrollY: y, chart, step }).top)
    for (const t of targets) {
      expect(t).toBeLessThanOrEqual(chart.top - 12)
      expect(t).toBeGreaterThanOrEqual(step.bottom + 12 - 900)
    }
  })

  it("short desktop (1000×900): when both can't fit, keeps the step fully on screen with at least half the chart", () => {
    // Measured at 1000×900: chart 477 tall, the step's bottom 1110 below the chart's top.
    const chart = { top: 220, bottom: 697 }
    const step = { top: 1124, bottom: 1322 }
    for (const scrollY of [0, 208, 434, 600, 900]) {
      const r = stepScrollTarget({ ...base, scrollY, chart, step })
      expect(r.stepVisible).toBe(true)
      expect(step.top).toBeGreaterThanOrEqual(r.top + 12)
      expect(step.bottom).toBeLessThanOrEqual(r.top + 900 - 12)
      const shown = Math.min(chart.bottom, r.top + 900) - Math.max(chart.top, r.top + 12)
      expect(shown / (chart.bottom - chart.top)).toBeGreaterThanOrEqual(0.5 - 1e-9)
    }
    // From below it stops as soon as half the chart shows; from above, as soon as the step does.
    const first = stepScrollTarget({ ...base, scrollY: 900, chart, step }).top
    expect(first).toBe(Math.floor(chart.top + (chart.bottom - chart.top) / 2 - 12))
    expect(stepScrollTarget({ ...base, scrollY: 0, chart, step }).top).toBe(step.bottom + 12 - 900)
    // Pressing again doesn't move (no bounce).
    expect(stepScrollTarget({ ...base, scrollY: first, chart, step }).top).toBe(first)
  })

  it("phone: when chart and step can't both fit, brings the whole chart in and says the step is off screen", () => {
    const chart = { top: 330, bottom: 710 }
    const step = { top: 1700, bottom: 1850 }
    const r = stepScrollTarget({ ...base, viewport: 844, scrollY: 1500, chart, step })
    expect(r.top).toBe(chart.top - 12)
    expect(r.stepVisible).toBe(false)
  })

  it('keeps inside the page and shows the top of a chart taller than the screen', () => {
    expect(stepScrollTarget({ ...base, scrollY: 50, chart: { top: 5, bottom: 300 }, step: { top: 400, bottom: 500 } }).top).toBe(0)
    expect(stepScrollTarget({ ...base, viewport: 300, scrollY: 900, chart: { top: 400, bottom: 900 }, step: { top: 1000, bottom: 1100 } }).top).toBe(388)
  })
})
