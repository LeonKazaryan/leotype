import { pvpConfig } from '../config/pvp.js'
import type {
  PvpDifficulty,
  PvpErrorCode,
  PvpMatchState,
  PvpPlayer,
  PvpPlayerStats,
  PvpPrivacy,
  PvpPublicRoom,
  PvpRoom,
  PvpRoomSettings,
} from '../types/pvp.js'
import { clampWordCount, createRoomCode, normalizeRoomName } from '../utils/pvp.js'

const buildDefaultMatch = (): PvpMatchState => ({
  stage: 'lobby',
  text: '',
  startAt: null,
  finishedAt: null,
  firstFinishAt: null,
})

const buildDefaultSettings = (): PvpRoomSettings => ({
  wordCount: clampWordCount(pvpConfig.defaults.wordCount),
  difficulty: pvpConfig.defaults.difficulty as PvpDifficulty,
  theme: 'default',
  timeLimitSec: null,
})

const sanitizeSettings = (settings: Partial<PvpRoomSettings>): PvpRoomSettings => {
  const difficulty = (settings.difficulty ?? pvpConfig.defaults.difficulty) as PvpDifficulty
  const wordCount = clampWordCount(settings.wordCount ?? pvpConfig.defaults.wordCount)
  return {
    wordCount,
    difficulty,
    theme: 'default',
    timeLimitSec: settings.timeLimitSec ?? null,
  }
}

const buildPlayer = (params: {
  id: string
  nickname?: string
  isHost: boolean
}): PvpPlayer => ({
  id: params.id,
  nickname: params.nickname ?? pvpConfig.defaults.fallbackUsername,
  avatarSeed: params.nickname ?? pvpConfig.defaults.fallbackUsername,
  isHost: params.isHost,
  isReady: false,
  pingMs: pvpConfig.defaults.pingMs,
  progress: 0,
  status: 'in_lobby',
  stats: null,
})

const updatePlayer = (players: PvpPlayer[], id: string, updater: (player: PvpPlayer) => PvpPlayer) =>
  players.map((player) => (player.id === id ? updater(player) : player))

export class PvpRoomManager {
  private rooms = new Map<string, PvpRoom>()
  private playerRoom = new Map<string, string>()

  getRoomByCode(code: string) {
    return [...this.rooms.values()].find((room) => room.code === code)
  }

  getRoomById(roomId: string) {
    return this.rooms.get(roomId) ?? null
  }

  getRoomForPlayer(playerId: string) {
    const roomId = this.playerRoom.get(playerId)
    if (!roomId) return null
    return this.rooms.get(roomId) ?? null
  }

  listPublicRooms(): PvpPublicRoom[] {
    return [...this.rooms.values()]
      .filter((room) => room.privacy === 'public')
      .map((room) => ({
        id: room.id,
        code: room.code,
        hostName: room.players.find((player) => player.id === room.hostId)?.nickname ?? pvpConfig.defaults.fallbackUsername,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        modeLabel: pvpConfig.defaults.modeLabel,
        difficulty: room.settings.difficulty,
        pingMs: pvpConfig.defaults.pingMs,
      }))
  }

  createRoom(params: {
    userId: string
    nickname?: string
    maxPlayers: number
    privacy: PvpPrivacy
    name: string
    settings?: Partial<PvpRoomSettings>
  }): PvpRoom {
    const now = Date.now()
    const roomId = `${pvpConfig.room.idPrefix}_${now}_${Math.random().toString(36).slice(2, 8)}`
    const room: PvpRoom = {
      id: roomId,
      code: createRoomCode(),
      name: normalizeRoomName(params.name),
      privacy: params.privacy,
      maxPlayers: Math.min(Math.max(params.maxPlayers, pvpConfig.room.minPlayers), pvpConfig.room.maxPlayers),
      hostId: params.userId,
      settings: sanitizeSettings(params.settings ?? buildDefaultSettings()),
      players: [buildPlayer({ id: params.userId, nickname: params.nickname, isHost: true })],
      createdAt: now,
      match: buildDefaultMatch(),
    }

    this.rooms.set(roomId, room)
    this.playerRoom.set(params.userId, roomId)
    return room
  }

  joinRoom(params: { userId: string; nickname?: string; code: string }): { room?: PvpRoom; error?: PvpErrorCode } {
    const room = this.getRoomByCode(params.code)
    if (!room) return { error: 'ROOM_NOT_FOUND' }
    if (room.players.length >= room.maxPlayers) return { error: 'ROOM_FULL' }
    if (room.match.stage !== 'lobby') return { error: 'MATCH_IN_PROGRESS' }

    if (room.players.some((player) => player.id === params.userId)) {
      return { room }
    }

    const updated: PvpRoom = {
      ...room,
      players: [...room.players, buildPlayer({ id: params.userId, nickname: params.nickname, isHost: false })],
    }

    this.rooms.set(room.id, updated)
    this.playerRoom.set(params.userId, room.id)
    return { room: updated }
  }

