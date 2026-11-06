import { m as motion } from 'framer-motion'
import { rise, stagger } from '../motion'
import '../views.css'

/** Methodology (Stage 6 writes the full text). Sets the editorial long-form style now. */
export function MethodView() {
  return (
    <motion.article className="page page--prose" variants={stagger(0.07)} initial="hidden" animate="show">
      <motion.header className="page__header" variants={rise}>
        <div className="t-eyebrow">Method</div>
        <h1 className="t-display">
          How the <em>futures</em> are made
        </h1>
        <p className="t-lede">
          eVelo replays real market history in thousands of different orders, borrows against your portfolio to fund your life, and
          counts how often the lender never has to sell.
        </p>
      </motion.header>
      <motion.section className="prose" variants={rise}>
        <h2 className="t-h2">Buy, borrow, die</h2>
        <p>
          Instead of selling investments to pay for living — and paying capital-gains tax each time — you borrow against them with a
          securities-backed line of credit. The loan grows with interest; the portfolio, untouched, keeps compounding. At death,
          heirs inherit with a stepped-up cost basis and the loan is repaid from the estate.
        </p>
        <h2 className="t-h2">What “holds” means</h2>
        <p>
          A future <em>holds</em> when the loan never crosses the lender’s margin-call threshold and the estate stays solvent to the
          end of your horizon. A future is <em>bruised</em> when a margin call forces a sale but you recover, and <em>broken</em>{' '}
          when the debt overtakes the assets.
        </p>
        <blockquote className="pullquote">The failure mode of Buy-Borrow-Die is not a bad year. It is being forced to sell in one.</blockquote>
        <h2 className="t-h2">Where the numbers come from</h2>
        <p>
          Monthly total returns for each holding, bundled at build time, resampled in blocks so that crashes, recoveries and the
          way assets move together are preserved. Short histories are extended from the broad market and tempered toward a
          long-run prior so recent winners don’t project forever.
        </p>
      </motion.section>
    </motion.article>
  )
}
