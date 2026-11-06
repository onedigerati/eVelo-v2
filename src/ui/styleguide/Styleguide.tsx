import { useState } from 'react'
import { PlaceholderFan } from '../outlook/PlaceholderFan'
import {
  AnimatedNumber,
  Badge,
  Button,
  Card,
  InfoTip,
  NumberField,
  Panel,
  Section,
  SegmentedControl,
  Select,
  Sheet,
  Skeleton,
  SkeletonText,
  Slider,
  Stat,
  Toggle,
  Tooltip,
  toast,
} from '../primitives'
import { IconShare } from '../icons'
import { PLACEHOLDER_CITIES } from '../plan/placeholderCities'
import '../views.css'
import './styleguide.css'

const SWATCHES = [
  ['--bg', 'Background'],
  ['--ink', 'Ink'],
  ['--ink-2', 'Ink 2'],
  ['--ink-3', 'Ink 3'],
  ['--holds', 'Holds'],
  ['--bruised', 'Bruised'],
  ['--broken', 'Broken'],
  ['--neutral', 'Neutral'],
  ['--chart-band-1', 'Band 1'],
  ['--chart-band-2', 'Band 2'],
  ['--chart-band-3', 'Band 3'],
  ['--hairline-strong', 'Hairline'],
]

function Board({ theme }: { theme: 'light' | 'dark' }) {
  const [money, setMoney] = useState(5_000_000)
  const [rate, setRate] = useState(0.065)
  const [ltv, setLtv] = useState(0.6)
  const [seg, setSeg] = useState<'15' | '20' | '30'>('30')
  const [on, setOn] = useState(true)
  const [city, setCity] = useState<string | null>('lisbon')
  const [n, setN] = useState(0.87)
  const [sheet, setSheet] = useState<false | 'bottom' | 'left'>(false)

  return (
    <div className="sg-board theme-scope" data-theme={theme}>
      <div className="t-eyebrow">{theme} theme</div>

      <section className="sg-group">
        <h2 className="t-h2">Type</h2>
        <div className="t-hero">
          87<em>%</em>
        </div>
        <div className="t-display">
          Your plan <em>holds.</em>
        </div>
        <div className="t-h1">Page title</div>
        <div className="t-h2">Card title, Instrument Serif</div>
        <div className="t-h3">UI heading, Geist</div>
        <p className="t-lede">Lede paragraph — calm, confident, numbers are the hero.</p>
        <p>
          Body copy in Geist with <span className="num">$1,234,567.89</span> tabular figures in Geist Mono.
        </p>
        <div className="t-eyebrow">Eyebrow label</div>
      </section>

      <section className="sg-group">
        <h2 className="t-h2">Color</h2>
        <div className="sg-swatches">
          {SWATCHES.map(([v, l]) => (
            <div key={v} className="sg-swatch">
              <span style={{ background: `var(${v})` }} />
              <small>{l}</small>
              <code>{v}</code>
            </div>
          ))}
        </div>
        <div className="row wrap">
          <Badge tone="holds" dot>
            Holds
          </Badge>
          <Badge tone="bruised" dot>
            Bruised
          </Badge>
          <Badge tone="broken" dot>
            Broken
          </Badge>
          <Badge>Neutral</Badge>
        </div>
      </section>

      <section className="sg-group">
        <h2 className="t-h2">Inputs</h2>
        <NumberField label="Portfolio value" kind="currency" size="lg" value={money} onChange={setMoney} min={0} step={50_000} />
        <NumberField label="Loan rate" kind="percent" value={rate} onChange={setRate} min={0} max={0.2} />
        <Slider label="Loan rate" value={rate} min={0.02} max={0.12} step={0.0025} format="percent1" onChange={setRate} ticks={[0.02, 0.05, 0.08, 0.12]} />
        <Slider
          label="Margin-call LTV"
          tone="bruised"
          value={ltv}
          min={0.3}
          max={0.8}
          step={0.01}
          format="percent"
          onChange={setLtv}
          aside={<InfoTip>Above this loan-to-value the lender forces a sale.</InfoTip>}
          hint="Hint text sits under the control."
        />
        <SegmentedControl
          aria-label="Horizon"
          block
          value={seg}
          onChange={setSeg}
          options={[
            { value: '15', label: '15 years' },
            { value: '20', label: '20 years' },
            { value: '30', label: '30 years' },
          ]}
        />
        <Toggle label="Plan a move abroad" description="Spend the same lifestyle somewhere cheaper." checked={on} onChange={setOn} />
        <Select label="City" value={city} options={PLACEHOLDER_CITIES} onChange={setCity} searchable />
      </section>

      <section className="sg-group">
        <h2 className="t-h2">Buttons & feedback</h2>
        <div className="row wrap">
          <Button variant="primary">Run simulation</Button>
          <Button variant="secondary" icon={<IconShare size={16} />}>
            Share
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Tooltip content="Tooltips appear on hover and focus.">
            <Button variant="secondary" size="sm">
              Hover me
            </Button>
          </Tooltip>
        </div>
        <div className="row wrap">
          <Button size="sm" onClick={() => toast('Link copied', { tone: 'holds', detail: 'Anyone with it sees this plan.' })}>
            Toast
          </Button>
          <Button size="sm" onClick={() => toast('Margin call in year 7', { tone: 'bruised' })}>
            Caution toast
          </Button>
          <Button size="sm" onClick={() => setSheet('bottom')}>
            Bottom sheet
          </Button>
          <Button size="sm" onClick={() => setSheet('left')}>
            Drawer
          </Button>
        </div>
        <Sheet open={!!sheet} onClose={() => setSheet(false)} side={sheet || 'bottom'} title="A sheet">
          <p className="ink-2">Drag the handle down, press Escape or tap outside to dismiss.</p>
          <SkeletonText lines={5} />
        </Sheet>
      </section>

      <section className="sg-group">
        <h2 className="t-h2">Numbers</h2>
        <div className="row wrap">
          <Button size="sm" onClick={() => setN(Math.round(Math.random() * 100) / 100)}>
            Randomize
          </Button>
          <span className="t-h1">
            <AnimatedNumber value={n} format="percent" />
          </span>
          <span className="t-h2">
            <AnimatedNumber value={n * 6_000_000} format="currency-compact" />
          </span>
        </div>
        <div className="sg-stats">
          <Stat label="Median estate" value={n * 9_400_000} format="currency-compact" delta={0.124} deltaFormat="percent1" hint="vs. selling" />
          <Stat label="Holds" value={n} format="percent" tone="holds" />
          <Stat label="Peak LTV" value={0.42} format="percent" delta={0.03} deltaFormat="percent" deltaPositive="bad" tone="bruised" />
        </div>
      </section>

      <section className="sg-group">
        <h2 className="t-h2">Surfaces</h2>
        <Card eyebrow="Eyebrow" title="Card title" subtitle="Subtitle line" actions={<Badge tone="holds">Live</Badge>}>
          <Panel>
            <SkeletonText lines={3} />
          </Panel>
        </Card>
        <Card variant="ghost" padding="sm">
          <Skeleton height={80} radius="var(--radius-md)" />
        </Card>
        <Card title="Chart tokens" padding="sm">
          <div style={{ aspectRatio: '16 / 6' }}>
            <PlaceholderFan className="sg-fan" />
          </div>
        </Card>
        <div>
          <Section index="01" title="Collapsible section" summary="$5.0M · 3 holdings">
            <p className="ink-2">Body content. Collapse to see the summary line.</p>
          </Section>
          <Section index="02" title="Collapsed by default" summary="Bootstrap · Balanced" defaultOpen={false}>
            <p className="ink-2">Hidden content.</p>
          </Section>
        </div>
      </section>
    </div>
  )
}

/** Hidden route #styleguide — every primitive in both themes. */
export function Styleguide() {
  return (
    <div className="sg">
      <header className="page__header sg-header">
        <div className="t-eyebrow">Internal</div>
        <h1 className="t-display">
          Style<em>guide</em>
        </h1>
      </header>
      <div className="sg-boards">
        <Board theme="light" />
        <Board theme="dark" />
      </div>
    </div>
  )
}
