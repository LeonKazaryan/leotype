export type TestMode = 'time' | 'words' | 'quote'

export type Theme = 'dark' | 'light' | 'neon' | 'ocean' | 'forest'

export interface TestSettings {
  mode: TestMode
  time: number
  words: number
  theme: Theme
  showKeyboard: boolean
  soundEnabled: boolean
  useAI: boolean
}

export interface TestStats {
  wpm: number
  accuracy: number
  time: number
  characters: {
    correct: number
    incorrect: number
    extra: number
    missed: number
  }
}

export interface TestState {
  isActive: boolean
  isFinished: boolean
  currentIndex: number
  userInput: string
  startTime: number | null
  endTime: number | null
  stats: TestStats | null
}
