import { rankedConfig } from '../config/ranked.js'
import type { RankedResult } from '../types/ranked.js'

export const clampProgress = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export const clampInt = (value: number, max: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(Math.floor(value), Math.floor(max)))
}

export const calculateEloDelta = (ratingA: number, ratingB: number, result: RankedResult) => {
  const k = rankedConfig.rating.kFactor
  const expectedA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
  const scoreA = result === 'WIN' ? 1 : result === 'DRAW' ? 0.5 : 0
  return Math.round(k * (scoreA - expectedA))
}

export const sumToAverage = (sum: number, count: number) => {
  if (count <= 0) return 0
  return Math.round(sum / count)
}