  leaveRoom(playerId: string): { room: PvpRoom | null; removedRoomId?: string } {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return { room: null }

    const nextPlayers = room.players.filter((player) => player.id !== playerId)
    this.playerRoom.delete(playerId)

    if (nextPlayers.length === 0) {
      this.rooms.delete(room.id)
      return { room: null, removedRoomId: room.id }
    }

    let nextHostId = room.hostId
    let nextPlayersWithHost = nextPlayers

    if (room.hostId === playerId) {
      nextHostId = nextPlayers[0].id
      nextPlayersWithHost = nextPlayers.map((player) => ({
        ...player,
        isHost: player.id === nextHostId,
      }))
    }

    const updated: PvpRoom = {
      ...room,
      hostId: nextHostId,
      players: nextPlayersWithHost,
    }

    this.rooms.set(room.id, updated)
    return { room: updated }
  }

  setReady(playerId: string, ready: boolean) {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return null

    const updated: PvpRoom = {
      ...room,
      players: updatePlayer(room.players, playerId, (player) => ({ ...player, isReady: ready })),
    }

    this.rooms.set(room.id, updated)
    return updated
  }

  updateSettings(playerId: string, settings: Partial<PvpRoomSettings>): { room?: PvpRoom; error?: PvpErrorCode } {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return { error: 'NOT_IN_ROOM' }
    if (room.hostId !== playerId) return { error: 'NOT_HOST' }
    if (room.match.stage !== 'lobby') return { error: 'MATCH_IN_PROGRESS' }

    const updated: PvpRoom = {
      ...room,
      settings: sanitizeSettings({ ...room.settings, ...settings }),
    }

    this.rooms.set(room.id, updated)
    return { room: updated }
  }

  beginMatch(playerId: string): { room?: PvpRoom; error?: PvpErrorCode } {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return { error: 'NOT_IN_ROOM' }
    if (room.hostId !== playerId) return { error: 'NOT_HOST' }
    if (room.match.stage !== 'lobby') return { error: 'MATCH_IN_PROGRESS' }

    const updated: PvpRoom = {
      ...room,
      players: room.players.map((player) => ({
        ...player,
        progress: 0,
        stats: null,
        status: 'loading',
      })),
      match: {
        ...buildDefaultMatch(),
        stage: 'syncing',
      },
    }

    this.rooms.set(room.id, updated)
    return { room: updated }
  }

  setMatchCountdown(roomId: string, params: { text: string; startAt: number }) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    const updated: PvpRoom = {
      ...room,
      match: {
        ...room.match,
        stage: 'countdown',
        text: params.text,
        startAt: params.startAt,
        finishedAt: null,
        firstFinishAt: null,
      },
      players: room.players.map((player) => ({
        ...player,
        status: 'loading',
      })),
    }

    this.rooms.set(room.id, updated)
    return updated
  }

  setMatchTyping(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    const updated: PvpRoom = {
      ...room,
      match: {
        ...room.match,
        stage: 'typing',
      },
      players: room.players.map((player) => ({
        ...player,
        status: 'typing',
      })),
    }

    this.rooms.set(room.id, updated)
    return updated
  }

  updateProgress(playerId: string, stats: PvpPlayerStats & { progress: number }) {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return null

    const updated: PvpRoom = {
      ...room,
      players: updatePlayer(room.players, playerId, (player) => ({
        ...player,
        progress: Math.min(Math.max(stats.progress, 0), 1),
        stats: {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          errors: stats.errors,
          timeSec: stats.timeSec,
        },
        status: player.status === 'finished' ? 'finished' : 'typing',
      })),
    }

    this.rooms.set(room.id, updated)
    return updated
  }

  finishPlayer(playerId: string, stats: PvpPlayerStats) {
    const room = this.getRoomForPlayer(playerId)
    if (!room) return null

    const now = Date.now()
    const updated: PvpRoom = {
      ...room,
      players: updatePlayer(room.players, playerId, (player) => ({
        ...player,
        progress: 1,
        status: 'finished',
        stats,
      })),
      match: {
        ...room.match,
        firstFinishAt: room.match.firstFinishAt ?? now,
      },
    }

    this.rooms.set(room.id, updated)
    return updated
  }

  finalizeMatch(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    const updated: PvpRoom = {
      ...room,
      match: {
        ...room.match,
        stage: 'finished',
        finishedAt: Date.now(),
      },
    }

    this.rooms.set(room.id, updated)
    return updated
  }
}
