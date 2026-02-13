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
import { pvpConfig } from '../config/pvp'
import { fetchPublicRooms, buildLocalRoom, buildRoomFromPublic, generatePvpText } from '../services/pvpService'
import { calculateStats } from '../utils/stats'
import { updateInputTimestamps } from '../utils/typingMetrics'
import { areCharsEquivalent } from '../utils/charCompare'
import { clampWordCount } from '../utils/pvp'

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

  openLobby: (user: AuthUser) => Promise<void>
  closeLobby: () => void
  setLobbyTab: (tab: PvpLobbyTab) => void
  setJoinCode: (code: string) => void
  setCreateForm: (field: 'maxPlayers' | 'privacy' | 'roomName', value: string | number) => void
  joinRoom: (code: string) => void
  createRoom: () => void
  leaveRoom: () => void
  toggleReady: (playerId: string) => void
  updateRoomSettings: (next: Partial<PvpRoomSettings>) => void
  startMatch: (language: 'ru' | 'en') => Promise<void>
  setMatchStage: (stage: PvpMatchState['stage']) => void
  setCountdown: (value: number) => void
  updateInput: (value: string) => void
  updateLocalMetrics: (metrics: { progress: number; wpm: number; accuracy: number; errors: number; timeSec: number }) => void
  finishLocalPlayer: () => void
  updateMatch: (next: Partial<PvpMatchState>) => void
  finalizeResults: () => void
  resetMatch: () => void
  setActiveRoomPlayers: (players: PvpPlayer[]) => void
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

const resetPlayersForMatch = (players: PvpPlayer[]) =>
  players.map((player) => ({
    ...player,
    progress: 0,
    status: 'loading' as const,
    stats: null,
  }))

const resetPlayersForRoom = (players: PvpPlayer[]) =>
  players.map((player) => ({
    ...player,
    progress: 0,
    status: 'in_lobby' as const,
    stats: null,
  }))

const stripBots = (players: PvpPlayer[]) => players.filter((player) => !player.botProfile)

