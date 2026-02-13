import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { usePvpStore } from '../../store/usePvpStore'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'

function PvpResultsView() {
  const theme = useTypingStore((state) => state.settings.theme)
  const language = useTypingStore((state) => state.settings.language)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  const activeRoom = usePvpStore((state) => state.activeRoom)
  const currentUser = usePvpStore((state) => state.currentUser)
  const startMatch = usePvpStore((state) => state.startMatch)
  const resetMatch = usePvpStore((state) => state.resetMatch)
  const leaveRoom = usePvpStore((state) => state.leaveRoom)

  const sortedPlayers = useMemo(() => {
    if (!activeRoom) return []
    return [...activeRoom.players].sort((a, b) => (b.stats?.wpm ?? 0) - (a.stats?.wpm ?? 0))
  }, [activeRoom])

  if (!activeRoom) return null

  const isHost = currentUser ? activeRoom.hostId === currentUser.id : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full max-w-5xl rounded-3xl border ${themeClasses.border} ${themeClasses.card} p-6 md:p-8 shadow-2xl`}
      >
        <div className="space-y-6">
          <div>
            <h2 className={`text-2xl font-semibold ${themeClasses.primary}`}>{i18n.pvp.results.title}</h2>
            <p className={`text-sm ${themeClasses.secondary}`}>{i18n.pvp.results.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedPlayers.slice(0, 3).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 text-center ${
                  index === 0 ? 'shadow-xl shadow-white/10' : ''
                }`}
              >
                <div className={`text-2xl font-bold ${themeClasses.primary}`}>#{index + 1}</div>
                <p className={`mt-2 text-sm font-semibold ${themeClasses.primary}`}>{player.nickname}</p>
                <p className={`text-xs ${themeClasses.secondary}`}>{player.stats?.wpm ?? 0} WPM</p>
              </motion.div>
            ))}
          </div>

          <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4`}>
            <div className="grid grid-cols-4 text-xs font-semibold gap-2">
              <span className={themeClasses.secondary}>{i18n.pvp.results.table.player}</span>
              <span className={themeClasses.secondary}>{i18n.pvp.results.table.wpm}</span>
              <span className={themeClasses.secondary}>{i18n.pvp.results.table.accuracy}</span>
              <span className={themeClasses.secondary}>{i18n.pvp.results.table.time}</span>
            </div>
            <div className="mt-3 space-y-2">
              {sortedPlayers.map((player) => (
                <div key={player.id} className="grid grid-cols-4 text-sm gap-2">
                  <span className={themeClasses.primary}>{player.nickname}</span>
                  <span className={themeClasses.primary}>{player.stats?.wpm ?? 0}</span>
                  <span className={themeClasses.primary}>{player.stats?.accuracy ?? 0}%</span>
                  <span className={themeClasses.primary}>{player.stats?.timeSec ?? 0}s</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isHost && (
              <button
                type="button"
                onClick={() => startMatch(language)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.accent}`}
              >
                {i18n.pvp.results.rematch}
              </button>
            )}
            <button
              type="button"
              onClick={resetMatch}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.primary}`}
            >
              {i18n.pvp.results.settings}
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.secondary}`}
            >
              {i18n.pvp.results.leave}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PvpResultsView
