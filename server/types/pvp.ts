export type PvpPrivacy = 'public' | 'private'
export type PvpDifficulty = 'easy' | 'medium' | 'hard'
export type PvpTheme = 'default'
export type PvpStage = 'lobby' | 'syncing' | 'countdown' | 'typing' | 'finished'
export type PvpPlayerStatus = 'in_lobby' | 'loading' | 'typing' | 'finished'

export interface PvpRoomSettings {
  wordCount: number
  difficulty: PvpDifficulty
  theme: PvpTheme
  timeLimitSec: number | null
  topic: string
}

export interface PvpPlayerStats {
  wpm: number
  accuracy: number
  errors: number
  timeSec: number
  words: number
  characters: number
}

export interface PvpPlayer {
  id: string
  nickname: string
  avatarSeed: string
  isHost: boolean
  isReady: boolean
  pingMs: number
  progress: number
  status: PvpPlayerStatus
  stats: PvpPlayerStats | null
}

export interface PvpMatchState {
  stage: PvpStage
  text: string
  startAt: number | null
  finishedAt: number | null
  firstFinishAt: number | null
}

export interface PvpRoom {
  id: string
  code: string
  name: string
  privacy: PvpPrivacy
  maxPlayers: number
  hostId: string
  settings: PvpRoomSettings
  players: PvpPlayer[]
  createdAt: number
  match: PvpMatchState
}

export interface PvpPublicRoom {
  id: string
  code: string
  hostName: string
  playersCount: number
  maxPlayers: number
  modeLabel: string
  difficulty: PvpDifficulty
  pingMs: number
}

export type PvpErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'NOT_HOST'
  | 'INVALID_SETTINGS'
  | 'MATCH_IN_PROGRESS'
  | 'TEXT_GENERATION_FAILED'
  | 'NOT_IN_ROOM'
  | 'UNAUTHORIZED'
