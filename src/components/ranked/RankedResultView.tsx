import { motion } from 'framer-motion'
import { ArrowRight, Flame, Shield, Trophy } from 'lucide-react'
import { useMemo } from 'react'
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
  const statusText = isWin ? 'WIN' : 'LOSS'
  const subText = isWin ? `You outtyped ${result.opponent}` : `${result.opponent} was faster this time`
  const ratingBefore = result.ratingBefore
  const ratingAfter = result.ratingAfter

  const selfStats = result.stats
  const oppStats = result.opponentStats

  const metrics = useMemo(() => {
    const rows = [
      { key: 'wpm', label: 'WPM', better: 'higher' as const, self: selfStats.wpm, opp: oppStats?.wpm },
      { key: 'accuracy', label: 'Accuracy', better: 'higher' as const, self: selfStats.accuracy, opp: oppStats?.accuracy, suffix: '%' },
      { key: 'timeSec', label: 'Time', better: 'lower' as const, self: selfStats.timeSec, opp: oppStats?.timeSec, suffix: 's' },
    ]

    return rows.map((row) => {
      const selfVal = row.self ?? 0
      const oppVal = row.opp ?? 0
      const hasOpp = row.opp !== undefined && row.opp !== null

      const denom = row.better === 'lower'
        ? (selfVal + oppVal === 0 ? 1 : selfVal + oppVal)
        : (selfVal + oppVal === 0 ? 1 : selfVal + oppVal)

      let selfRatio = hasOpp ? selfVal / denom : 1
      let oppRatio = hasOpp ? oppVal / denom : 0

      if (row.better === 'lower' && hasOpp) {
        // invert so lower time gets bigger bar
        const max = Math.max(selfVal, oppVal, 1)
        selfRatio = (max - selfVal) / max
        oppRatio = (max - oppVal) / max
      }

      const selfWins = hasOpp
        ? row.better === 'higher'
          ? selfVal > oppVal
          : selfVal < oppVal
        : true

      return { ...row, selfVal, oppVal, hasOpp, selfRatio, oppRatio, selfWins }
    })
  }, [selfStats, oppStats])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`relative w-full max-w-2xl rounded-3xl border ${themeClasses.border} ${themeClasses.card} p-6 shadow-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen bg-gradient-to-br from-primary-500/20 via-transparent to-pink-500/15" />

      <div className="relative space-y-5">
        {/* STATUS */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <div
            className={`text-4xl font-extrabold tracking-wide ${
              isWin ? 'text-green-400 drop-shadow-[0_0_18px_rgba(74,222,128,0.55)]' : 'text-red-400'
            }`}
          >
            {statusText}
          </div>
          <div className={`text-sm ${themeClasses.secondary}`}>{subText}</div>
        </motion.div>

        {/* RATING CHANGE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 flex flex-col gap-2`}
        >
          <div className="flex items-center justify-between text-sm uppercase tracking-wide">
            <span className={`inline-flex items-center gap-2 ${isWin ? 'text-green-300' : 'text-red-300'}`}>
              <Trophy size={16} />
              {result.delta > 0 ? `+${result.delta}` : result.delta} Rating
            </span>
            <Flame size={16} className={themeClasses.secondary} />
          </div>
          <div className="flex items-center justify-center gap-3 text-lg font-semibold">
            <span className={`opacity-70 ${themeClasses.secondary}`}>{ratingBefore}</span>
            <ArrowRight className={themeClasses.secondary} size={18} />
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 18 }}
              className={`text-3xl font-bold ${isWin ? 'text-green-300' : 'text-red-300'} glow-text`}
            >
              {ratingAfter}
            </motion.span>
          </div>
          <div className={`text-xs text-center ${themeClasses.secondary}`}>
            {result.delta > 0 ? 'Rating increased' : 'Rating decreased'}
          </div>
        </motion.div>

        {/* HEAD-TO-HEAD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4`}
        >
          <div className="flex items-center justify-between text-sm font-semibold mb-3">
            <span className={themeClasses.primary}>Head-to-head</span>
            <span className={`inline-flex items-center gap-2 ${themeClasses.secondary}`}>
              <Shield size={14} />
              {result.opponent}
            </span>
          </div>

          <div className="space-y-3">
            {metrics.map((metric, idx) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + idx * 0.06 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span className={themeClasses.secondary}>{metric.label}</span>
                  <span className={themeClasses.secondary}>{metric.better === 'higher' ? 'Higher wins' : 'Lower wins'}</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${metric.selfWins ? themeClasses.primary : 'text-gray-500'}`}>
                      {metric.selfVal}
                      {metric.suffix}
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(4, metric.selfRatio * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className={`text-[10px] uppercase tracking-wide ${themeClasses.secondary} text-center`}>
                    You
                  </div>
                  <div className="space-y-1 text-right">
                    <div className={`text-sm font-semibold ${metric.selfWins ? 'text-gray-500' : themeClasses.primary}`}>
                      {metric.hasOpp ? metric.oppVal : '—'}
                      {metric.suffix}
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/30 transition-all"
                        style={{ width: `${Math.min(100, Math.max(4, metric.oppRatio * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <motion.button
            type="button"
            onClick={() => joinQueue()}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(14,165,233,0.35)' }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 rounded-xl border ${themeClasses.border} ${themeClasses.accent} py-2 font-semibold`}
          >
            Играть ещё
          </motion.button>
          <button
            type="button"
            onClick={closeOverlay}
            className={`flex-1 rounded-xl border ${themeClasses.border} ${themeClasses.secondary} py-2 font-semibold hover:${themeClasses.primary}`}
          >
            Назад
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default RankedResultView
