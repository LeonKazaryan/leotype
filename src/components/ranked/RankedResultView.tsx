import { motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useRankedStore } from '../../store/useRankedStore'

function RankedResultView() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const result = useRankedStore((state) => state.result)
  const joinQueue = useRankedStore((state) => state.joinQueue)
  const closeOverlay = useRankedStore((state) => state.closeOverlay)

  if (!result) return null

  const isWin = result.delta > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`relative w-full max-w-lg rounded-3xl border ${themeClasses.border} ${themeClasses.card} p-6 shadow-2xl`}
    >
      <div className="space-y-4 text-center">
        <div className={`text-3xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          {isWin ? 'WIN' : 'LOSS'}
        </div>
        <div className={`text-sm ${themeClasses.secondary}`}>
          Rating {result.ratingBefore} → {result.ratingAfter} ({result.delta > 0 ? '+' : ''}{result.delta})
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={themeClasses.secondary}>Оппонент:</span>
          <span className={themeClasses.primary}>{result.opponent}</span>
        </div>

        <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 text-sm`}>
          <div className="flex justify-between">
            <span className={themeClasses.secondary}>WPM</span>
            <span className={themeClasses.primary}>{result.stats.wpm}</span>
          </div>
          <div className="flex justify-between">
            <span className={themeClasses.secondary}>Accuracy</span>
            <span className={themeClasses.primary}>{result.stats.accuracy}%</span>
          </div>
          <div className="flex justify-between">
            <span className={themeClasses.secondary}>Time</span>
            <span className={themeClasses.primary}>{result.stats.timeSec}s</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => joinQueue()}
            className={`flex-1 rounded-xl border ${themeClasses.border} ${themeClasses.accent} py-2 font-semibold`}
          >
            Играть ещё
          </button>
          <button
            type="button"
            onClick={closeOverlay}
            className={`flex-1 rounded-xl border ${themeClasses.border} ${themeClasses.secondary} py-2 font-semibold`}
          >
            Назад
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default RankedResultView
