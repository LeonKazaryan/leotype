import { motion } from 'framer-motion'
import type { MemoryResults } from '../../types/memory'
import type { ThemeClasses } from '../../utils/themes'
import type { I18nDictionary } from '../../config/i18n'
import ResultsOverlay from '../results/ResultsOverlay'
import { memoryConfig } from '../../config/memory'

interface MemoryResultsViewProps {
  isVisible: boolean
  results: MemoryResults | null
  onRunAgain: () => void
  onSettings: () => void
  themeClasses: ThemeClasses
  i18n: I18nDictionary
  orderRequired: boolean
}

const { statusClasses, animation } = memoryConfig.ui

function MemoryResultsView({
  isVisible,
  results,
  onRunAgain,
  onSettings,
  themeClasses,
  i18n,
  orderRequired,
}: MemoryResultsViewProps) {
  if (!results) return null

  const headerText = results.perfect ? i18n.memory.results.perfectTitle : i18n.memory.results.title
  const subText = orderRequired ? i18n.memory.results.orderOn : i18n.memory.results.orderOff

  return (
    <ResultsOverlay isVisible={isVisible} themeClasses={themeClasses}>
      <div className={`rounded-3xl p-6 ${themeClasses.card} border ${themeClasses.border} shadow-2xl`}>
        <div className="space-y-2 text-center">
          <p className={`text-xs uppercase tracking-[0.4em] ${themeClasses.secondary}`}>
            {i18n.memory.results.phaseLabel}
          </p>
          <h2 className={`text-3xl font-bold ${themeClasses.primary}`}>{headerText}</h2>
          <p className={`text-sm ${themeClasses.secondary}`}>{subText}</p>
          <p className={`text-sm ${themeClasses.secondary}`}>
            {i18n.memory.results.summary(results.correct, results.total, results.misordered)}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.slots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{
                opacity: 0,
                rotateY: animation.resultsCardEnter.rotateY,
                y: animation.resultsCardEnter.y,
              }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{ duration: animation.resultsFlipDuration, delay: index * animation.resultsStaggerDelay }}
              className={`rounded-2xl border p-4 relative ${statusClasses[slot.status]}`}
            >
              <div className="absolute right-3 top-3 h-7 w-7 rounded-full border border-white/20 bg-white/5 text-[11px] font-semibold flex items-center justify-center">
                {index + 1}
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                {i18n.memory.results.correctLabel}
              </p>
              <p className="text-lg font-semibold">{slot.target}</p>
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                  {i18n.memory.results.guessLabel}
                </p>
                <p className="text-sm font-medium">
                  {slot.guess || i18n.memory.results.emptyGuess}
                </p>
              </div>
              {slot.status === 'misordered' && (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] opacity-80">
                  {i18n.memory.results.misorderedLabel}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onRunAgain}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
          >
            {i18n.memory.results.runAgain}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSettings}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${themeClasses.secondary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
          >
            {i18n.memory.results.settings}
          </motion.button>
        </div>
      </div>
    </ResultsOverlay>
  )
}

export default MemoryResultsView
