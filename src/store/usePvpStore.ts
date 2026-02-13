import { create } from 'zustand'
import type { AuthUser } from '../utils/auth'
import type {
  PvpLobbyTab,
  PvpMatchState,
  PvpPhase,
  PvpPlayer,
  PvpPublicRoom,
  PvpRoom,
  PvpRoomSettings,
  PvpErrorCode,
} from '../types/pvp'
import type { PvpServerRoom } from '../types/pvpSocket'
import { pvpConfig } from '../config/pvp'
import { calculateStats } from '../utils/stats'
import { updateInputTimestamps } from '../utils/typingMetrics'
import { areCharsEquivalent } from '../utils/charCompare'
import { clampWordCount } from '../utils/pvp'
import {
  connectPvpSocket,
  disconnectPvpSocket,
  emitPvp,
  getPvpSocket,
  offPvp,
  onPvp,
  PvpSocketStatus,
  pvpSocketClient,
} from '../services/pvpSocketClient'

interface PvpStore {
  phase: PvpPhase
  lobbyTab: PvpLobbyTab
  isLobbyOpen: boolean
  isLoadingRooms: boolean
  roomsError: PvpErrorCode | null
  publicRooms: PvpPublicRoom[]
  joinCode: string
  createForm: {
    maxPlayers: number
    privacy: 'public' | 'private'
    roomName: string
  }
  currentUser: AuthUser | null
  activeRoom: PvpRoom | null
  match: PvpMatchState
  input: string
  inputTimestamps: number[]
  streakCount: number
  errorShakeKey: number
  socketStatus: PvpSocketStatus
  clockOffsetMs: number

  openLobby: (user: AuthUser) => void
  closeLobby: () => void
  disconnectSocket: () => void
  setLobbyTab: (tab: PvpLobbyTab) => void
  setJoinCode: (code: string) => void
  setCreateForm: (field: 'maxPlayers' | 'privacy' | 'roomName', value: string | number) => void
  joinRoom: (code: string) => void
  createRoom: () => void
  leaveRoom: () => void
  toggleReady: (playerId: string) => void
  updateRoomSettings: (next: Partial<PvpRoomSettings>) => void
  resetRoom: () => void
  destroyRoom: () => void
  startMatch: (language: 'ru' | 'en') => void
  setMatchStage: (stage: PvpMatchState['stage']) => void
  setCountdown: (value: number) => void
  updateInput: (value: string) => void
  updateLocalMetrics: (metrics: { progress: number; wpm: number; accuracy: number; errors: number; timeSec: number; words: number; characters: number }) => void
  finishLocalPlayer: () => void
  finalizeResults: () => void
  resetMatch: () => void
}

const defaultMatchState: PvpMatchState = {
  stage: 'idle',
  countdown: pvpConfig.network.countdownSeconds,
  text: '',
  startedAt: null,
  finishedAt: null,
  firstFinishAt: null,
}

const defaultCreateForm = {
  maxPlayers: pvpConfig.room.maxPlayers,
  privacy: 'public' as const,
  roomName: '',
}

const updatePlayer = (players: PvpPlayer[], id: string, updater: (player: PvpPlayer) => PvpPlayer) =>
  players.map((player) => (player.id === id ? updater(player) : player))

const mapServerRoom = (room: PvpServerRoom, userId: string | null): PvpRoom => {
  const { match: ignoredMatch, ...rest } = room
  void ignoredMatch
  return {
    ...rest,
    players: room.players.map((player) => ({
      ...player,
      isLocal: player.id === userId,
    })),
  }
}

const mapServerStage = (stage: PvpServerRoom['match']['stage'], text: string): PvpMatchState['stage'] => {
  if (stage === 'lobby') return 'idle'
  if (stage === 'syncing') return text.length > 0 ? 'syncing' : 'generating'
  return stage
}

