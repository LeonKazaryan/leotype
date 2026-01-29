import { resultsViewConfig } from '../config/resultsView'
import { TestStats } from '../types'

export type ChartPoint = { x: number; y: number }

export type ChartData = {
  width: number
  height: number
  linePath: string
  areaPath: string
  points: ChartPoint[]
  gridY: number[]
}

const { chart, format, labels, series } = resultsViewConfig

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const lerp = (start: number, end: number, t: number) => start + (end - start) * t

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export const isPerfectRun = (stats: TestStats): boolean => {
  return stats.characters.incorrect + stats.characters.extra + stats.characters.missed === 0
}

export const getTypedCharacters = (stats: TestStats): number => {
  return stats.characters.correct + stats.characters.incorrect + stats.characters.extra
}

export const buildWpmSeries = (stats: TestStats): number[] => {
  const baseWpm = Math.max(stats.wpm, series.minValue)
  const start = baseWpm * series.startFactor
  const end = baseWpm * series.endFactor

  return Array.from({ length: series.points }, (_, index) => {
    const t = series.points === 1 ? 1 : index / (series.points - 1)
    const eased = easeOutCubic(t)
    const wave = Math.sin(t * Math.PI * series.waveFrequency) * series.waveAmplitude
    return clamp(lerp(start, end, eased) * (1 + wave), series.minValue, baseWpm * series.endFactor)
  })
}

const buildPath = (points: ChartPoint[]): string => {
  if (points.length === 0) return ''
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
}

export const buildChartData = (values: number[]): ChartData => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = chart.width
  const height = chart.height
  const innerWidth = width - chart.paddingX * 2
  const innerHeight = height - chart.paddingY * 2

  const points = values.map((value, index) => {
    const t = values.length === 1 ? 1 : index / (values.length - 1)
    const x = chart.paddingX + innerWidth * t
    const y = chart.paddingY + innerHeight * (1 - (value - min) / range)
    return { x, y }
  })

  const linePath = buildPath(points)
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const areaPath = `${linePath} L ${lastPoint.x},${height - chart.paddingY} L ${firstPoint.x},${height - chart.paddingY} Z`

  const gridY = Array.from({ length: chart.gridLines }, (_, index) => {
    if (chart.gridLines === 1) {
      return chart.paddingY + innerHeight / 2
    }
    return chart.paddingY + (innerHeight / (chart.gridLines - 1)) * index
  })

  return {
    width,
    height,
    linePath,
    areaPath,
    points,
    gridY,
  }
}

export const buildSummarySegments = (stats: TestStats): string[] => {
  const timeValue = stats.time.toFixed(format.timeDecimals)
  const typedCharacters = getTypedCharacters(stats)
  const description = isPerfectRun(stats) ? labels.cleanRun : labels.imperfectRun

  return [
    `${labels.summaryPrefix} ${timeValue}${labels.timeUnit}`,
    `${typedCharacters} ${labels.characters}`,
    description,
  ]
}
