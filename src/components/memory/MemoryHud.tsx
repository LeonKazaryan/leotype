import { motion } from 'framer-motion'
import type { MemoryPhase } from '../../types/memory'
import type { ThemeClasses } from '../../utils/themes'
import type { I18nDictionary } from '../../config/i18n'
import { memoryConfig } from '../../config/memory'

interface MemoryHudProps {
  phase: MemoryPhase
  currentIndex: number
  totalCards: number
  progress: number
  onExit: () => void
  themeClasses: ThemeClasses
  i18n: I18nDictionary
}

const { animation } = memoryConfig.ui

function MemoryHud({ phase, currentIndex, totalCards, progress, onExit, themeClasses, i18n }: MemoryHudProps) {
  const isMemorizePhase = phase === 'memorize' || phase === 'transition' || phase === 'loading' || phase === 'idle'
  const phaseLabel = isMemorizePhase ? i18n.memory.phases.memorize : i18n.memory.phases.recall
  const showCounter = isMemorizePhase && totalCards > 0
  const counterText = i18n.memory.cardCounter(currentIndex + 1, totalCards)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.3em] ${themeClasses.secondary}`}>{phaseLabel}</p>
          {showCounter && (
            <p className={`text-lg font-semibold ${themeClasses.primary}`}>{counterText}</p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${themeClasses.secondary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
          title={i18n.timer.backToMenu}
        >
          ← {i18n.timer.menu}
        </motion.button>
      </div>

      <div className={`h-2 rounded-full overflow-hidden ${themeClasses.bg} border ${themeClasses.border}`}>
        <motion.div
          className={`h-full ${themeClasses.accent} bg-current`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: animation.progressDuration, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default MemoryHud
