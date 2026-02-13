export const pvpConfig = {
  room: {
    minPlayers: 2,
    maxPlayers: 4,
    nameMaxLength: 24,
    defaultName: 'PVP Room',
    codeLength: 6,
    codeAlphabet: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
    idPrefix: 'room',
  },
  settings: {
    wordCount: {
      min: 10,
      max: 200,
      step: 5,
    },
    difficultyMap: {
      easy: 'easy',
      medium: 'medium',
      hard: 'hard',
      custom: 'medium',
    },
  },
  match: {
    syncHoldMs: 700,
    countdownSeconds: 3,
    countdownTickMs: 1000,
    finishGraceMs: 20000,
  },
  network: {
    progressMinIntervalMs: 80,
  },
  defaults: {
    pingMs: 28,
    fallbackUsername: 'Player',
    modeLabel: 'Words',
    wordCount: 50,
    difficulty: 'medium',
  },
}
