import { useTypingStore } from '../store/useTypingStore'
import { useResultsData } from '../hooks/useResultsData'
import { useResultsOverlay } from '../hooks/useResultsOverlay'
import { getThemeClasses } from '../utils/themes'
import ResultsOverlay from './results/ResultsOverlay'
import ResultsView from './results/ResultsView'

function Stats() {
  const testState = useTypingStore((state) => state.testState)
  const settings = useTypingStore((state) => state.settings)
  const generateNewText = useTypingStore((state) => state.generateNewText)
  const goToSettings = useTypingStore((state) => state.goToSettings)
  const themeClasses = getThemeClasses(settings.theme)
  const results = useResultsData(testState.stats, testState.wpmSeries)
  const showOverlay = useResultsOverlay(testState.isFinished, !!testState.stats)
  
  if (!results) {
    return null
  }

  return (
    <ResultsOverlay isVisible={showOverlay} themeClasses={themeClasses}>
      <ResultsView
        wpm={results.stats.wpm}
        accuracy={results.stats.accuracy}
        isPerfect={results.isPerfect}
        chart={results.chart}
        summarySegments={results.summarySegments}
        onRunAgain={generateNewText}
        onSettings={goToSettings}
        themeClasses={themeClasses}
      />
    </ResultsOverlay>
  )
}

export default Stats
