import { motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import type { PvpPublicRoom, PvpErrorCode } from '../../types/pvp'
import { sanitizeRoomCode } from '../../utils/pvp'
import { pvpConfig } from '../../config/pvp'

interface PvpLobbyJoinTabProps {
  joinCode: string
  onJoinCodeChange: (value: string) => void
  onJoin: (code: string) => void
  rooms: PvpPublicRoom[]
  isLoading: boolean
  errorCode: PvpErrorCode | null
}

function PvpLobbyJoinTab({ joinCode, onJoinCodeChange, onJoin, rooms, isLoading, errorCode }: PvpLobbyJoinTabProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.pvp.lobby.roomCode}</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => onJoinCodeChange(sanitizeRoomCode(e.target.value))}
            placeholder={i18n.pvp.lobby.roomCodePlaceholder}
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:${themeClasses.accent}`}
          />
          <button
            type="button"
            onClick={() => onJoin(joinCode)}
            disabled={joinCode.length !== pvpConfig.roomCode.length}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.accent} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {i18n.pvp.lobby.joinButton}
          </button>
        </div>
        {errorCode && (
          <p className="text-xs text-red-400">{i18n.pvp.errors[errorCode]}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold ${themeClasses.primary}`}>{i18n.pvp.lobby.publicRooms}</h3>
          <span className={`text-xs ${themeClasses.secondary}`}>{i18n.pvp.lobby.publicRoomsHint}</span>
        </div>
        <div className="mt-3 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton_${index}`}
                  className={`h-16 rounded-xl border ${themeClasses.border} ${themeClasses.card} animate-pulse`}
                />
              ))}
            </div>
          )}

          {!isLoading && rooms.length === 0 && (
            <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.card} p-4 text-sm ${themeClasses.secondary}`}>
              {i18n.pvp.lobby.noRooms}
            </div>
          )}

          {!isLoading && rooms.map((room) => (
            <motion.button
              key={room.id}
              type="button"
              onClick={() => onJoin(room.code)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className={`w-full text-left rounded-xl border ${themeClasses.border} ${themeClasses.card} px-4 py-3 transition-colors`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold ${themeClasses.primary}`}>{room.hostName}</p>
                  <p className={`text-xs ${themeClasses.secondary}`}>{room.modeLabel} • {i18n.pvp.difficulty[room.difficulty]}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${themeClasses.secondary}`}>{room.playersCount}/{room.maxPlayers}</p>
                  <p className={`text-xs ${themeClasses.secondary}`}>{room.pingMs} ms</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PvpLobbyJoinTab
