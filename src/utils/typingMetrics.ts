import { typingMetricsConfig } from '../config/typingMetrics'

export const updateInputTimestamps = (
  previous: number[],
  prevLength: number,
  nextLength: number,
  now: number
): number[] => {
  if (nextLength === prevLength) {
    return previous
  }

  if (nextLength < prevLength) {
    return previous.slice(0, Math.max(nextLength, 0))
  }

  const delta = nextLength - prevLength
  const additions = Array.from({ length: delta }, () => now)
  return [...previous, ...additions]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

const smoothSeries = (values: number[]): number[] => {
  const windowSize = typingMetricsConfig.sampling.smoothingWindow
  if (windowSize <= 1) {
    return values
  }

  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const slice = values.slice(start, index + 1)
    return average(slice)
  })
}

export const buildWpmSeriesFromTimestamps = (
  timestamps: number[],
  startTime: number | null,
  endTime: number | null
): number[] => {
  if (!startTime || !endTime || timestamps.length === 0) {
    return []
  }

  const durationMs = Math.max(endTime - startTime, 0)
  const rawPoints = Math.ceil(durationMs / typingMetricsConfig.sampling.intervalMs) + 1
  const points = clamp(rawPoints, typingMetricsConfig.sampling.minPoints, typingMetricsConfig.sampling.maxPoints)
  const step = points <= 1 ? durationMs : durationMs / (points - 1)

  let startIndex = 0
  let endIndex = 0

  const values = Array.from({ length: points }, (_, index) => {
    const sampleTime = startTime + step * index
    const windowMs = Math.min(typingMetricsConfig.sampling.windowMs, Math.max(sampleTime - startTime, typingMetricsConfig.sampling.minWindowMs))

    while (endIndex < timestamps.length && timestamps[endIndex] <= sampleTime) {
      endIndex += 1
    }

    const windowStart = sampleTime - windowMs
    while (startIndex < timestamps.length && timestamps[startIndex] < windowStart) {
      startIndex += 1
    }

    const charsInWindow = Math.max(endIndex - startIndex, 0)
    const minutes = windowMs / typingMetricsConfig.time.msPerMinute
    const wpm = minutes > 0
      ? (charsInWindow / typingMetricsConfig.wpm.charsPerWord) / minutes
      : 0

    return Math.max(wpm, typingMetricsConfig.wpm.minValue)
  })

  return smoothSeries(values)
}
