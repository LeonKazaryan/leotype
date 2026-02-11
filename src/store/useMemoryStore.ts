import { create } from 'zustand'
import type { AIDifficulty, LanguageCode } from '../types'
import type { MemoryCard, MemoryPhase, MemoryResults, MemorySlot } from '../types/memory'
import { memoryConfig } from '../config/memory'
import { generateMemoryWords } from '../services/memoryService'
import {
  buildMemoryCards,
  buildMemorySlots,
  evaluateMemoryResults,
  getNextSlotIndex,
  getSlotIndexByGuess,
  isAllSlotsFilled,
  isValidMemoryGuess,
  truncateInput,
} from '../utils/memory'

interface MemorySessionParams {
  difficulty: AIDifficulty
  language: LanguageCode
  topic: string
}

interface MemoryStore {
  phase: MemoryPhase
  cards: MemoryCard[]
  currentIndex: number
  remainingMs: number
  slots: MemorySlot[]
  inputValue: string
  isLoading: boolean
  error: string | null
  orderRequired: boolean
  showHints: boolean
  lastFilledSlotId: string | null
  inputShakeKey: number
  results: MemoryResults | null
  filledOrder: number[]
  recallStartedAt: number | null

  startSession: (params: MemorySessionParams) => Promise<void>
  setRemainingMs: (ms: number) => void
  advanceCard: () => void
  goToRecall: () => void
  updateInput: (value: string) => void
  submitInput: () => void
  removeLast: () => void
  resetSession: () => void
}

const defaultState = {
  phase: 'idle' as MemoryPhase,
  cards: [],
  currentIndex: 0,
  remainingMs: 0,
  slots: [],
  inputValue: '',
  isLoading: false,
  error: null,
  orderRequired: false,
  showHints: false,
  lastFilledSlotId: null,
  inputShakeKey: 0,
  results: null,
  filledOrder: [],
  recallStartedAt: null,
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  ...defaultState,

  startSession: async ({ difficulty, language, topic }) => {
    const difficultyConfig = memoryConfig.difficulty[difficulty]
    set({
      ...defaultState,
      phase: 'loading',
      isLoading: true,
      orderRequired: difficultyConfig.orderRequired,
      showHints: difficultyConfig.showHints,
    })

    try {
      const words = await generateMemoryWords({
        count: difficultyConfig.cardCount,
        difficulty,
        language,
        topic,
      })

      const cards = buildMemoryCards(words, difficultyConfig)
      const slots = buildMemorySlots(words, difficultyConfig.showHints, difficultyConfig.hintStyle)

      set({
        phase: 'memorize',
        isLoading: false,
        cards,
        slots,
        currentIndex: 0,
        remainingMs: cards[0]?.durationMs ?? 0,
        orderRequired: difficultyConfig.orderRequired,
        showHints: difficultyConfig.showHints,
      })
    } catch (error) {
      set({
        ...defaultState,
        phase: 'idle',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  setRemainingMs: (ms) => {
    set({ remainingMs: ms })
  },

  advanceCard: () => {
    const { currentIndex, cards } = get()
    if (currentIndex < cards.length - 1) {
      set({ currentIndex: currentIndex + 1 })
      return
    }
    set({ phase: 'transition', remainingMs: 0 })
  },

  goToRecall: () => {
    set({ phase: 'recall', recallStartedAt: Date.now(), inputValue: '' })
  },

  updateInput: (value) => {
    set({ inputValue: truncateInput(value) })
  },

  submitInput: () => {
    const { inputValue, slots, orderRequired, filledOrder } = get()
    const trimmed = inputValue.trim()

    if (!isValidMemoryGuess(trimmed)) {
      set({ inputValue: '' })
      return
    }

    let updatedSlots = slots
    let filledIndex = -1

    if (orderRequired) {
      filledIndex = getNextSlotIndex(slots)
      if (filledIndex === -1) {
        set({ inputValue: '' })
        return
      }
      updatedSlots = slots.map((slot, index) =>
        index === filledIndex ? { ...slot, guess: trimmed } : slot
      )
    } else {
      const matchedIndex = getSlotIndexByGuess(slots, trimmed)
      if (matchedIndex === -1) {
        const nextIndex = getNextSlotIndex(slots)
        if (nextIndex === -1) {
          set({ inputValue: '' })
          return
        }
        filledIndex = nextIndex
      } else {
        filledIndex = matchedIndex
      }
      updatedSlots = slots.map((slot, index) =>
        index === filledIndex ? { ...slot, guess: trimmed } : slot
      )
    }

    const updatedFilledOrder = orderRequired ? filledOrder : [...filledOrder, filledIndex]

    set({
      slots: updatedSlots,
      inputValue: '',
      lastFilledSlotId: updatedSlots[filledIndex]?.id ?? null,
      filledOrder: updatedFilledOrder,
    })

    if (isAllSlotsFilled(updatedSlots)) {
      const results = evaluateMemoryResults(updatedSlots, orderRequired)
      set({ phase: 'results', results })
    }
  },

  removeLast: () => {
    const { slots, orderRequired, filledOrder } = get()

    if (orderRequired) {
      const lastIndex = [...slots].reverse().findIndex((slot) => slot.guess.trim().length > 0)
      if (lastIndex === -1) return
      const actualIndex = slots.length - 1 - lastIndex
      const updatedSlots = slots.map((slot, index) =>
        index === actualIndex ? { ...slot, guess: '' } : slot
      )
      set({ slots: updatedSlots, lastFilledSlotId: updatedSlots[actualIndex]?.id ?? null })
      return
    }

    const remainingOrder = [...filledOrder]
    const lastFilledIndex = remainingOrder.pop()
    if (lastFilledIndex === undefined) return
    const updatedSlots = slots.map((slot, index) =>
      index === lastFilledIndex ? { ...slot, guess: '' } : slot
    )
    set({
      slots: updatedSlots,
      lastFilledSlotId: updatedSlots[lastFilledIndex]?.id ?? null,
      filledOrder: remainingOrder,
    })
  },

  resetSession: () => {
    set({ ...defaultState })
  },
}))