const fillWithBots = (room: PvpRoom) => {
  const missing = room.maxPlayers - room.players.length
  if (missing <= 0) return room

  const now = Date.now()
  const bots = Array.from({ length: missing }, (_, index) => {
    const profile = pvpConfig.mock.botProfiles[index % pvpConfig.mock.botProfiles.length]
    const botName = pvpConfig.mock.botNames[index % pvpConfig.mock.botNames.length]
    return {
      id: `bot_${now}_${index}`,
      nickname: botName,
      avatarSeed: botName,
      isHost: false,
      isReady: true,
      pingMs: Math.round((pvpConfig.mock.pingRangeMs.min + pvpConfig.mock.pingRangeMs.max) / 2),
      progress: 0,
      status: 'in_lobby' as const,
      stats: null,
      isLocal: false,
      botProfile: profile,
    } as PvpPlayer
  })

  return {
    ...room,
    players: [...room.players, ...bots],
  }
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

  openLobby: async (user) => {
    set({
      currentUser: user,
      phase: 'lobby',
      isLobbyOpen: true,
      isLoadingRooms: true,
      roomsError: null,
      publicRooms: [],
    })

    try {
      const rooms = await fetchPublicRooms()
      set({ publicRooms: rooms, isLoadingRooms: false })
    } catch (error) {
      set({
        roomsError: 'ROOMS_LOAD_FAILED',
        isLoadingRooms: false,
      })
    }
  },

  closeLobby: () => {
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
    })
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
    const { publicRooms, currentUser } = get()
    if (!currentUser) return

    const matched = publicRooms.find((room) => room.code === code)
    if (!matched) {
      set({ roomsError: 'ROOM_NOT_FOUND' })
      return
    }

    const room = buildRoomFromPublic({
      room: matched,
      user: currentUser,
      settings: pvpConfig.settings.defaultRoomSettings,
    })

    set({
      activeRoom: room,
      phase: 'room',
      roomsError: null,
    })
  },

  createRoom: () => {
    const { currentUser, createForm } = get()
    if (!currentUser) return

    const maxPlayers = Math.min(Math.max(createForm.maxPlayers, pvpConfig.room.minPlayers), pvpConfig.room.maxPlayers)

    const room = buildLocalRoom({
      host: currentUser,
      maxPlayers,
      privacy: createForm.privacy,
      name: createForm.roomName,
      settings: pvpConfig.settings.defaultRoomSettings,
    })

    set({
      activeRoom: room,
      phase: 'room',
      roomsError: null,
    })
  },

  leaveRoom: () => {
    set({
      phase: 'lobby',
      isLobbyOpen: true,
      activeRoom: null,
      roomsError: null,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
    })
  },

  toggleReady: (playerId) => {
    const { activeRoom } = get()
    if (!activeRoom) return

    set({
      activeRoom: {
        ...activeRoom,
        players: updatePlayer(activeRoom.players, playerId, (player) => ({
          ...player,
          isReady: !player.isReady,
        })),
      },
    })
  },

  updateRoomSettings: (next) => {
    const { activeRoom } = get()
    if (!activeRoom) return

    const nextWordCount = typeof next.wordCount === 'number'
      ? clampWordCount(next.wordCount)
      : activeRoom.settings.wordCount

    set({
      activeRoom: {
        ...activeRoom,
        settings: {
          ...activeRoom.settings,
          ...next,
          wordCount: nextWordCount,
        },
      },
    })
  },

  startMatch: async (language) => {
    const { activeRoom } = get()
    if (!activeRoom) return
    const roomWithBots = fillWithBots(activeRoom)

    set({
      phase: 'match',
      isLobbyOpen: false,
      roomsError: null,
      match: { ...defaultMatchState, stage: 'generating' },
      activeRoom: {
        ...roomWithBots,
        players: resetPlayersForMatch(roomWithBots.players),
      },
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
    })

    try {
      const text = await generatePvpText({
        wordCount: activeRoom.settings.wordCount,
        difficulty: activeRoom.settings.difficulty,
        language,
      })

      set((state) => ({
        match: {
          ...state.match,
          text,
          stage: 'syncing',
        },
      }))
    } catch (error) {
      set({
        match: { ...defaultMatchState, stage: 'idle' },
        phase: 'room',
        roomsError: 'TEXT_GENERATION_FAILED',
        activeRoom: activeRoom ? {
          ...activeRoom,
          players: resetPlayersForRoom(stripBots(activeRoom.players)),
        } : null,
      })
    }
  },

  setMatchStage: (stage) => set((state) => ({ match: { ...state.match, stage } })),

  setCountdown: (value) => set((state) => ({ match: { ...state.match, countdown: value } })),

  updateInput: (value) => {
    const { match, input, inputTimestamps } = get()
    if (match.stage !== 'typing') return

    const nextValue = value
    const now = Date.now()
    const nextTimestamps = updateInputTimestamps(inputTimestamps, input.length, nextValue.length, now)

    let nextStreak = get().streakCount
    let nextShakeKey = get().errorShakeKey
    const prevLength = input.length

    if (nextValue.length > prevLength && match.text.length >= nextValue.length) {
      const index = nextValue.length - 1
      const isCorrect = areCharsEquivalent(match.text[index], nextValue[index])
      if (isCorrect) {
        nextStreak += 1
      } else {
        nextStreak = 0
        nextShakeKey += 1
      }
    }

    set({
      input: nextValue,
      inputTimestamps: nextTimestamps,
      streakCount: nextStreak,
      errorShakeKey: nextShakeKey,
    })
  },

  updateLocalMetrics: (metrics) => {
    const { activeRoom, currentUser } = get()
    if (!activeRoom || !currentUser) return

    set({
      activeRoom: {
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
          },
        })),
      },
    })
  },

  finishLocalPlayer: () => {
    const { activeRoom, currentUser, match, input } = get()
    if (!activeRoom || !currentUser || !match.startedAt) return

    const elapsedSeconds = (Date.now() - match.startedAt) / 1000
    const stats = calculateStats(match.text, input, elapsedSeconds)

    set((state) => ({
      activeRoom: state.activeRoom
        ? {
          ...state.activeRoom,
          players: updatePlayer(state.activeRoom.players, currentUser.id, (player) => ({
            ...player,
            progress: 1,
            status: 'finished',
            stats: {
              wpm: stats.wpm,
              accuracy: stats.accuracy,
              errors: stats.characters.incorrect + stats.characters.missed + stats.characters.extra,
              timeSec: stats.time,
            },
          })),
        }
        : null,
      match: {
        ...state.match,
        firstFinishAt: state.match.firstFinishAt ?? Date.now(),
      },
    }))
  },

  updateMatch: (next) => {
    set((state) => ({
      match: {
        ...state.match,
        ...next,
      },
    }))
  },

  finalizeResults: () => {
    set((state) => ({
      phase: 'results',
      match: { ...state.match, stage: 'finished', finishedAt: Date.now() },
    }))
  },

  resetMatch: () => {
    const { activeRoom } = get()
    if (!activeRoom) return

    set({
      phase: 'room',
      isLobbyOpen: true,
      match: defaultMatchState,
      input: '',
      inputTimestamps: [],
      streakCount: 0,
      errorShakeKey: 0,
      activeRoom: {
        ...activeRoom,
        players: resetPlayersForRoom(stripBots(activeRoom.players)),
      },
    })
  },

  setActiveRoomPlayers: (players) => {
    const { activeRoom } = get()
    if (!activeRoom) return
    set({ activeRoom: { ...activeRoom, players } })
  },
}))
