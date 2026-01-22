import { create } from 'zustand'
import { TestSettings, TestState, TestMode, Theme, AIDifficulty } from '../types'
import { generateText } from '../utils/textGenerator'
import { generateTextWithAI } from '../utils/aiGenerator'
import { calculateStats } from '../utils/stats'

interface TypingStore {
    settings: TestSettings
    testState: TestState
    text: string
    showGame: boolean

    setMode: (mode: TestMode) => void
    setTime: (time: number) => void
    setWords: (words: number) => void
    setTheme: (theme: Theme) => void
    toggleKeyboard: () => void
    toggleSound: () => void
    toggleAI: () => void
    setAITopic: (topic: string) => void
    setAIDifficulty: (difficulty: AIDifficulty) => void

    startTest: () => void
    updateInput: (input: string) => void
    finishTest: () => void
    resetTest: () => void

    generateNewText: () => void
    goToSettings: () => void
}

const defaultSettings: TestSettings = {
    mode: 'words',
    time: 15,
    words: 20,
    theme: 'dark',
    showKeyboard: false,
    soundEnabled: true,
    useAI: false,
    aiTopic: '',
    aiDifficulty: 'medium',
}

const defaultTestState: TestState = {
    isActive: false,
    isFinished: false,
    currentIndex: 0,
    userInput: '',
    startTime: null,
    endTime: null,
    stats: null,
    isGeneratingAI: false,
}

