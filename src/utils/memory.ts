import { memoryConfig, type MemoryDifficultyConfig, type MemoryHintStyle } from '../config/memory'
import type { MemoryCard, MemorySlot, MemoryResults, MemoryResultSlot, MemorySlotStatus } from '../types/memory'

const wordSplitRegex = /\s+/
const wordNormalizeRegex = /[^\p{L}\p{N}]+/gu

const createMemoryId = (prefix: string, index: number) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${index}`
}

export const splitTextToWords = (text: string) => {
  return text
    .split(wordSplitRegex)
    .map((token) => token.trim())
    .filter(Boolean)
}

export const normalizeMemoryWord = (word: string) => {
  return word.trim().toLowerCase().replace(wordNormalizeRegex, '')
}

const buildHintPlaceholder = (length: number, includeFirstLetter: boolean, word: string) => {
  if (length <= 0) return ''
  const { placeholderChar, separator } = memoryConfig.hints
  if (!includeFirstLetter) {
    return new Array(length).fill(placeholderChar).join(separator)
  }
  const firstLetter = word.slice(0, 1)
  const tail = new Array(Math.max(0, length - 1)).fill(placeholderChar).join(separator)
  return [firstLetter, tail].filter(Boolean).join(separator)
}

export const buildMemoryHint = (word: string, hintStyle: MemoryHintStyle) => {
  if (hintStyle === 'none') return ''
  const length = word.length
  if (hintStyle === 'length') {
    return buildHintPlaceholder(length, false, word)
  }
  return buildHintPlaceholder(length, true, word)
}

const getRandomDurationMs = (config: MemoryDifficultyConfig) => {
  const step = memoryConfig.exposure.stepMs
  const min = config.minMs
  const max = config.maxMs
  const steps = Math.max(0, Math.floor((max - min) / step))
  const offset = Math.floor(Math.random() * (steps + 1))
  return min + offset * step
}

export const buildMemoryCards = (words: string[], config: MemoryDifficultyConfig): MemoryCard[] => {
  return words.map((word, index) => ({
    id: createMemoryId('memory-card', index),
    word,
    durationMs: getRandomDurationMs(config),
  }))
}

export const buildMemorySlots = (
  words: string[],
  showHints: boolean,
  hintStyle: MemoryHintStyle
): MemorySlot[] => {
  return words.map((word, index) => ({
    id: createMemoryId('memory-slot', index),
    target: word,
    guess: '',
    hint: showHints ? buildMemoryHint(word, hintStyle) : '',
  }))
}

export const formatMemorySeconds = (ms: number) => {
  const seconds = ms / 1000
  return `${seconds.toFixed(memoryConfig.timer.displayDecimals)}s`
}

export const getMemorizeProgress = (cards: MemoryCard[], currentIndex: number, remainingMs: number) => {
  if (cards.length === 0) return 0
  const currentCard = cards[currentIndex]
  if (!currentCard) return 0
  const cardProgress = (currentCard.durationMs - remainingMs) / currentCard.durationMs
  const overall = (currentIndex + Math.min(Math.max(cardProgress, 0), 1)) / cards.length
  return Math.min(Math.max(overall * 100, 0), 100)
}

export const getRecallProgress = (slots: MemorySlot[]) => {
  if (slots.length === 0) return 0
  const filled = slots.filter((slot) => slot.guess.trim().length > 0).length
  return (filled / slots.length) * 100
}

export const evaluateMemoryResults = (slots: MemorySlot[], orderRequired: boolean): MemoryResults => {
  const normalizedTargets = slots.map((slot) => normalizeMemoryWord(slot.target))
  let correct = 0
  let incorrect = 0
  let misordered = 0
  let missing = 0

  const resultSlots: MemoryResultSlot[] = slots.map((slot, index) => {
    const guessNormalized = normalizeMemoryWord(slot.guess)
    let status: MemorySlotStatus = 'missing'

    if (!slot.guess) {
      status = 'missing'
      missing += 1
    } else if (guessNormalized === normalizedTargets[index]) {
      status = 'correct'
      correct += 1
    } else if (orderRequired && normalizedTargets.includes(guessNormalized)) {
      status = 'misordered'
      misordered += 1
    } else {
      status = 'incorrect'
      incorrect += 1
    }

    return {
      ...slot,
      status,
    }
  })

  const total = slots.length
  const perfect = correct === total

  return {
    slots: resultSlots,
    total,
    correct,
    incorrect,
    misordered,
    missing,
    perfect,
  }
}

export const truncateInput = (value: string) => {
  if (value.length <= memoryConfig.input.maxWordLength) return value
  return value.slice(0, memoryConfig.input.maxWordLength)
}

export const isValidMemoryGuess = (guess: string) => {
  return normalizeMemoryWord(guess).length > 0
}

export const getRemainingSlotsCount = (slots: MemorySlot[]) => {
  return slots.filter((slot) => slot.guess.trim().length === 0).length
}

export const getNextSlotIndex = (slots: MemorySlot[]) => {
  return slots.findIndex((slot) => slot.guess.trim().length === 0)
}

export const getSlotIndexByGuess = (slots: MemorySlot[], guess: string) => {
  const normalizedGuess = normalizeMemoryWord(guess)
  if (!normalizedGuess) return -1
  return slots.findIndex(
    (slot) => slot.guess.trim().length === 0 && normalizeMemoryWord(slot.target) === normalizedGuess
  )
}

export const isAllSlotsFilled = (slots: MemorySlot[]) => {
  return slots.every((slot) => slot.guess.trim().length > 0)
}
