export type MemoryPhase = 'idle' | 'loading' | 'memorize' | 'transition' | 'recall' | 'results'

export type MemorySlotStatus = 'correct' | 'incorrect' | 'misordered' | 'missing'

export interface MemoryCard {
  id: string
  word: string
  durationMs: number
}

export interface MemorySlot {
  id: string
  target: string
  guess: string
  hint?: string
}

export interface MemoryResultSlot extends MemorySlot {
  status: MemorySlotStatus
}

export interface MemoryResults {
  slots: MemoryResultSlot[]
  total: number
  correct: number
  incorrect: number
  misordered: number
  missing: number
  perfect: boolean
}
