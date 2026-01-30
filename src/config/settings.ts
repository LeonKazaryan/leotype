import type { AIDifficulty, TestMode, Theme } from '../types'

export const settingsOptions = {
  modes: ['time', 'words', 'quote'] as TestMode[],
  themes: ['dark', 'light', 'neon', 'ocean', 'forest'] as Theme[],
  timeOptions: [10, 15, 25, 30, 60],
  wordOptions: [15, 20, 25, 50],
  aiDifficultyOptions: {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴',
  } satisfies Record<AIDifficulty, string>,
}
