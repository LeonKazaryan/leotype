import { create } from 'zustand'
import { TestSettings, TestState, TestMode, Theme, AIDifficulty } from '../types'
import { generateText } from '../utils/textGenerator'
import { generateTextWithAI } from '../utils/aiGenerator'
import { generateTextFromDictionary } from '../utils/dictionaryText'
import { calculateStats } from '../utils/stats'
import { buildWpmSeriesFromTimestamps, updateInputTimestamps } from '../utils/typingMetrics'

interface TypingStore {
    settings: TestSettings
    testState: TestState
    text: string
    showGame: boolean
    dictionaryUnavailable: boolean

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
    setDictionaryUnavailable: (open: boolean) => void
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
    inputTimestamps: [],
    wpmSeries: [],
}

export const useTypingStore = create<TypingStore>((set, get) => ({
    settings: defaultSettings,
    testState: defaultTestState,
    text: '',
    showGame: false,
    dictionaryUnavailable: false,

    setMode: (mode) => {
        set((state) => {
            const newSettings = mode === 'quote'
                ? { ...state.settings, mode, useAI: true }
                : { ...state.settings, mode }
            return { settings: newSettings }
        })

        const { settings } = get()
        if (!settings.useAI && get().showGame) {
            const wordCount = settings.mode === 'time'
                ? Math.ceil(settings.time * 2.5)
                : settings.words

            set({ testState: { ...get().testState, isGeneratingAI: true }, dictionaryUnavailable: false })
            generateTextFromDictionary(settings.mode, wordCount, settings.aiDifficulty)
                .then((text) => {
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch(() => {
                    set({
                        text: '',
                        testState: { ...get().testState, isGeneratingAI: false },
                        dictionaryUnavailable: true,
                    })
                })
        }
    },

    setTime: (time) => {
        set((state) => ({ settings: { ...state.settings, time } }))
    },

    setWords: (words) => {
        set((state) => {
            const newSettings = { ...state.settings, words }
            return { settings: newSettings }
        })

        const { settings } = get()
        if (!settings.useAI && get().showGame) {
            const wordCount = settings.mode === 'time'
                ? Math.ceil(settings.time * 2.5)
                : settings.words

            set({ testState: { ...get().testState, isGeneratingAI: true }, dictionaryUnavailable: false })
            generateTextFromDictionary(settings.mode, wordCount, settings.aiDifficulty)
                .then((text) => {
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch(() => {
                    set({
                        text: '',
                        testState: { ...get().testState, isGeneratingAI: false },
                        dictionaryUnavailable: true,
                    })
                })
        }
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
            settings: state.settings.mode === 'quote'
                ? { ...state.settings, useAI: true }
                : { ...state.settings, useAI: !state.settings.useAI },
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
    setDictionaryUnavailable: (open) => {
        set({ dictionaryUnavailable: open })
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
                inputTimestamps: [],
                wpmSeries: [],
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
        const now = Date.now()
        const nextTimestamps = updateInputTimestamps(
            testState.inputTimestamps,
            testState.userInput.length,
            input.length,
            now
        )

        set((state) => ({
            testState: {
                ...state.testState,
                userInput: input,
                currentIndex: newIndex,
                inputTimestamps: nextTimestamps,
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
        const wpmSeries = buildWpmSeriesFromTimestamps(testState.inputTimestamps, testState.startTime, endTime)

        set({
            testState: {
                ...testState,
                isActive: false,
                isFinished: true,
                endTime,
                stats,
                wpmSeries,
            },
        })
    },

    resetTest: () => {
        const { settings, testState } = get()

        if (testState.isGeneratingAI) {
            return
        }

        if (settings.mode === 'quote' && (!settings.useAI || settings.aiTopic.trim().length === 0)) {
            return
        }

        const updatedSettings = settings

        set({
            settings: updatedSettings,
            testState: { ...defaultTestState, isGeneratingAI: updatedSettings.useAI },
        })
        if (updatedSettings.useAI) {
            set({ dictionaryUnavailable: false })
        }

        if (updatedSettings.useAI) {
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

            set({
                testState: { ...get().testState, isGeneratingAI: true },
            })

            generateTextFromDictionary(updatedSettings.mode, wordCount, updatedSettings.aiDifficulty)
                .then((text) => {
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch(() => {
                    set({
                        text: '',
                        testState: { ...get().testState, isGeneratingAI: false },
                        dictionaryUnavailable: true,
                    })
                })
        }
    },

    generateNewText: () => {
        const { settings, testState } = get()

        if (testState.isGeneratingAI) {
            return
        }

        if (settings.mode === 'quote' && (!settings.useAI || settings.aiTopic.trim().length === 0)) {
            return
        }

        const updatedSettings = settings

        set({
            settings: updatedSettings,
            testState: { ...defaultTestState, isGeneratingAI: updatedSettings.useAI },
            showGame: true,
        })
        if (updatedSettings.useAI) {
            set({ dictionaryUnavailable: false })
        }

        if (updatedSettings.useAI) {
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

            set({
                testState: { ...get().testState, isGeneratingAI: true },
            })

            generateTextFromDictionary(updatedSettings.mode, wordCount, updatedSettings.aiDifficulty)
                .then((text) => {
                    set({
                        text,
                        testState: { ...get().testState, isGeneratingAI: false },
                    })
                })
                .catch(() => {
                    set({
                        text: '',
                        testState: { ...get().testState, isGeneratingAI: false },
                        dictionaryUnavailable: true,
                    })
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
