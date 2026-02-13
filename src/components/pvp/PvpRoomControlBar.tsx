import { useTypingStore } from '../../store/useTypingStore'
import { usePvpStore } from '../../store/usePvpStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'

function PvpRoomControlBar() {
  const theme = useTypingStore((state) => state.settings.theme)
  const language = useTypingStore((state) => state.settings.language)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  const activeRoom = usePvpStore((state) => state.activeRoom)
  const currentUser = usePvpStore((state) => state.currentUser)
  const startMatch = usePvpStore((state) => state.startMatch)
  const leaveRoom = usePvpStore((state) => state.leaveRoom)
  const toggleReady = usePvpStore((state) => state.toggleReady)

  if (!activeRoom || !currentUser) return null

  const isHost = activeRoom.hostId === currentUser.id
  const localPlayer = activeRoom.players.find((player) => player.id === currentUser.id)

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {isHost ? (
        <button
          type="button"
          onClick={() => startMatch(language)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.accent}`}
        >
          {i18n.pvp.room.start}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => localPlayer && toggleReady(localPlayer.id)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.primary}`}
        >
          {localPlayer?.isReady ? i18n.pvp.room.notReady : i18n.pvp.room.ready}
        </button>
      )}
      <button
        type="button"
        onClick={leaveRoom}
        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.secondary}`}
      >
        {i18n.pvp.room.leave}
      </button>
    </div>
  )
}

export default PvpRoomControlBar
