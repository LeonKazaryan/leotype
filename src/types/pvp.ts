export type PvpPhase = 'idle' | 'lobby' | 'room' | 'match' | 'results'

export type PvpMatchStage = 'idle' | 'generating' | 'syncing' | 'countdown' | 'typing' | 'finished'

export type PvpLobbyTab = 'join' | 'create'

export type PvpPrivacy = 'public' | 'private'

export type PvpDifficulty = 'easy' | 'medium' | 'hard'

export type PvpTheme = 'default'

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
  isLocal: boolean
  botProfile?: PvpBotProfile
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

export interface PvpMatchState {
  stage: PvpMatchStage
  countdown: number
  text: string
  startedAt: number | null
  finishedAt: number | null
  firstFinishAt: number | null
}

export type PvpErrorCode =
  | 'ROOMS_LOAD_FAILED'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'NOT_HOST'
  | 'MATCH_IN_PROGRESS'
  | 'NOT_IN_ROOM'
  | 'UNAUTHORIZED'
  | 'TEXT_GENERATION_FAILED'
  | 'UNKNOWN_ERROR'

export interface PvpBotProfile {
  wpm: number
  accuracy: number
}
