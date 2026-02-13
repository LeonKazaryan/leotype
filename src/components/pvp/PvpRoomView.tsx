import { AnimatePresence } from 'framer-motion'
import { usePvpStore } from '../../store/usePvpStore'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import PvpPlayerSlot from './PvpPlayerSlot'
import PvpRoomSettingsPanel from './PvpRoomSettingsPanel'
import PvpRoomControlBar from './PvpRoomControlBar'
import { useI18n } from '../../hooks/useI18n'

function PvpRoomView() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const activeRoom = usePvpStore((state) => state.activeRoom)
  const i18n = useI18n()
  const roomsError = usePvpStore((state) => state.roomsError)

  if (!activeRoom) return null

  const slots = Array.from({ length: activeRoom.maxPlayers }, (_, index) => activeRoom.players[index] ?? null)

  return (
    <div className="space-y-4">
      {roomsError && (
        <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.card} px-4 py-3 text-xs text-red-400`}>
          {i18n.pvp.errors[roomsError]}
        </div>
      )}
      <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.card} px-4 py-3 text-xs ${themeClasses.secondary}`}>
        <div className="flex items-center justify-between gap-4">
          <span>{i18n.pvp.room.roomNameLabel}: <span className={themeClasses.primary}>{activeRoom.name}</span></span>
          <span>{i18n.pvp.room.roomCodeLabel}: <span className={themeClasses.primary}>{activeRoom.code}</span></span>
        </div>
      </div>
      <div className="space-y-3">
        <p className={`text-xs uppercase tracking-wide ${themeClasses.secondary}`}>{i18n.pvp.room.playersLabel}</p>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {slots.map((player, index) => (
              <PvpPlayerSlot
                key={player ? player.id : `empty_${index}`}
                player={player}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <PvpRoomSettingsPanel />

      <PvpRoomControlBar />
    </div>
  )
}

export default PvpRoomView
