import type { PvpDifficulty, PvpPrivacy, PvpRoomSettings, PvpTheme } from '../types/pvp'

const roomCodeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const defaultRoomSettings: PvpRoomSettings = {
  wordCount: 25,
  difficulty: 'medium',
  theme: 'default',
  timeLimitSec: null,
  topic: '',
}

export const pvpConfig = {
  roomCode: {
    length: 6,
    alphabet: roomCodeAlphabet,
  },
  room: {
    nameMaxLength: 24,
    minPlayers: 2,
    maxPlayers: 4,
    defaultName: 'PVP Room',
  },
  settings: {
    wordCount: {
      min: 15,
      max: 50,
      step: 5,
      quickOptions: [15, 25, 35, 50],
    },
    topicMaxLength: 60,
    difficultyOptions: ['easy', 'medium', 'hard'] as PvpDifficulty[],
    privacyOptions: ['public', 'private'] as PvpPrivacy[],
    themeOptions: ['default'] as PvpTheme[],
    defaultRoomSettings,
  },
  mappings: {
    difficultyToAi: {
      easy: 'easy',
      medium: 'medium',
      hard: 'hard',
    } as Record<PvpDifficulty, 'easy' | 'medium' | 'hard'>,
  },
  ui: {
    lobbyDrawerWidthClass: 'max-w-xl',
    lobbyDrawerHeightClass: 'h-[85vh]',
    fadeDurationMs: 220,
    joinPopDurationMs: 500,
    settingsPulseMs: 600,
    authShakeMs: 360,
    leadingBadgeMs: 800,
    goFlashMs: 350,
    topicDebounceMs: 300,
    streakThreshold: 8,
    catchUpThreshold: 0.08,
  },
  network: {
    progressThrottleMs: 90,
    syncHoldMs: 700,
    countdownSeconds: 3,
    countdownTickMs: 1000,
    finishGraceMs: 20000,
    botUpdateMs: 120,
    minElapsedSec: 0.01,
  },
  mock: {
    publicRoomsDelayMs: 450,
    pingRangeMs: { min: 18, max: 120 },
    rooms: [
      {
        id: 'room_alpha',
        code: 'AX9K2P',
        hostName: 'Mira',
        playersCount: 2,
        maxPlayers: 4,
        modeLabel: 'Words',
        difficulty: 'medium',
        pingMs: 42,
      },
      {
        id: 'room_beta',
        code: 'Q7T4ZN',
        hostName: 'Serg',
        playersCount: 3,
        maxPlayers: 4,
        modeLabel: 'Words',
        difficulty: 'hard',
        pingMs: 58,
      },
      {
        id: 'room_gamma',
        code: 'B5RM8K',
        hostName: 'Aiko',
        playersCount: 1,
        maxPlayers: 2,
        modeLabel: 'Words',
        difficulty: 'easy',
        pingMs: 36,
      },
    ],
    botProfiles: [
      { wpm: 55, accuracy: 96 },
      { wpm: 72, accuracy: 94 },
      { wpm: 88, accuracy: 92 },
    ],
    botNames: ['Nova', 'Rex', 'Vega', 'Kiro'],
  },
}
