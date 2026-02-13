import { motion } from 'framer-motion'
import type { PvpPlayer } from '../../types/pvp'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'

interface PvpPlayerSlotProps {
  player: PvpPlayer | null
  index: number
}

function PvpPlayerSlot({ player, index }: PvpPlayerSlotProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  if (!player) {
    return (
      <div
        className={`rounded-xl border border-dashed ${themeClasses.border} ${themeClasses.card} px-4 py-3 text-sm ${themeClasses.secondary} opacity-60`}
      >
        {i18n.pvp.room.emptySlot(index + 1)}
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border ${themeClasses.border} ${themeClasses.card} px-4 py-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full border ${themeClasses.border} flex items-center justify-center text-sm font-semibold ${themeClasses.primary}`}>
          {player.nickname.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-semibold ${themeClasses.primary}`}>{player.nickname}</p>
            {player.isHost && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${themeClasses.border} ${themeClasses.accent}`}>
                {i18n.pvp.room.hostBadge}
              </span>
            )}
          </div>
          <p className={`text-xs ${themeClasses.secondary}`}>{i18n.pvp.room.status[player.status]}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs ${themeClasses.secondary}`}>{player.pingMs} ms</p>
        <p className={`text-xs ${themeClasses.secondary}`}>{player.isReady ? i18n.pvp.room.ready : i18n.pvp.room.notReady}</p>
      </div>
    </motion.div>
  )
}

export default PvpPlayerSlot
