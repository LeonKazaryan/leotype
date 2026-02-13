import { pvpConfig } from '../config/pvp'
import type { PvpPublicRoom, PvpRoom, PvpRoomSettings, PvpDifficulty } from '../types/pvp'
import type { AuthUser } from '../utils/auth'
import { buildRoomName, createRoomCode, randomPing } from '../utils/pvp'
import { generateTextFromDictionary } from '../utils/dictionaryText'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchPublicRooms = async (): Promise<PvpPublicRoom[]> => {
  await delay(pvpConfig.mock.publicRoomsDelayMs)
  return pvpConfig.mock.rooms
}

export const buildLocalRoom = (params: {
  host: AuthUser
  maxPlayers: number
  privacy: 'public' | 'private'
  name: string
  settings: PvpRoomSettings
}): PvpRoom => {
  const now = Date.now()
  const code = createRoomCode()
  return {
    id: `local_${now}`,
    code,
    name: buildRoomName(params.name),
    privacy: params.privacy,
    maxPlayers: params.maxPlayers,
    hostId: params.host.id,
    settings: params.settings,
    createdAt: now,
    players: [
      {
        id: params.host.id,
        nickname: params.host.username,
        avatarSeed: params.host.username,
        isHost: true,
        isReady: false,
        pingMs: randomPing(),
        progress: 0,
        status: 'in_lobby',
        stats: null,
        isLocal: true,
      },
    ],
  }
}

export const buildRoomFromPublic = (params: {
  room: PvpPublicRoom
  user: AuthUser
  settings: PvpRoomSettings
}): PvpRoom => {
  const now = Date.now()
  const remoteCount = Math.min(params.room.playersCount, params.room.maxPlayers - 1)
  const remotePlayers = Array.from({ length: remoteCount }, (_, index) => {
    const profile = pvpConfig.mock.botProfiles[index % pvpConfig.mock.botProfiles.length]
    const name = index === 0 ? params.room.hostName : pvpConfig.mock.botNames[index % pvpConfig.mock.botNames.length]
    return {
      id: `remote_${params.room.id}_${index}`,
      nickname: name,
      avatarSeed: name,
      isHost: index === 0,
      isReady: true,
      pingMs: randomPing(),
      progress: 0,
      status: 'in_lobby' as const,
      stats: null,
      isLocal: false,
      botProfile: profile,
    }
  })

  return {
    id: params.room.id,
    code: params.room.code,
    name: params.room.hostName,
    privacy: 'public',
    maxPlayers: params.room.maxPlayers,
    hostId: remoteCount > 0 ? `remote_${params.room.id}_0` : params.user.id,
    settings: params.settings,
    createdAt: now,
    players: [
      {
        id: params.user.id,
        nickname: params.user.username,
        avatarSeed: params.user.username,
        isHost: false,
        isReady: false,
        pingMs: randomPing(),
        progress: 0,
        status: 'in_lobby',
        stats: null,
        isLocal: true,
      },
      ...remotePlayers,
    ],
  }
}

export const generatePvpText = async (params: {
  wordCount: number
  difficulty: PvpDifficulty
  language: 'ru' | 'en'
}) => {
  return generateTextFromDictionary(
    params.wordCount,
    pvpConfig.mappings.difficultyToAi[params.difficulty],
    params.language
  )
}
