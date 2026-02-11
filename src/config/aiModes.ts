import type { TestMode } from '../types'

export const aiModeMap = {
  time: 'time',
  words: 'words',
  quote: 'quote',
  memory: 'words',
} as const satisfies Record<TestMode, 'time' | 'words' | 'quote'>

export type AIMode = (typeof aiModeMap)[keyof typeof aiModeMap]
