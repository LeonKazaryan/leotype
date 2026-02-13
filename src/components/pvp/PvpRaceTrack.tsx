import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { PvpPlayer } from '../../types/pvp'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { pvpConfig } from '../../config/pvp'

interface PvpRaceTrackProps {
  players: PvpPlayer[]
  localPlayerId: string
}

function PvpRaceTrack({ players, localPlayerId }: PvpRaceTrackProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  const leader = useMemo(() => {
    if (players.length === 0) return null
    return players.reduce((max, player) => (player.progress > max.progress ? player : max), players[0])
  }, [players])

  const checkpoints = [0.25, 0.5, 0.75, 1]

  return (
    <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="relative">
        <div className="h-2 rounded-full bg-white/10 relative">
          {checkpoints.map((point) => (
            <span
              key={point}
              className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border ${themeClasses.border} bg-white/10`}
              style={{ left: `${point * 100}%` }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {players.map((player) => {
            const isLocal = player.id === localPlayerId
            const isLeader = leader?.id === player.id
            const catchUp =
              !isLeader &&
              leader &&
              leader.progress - player.progress <= pvpConfig.ui.catchUpThreshold &&
              leader.progress > player.progress

            return (
              <div key={player.id} className="relative h-7">
                <motion.div
                  animate={{ left: `${player.progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-2`}
                >
                  <div
                    className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${
                      isLocal ? themeClasses.accent : themeClasses.primary
                    } ${themeClasses.border} ${catchUp ? 'shadow-lg shadow-white/20' : ''}`}
                  >
                    {player.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-xs ${themeClasses.secondary}`}>{Math.round(player.progress * 100)}%</span>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PvpRaceTrack
