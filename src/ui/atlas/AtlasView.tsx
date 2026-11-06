import { AnimatePresence, m as motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CITIES, CITY_BY_ID } from '../../data/cities'
import { budgetTotal } from '../../engine/cost'
import { useStore } from '../../state/store'
import { percent } from '../format'
import { rise, springSoft, stagger } from '../motion'
import { AnimatedNumber, Button, Card, Skeleton, cx, toast } from '../primitives'
import {
  REGION_CHIPS,
  inRegion,
  insight,
  lifestyleCaption,
  ranked,
  successColor,
  successTextColor,
  useAtlasSync,
  type Ranked,
  type RegionChip,
} from './atlasData'
import { CityList } from './CityList'
import { CodeChip } from './CodeChip'
import { CompareSheet } from './CompareSheet'
import { SourcesLine } from './ThingsToCheck'
import { WorldMap } from './WorldMap'
import '../views.css'
import './atlas.css'

function chooseDestination(id: string, rows: Ranked[]) {
  const st = useStore.getState()
  const city = CITY_BY_ID[id]
  if (!city) return
  const row = rows.find((r) => r.cityId === id)
  if (id === st.inputs.homeCityId) {
    if (st.inputs.destCityId) {
      st.setDestination(null)
      toast(`Staying in ${city.name}`, { tone: 'neutral', detail: 'Destination cleared. The outlook now prices your home city.' })
    } else toast(`${city.name} is already home`, { tone: 'neutral' })
    return
  }
  if (st.inputs.destCityId === id) {
    toast(`${city.name} is already your destination`, { tone: 'neutral' })
    return
  }
  st.setDestination(id)
  toast(`${city.name} set as your destination`, {
    tone: row ? (row.successRate >= 0.8 ? 'holds' : row.successRate >= 0.6 ? 'bruised' : 'broken') : 'holds',
    detail: row ? `Your plan holds in ${percent(row.successRate)} of futures there.` : 'The outlook is updating.',
  })
}

