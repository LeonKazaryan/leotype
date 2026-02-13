import { usePvpStore } from '../../store/usePvpStore'
import PvpLobbyDrawer from './PvpLobbyDrawer'
import PvpMatchView from './PvpMatchView'
import PvpResultsView from './PvpResultsView'

interface PvpOverlayProps {
  onCloseLobby: () => void
}

function PvpOverlay({ onCloseLobby }: PvpOverlayProps) {
  const phase = usePvpStore((state) => state.phase)
  const isLobbyOpen = usePvpStore((state) => state.isLobbyOpen)

  if (phase === 'match') {
    return <PvpMatchView />
  }

  if (phase === 'results') {
    return <PvpResultsView />
  }

  return <PvpLobbyDrawer open={isLobbyOpen} onClose={onCloseLobby} />
}

export default PvpOverlay
