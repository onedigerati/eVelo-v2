import { shareUrl } from '../../state/share'
import { useStore } from '../../state/store'
import { IconShare } from '../icons'
import { Button, toast } from '../primitives'

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for non-secure contexts / older Safari.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function useShare() {
  return async () => {
    const url = shareUrl(useStore.getState().inputs)
    const ok = await copy(url)
    if (ok) toast('Link copied', { tone: 'holds', detail: 'Anyone with it sees this exact plan.' })
    else {
      window.history.replaceState(null, '', url)
      toast('Couldn’t reach the clipboard', { tone: 'bruised', detail: 'The link is in your address bar.' })
    }
  }
}

export function ShareButton({ compact }: { compact?: boolean }) {
  const share = useShare()
  if (compact)
    return (
      <button type="button" className="icon-btn" aria-label="Copy share link" title="Copy share link" onClick={share}>
        <IconShare size={20} />
      </button>
    )
  return (
    <Button variant="secondary" size="sm" icon={<IconShare size={16} />} onClick={share}>
      Share
    </Button>
  )
}
