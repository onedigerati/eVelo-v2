import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../state/store'
import { ease } from '../motion'
import { Section, Select, Toggle } from '../primitives'
import { PLACEHOLDER_CITIES, cityLabel } from './placeholderCities'

export function PlaceSection() {
  const home = useStore((s) => s.inputs.homeCityId)
  const dest = useStore((s) => s.inputs.destCityId)
  const setInput = useStore((s) => s.setInput)
  const summary = dest ? `${cityLabel(home)} → ${cityLabel(dest)}` : `Staying in ${cityLabel(home)}`
  return (
    <Section index="03" title="Where you live" summary={summary}>
      <Select label="Home city" value={home} options={PLACEHOLDER_CITIES} onChange={(v) => setInput('homeCityId', v)} searchable />
      <Toggle
        label="Plan a move abroad"
        description="Spend the same lifestyle somewhere it costs less."
        checked={dest !== null}
        onChange={(on) => setInput('destCityId', on ? (PLACEHOLDER_CITIES.find((c) => c.value !== home)?.value ?? null) : null)}
      />
      <AnimatePresence initial={false}>
        {dest !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
            transition={{ duration: 0.36, ease }}
          >
            <Select
              label="Destination"
              value={dest}
              options={PLACEHOLDER_CITIES.filter((c) => c.value !== home)}
              onChange={(v) => setInput('destCityId', v)}
              searchable
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
