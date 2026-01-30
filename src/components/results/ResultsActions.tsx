import { motion } from 'framer-motion'
import { resultsViewConfig } from '../../config/resultsView'
import { useI18n } from '../../hooks/useI18n'

interface ResultsActionsProps {
  onRunAgain: () => void
  onSettings: () => void
  themeClasses: {
    primary: string
    secondary: string
    border: string
    accent: string
  }
}

const { animation, icons } = resultsViewConfig

function ResultsActions({ onRunAgain, onSettings, themeClasses }: ResultsActionsProps) {
  const i18n = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: animation.containerYOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.actionsDelay }}
      className="flex flex-col items-center gap-4"
    >
      <motion.button
        whileHover={{ scale: animation.buttonHoverScale }}
        whileTap={{ scale: animation.buttonTapScale }}
        onClick={onRunAgain}
        className={`w-full sm:w-auto px-10 py-4 rounded-xl font-semibold text-lg ${themeClasses.primary} border-2 ${themeClasses.border} bg-transparent shadow-2xl hover:bg-opacity-10 transition-all`}
        type="button"
      >
        <span className="inline-flex items-center gap-3">
          <span className={themeClasses.accent}>{icons.runAgain}</span>
          {i18n.results.runAgain}
        </span>
      </motion.button>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: animation.buttonHoverScale }}
          whileTap={{ scale: animation.buttonTapScale }}
          onClick={onSettings}
          className={`px-5 py-2 rounded-lg text-sm font-medium ${themeClasses.secondary} border ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <span className={themeClasses.accent}>{icons.settings}</span>
            {i18n.results.settings}
          </span>
        </motion.button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium ${themeClasses.secondary} border ${themeClasses.border} opacity-50 cursor-not-allowed`}
          type="button"
          aria-disabled="true"
          title={`${i18n.results.history}${i18n.results.historySoonSuffix}`}
        >
          <span className="inline-flex items-center gap-2">
            <span className={themeClasses.accent}>{icons.history}</span>
            {i18n.results.history}
          </span>
        </button>
      </div>
    </motion.div>
  )
}

export default ResultsActions
