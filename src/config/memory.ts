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
      correct: 'border-emerald-500/60 text-emerald-200 bg-emerald-500/5',
      incorrect: 'border-rose-500/60 text-rose-200 bg-rose-500/5',
      misordered: 'border-amber-400/70 text-amber-200 bg-amber-400/5',
      missing: 'border-slate-500/40 text-slate-300 bg-slate-500/5',
    },
    statusClassesLight: {
      correct: 'border-emerald-500/50 text-emerald-700 bg-emerald-50',
      incorrect: 'border-rose-500/50 text-rose-700 bg-rose-50',
      misordered: 'border-amber-500/60 text-amber-700 bg-amber-50',
      missing: 'border-slate-300 text-slate-600 bg-slate-50',
    },
    badgeClasses: {
      dark: 'border-white/20 bg-white/5 text-white/70',
      light: 'border-slate-200 bg-white text-slate-500',
    },
    slotClasses: {
      filled: 'border-emerald-400/40 text-emerald-100',
      empty: 'border-dashed border-white/20 text-white/40',
      hint: 'text-white/50',
    },
    slotClassesLight: {
      filled: 'border-emerald-500/40 text-emerald-700 bg-emerald-50',
      empty: 'border-dashed border-slate-300 text-slate-400 bg-white',
      hint: 'text-slate-400',
    },
    cardClasses: {
      container:
        'relative rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden',
      glow: 'shadow-primary-500/20',
      sheen:
        "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-transparent before:opacity-60",
    },
    cardClassesLight: {
      container: 'relative rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden',
      glow: 'shadow-slate-200/60',
      sheen:
        "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-100 before:via-white before:to-transparent before:opacity-80",
    },
    stageBackground: {
      dark: 'bg-black/10 backdrop-blur-sm',
      light: 'bg-slate-100/80 border border-slate-200',
    },
    timerBadge: {
      dark: 'bg-black/40 text-white/80 border-white/10',
      light: 'bg-white text-slate-600 border-slate-200 shadow-sm',
    },
    inputClasses: {
      dark: '',
      light: 'bg-white text-slate-700 placeholder:text-slate-400 border-slate-200',
    },
  },
}
