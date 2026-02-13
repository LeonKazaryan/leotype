import { pvpConfig } from '../config/pvp.js'
import { randomBytes } from 'crypto'

export const createRoomCode = () => {
  const { codeAlphabet, codeLength } = pvpConfig.room
  const values = randomBytes(codeLength)
  return Array.from(values, (value) => codeAlphabet[value % codeAlphabet.length]).join('')
}

export const normalizeRoomName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return pvpConfig.room.defaultName
  return trimmed.slice(0, pvpConfig.room.nameMaxLength)
}

export const clampWordCount = (value: number) => {
  const { min, max, step } = pvpConfig.settings.wordCount
  const rounded = Math.round(value / step) * step
  return Math.max(min, Math.min(max, rounded))
}
