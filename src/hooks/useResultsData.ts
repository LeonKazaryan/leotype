import { useMemo } from 'react'
import { useTypingStore } from '../store/useTypingStore'
import type { TestStats } from '../types'
import { buildChartData, buildSummarySegments, buildWpmSeries, getTypedCharacters, isPerfectRun } from '../utils/results'

export type ResultsData = {
  stats: TestStats
  isPerfect: boolean
  typedCharacters: number
  summarySegments: string[]
  chart: ReturnType<typeof buildChartData>
}

export const useResultsData = (stats: TestStats | null, wpmSeries?: number[]): ResultsData | null => {
  const language = useTypingStore((state) => state.settings.language)
  return useMemo(() => {
    if (!stats) return null

    const isPerfect = isPerfectRun(stats)
    const typedCharacters = getTypedCharacters(stats)
    const series = wpmSeries && wpmSeries.length > 0 ? wpmSeries : buildWpmSeries(stats)
    const chart = buildChartData(series)
    const summarySegments = buildSummarySegments(stats, language)

    return {
      stats,
      isPerfect,
      typedCharacters,
      summarySegments,
      chart,
    }
  }, [stats, language, wpmSeries])
}