function useRelativeTime(at: number | null): string {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 15_000)
    return () => clearInterval(t)
  }, [])
  if (!at) return ''
  const s = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (s < 20) return 'just now'
  if (s < 60) return `${s} s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function AtlasView() {
  useAtlasSync()
  const inputs = useStore((s) => s.inputs)
  const atlas = useStore((s) => s.atlas)
  const atlasAt = useStore((s) => s.atlasAt)
  const running = useStore((s) => s.atlasRunning)
  const [region, setRegion] = useState<RegionChip>('All')
  const [compare, setCompare] = useState<string[]>([])
  const [cmpOpen, setCmpOpen] = useState(false)
  const rows = useMemo(() => ranked(atlas), [atlas])
  const when = useRelativeTime(atlasAt)
  const homeId = inputs.homeCityId
  const destId = inputs.destCityId
  const homeSpend = budgetTotal(inputs.budget)

  const choose = useCallback((id: string) => chooseDestination(id, rows), [rows])
  const toggleCompare = useCallback((id: string) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id)
      if (c.length >= 3) {
        toast('Compare holds up to 3 cities', { tone: 'neutral', detail: 'Remove one to add another.' })
        return c
      }
      return [...c, id]
    })
  }, [])
  const cmpRows = useMemo(() => compare.map((id) => rows.find((r) => r.cityId === id)).filter((r): r is Ranked => !!r), [compare, rows])
  useEffect(() => {
    if (cmpOpen && cmpRows.length === 0) setCmpOpen(false)
  }, [cmpOpen, cmpRows.length])

  const best = rows[0]
  const home = rows.find((r) => r.cityId === homeId)
  const dest = destId ? rows.find((r) => r.cityId === destId) : undefined
  const counts = useMemo(() => Object.fromEntries(REGION_CHIPS.map((r) => [r, CITIES.filter((c) => inRegion(c, r)).length])), [])
  const line = insight(rows, inputs)

  return (
    <motion.div className={cx('page page--atlas atlas', running && 'is-running')} variants={stagger(0.07)} initial="hidden" animate="show">
      <motion.header className="atlas__header" variants={rise}>
        <div className="atlas__meta">
          <span className="t-eyebrow">Where your money goes furthest</span>
          <span className={cx('atlas__status', running ? 'is-running' : 'is-done')} role="status" aria-live="polite">
            <span className="pulse-dot" aria-hidden="true" />
            {running || !atlasAt ? `Ranking ${CITIES.length} cities…` : `Ranked ${when}`}
          </span>
        </div>
        <h1 className="t-display atlas__title">
          The <em>atlas</em>
        </h1>
        <p className="t-lede atlas__lede">
          {lifestyleCaption(inputs)}, ranked by how often your plan holds there: same portfolio, same loan, local prices and currency risk.
        </p>
      </motion.header>

      <motion.div className="atlas__tiles" variants={rise}>
        <Tile
          eyebrow="Best odds"
          row={best}
          note={best && home && best.cityId !== homeId ? `${percent(1 - best.costRatio)} cheaper than home` : undefined}
          action={
            best && best.cityId !== destId && best.cityId !== homeId
              ? { label: 'Make destination', onClick: () => choose(best.cityId) }
              : undefined
          }
        />
        <Tile eyebrow="Your home" row={home} note={home ? `Rank ${home.rank} of ${rows.length}` : undefined} />
        <Tile
          eyebrow="Your destination"
          row={dest}
          empty={!destId ? 'Staying home. Tap any city to price a move.' : undefined}
          note={
            dest && home
              ? `${dest.successRate >= home.successRate ? '+' : '−'}${Math.abs(Math.round((dest.successRate - home.successRate) * 100))} pts vs staying home`
              : undefined
          }
        />
      </motion.div>

      <motion.div variants={rise}>
        <Card
          className="atlas__mapcard"
          eyebrow={`World map · ${CITIES.length} cities`}
          title={
            <>
              Where your plan <em>holds</em>
            </>
          }
          subtitle={line ?? 'Every city priced at your lifestyle, then simulated with the same futures.'}
        >
          <RegionChips value={region} onChange={setRegion} counts={counts} />
          <WorldMap
            rows={rows}
            homeId={homeId}
            destId={destId}
            region={region}
            compare={compare}
            onToggleCompare={toggleCompare}
            onChoose={choose}
            homeSpend={homeSpend}
          />
          <Legend />
        </Card>
      </motion.div>

      <motion.div variants={rise}>
        <Card
          className="atlas__listcard"
          eyebrow={region === 'All' ? 'Ranking · every city' : `Ranking · ${region}`}
          title={
            <>
              Cities, best odds <em>first</em>
            </>
          }
          subtitle="Tap a city to make it your destination; tick up to three to compare side by side."
        >
          {rows.length ? (
            <CityList
              rows={rows}
              homeId={homeId}
              destId={destId}
              region={region}
              compare={compare}
              onToggleCompare={toggleCompare}
              onChoose={choose}
            />
          ) : (
            <div className="clist__skel" aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="clist__skel-row">
                  <Skeleton width={22} height={12} />
                  <Skeleton width={`${38 - i * 2}%`} height={14} />
                  <Skeleton width={90} height={10} radius={99} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={rise}>
        <SourcesLine />
      </motion.div>

      <AnimatePresence>
        {cmpRows.length > 0 && !cmpOpen && (
          <motion.div
            className="cmp-dock"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={springSoft}
          >
            <div className="cmp-dock__chips">
              {cmpRows.map((r) => (
                <span key={r.cityId} className="cmp-dock__chip">
                  <i style={{ background: successColor(r.successRate) }} />
                  {r.city.name}
                  <button type="button" aria-label={`Remove ${r.city.name}`} onClick={() => toggleCompare(r.cityId)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={() => setCmpOpen(true)}>
              Compare {cmpRows.length}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareSheet
        open={cmpOpen}
        onClose={() => setCmpOpen(false)}
        rows={cmpRows}
        inputs={inputs}
        onChoose={(id) => {
          choose(id)
        }}
        onRemove={toggleCompare}
      />
    </motion.div>
  )
}

function Tile({
  eyebrow,
  row,
  note,
  empty,
  action,
}: {
  eyebrow: string
  row?: Ranked
  note?: string
  empty?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="atile" style={row ? { ['--tone' as string]: successColor(row.successRate) } : undefined}>
      <div className="t-eyebrow">{eyebrow}</div>
      {row ? (
        <>
          <div className="atile__city">
            <CodeChip code={row.city.countryCode} />
            <span>{row.city.name}</span>
          </div>
          <div className="atile__fig" style={{ color: successTextColor(row.successRate) }}>
            <AnimatedNumber value={Math.round(row.successRate * 100)} className="atile__num" />
            <i>%</i>
          </div>
          <div className="atile__foot">
            {note && <span className="t-small ink-3">{note}</span>}
            {action && (
              <button type="button" className="link-btn" onClick={action.onClick}>
                {action.label} →
              </button>
            )}
          </div>
        </>
      ) : empty ? (
        <p className="atile__empty">{empty}</p>
      ) : (
        <div className="atile__skel">
          <Skeleton width="60%" height={14} />
          <Skeleton width={80} height={40} radius={10} />
        </div>
      )}
    </div>
  )
}

function RegionChips({
  value,
  onChange,
  counts,
}: {
  value: RegionChip
  onChange: (r: RegionChip) => void
  counts: Record<string, number>
}) {
  return (
    <div className="rchips" role="toolbar" aria-label="Zoom to region">
      <div className="rchips__track">
        {REGION_CHIPS.map((r) => (
          <button
            key={r}
            type="button"
            className={cx('rchip', value === r && 'is-on')}
            aria-pressed={value === r}
            onClick={() => onChange(r)}
          >
            {value === r && (
              <motion.span layoutId="rchip-pill" className="rchip__pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
            )}
            <span className="rchip__label">{r}</span>
            <span className="rchip__n num">{counts[r]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="wlegend" aria-hidden="true">
      <div className="wlegend__ramp">
        <span className="wlegend__t">Plan holds</span>
        <span className="wlegend__bar" />
        <span className="wlegend__ticks num">
          <span>≤45%</span>
          <span>65%</span>
          <span>≥85%</span>
        </span>
      </div>
      <div className="wlegend__keys">
        <span className="wlegend__key">
          <svg width="30" height="14">
            <circle cx="5" cy="7" r="2.6" fill="var(--ink-3)" />
            <circle cx="20" cy="7" r="6" fill="var(--ink-3)" />
          </svg>
          Bigger = cheaper than home
        </span>
        <span className="wlegend__key">
          <svg width="14" height="14">
            <circle cx="7" cy="7" r="3.2" fill="none" stroke="var(--ink-3)" strokeWidth="1.4" />
          </svg>
          Costlier
        </span>
        <span className="wlegend__key">
          <svg width="18" height="18">
            <circle cx="9" cy="9" r="7" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
            <circle cx="9" cy="9" r="2.6" fill="var(--ink-3)" />
          </svg>
          Home
        </span>
        <span className="wlegend__key">
          <svg width="18" height="18">
            <circle cx="9" cy="9" r="4" fill="var(--holds)" />
            <circle cx="9" cy="9" r="7" fill="none" stroke="var(--holds)" strokeWidth="1.2" opacity=".6" />
          </svg>
          Destination
        </span>
      </div>
    </div>
  )
}