export const useTypingStore = create<TypingStore>((set, get) => ({
    settings: defaultSettings,
    testState: defaultTestState,
    text: generateText(defaultSettings.mode, defaultSettings.words),
    showGame: false,

    setMode: (mode) => {
        set((state) => {
            const newSettings = { ...state.settings, mode }
            const newText = generateText(newSettings.mode, newSettings.words)

            return {
                settings: newSettings,
                text: newText,
            }
        })
    },

    setTime: (time) => {
        set((state) => ({ settings: { ...state.settings, time } }))
    },

    setWords: (words) => {
        set((state) => {
            const newSettings = { ...state.settings, words }
            const newText = generateText(newSettings.mode, words)

            return {
                settings: newSettings,
                text: newText,
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

    toggleAI: () => {
        set((state) => ({
            settings: { ...state.settings, useAI: !state.settings.useAI },
        }))
    },

    setAITopic: (topic) => {
        set((state) => ({
            settings: { ...state.settings, aiTopic: topic },
        }))
    },

    setAIDifficulty: (difficulty) => {
        set((state) => ({
            settings: { ...state.settings, aiDifficulty: difficulty },
        }))
    },

    startTest: () => {
        const { settings, testState } = get()

        if (testState.isGeneratingAI) {
            return
        }

        const startTime = Date.now()

        set({
            testState: {
                ...testState,
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

        if (!testState.isActive || testState.isFinished || testState.isGeneratingAI) return

        const newIndex = input.length
        const isComplete = newIndex >= text.length

        set((state) => ({
            testState: {
                ...state.testState,
                userInput: input,
                currentIndex: newIndex,
            },
        }))

        if (settings.mode === 'words' && isComplete) {
            get().finishTest()
        }
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
        const { settings, testState } = get()

        if (testState.isGeneratingAI) {
            return
        }

        // Автоматически включаем AI, если введена тематика
        const shouldUseAI = settings.useAI || !!(settings.aiTopic && settings.aiTopic.trim().length > 0)
        const updatedSettings = shouldUseAI && !settings.useAI
            ? { ...settings, useAI: true }
            : settings

        set({
            settings: updatedSettings,
            testState: { ...defaultTestState, isGeneratingAI: shouldUseAI },
        })

        if (shouldUseAI) {
            // Для режима времени вычисляем количество слов на основе времени (примерно 2.5 слова в секунду)
            const wordCount = updatedSettings.mode === 'time'
                ? Math.ceil(updatedSettings.time * 2.5)
                : updatedSettings.words

            if (import.meta.env.DEV) {
                console.log('Generating AI text (resetTest):', {
                    mode: updatedSettings.mode,
                    wordCount,
                    topic: updatedSettings.aiTopic,
                    difficulty: updatedSettings.aiDifficulty
                })
            }

            generateTextWithAI(updatedSettings.mode, wordCount, updatedSettings.aiTopic, updatedSettings.aiDifficulty)
                .then((text) => {
                    if (import.meta.env.DEV) {
                        console.log('✅ AI text generated successfully (resetTest)')
                    }
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch((error) => {
                    if (error instanceof Error && error.message !== 'Request was cancelled') {
                        console.error('❌ Failed to generate AI text, using fallback:', error)
                        const fallbackWordCount = updatedSettings.mode === 'time'
                            ? Math.ceil(updatedSettings.time * 2.5)
                            : updatedSettings.words
                        const fallbackText = generateText(updatedSettings.mode, fallbackWordCount)
                        set({
                            text: fallbackText,
                            testState: { ...get().testState, isGeneratingAI: false },
                        })
                    } else {
                        set({
                            testState: { ...get().testState, isGeneratingAI: false },
                        })
                    }
                })
        } else {
            const wordCount = updatedSettings.mode === 'time'
                ? Math.ceil(updatedSettings.time * 2.5)
                : updatedSettings.words
            const newText = generateText(updatedSettings.mode, wordCount)
            set({
                text: newText,
            })
        }
    },

    generateNewText: () => {
        const { settings, testState } = get()

        if (testState.isGeneratingAI) {
            return
        }

        // Автоматически включаем AI, если введена тематика
        const shouldUseAI = settings.useAI || !!(settings.aiTopic && settings.aiTopic.trim().length > 0)
        const updatedSettings = shouldUseAI && !settings.useAI
            ? { ...settings, useAI: true }
            : settings

        set({
            settings: updatedSettings,
            testState: { ...defaultTestState, isGeneratingAI: shouldUseAI },
            showGame: true,
        })

        if (shouldUseAI) {
            // Для режима времени вычисляем количество слов на основе времени (примерно 2.5 слова в секунду)
            const wordCount = updatedSettings.mode === 'time'
                ? Math.ceil(updatedSettings.time * 2.5)
                : updatedSettings.words

            if (import.meta.env.DEV) {
                console.log('Generating AI text (generateNewText):', {
                    mode: updatedSettings.mode,
                    wordCount,
                    topic: updatedSettings.aiTopic,
                    difficulty: updatedSettings.aiDifficulty
                })
            }

            generateTextWithAI(updatedSettings.mode, wordCount, updatedSettings.aiTopic, updatedSettings.aiDifficulty)
                .then((text) => {
                    if (import.meta.env.DEV) {
                        console.log('✅ AI text generated successfully (generateNewText)')
                    }
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch((error) => {
                    if (error instanceof Error && error.message !== 'Request was cancelled') {
                        console.error('❌ Failed to generate AI text, using fallback:', error)
                        const fallbackWordCount = updatedSettings.mode === 'time'
                            ? Math.ceil(updatedSettings.time * 2.5)
                            : updatedSettings.words
                        const fallbackText = generateText(updatedSettings.mode, fallbackWordCount)
                        set({
                            text: fallbackText,
                            testState: { ...get().testState, isGeneratingAI: false },
                        })
                    } else {
                        set({
                            testState: { ...get().testState, isGeneratingAI: false },
                        })
                    }
                })
        } else {
            const wordCount = updatedSettings.mode === 'time'
                ? Math.ceil(updatedSettings.time * 2.5)
                : updatedSettings.words
            const newText = generateText(updatedSettings.mode, wordCount)
            set({
                text: newText,
            })
        }
    },

    goToSettings: () => {
        set({
            showGame: false,
            testState: defaultTestState,
        })
    },
}))