export const usePvpStore = create<PvpStore>((set, get) => ({
  phase: 'idle',
  lobbyTab: 'join',
  isLobbyOpen: false,
  isLoadingRooms: false,
  roomsError: null,
  publicRooms: [],
  joinCode: '',
  createForm: defaultCreateForm,
  currentUser: null,
  activeRoom: null,
  match: defaultMatchState,
  input: '',
  inputTimestamps: [],
  streakCount: 0,
  errorShakeKey: 0,
  socketStatus: 'disconnected',
  clockOffsetMs: 0,

  openLobby: (user) => {
    disconnectPvpSocket()
    const socket = connectPvpSocket()
    if (!socket) {
      set({ roomsError: 'UNAUTHORIZED' })
      return
    }

    set({
      currentUser: user,
      phase: 'lobby',
      isLobbyOpen: true,
      isLoadingRooms: true,
      roomsError: null,
      publicRooms: [],
      socketStatus: 'connecting',
    })

    socket.on('connect', () => {
      set({ socketStatus: 'connected' })
      emitPvp(pvpSocketClient.events.client.requestRooms)
    })

    socket.on('disconnect', () => {
      set({ socketStatus: 'disconnected' })
    })

    onPvp(pvpSocketClient.events.server.rooms, (payload: { rooms: PvpPublicRoom[] }) => {
      set({ publicRooms: payload.rooms, isLoadingRooms: false })
    })

    onPvp(pvpSocketClient.events.server.roomState, (payload: { room: PvpServerRoom; serverTime?: number }) => {
      const { room, serverTime } = payload
      const currentUserId = get().currentUser?.id ?? null
      const mappedRoom = mapServerRoom(room, currentUserId)
      const mappedStage = mapServerStage(room.match.stage, room.match.text)
      const match: PvpMatchState = {
        stage: mappedStage,
        countdown: get().match.countdown,
        text: room.match.text,
        startedAt: room.match.startAt,
        finishedAt: room.match.finishedAt,
        firstFinishAt: room.match.firstFinishAt,
      }

      const nextPhase: PvpPhase = room.match.stage === 'finished'
        ? 'results'
        : room.match.stage === 'syncing' || room.match.stage === 'countdown' || room.match.stage === 'typing'
          ? 'match'
          : 'room'

      set({
        activeRoom: mappedRoom,
        match,
        phase: nextPhase,
        isLobbyOpen: nextPhase !== 'match',
        roomsError: null,
        clockOffsetMs: typeof serverTime === 'number' ? serverTime - Date.now() : get().clockOffsetMs,
      })
    })

    onPvp(pvpSocketClient.events.server.error, (payload: { code: PvpErrorCode }) => {
      if (payload.code === 'ROOM_CLOSED') {
        set({
          roomsError: payload.code,
          phase: 'lobby',
          isLobbyOpen: true,
          activeRoom: null,
          match: defaultMatchState,
          input: '',
          inputTimestamps: [],
          streakCount: 0,
          errorShakeKey: 0,
        })
        return
      }
      set({ roomsError: payload.code })
    })
  },

  closeLobby: () => {
    const phase = get().phase
    if (phase === 'lobby' || phase === 'idle') {
      disconnectPvpSocket()
    }
    set({
      phase: 'idle',
      isLobbyOpen: false,
      activeRoom: null,
      roomsError: null,
      joinCode: '',
      createForm: defaultCreateForm,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
      socketStatus: 'disconnected',
    })
  },

  disconnectSocket: () => {
    disconnectPvpSocket()
    set({ socketStatus: 'disconnected' })
  },

  setLobbyTab: (tab) => set({ lobbyTab: tab }),

  setJoinCode: (code) => set({ joinCode: code, roomsError: null }),

  setCreateForm: (field, value) => {
    set((state) => ({
      createForm: {
        ...state.createForm,
        [field]: value,
      },
    }))
  },

  joinRoom: (code) => {
    emitPvp(pvpSocketClient.events.client.joinRoom, { code })
  },

  createRoom: () => {
    const { createForm } = get()
    emitPvp(pvpSocketClient.events.client.createRoom, {
      maxPlayers: createForm.maxPlayers,
      privacy: createForm.privacy,
      name: createForm.roomName,
      settings: pvpConfig.settings.defaultRoomSettings,
    })
  },

  leaveRoom: () => {
    emitPvp(pvpSocketClient.events.client.leaveRoom)
    set({
      phase: 'lobby',
      isLobbyOpen: true,
      activeRoom: null,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
    })
  },

  toggleReady: (playerId) => {
    const room = get().activeRoom
    if (!room) return
    const player = room.players.find((item) => item.id === playerId)
    emitPvp(pvpSocketClient.events.client.setReady, { ready: !player?.isReady })
  },

  updateRoomSettings: (next) => {
    const room = get().activeRoom
    if (!room) return

    const nextWordCount = typeof next.wordCount === 'number'
      ? clampWordCount(next.wordCount)
      : room.settings.wordCount

    emitPvp(pvpSocketClient.events.client.updateSettings, {
      settings: { ...next, wordCount: nextWordCount, topic: next.topic ?? room.settings.topic },
    })
  },

  resetRoom: () => {
    emitPvp(pvpSocketClient.events.client.resetRoom)
  },

  destroyRoom: () => {
    emitPvp(pvpSocketClient.events.client.destroyRoom)
    set({
      phase: 'lobby',
      isLobbyOpen: true,
      activeRoom: null,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
    })
  },

  startMatch: (language) => {
    emitPvp(pvpSocketClient.events.client.startMatch, { language })
  },

  setMatchStage: (stage) => set((state) => ({ match: { ...state.match, stage } })),

  setCountdown: (value) => set((state) => ({ match: { ...state.match, countdown: value } })),

  updateInput: (value) => {
    const { match, input, inputTimestamps } = get()
    if (match.stage !== 'typing') return

    const now = Date.now()
    const nextTimestamps = updateInputTimestamps(inputTimestamps, input.length, value.length, now)

    let nextStreak = get().streakCount
    let nextShakeKey = get().errorShakeKey
    const prevLength = input.length

    if (value.length > prevLength && match.text.length >= value.length) {
      const index = value.length - 1
      const isCorrect = areCharsEquivalent(match.text[index], value[index])
      if (isCorrect) {
        nextStreak += 1
      } else {
        nextStreak = 0
        nextShakeKey += 1
      }
    }

    set({
      input: value,
      inputTimestamps: nextTimestamps,
      streakCount: nextStreak,
      errorShakeKey: nextShakeKey,
    })
  },

  updateLocalMetrics: (metrics) => {
    const { activeRoom, currentUser } = get()
    if (!activeRoom || !currentUser) return

    const updatedRoom = {
      ...activeRoom,
      players: updatePlayer(activeRoom.players, currentUser.id, (player) => ({
        ...player,
        progress: metrics.progress,
        status: player.status === 'finished' ? 'finished' : 'typing',
        stats: {
          wpm: metrics.wpm,
          accuracy: metrics.accuracy,
          errors: metrics.errors,
          timeSec: metrics.timeSec,
          words: metrics.words,
          characters: metrics.characters,
        },
      })),
    }

    set({ activeRoom: updatedRoom })

    emitPvp(pvpSocketClient.events.client.updateProgress, metrics)
  },

  finishLocalPlayer: () => {
    const { activeRoom, currentUser, match, input, clockOffsetMs } = get()
    if (!activeRoom || !currentUser || !match.startedAt) return

    const elapsedSeconds = (Date.now() + clockOffsetMs - match.startedAt) / 1000
    const stats = calculateStats(match.text, input, elapsedSeconds)

    const words = input.trim().split(/\s+/).filter(Boolean).length
    const characters = input.length

    emitPvp(pvpSocketClient.events.client.finishMatch, {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.characters.incorrect + stats.characters.missed + stats.characters.extra,
      timeSec: stats.time,
      words,
      characters,
    })
  },

  finalizeResults: () => {
    set((state) => ({
      phase: 'results',
      match: { ...state.match, stage: 'finished', finishedAt: Date.now() },
    }))
  },

  resetMatch: () => {
    set({
      phase: 'room',
      isLobbyOpen: true,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
    })
  },
}))

export const cleanupPvpSocketListeners = () => {
  const socket = getPvpSocket()
  if (!socket) return
  offPvp(pvpSocketClient.events.server.rooms)
  offPvp(pvpSocketClient.events.server.roomState)
  offPvp(pvpSocketClient.events.server.error)
}
