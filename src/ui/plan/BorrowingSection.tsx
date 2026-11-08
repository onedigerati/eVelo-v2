import { AnimatePresence, m as motion } from 'framer-motion'
import { useId, useState, type CSSProperties } from 'react'
import { useStore } from '../../state/store'
import { currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { InfoTip, NumberField, Section, SegmentedControl, Slider } from '../primitives'
import { existingLoanInfo } from './existingLoan'

const GAP = 0.05 // target must sit at least this far under the threshold
const CG_PRESETS = [0.15, 0.2, 0.238]

export function BorrowingSection() {
  const portfolio = useStore((s) => s.inputs.portfolio)
  const balance = useStore((s) => s.inputs.existingLoan)
  const basis = useStore((s) => s.inputs.basisFraction)
  const rate = useStore((s) => s.inputs.loanRate)
  const maxLtv = useStore((s) => s.inputs.maxLtv)
  const target = useStore((s) => s.inputs.targetLtvAfterCall)
  const cg = useStore((s) => s.inputs.capGainsRate)
  const drag = useStore((s) => s.inputs.dividendTaxDrag)
  const setInput = useStore((s) => s.setInput)
  const patch = useStore((s) => s.patchInputs)
  const uid = useId()
  const [cgCustom, setCgCustom] = useState(!CG_PRESETS.some((p) => Math.abs(p - cg) < 1e-6))
  const isPreset = !cgCustom && CG_PRESETS.some((p) => Math.abs(p - cg) < 1e-6)
  const targetMax = Math.round((maxLtv - GAP) * 100) / 100
  const loan = existingLoanInfo({ portfolio, balance, maxLtv, basisFraction: basis, capGainsRate: cg })

  return (
    <Section
      index="04"
      title="Borrowing"
      summary={`${balance > 0 ? `${currencyCompact(balance)} owed · ` : ''}${percent(rate, { digits: 1 })} loan · call at ${percent(maxLtv)} LTV · ${percent(cg, { digits: 1 })} gains tax`}
    >
      <div className="existing-loan">
        <NumberField
          label="Existing loan balance"
          kind="currency"
          aside={
            <InfoTip label="What is the existing loan?">
              What you already owe on your securities-backed line of credit. The plan starts with this loan (so today’s LTV is
              balance ÷ portfolio) and keeps borrowing from there; the sell-instead comparison starts with the portfolio minus
              this balance and no debt.
            </InfoTip>
          }
          value={balance}
          min={0}
          max={loan.maxBalance}
          step={10_000}
          onChange={(v) => setInput('existingLoan', v)}
          hint="Already borrowed on your line of credit; 0 if none."
        />
        {loan.status !== 'ok' && (
          <div className={`hrow__warn existing-loan__warn${loan.status === 'breaks' ? ' is-broken' : ''}`} role="status">
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2.5l6 11H2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6.5v3.25M8 11.6v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>
              {loan.status === 'breaks'
                ? 'The forced sale can’t cover this after tax: the plan fails at once.'
                : 'Above your margin-call LTV — the plan starts with a forced sale.'}
            </span>
          </div>
        )}
      </div>
      <LtvMeter now={loan.ltv} threshold={maxLtv} target={target} />
      <Slider
        label="Loan interest rate"
        value={rate}
        min={0.02}
        max={0.12}
        step={0.0025}
        format="percent1"
        ticks={[0.02, 0.05, 0.08, 0.12]}
        onChange={(v) => setInput('loanRate', v)}
        hint="Securities-backed line of credit. Interest is added to the loan, never paid in cash."
      />
      <Slider
        label="Margin-call threshold"
        tone="broken"
        aside={
          <InfoTip label="What is a margin call?">
            If the loan grows past this share of your portfolio, the lender forces a sale — usually at the worst moment. Avoiding
            that is what “holds” means.
          </InfoTip>
        }
        value={maxLtv}
        min={0.3}
        max={0.8}
        step={0.01}
        format="percent"
        ticks={[0.3, 0.5, 0.7, 0.8]}
        // Keep the post-sale target under the new threshold.
        onChange={(v) => patch({ maxLtv: v, targetLtvAfterCall: Math.min(target, Math.round((v - GAP) * 100) / 100) })}
      />
      <Slider
        label="LTV after a forced sale"
        tone="bruised"
        aside={
          <InfoTip label="What happens in a forced sale?">
            The lender sells enough holdings — paying capital-gains tax on them — to bring the loan back down to this share of the
            portfolio. Lower means a bigger sale.
          </InfoTip>
        }
        value={Math.min(target, targetMax)}
        min={0.1}
        max={targetMax}
        step={0.01}
        format="percent"
        ticks={[{ value: 0.1, label: '10%' }, { value: targetMax, label: percent(targetMax) }]}
        onChange={(v) => setInput('targetLtvAfterCall', Math.min(v, targetMax))}
        hint={`Must stay below the ${percent(maxLtv)} threshold.`}
      />

      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-cg`}>
            Capital-gains tax when selling
          </span>
          <span className="field__value num">{percent(cg, { digits: 1 })}</span>
        </div>
        <SegmentedControl<number | 'custom'>
          block
          aria-labelledby={`${uid}-cg`}
          value={isPreset ? CG_PRESETS.find((p) => Math.abs(p - cg) < 1e-6)! : 'custom'}
          onChange={(v) => {
            if (v === 'custom') setCgCustom(true)
            else {
              setCgCustom(false)
              setInput('capGainsRate', v)
            }
          }}
          options={[
            { value: 0.15, label: '15%' },
            { value: 0.2, label: '20%' },
            { value: 0.238, label: '23.8%', title: '20% + 3.8% net investment income tax' },
            { value: 'custom' as const, label: 'Custom' },
          ]}
        />
        <AnimatePresence initial={false}>
          {!isPreset && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ overflow: 'hidden' }}
            >
              <NumberField
                className="numfield--inset"
                label="Your combined rate (federal + state)"
                kind="percent"
                value={cg}
                min={0}
                max={0.6}
                step={0.005}
                onChange={(v) => setInput('capGainsRate', v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Slider
        label="Dividend tax drag"
        tone="neutral"
        aside={
          <InfoTip label="What is dividend tax drag?">
            Dividends are taxed each year even if you never sell. This is the yearly hit to returns: roughly dividend yield × your
            dividend tax rate (e.g. 1.5% × 15% ≈ 0.25%).
          </InfoTip>
        }
        value={drag}
        min={0}
        max={0.015}
        step={0.0005}
        format="percent2"
        ticks={[0, 0.005, 0.01, 0.015].map((v) => ({ value: v, label: percent(v, { digits: v === 0 ? 0 : 1 }) }))}
        onChange={(v) => setInput('dividendTaxDrag', v)}
      />
    </Section>
  )
}

/** Explainer: where the loan starts, where a call is triggered, and where a forced sale takes it back to. */
function LtvMeter({ now, threshold, target }: { now: number; threshold: number; target: number }) {
  const style = { '--t': threshold, '--g': target, '--n': Math.min(1, Math.max(0, now)) } as CSSProperties
  const zone = now > threshold ? 'call' : now > target ? 'warn' : 'safe'
  return (
    <figure className="ltv" style={style} aria-label={`Loan-to-value meter. Today ${percent(now)}. A margin call triggers at ${percent(threshold)}; a forced sale brings it back to ${percent(target)}.`}>
      <div className="ltv__labels-top" aria-hidden="true">
        <span className="ltv__lab ltv__lab--today">
          <b className="num">{percent(now)}</b> today
        </span>
        <span className="ltv__lab ltv__lab--call">
          <b className="num">{percent(threshold)}</b> call
        </span>
      </div>
      <div className="ltv__track" aria-hidden="true">
        <span className="ltv__zone ltv__zone--safe" />
        <span className="ltv__zone ltv__zone--warn" />
        <span className="ltv__zone ltv__zone--call" />
        <span className={`ltv__now ltv__now--${zone}`} />
        <span className="ltv__mark ltv__mark--target" />
        <span className="ltv__mark ltv__mark--call" />
        <svg className="ltv__arrow" preserveAspectRatio="none" viewBox="0 0 100 12" aria-hidden="true">
          <path d="M100 2 C 70 12, 30 12, 2 4" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="ltv__labels" aria-hidden="true">
        <span className="ltv__lab ltv__lab--target">
          sold back to <b className="num">{percent(target)}</b>
        </span>
      </div>
      <figcaption className="field__hint">
        Spending and interest grow the loan. Cross the line and the lender sells; staying left of it is the whole game.
      </figcaption>
    </figure>
  )
}
