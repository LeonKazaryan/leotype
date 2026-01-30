import { motion } from 'framer-motion'
import { resultsViewConfig } from '../../config/resultsView'
import type { ChartData } from '../../utils/results'
import ResultsActions from './ResultsActions'
import ResultsChart from './ResultsChart'
import ResultsHero from './ResultsHero'
import ResultsSummary from './ResultsSummary'

interface ResultsViewProps {
  wpm: number
  accuracy: number
  isPerfect: boolean
  chart: ChartData
  summarySegments: string[]
  onRunAgain: () => void
  onSettings: () => void
  themeClasses: {
    primary: string
    secondary: string
    accent: string
    border: string
    card: string
  }
}

const { animation } = resultsViewConfig

function ResultsView({
  wpm,
  accuracy,
  isPerfect,
  chart,
  summarySegments,
  onRunAgain,
  onSettings,
  themeClasses,
}: ResultsViewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: animation.containerYOffset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -animation.containerYOffset }}
      transition={{ duration: animation.containerDuration, ease: animation.ease }}
      className={`relative overflow-hidden rounded-3xl border-2 ${themeClasses.border} ${themeClasses.card} px-6 py-10 md:px-10 shadow-2xl`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-24 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-current blur-3xl opacity-20 ${themeClasses.accent}`}
        />
        <div
          className={`absolute left-1/2 top-20 h-px w-4/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${themeClasses.accent}`}
        />
        <div
          className={`absolute left-1/2 bottom-24 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${themeClasses.accent}`}
        />
      </div>

      <div className="relative z-10 space-y-8">
        <ResultsHero wpm={wpm} accuracy={accuracy} isPerfect={isPerfect} themeClasses={themeClasses} />
        <ResultsChart chart={chart} themeClasses={themeClasses} />
        <ResultsSummary segments={summarySegments} themeClasses={themeClasses} />
        <ResultsActions onRunAgain={onRunAgain} onSettings={onSettings} themeClasses={themeClasses} />
      </div>
    </motion.section>
  )
}

export default ResultsView
