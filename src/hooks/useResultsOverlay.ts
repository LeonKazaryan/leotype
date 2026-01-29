import { useEffect, useState } from 'react'
import { resultsViewConfig } from '../config/resultsView'

export const useResultsOverlay = (isFinished: boolean, hasStats: boolean): boolean => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isFinished || !hasStats) {
      setVisible(false)
      return
    }

    const timer = window.setTimeout(() => setVisible(true), resultsViewConfig.overlay.delayMs)
    return () => window.clearTimeout(timer)
  }, [isFinished, hasStats])

  return visible
}
