export type RankedPhase = 'idle' | 'search' | 'found' | 'countdown' | 'match' | 'result'

export type RankedStage = 'search' | 'countdown' | 'typing' | 'finished'

export type RankedResult = 'WIN' | 'LOSS' | 'DRAW'

export type RankedErrorCode =
  | 'UNAUTHORIZED'
  | 'ALREADY_IN_QUEUE'
  | 'ALREADY_IN_MATCH'
  | 'MATCH_NOT_FOUND'
  | 'INVALID_STATE'
  | 'INTERNAL_ERROR'

export interface RankedQueueEntry {
  userId: string
  nickname: string
  rating: number
  joinedAt: number
  language: 'ru' | 'en'
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface RankedMatchPlayerSnapshot {
  userId: string | null
  nickname: string
  rating: number
  isBot: boolean
  opponentId?: string | null
}

export interface RankedMatchSnapshot {
  id: string
  text: string
  startAt: number
  wordCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  language: 'ru' | 'en'
  players: RankedMatchPlayerSnapshot[]
}

export interface RankedProgressPayload {
  progress: number
  wpm: number
  accuracy: number
  errors: number
  timeSec: number
  words: number
  characters: number
}
