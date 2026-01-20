import { create } from 'zustand'
import { TestSettings, TestState, TestStats, TestMode, Theme } from '../types'
import { generateText } from '../utils/textGenerator'
import { calculateStats } from '../utils/stats'

interface TypingStore {
  settings: TestSettings
  testState: TestState
  text: string
  
  setMode: (mode: TestMode) => void
  setTime: (time: number) => void
  setWords: (words: number) => void
  setTheme: (theme: Theme) => void
  toggleKeyboard: () => void
  toggleSound: () => void
  
  startTest: () => void
  updateInput: (input: string) => void
  finishTest: () => void
  resetTest: () => void
  
  generateNewText: () => void
}

const defaultSettings: TestSettings = {
  mode: 'time',
  time: 30,
  words: 50,
  theme: 'dark',
  showKeyboard: false,
  soundEnabled: true,
}

const defaultTestState: TestState = {
  isActive: false,
  isFinished: false,
  currentIndex: 0,
  userInput: '',
  startTime: null,
  endTime: null,
  stats: null,
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  settings: defaultSettings,
  testState: defaultTestState,
  text: generateText(defaultSettings.mode, defaultSettings.words),
  
  setMode: (mode) => {
    set((state) => {
      const newSettings = { ...state.settings, mode }
      return {
        settings: newSettings,
        text: generateText(newSettings.mode, newSettings.words),
      }
    })
  },
  
  setTime: (time) => {
    set((state) => ({ settings: { ...state.settings, time } }))
  },
  
  setWords: (words) => {
    set((state) => {
      const newSettings = { ...state.settings, words }
      return {
        settings: newSettings,
        text: generateText(newSettings.mode, words),
      }
    })
  },
  
  setTheme: (theme) => {
    set((state) => ({ settings: { ...state.settings, theme } }))
  },
  
  toggleKeyboard: () => {
    set((state) => ({
      settings: { ...state.settings, showKeyboard: !state.settings.showKeyboard },
    }))
  },
  
  toggleSound: () => {
    set((state) => ({
      settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
    }))
  },
  
  startTest: () => {
    const { settings, text } = get()
    const startTime = Date.now()
    
    set({
      testState: {
        isActive: true,
        isFinished: false,
        currentIndex: 0,
        userInput: '',
        startTime,
        endTime: null,
        stats: null,
      },
    })
    
    if (settings.mode === 'time') {
      setTimeout(() => {
        const state = get()
        if (state.testState.isActive && !state.testState.isFinished) {
          get().finishTest()
        }
      }, settings.time * 1000)
    }
  },
  
  updateInput: (input) => {
    const { testState, text, settings } = get()
    
    if (!testState.isActive || testState.isFinished) return
    
    const newIndex = input.length
    const isComplete = newIndex >= text.length
    
    if (settings.mode === 'words' && isComplete) {
      get().finishTest()
      return
    }
    
    set((state) => ({
      testState: {
        ...state.testState,
        userInput: input,
        currentIndex: newIndex,
      },
    }))
  },
  
  finishTest: () => {
    const { testState, text } = get()
    
    if (!testState.isActive || testState.isFinished || !testState.startTime) return
    
    const endTime = Date.now()
    const timeSeconds = (endTime - testState.startTime) / 1000
    const stats = calculateStats(text, testState.userInput, timeSeconds)
    
    set({
      testState: {
        ...testState,
        isActive: false,
        isFinished: true,
        endTime,
        stats,
      },
    })
  },
  
  resetTest: () => {
    const { settings } = get()
    set({
      testState: defaultTestState,
      text: generateText(settings.mode, settings.words),
    })
  },
  
  generateNewText: () => {
    const { settings } = get()
    set({ text: generateText(settings.mode, settings.words) })
  },
}))
