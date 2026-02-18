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

export interface RankedProfile {
  rating: number
  wins: number
  losses: number
  racesPlayed: number
  avgWpm: number
  avgAccuracy: number
  winRate: number
}

export interface RankedOpponent {
  nickname: string
  rating: number
  isBot: boolean
  expectedTimeSec?: number
  expectedWpm?: number
  expectedAccuracy?: number
}

export interface RankedMatchState {
  matchId: string
  stage: RankedStage
  startAt: number | null
  countdown: number
  text: string
  wordCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  language: 'ru' | 'en'
  progress: {
    self: number
    opponent: number
  }
}

export interface RankedResultSummary {
  ratingBefore: number
  ratingAfter: number
  delta: number
  opponent: string
  opponentStats?: {
    wpm: number
    accuracy: number
    errors: number
    timeSec: number
    words: number
    characters: number
  }
  stats: {
    wpm: number
    accuracy: number
    errors: number
    timeSec: number
    words: number
    characters: number
  }
}
