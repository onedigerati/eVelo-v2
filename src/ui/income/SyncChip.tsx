// The sync control in the mode's header once the questions are done: a "⇄ Sync with my eVelo plan"
// button before any sync; after one, a chip — "Synced Nov 18 · 5 values · Re-sync", or "eVelo
// changed since · spending, age · Re-sync" when the eVelo plan has moved on. The chip only notices;
// it never copies by itself. Re-sync opens the sheet with the changed fields ticked (all when none).
// The read copy of the eVelo plan is refreshed when this mounts, when the window regains focus, and
// when another tab saves `evelo:v2`. Nothing here writes to the eVelo plan.
import './sync.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EVELO_KEY, loadEveloPlan, useIncomeStore } from '../../state/incomeState'
import { changedSince, snapshotFromEvelo, SYNC_FIELDS, type SyncField } from '../../state/incomeSync'
import { useStore } from '../../state/store'
import { SyncSheet } from './SyncSheet'
import { chipText } from './syncText'

function localStore(): Pick<Storage, 'getItem'> | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Keeps the income store's read copy of the eVelo plan current. This tab's eVelo store is the
 *  plan (it is hydrated before the mode loads, and holds edits not yet saved); a save from another
 *  tab wins until this tab's own plan changes again. */
export function useEveloRefresh() {
  const setEvelo = useIncomeStore((s) => s.setEvelo)
  const external = useRef<unknown>(null)
  useEffect(() => {
    const fromStore = () => {
      const own = useStore.getState().inputs
      if (external.current && external.current === own) return
      external.current = null
      setEvelo(own)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== EVELO_KEY && e.key !== null) return
      external.current = useStore.getState().inputs
      setEvelo(loadEveloPlan(localStore()))
    }
    fromStore()
    window.addEventListener('focus', fromStore)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('focus', fromStore)
      window.removeEventListener('storage', onStorage)
    }
  }, [setEvelo])
}

export function SyncHeader() {
  useEveloRefresh()
  const inputs = useIncomeStore((s) => s.inputs)
  const sync = useIncomeStore((s) => s.sync)
  const evelo = useIncomeStore((s) => s.evelo)
  const syncFrom = useIncomeStore((s) => s.syncFrom)
  const snap = useMemo(() => snapshotFromEvelo(evelo), [evelo])
  const changed = useMemo(() => changedSince(sync, snap), [sync, snap])

  const [open, setOpen] = useState(false)
  const [ticked, setTicked] = useState<readonly SyncField[]>(SYNC_FIELDS)
  const openWith = (fields: readonly SyncField[]) => {
    setTicked(fields)
    setOpen(true)
  }

  return (
    <>
      {/* One button throughout, so focus that the sheet hands back after a first sync still lands on it. */}
      <div className={sync ? (changed.length ? 'isync-chip isync-chip--changed' : 'isync-chip') : 'isync-ctl'} data-testid="sync-chip">
        {sync && <span className="isync-chip__dot" aria-hidden="true" />}
        {sync && (
          <span className="isync-chip__text" aria-live="polite">
            {chipText(sync, changed)}
          </span>
        )}
        <button
          type="button"
          className={sync ? 'isync-chip__resync' : 'isync-open'}
          onClick={() => openWith(changed.length ? changed : SYNC_FIELDS)}
        >
          {sync ? (
            'Re-sync'
          ) : (
            <>
              <span aria-hidden="true">⇄</span> Sync with my eVelo plan
            </>
          )}
        </button>
      </div>
      <SyncSheet
        open={open}
        onClose={() => setOpen(false)}
        ticked={ticked}
        onTickedChange={setTicked}
        inputs={inputs}
        evelo={snap}
        onCopy={(fields) => {
          syncFrom(fields)
          setOpen(false)
        }}
      />
    </>
  )
}
