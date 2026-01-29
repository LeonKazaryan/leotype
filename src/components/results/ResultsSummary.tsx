import { motion } from 'framer-motion'
import { resultsViewConfig } from '../../config/resultsView'

interface ResultsSummaryProps {
  segments: string[]
  themeClasses: {
    primary: string
    secondary: string
  }
}

const { animation, labels } = resultsViewConfig

function ResultsSummary({ segments, themeClasses }: ResultsSummaryProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: animation.containerYOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.summaryDelay }}
      className={`text-sm md:text-base text-center ${themeClasses.secondary}`}
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        return (
          <span key={`${index}-${segment}`}>
            <span className={isLast ? themeClasses.primary : themeClasses.secondary}>{segment}</span>
            {!isLast && <span className="px-2">{labels.summarySeparator}</span>}
          </span>
        )
      })}
    </motion.p>
  )
}

export default ResultsSummary
