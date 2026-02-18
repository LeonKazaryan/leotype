import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useTypingStore } from '../../store/useTypingStore'
import { useRankedStore } from '../../store/useRankedStore'
import { getThemeClasses } from '../../utils/themes'
import RankedMatchView from './RankedMatchView'
import RankedResultView from './RankedResultView'

function RankedOverlay() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const overlayOpen = useRankedStore((state) => state.overlayOpen)
  const phase = useRankedStore((state) => state.phase)
  const searchStatus = useRankedStore((state) => state.searchStatus)
  const opponent = useRankedStore((state) => state.opponent)
  const match = useRankedStore((state) => state.match)
  const cancelQueue = useRankedStore((state) => state.cancelQueue)
  const closeOverlay = useRankedStore((state) => state.closeOverlay)

  useEffect(() => {
    return () => {
      cancelQueue()
    }
  }, [cancelQueue])

  return (
    <AnimatePresence>
      {overlayOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${themeClasses.overlay}`}
            onClick={closeOverlay}
          />

          {phase === 'match' && <RankedMatchView />}
          {phase === 'result' && <RankedResultView />}

          {(phase === 'search' || phase === 'found' || phase === 'countdown') && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className={`relative w-full max-w-md rounded-3xl border ${themeClasses.border} ${themeClasses.card} p-6 shadow-2xl backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${themeClasses.primary}`}>Ranked</h2>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className={`${themeClasses.secondary} hover:${themeClasses.primary}`}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {phase === 'search' && (
                <div className="space-y-4 text-center">
                  <div className={`text-lg font-semibold ${themeClasses.primary}`}>Ищем соперника</div>
                  <div className={`${themeClasses.secondary} text-sm`}>
                    Подбор по рейтингу: ±{searchStatus?.range ?? 80}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="ranked-scan size-32" />
                  </div>
                  <button
                    type="button"
                    onClick={cancelQueue}
                    className={`w-full rounded-xl border ${themeClasses.border} ${themeClasses.secondary} py-2 text-sm font-semibold hover:${themeClasses.primary}`}
                  >
                    Отмена
                  </button>
                </div>
              )}

              {(phase === 'found' || phase === 'countdown') && opponent && (
                <div className="space-y-4">
                  <div className={`text-lg font-semibold ${themeClasses.primary}`}>Соперник найден</div>
                  <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 flex items-center gap-4`}>
                    <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-sm font-bold">
                      {opponent.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-base font-semibold ${themeClasses.primary}`}>{opponent.nickname}</div>
                      <div className={`text-xs ${themeClasses.secondary}`}>Rating {opponent.rating}{opponent.isBot ? ' • бот' : ''}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${themeClasses.border} ${themeClasses.accent}`}>Ranked</span>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${themeClasses.primary} glow-text`}>{match.countdown}</div>
                    <div className={`text-xs mt-1 ${themeClasses.secondary}`}>Старт через</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RankedOverlay
