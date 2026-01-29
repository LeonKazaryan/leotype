import { motion } from 'framer-motion'
import AnimatedNumber from '../AnimatedNumber'
import { resultsViewConfig } from '../../config/resultsView'

interface ResultsHeroProps {
  wpm: number
  accuracy: number
  isPerfect: boolean
  themeClasses: {
    primary: string
    secondary: string
    accent: string
  }
}

const { animation, icons, labels, format } = resultsViewConfig

function ResultsHero({ wpm, accuracy, isPerfect, themeClasses }: ResultsHeroProps) {
  return (
    <div className="text-center space-y-3">
      <motion.div
        initial={{ opacity: 0, y: animation.containerYOffset }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.wpmDelay }}
        className="flex items-end justify-center gap-3"
      >
        <span className={`text-2xl ${themeClasses.accent}`}>{icons.wpm}</span>
        <span className={`text-6xl md:text-7xl font-bold ${themeClasses.primary} glow-text`}>
          <AnimatedNumber value={wpm} decimals={format.wpmDecimals} />
        </span>
        <span className={`text-xl md:text-2xl font-semibold ${themeClasses.secondary}`}>
          {labels.wpm}
        </span>
      </motion.div>

      {isPerfect && (
        <motion.div
          initial={{ opacity: 0, y: animation.containerYOffset }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.perfectDelay }}
          className={`text-sm md:text-base tracking-widest ${themeClasses.primary}`}
        >
          {labels.perfectRun}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: animation.containerYOffset }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.accuracyDelay }}
        className={`text-base md:text-lg ${themeClasses.secondary}`}
      >
        {labels.accuracy}{' '}
        <span className={`font-semibold ${themeClasses.primary}`}>
          <AnimatedNumber value={accuracy} decimals={format.accuracyDecimals} />%
        </span>
      </motion.div>
    </div>
  )
}

export default ResultsHero
