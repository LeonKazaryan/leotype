import type { AIDifficulty } from '../types'

export type MemoryHintStyle = 'first_letter' | 'length' | 'none'

export interface MemoryDifficultyConfig {
  cardCount: number
  minMs: number
  maxMs: number
  orderRequired: boolean
  showHints: boolean
  hintStyle: MemoryHintStyle
}

const cardCount = 5

export const memoryConfig = {
  difficulty: {
    easy: {
      cardCount,
      minMs: 1200,
      maxMs: 1500,
      orderRequired: false,
      showHints: true,
      hintStyle: 'first_letter',
    },
    medium: {
      cardCount,
      minMs: 800,
      maxMs: 1000,
      orderRequired: true,
      showHints: false,
      hintStyle: 'none',
    },
    hard: {
      cardCount,
      minMs: 500,
      maxMs: 700,
      orderRequired: true,
      showHints: false,
      hintStyle: 'none',
    },
  } satisfies Record<AIDifficulty, MemoryDifficultyConfig>,
  timer: {
    tickMs: 50,
    displayDecimals: 1,
  },
  exposure: {
    stepMs: 100,
  },
  transition: {
    toRecallMs: 400,
  },
  hints: {
    placeholderChar: '_',
    separator: ' ',
  },
  input: {
    submitKeys: ['Enter', ' '] as const,
    backspaceKey: 'Backspace',
    maxWordLength: 32,
    placeholderStartIndex: 1,
  },
  errors: {
    dictionaryInsufficient: 'DICTIONARY_INSUFFICIENT',
    insufficientWords: 'MEMORY_INSUFFICIENT_WORDS',
  },
  ui: {
    animation: {
      containerInDuration: 0.35,
      containerInScale: 0.96,
      spinnerRotationDuration: 1,
      cardEnter: {
        rotateX: -12,
        y: 20,
      },
      cardExit: {
        rotateX: 10,
        y: -10,
      },
      slotPopScale: [0.92, 1.06, 1],
      inputShakeOffsets: [0, -6, 6, -4, 4, 0],
      overlayScale: 0.95,
      resultsCardEnter: {
        rotateY: 90,
        y: 10,
      },
      cardInDuration: 0.35,
      cardOutDuration: 0.25,
      cardStaggerDelay: 0.05,
      slotPopDuration: 0.25,
      inputShakeDuration: 0.3,
      progressDuration: 0.25,
      overlayFadeDuration: 0.35,
      resultsFlipDuration: 0.4,
      resultsStaggerDelay: 0.08,
    },
    statusClasses: {
      correct: 'border-emerald-500/60 text-emerald-200',
      incorrect: 'border-rose-500/60 text-rose-200',
      misordered: 'border-amber-400/70 text-amber-200',
      missing: 'border-slate-500/40 text-slate-300',
    },
    slotClasses: {
      filled: 'border-emerald-400/40 text-emerald-100',
      empty: 'border-dashed border-white/20 text-white/40',
      hint: 'text-white/50',
    },
    cardClasses: {
      container:
        'relative rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden',
      glow: 'shadow-primary-500/20',
      sheen:
        "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-transparent before:opacity-60",
    },
  },
}
