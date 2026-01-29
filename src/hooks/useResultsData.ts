import { useMemo } from 'react'
import { TestStats } from '../types'
import { buildChartData, buildSummarySegments, buildWpmSeries, getTypedCharacters, isPerfectRun } from '../utils/results'

export type ResultsData = {
  stats: TestStats
  isPerfect: boolean
  typedCharacters: number
  summarySegments: string[]
  chart: ReturnType<typeof buildChartData>
}

export const useResultsData = (stats: TestStats | null): ResultsData | null => {
  return useMemo(() => {
    if (!stats) return null

    const isPerfect = isPerfectRun(stats)
    const typedCharacters = getTypedCharacters(stats)
    const series = buildWpmSeries(stats)
    const chart = buildChartData(series)
    const summarySegments = buildSummarySegments(stats)

    return {
      stats,
      isPerfect,
      typedCharacters,
      summarySegments,
      chart,
    }
  }, [stats])
}
