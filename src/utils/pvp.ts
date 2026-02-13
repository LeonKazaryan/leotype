import { pvpConfig } from '../config/pvp'

export const sanitizeRoomCode = (value: string) =>
  value.replace(/\s+/g, '').toUpperCase().slice(0, pvpConfig.roomCode.length)

export const createRoomCode = () => {
  const { alphabet, length } = pvpConfig.roomCode
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('')
}

export const clampWordCount = (value: number) => {
  const { min, max, step } = pvpConfig.settings.wordCount
  const rounded = Math.round(value / step) * step
  return Math.max(min, Math.min(max, rounded))
}

export const getProgress = (typedLength: number, totalLength: number) => {
  if (totalLength <= 0) return 0
  return Math.min(typedLength / totalLength, 1)
}

export const buildRoomName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return pvpConfig.room.defaultName
  return trimmed.slice(0, pvpConfig.room.nameMaxLength)
}

export const randomPing = () => {
  const { min, max } = pvpConfig.mock.pingRangeMs
  return Math.round(min + Math.random() * (max - min))
}
