import type { PvpDifficulty, PvpPlayerStatus, PvpPrivacy, PvpRoomSettings } from './pvp'

export interface PvpServerPlayer {
  id: string
  nickname: string
  avatarSeed: string
  isHost: boolean
  isReady: boolean
  pingMs: number
  progress: number
  status: PvpPlayerStatus
  stats: {
    wpm: number
    accuracy: number
    errors: number
    timeSec: number
    words: number
    characters: number
  } | null
}

export interface PvpServerMatch {
  stage: 'lobby' | 'syncing' | 'countdown' | 'typing' | 'finished'
  text: string
  startAt: number | null
  finishedAt: number | null
  firstFinishAt: number | null
}

export interface PvpServerRoom {
  id: string
  code: string
  name: string
  privacy: PvpPrivacy
  maxPlayers: number
  hostId: string
  settings: PvpRoomSettings
  players: PvpServerPlayer[]
  createdAt: number
  match: PvpServerMatch
}

export interface PvpServerPublicRoom {
  id: string
  code: string
  hostName: string
  playersCount: number
  maxPlayers: number
  modeLabel: string
  difficulty: PvpDifficulty
  pingMs: number
}
